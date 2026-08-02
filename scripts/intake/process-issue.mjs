#!/usr/bin/env node
// CLI orchestrator (PHASE_002.md §8, §17, §18): the only entrypoint that
// runs the full pipeline end to end. Every stage it calls is its own
// single-responsibility module — this file does argument parsing, atomic
// output writing, and exit-code mapping, and nothing else.
//
//   node scripts/intake/process-issue.mjs \
//     --event <path> --output-dir <dir> \
//     [--generated-at <ISO8601>] [--repository-commit <sha>] [--overwrite]
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync, existsSync } from "node:fs";
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
import { buildIntakeManifest } from "./build-intake-manifest.mjs";
import { validateManifestShape } from "./lib/schema-validators.mjs";
import { renderIntakeReport } from "./render-intake-report.mjs";
import { hashEventInput } from "./hash.mjs";

const ERROR_CODE_TO_EXIT_CODE = Object.freeze({
  [ERROR_CODES.EVENT_NOT_FOUND]: EXIT_CODES.invalidCliUsage,
  [ERROR_CODES.EVENT_NOT_REGULAR_FILE]: EXIT_CODES.invalidCliUsage,
  [ERROR_CODES.EVENT_TOO_LARGE]: EXIT_CODES.invalidEventJson,
  [ERROR_CODES.EVENT_INVALID_JSON]: EXIT_CODES.invalidEventJson,
  [ERROR_CODES.EVENT_SCHEMA_INVALID]: EXIT_CODES.invalidEventJson,
  [ERROR_CODES.MISSING_FORM_MARKER]: EXIT_CODES.unsupportedForm,
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

const KNOWN_FLAGS = Object.freeze(["--event", "--output-dir", "--generated-at", "--repository-commit", "--overwrite", "--help"]);

// §8.1: rejects unknown args, missing values, and duplicate args instead of
// silently taking the last/first occurrence.
export function parseCliArgs(argv) {
  const result = { overwrite: false, help: false };
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
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new IntakeError(ERROR_CODES.CLI_USAGE, `missing value for argument: ${flag}`);
    }
    i += 1;
    if (flag === "--event") result.eventPath = value;
    else if (flag === "--output-dir") result.outputDir = value;
    else if (flag === "--generated-at") result.generatedAt = value;
    else if (flag === "--repository-commit") result.repositoryCommit = value;
  }
  return result;
}

const HELP_TEXT = `usage: node scripts/intake/process-issue.mjs --event <path> --output-dir <dir> [--generated-at <ISO8601>] [--repository-commit <sha>] [--overwrite]

Processes one local GitHub-issue event fixture into an intake manifest,
Markdown report and processing result. Fully offline; never authorizes or
publishes anything. See docs/intake/local-processor.md.`;

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

// The whole pipeline as one pure-ish function (all side effects — event
// read, temp files — are still real, but there is exactly one call site:
// runCli below), so tests can call it directly instead of shelling out.
export function processIssueEvent({ eventPath, outputDir, generatedAt, repositoryCommit, overwrite }) {
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

  const manifest = buildIntakeManifest({
    event: eventJson,
    parsedSubmission: parsed,
    normalization,
    systemObservations: { warnings, errors: [] },
    // §15.3: any warning means a human should look this over before
    // triage proceeds normally — a mechanical rule, not a judgment call.
    workflow: { intake_status: warnings.length > 0 ? "needs_information" : "triage" },
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

function runCli(argv) {
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
    const result = processIssueEvent({
      eventPath: args.eventPath,
      outputDir: args.outputDir,
      generatedAt,
      repositoryCommit,
      overwrite: args.overwrite,
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
  process.exit(runCli(process.argv.slice(2)));
}
