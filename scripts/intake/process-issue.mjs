#!/usr/bin/env node
// CLI orchestrator (PHASE_002.md §8, §17, §18): the only entrypoint that
// runs the full pipeline end to end. Every stage it calls is its own
// single-responsibility module — this file does argument parsing, atomic
// output writing, and exit-code mapping, and nothing else.
//
//   node scripts/intake/process-issue.mjs \
//     --event <path> --output-dir <dir> \
//     [--generated-at <ISO8601>] [--repository-commit <sha>] [--overwrite]
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { EXIT_CODES } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";
import { loadEventFile } from "./load-event.mjs";
import { detectFormVersion } from "./detect-form.mjs";
import { parseIssueFormV1 } from "./parse-issue-form.mjs";
import { validateParsedSubmission } from "./validate-submission.mjs";
import { normalizeText, extractAndNormalizeUrls } from "./normalize-submission.mjs";
import { buildIntakeManifest, buildIntakeId } from "./build-intake-manifest.mjs";
import { validateManifestShape } from "./lib/schema-validators.mjs";
import { renderIntakeReport } from "./render-intake-report.mjs";
import { hashEventInput } from "./hash.mjs";
import { buildMatchingIndex } from "./build-matching-index.mjs";
import { extractCandidates } from "./matching/extract-candidates.mjs";
import { buildIndexLookups, matchCandidateAgainstIndex, resolveCandidate } from "./matching/match-entities.mjs";
import { detectDuplicateIntake } from "./matching/detect-duplicate-intake.mjs";
import { loadPriorManifestsFromDirectory } from "./matching/duplicate-intake-source.mjs";
import { classifyIntakeRisk } from "./risk/classify-intake-risk.mjs";
import { preflightUrls, offlinePreflightResult } from "./preflight/preflight-urls.mjs";
import { createProductionDnsAdapter } from "./preflight/resolve-hostname.mjs";

const ERROR_CODE_TO_EXIT_CODE = Object.freeze({
  [ERROR_CODES.EVENT_NOT_FOUND]: EXIT_CODES.invalidCliUsage,
  [ERROR_CODES.EVENT_NOT_REGULAR_FILE]: EXIT_CODES.invalidCliUsage,
  [ERROR_CODES.EVENT_TOO_LARGE]: EXIT_CODES.invalidEventJson,
  [ERROR_CODES.EVENT_INVALID_JSON]: EXIT_CODES.invalidEventJson,
  [ERROR_CODES.EVENT_SCHEMA_INVALID]: EXIT_CODES.invalidEventJson,
  [ERROR_CODES.MISSING_FORM_MARKER]: EXIT_CODES.unsupportedForm,
  [ERROR_CODES.DUPLICATE_FORM_MARKER]: EXIT_CODES.unsupportedForm,
  [ERROR_CODES.UNSUPPORTED_FORM_VERSION]: EXIT_CODES.unsupportedForm,
  [ERROR_CODES.DUPLICATE_SECTION]: EXIT_CODES.unsupportedForm,
  [ERROR_CODES.MISSING_REQUIRED_SECTION]: EXIT_CODES.unsupportedForm,
  [ERROR_CODES.SUBMISSION_VALIDATION_FAILED]: EXIT_CODES.submissionValidationFailed,
  [ERROR_CODES.MANIFEST_SCHEMA_INVALID]: EXIT_CODES.manifestValidationFailed,
  [ERROR_CODES.CLI_USAGE]: EXIT_CODES.invalidCliUsage,
  [ERROR_CODES.OUTPUT_EXISTS]: EXIT_CODES.outputFailure,
  [ERROR_CODES.OUTPUT_PATH_UNSAFE]: EXIT_CODES.outputFailure,
  [ERROR_CODES.OUTPUT_WRITE_FAILED]: EXIT_CODES.outputFailure,
  [ERROR_CODES.INTERNAL_ERROR]: EXIT_CODES.internalError,
});

const KNOWN_FLAGS = Object.freeze(["--event", "--output-dir", "--generated-at", "--repository-commit", "--overwrite", "--help", "--matching-index", "--prior-manifests-dir", "--preflight"]);

// §8.1: rejects unknown args, missing values, and duplicate args instead of
// silently taking the last/first occurrence.
export function parseCliArgs(argv) {
  const result = { overwrite: false, help: false, preflight: false };
  const seen = new Set();
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (!KNOWN_FLAGS.includes(flag)) {
      throw new IntakeError(ERROR_CODES.CLI_USAGE, `unknown argument: ${flag}`);
    }
    if (seen.has(flag)) {
      throw new IntakeError(ERROR_CODES.CLI_USAGE, `duplicate argument: ${flag}`);
    }
    seen.add(flag);
    if (flag === "--help") {
      result.help = true;
      continue;
    }
    if (flag === "--overwrite") {
      result.overwrite = true;
      continue;
    }
    if (flag === "--preflight") {
      result.preflight = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new IntakeError(ERROR_CODES.CLI_USAGE, `missing value for argument: ${flag}`);
    }
    i += 1;
    if (flag === "--event") result.eventPath = value;
    else if (flag === "--output-dir") result.outputDir = value;
    else if (flag === "--generated-at") result.generatedAt = value;
    else if (flag === "--repository-commit") result.repositoryCommit = value;
    else if (flag === "--matching-index") result.matchingIndexPath = value;
    else if (flag === "--prior-manifests-dir") result.priorManifestsDir = value;
  }
  return result;
}

const HELP_TEXT = `usage: node scripts/intake/process-issue.mjs --event <path> --output-dir <dir> [--generated-at <ISO8601>] [--repository-commit <sha>] [--overwrite] [--matching-index <path>] [--prior-manifests-dir <dir>] [--preflight]

Processes one local GitHub-issue event fixture into an intake manifest,
Markdown report and processing result. Offline by default; never
authorizes or publishes anything. --preflight opts in to a real,
SSRF-hardened technical check of the submitted source URLs (still no
authorization, no publication — see docs/intake/url-preflight.md).
See docs/intake/local-processor.md.`;

function currentRepositoryCommit() {
  try {
    // §7.3: no user input interpolated into the command — fixed argv array.
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: resolve(fileURLToPath(new URL("../../", import.meta.url))), encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function resolveSafeOutputPath(outputDirResolved, intakeId) {
  const finalDir = resolve(outputDirResolved, intakeId);
  if (finalDir !== outputDirResolved && !finalDir.startsWith(outputDirResolved + sep)) {
    throw new IntakeError(ERROR_CODES.OUTPUT_PATH_UNSAFE, "resolved output path escapes the output directory");
  }
  return finalDir;
}

// Loads the matching index once per call — `matchingIndexPath` lets
// tests inject a small synthetic index instead of always reading the
// real ~450-entity dataset (§22: index build cost paid once per run,
// never per-candidate).
function loadMatchingIndex(matchingIndexPath) {
  if (!matchingIndexPath) return buildMatchingIndex({});
  return JSON.parse(readFileSync(matchingIndexPath, "utf8"));
}

// The whole pipeline as one pure-ish function (all side effects — event
// read, temp files, matching-index build — are still real, but there is
// exactly one call site: runCli below), so tests can call it directly
// instead of shelling out.
export async function processIssueEvent({
  eventPath,
  outputDir,
  generatedAt,
  repositoryCommit,
  overwrite,
  matchingIndexPath,
  priorManifestsDir,
  preflight = false,
  preflightDnsAdapter,
  // Whole-function override for the `preflightUrls` call below, defaulting
  // to the real one. This file must stay free of any preflight test-only
  // bypass vocabulary (see preflight-security-gates.test.mjs's static
  // assertion that this exact file is clean of it), so a reviewer
  // scanning only the CLI entrypoint can be confident no bypass is
  // reachable from it. A script-level caller that legitimately needs one
  // (the local E2E fixture runner, to exercise a real mock HTTP server
  // instead of only ever proving the "blocked" path) supplies its own
  // wrapper closure here instead — that vocabulary then lives only in
  // that script and in preflight-urls.mjs, which already documents and
  // permits it.
  preflightRunner = preflightUrls,
}) {
  const eventJson = loadEventFile(eventPath);
  const inputHash = hashEventInput(eventJson);

  detectFormVersion(eventJson.issue.body);
  const parsed = parseIssueFormV1(eventJson.issue.body);
  validateParsedSubmission(parsed);

  const normalizedUrls = extractAndNormalizeUrls(parsed.submitted_source_urls_raw);
  const normalization = {
    subject_text_normalized: normalizeText(parsed.subject_text),
    normalized_source_urls: normalizedUrls,
    normalization_notes: [],
  };

  // ---- Phase 3: candidate matching (PHASE_003.md §9, §10) ----
  const matchingIndex = loadMatchingIndex(matchingIndexPath);
  const lookups = buildIndexLookups(matchingIndex);
  const { candidates: extractedCandidates, observations: extractionObservations } = extractCandidates(parsed);
  const candidateSubjects = extractedCandidates.map((candidate) => {
    const { matches, total_candidates_considered, total_matches_above_floor } = matchCandidateAgainstIndex(candidate, matchingIndex, lookups);
    const normalizedLabel = candidate.candidate_type === "organization" ? candidate.normalized.organization.comparisonName : candidate.normalized.person.comparisonName;
    return {
      candidate_id: candidate.candidate_id,
      input: { candidate_type: candidate.candidate_type, raw_label: candidate.raw_label, normalized_label: normalizedLabel, source_field: candidate.source_field },
      extracted_identifiers: candidate.extracted_identifiers,
      resolution_status: resolveCandidate(matches),
      matches,
      total_candidates_considered,
      total_matches_above_floor,
    };
  });
  const matching = { dataset_commit: matchingIndex.generated_from_commit, index_schema_version: matchingIndex.schema_version, candidate_subjects: candidateSubjects };

  // ---- Phase 3: duplicate intake detection (PHASE_003.md §11) ----
  const intakeId = buildIntakeId(eventJson.repository.full_name, eventJson.issue.number);
  const currentForDuplicateCheck = {
    id: intakeId,
    source_event: { repository: eventJson.repository.full_name, issue_number: eventJson.issue.number },
    normalization: { subject_text_normalized: normalization.subject_text_normalized, normalized_source_urls: normalizedUrls },
    submission: { description_text: parsed.description_text },
    proposed_authorization_scope: { subject_candidates: [{ extracted_identifiers: candidateSubjects[0]?.extracted_identifiers ?? {} }] },
  };
  const priorManifests = priorManifestsDir ? loadPriorManifestsFromDirectory(priorManifestsDir) : [];
  const duplicateResult = detectDuplicateIntake(currentForDuplicateCheck, priorManifests);
  const duplicateDetection = { ...duplicateResult, prior_manifest_source: priorManifestsDir ?? null };

  // ---- Phase 4: URL preflight (PHASE_004.md §0, §23.1: offline by
  // default, --preflight explicitly opts in to real network access). The
  // production DNS adapter is only ever constructed HERE, inside the
  // `preflight` branch — a caller that never passes `preflight: true`
  // gets offlinePreflightResult and this code path never runs at all,
  // which is what keeps `npm run build`/`npm test` network-free.
  const sourcePreflight = preflight
    ? await preflightRunner(normalizedUrls, { dnsAdapter: preflightDnsAdapter ?? createProductionDnsAdapter({ now: () => generatedAt }), now: () => generatedAt })
    : offlinePreflightResult(normalizedUrls, () => generatedAt);

  // ---- Phase 3: risk classification (PHASE_003.md §12-§16) ----
  const riskResult = classifyIntakeRisk({
    submission: parsed,
    matchingResult: { candidate_subjects: candidateSubjects, normalizedSourceUrlCount: normalizedUrls.length },
    duplicateResult,
    sourcePreflight,
  });
  const riskClassification = { flags: riskResult.flags };
  const workflowDecision = riskResult.workflow_decision;

  const warnings = [];
  for (const section of parsed.unparsed_sections) {
    warnings.push({ code: "unrecognized_section", field: section.heading, message: `unrecognized section retained without interpretation: "${section.heading}"` });
  }
  for (const label of parsed.unrecognized_acknowledgement_labels) {
    warnings.push({ code: "unrecognized_acknowledgement_label", field: "acknowledgements", message: `unrecognized acknowledgement checkbox label: "${label}"` });
  }
  for (const entry of normalizedUrls) {
    for (const observation of entry.syntax_observations) {
      warnings.push({ code: `url_${observation}`, field: "submitted_source_urls_raw", message: `${entry.normalized}: ${observation}` });
    }
  }
  for (const observation of extractionObservations) {
    warnings.push({ code: observation, field: "identifiers_text", message: `candidate extraction observation: ${observation}` });
  }

  const manifest = buildIntakeManifest({
    event: eventJson,
    parsedSubmission: parsed,
    normalization,
    systemObservations: { warnings, errors: [] },
    matching,
    duplicateDetection,
    riskClassification,
    sourcePreflight,
    workflowDecision,
    generatedAt,
    repositoryCommit,
    inputHash,
  });

  const manifestShape = validateManifestShape(manifest);
  if (!manifestShape.valid) {
    throw new IntakeError(ERROR_CODES.MANIFEST_SCHEMA_INVALID, "built manifest failed schema validation", { errors: manifestShape.errors });
  }

  const report = renderIntakeReport(manifest);

  const outputDirResolved = resolve(outputDir);
  mkdirSync(outputDirResolved, { recursive: true });
  const finalDir = resolveSafeOutputPath(outputDirResolved, manifest.id);

  if (existsSync(finalDir) && !overwrite) {
    throw new IntakeError(ERROR_CODES.OUTPUT_EXISTS, `output already exists (use --overwrite to replace): ${finalDir}`);
  }

  const tmpDir = mkdtempSync(join(outputDirResolved, ".intake-tmp-"));
  try {
    const manifestPath = join(tmpDir, "manifest.json");
    const reportPath = join(tmpDir, "report.md");
    const resultPath = join(tmpDir, "processing-result.json");
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    writeFileSync(reportPath, report, "utf8");
    const processingResult = {
      status: "success",
      intake_id: manifest.id,
      manifest_path: join(manifest.id, "manifest.json"),
      report_path: join(manifest.id, "report.md"),
      warnings,
      errors: [],
    };
    writeFileSync(resultPath, `${JSON.stringify(processingResult, null, 2)}\n`, "utf8");

    if (existsSync(finalDir)) rmSync(finalDir, { recursive: true, force: true });
    renameSync(tmpDir, finalDir);

    return { ...processingResult, manifest_path: join(finalDir, "manifest.json"), report_path: join(finalDir, "report.md") };
  } catch (err) {
    rmSync(tmpDir, { recursive: true, force: true });
    if (err instanceof IntakeError) throw err;
    throw new IntakeError(ERROR_CODES.OUTPUT_WRITE_FAILED, `failed writing intake output: ${err.message}`);
  }
}

async function runCli(argv) {
  let args;
  try {
    args = parseCliArgs(argv);
  } catch (err) {
    console.error(err.message);
    return EXIT_CODES.invalidCliUsage;
  }

  if (args.help) {
    console.log(HELP_TEXT);
    return EXIT_CODES.success;
  }
  if (!args.eventPath || !args.outputDir) {
    console.error("missing required argument: --event and --output-dir are both required");
    console.error(HELP_TEXT);
    return EXIT_CODES.invalidCliUsage;
  }

  const generatedAt = args.generatedAt ?? new Date().toISOString();
  const repositoryCommit = args.repositoryCommit ?? currentRepositoryCommit();

  try {
    const result = await processIssueEvent({
      eventPath: args.eventPath,
      outputDir: args.outputDir,
      generatedAt,
      repositoryCommit,
      overwrite: args.overwrite,
      matchingIndexPath: args.matchingIndexPath,
      priorManifestsDir: args.priorManifestsDir,
      preflight: args.preflight,
    });
    console.log(JSON.stringify(result, null, 2));
    return EXIT_CODES.success;
  } catch (err) {
    if (err instanceof IntakeError) {
      console.error(JSON.stringify({ status: "error", code: err.code, message: err.message, details: err.details }, null, 2));
      return ERROR_CODE_TO_EXIT_CODE[err.code] ?? EXIT_CODES.internalError;
    }
    console.error(JSON.stringify({ status: "error", code: ERROR_CODES.INTERNAL_ERROR, message: "unexpected internal error" }, null, 2));
    return EXIT_CODES.internalError;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  process.exit(await runCli(process.argv.slice(2)));
}
