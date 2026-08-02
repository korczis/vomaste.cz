#!/usr/bin/env node
// Workflow processing entrypoint (PHASE_006.md §6, §21 step 5): the ONLY
// step in the GitHub Actions workflow that reads $GITHUB_EVENT_PATH, and
// it never receives GITHUB_TOKEN in its environment (privilege
// separation — §20/§21: this step can process a hostile issue body with
// zero ability to talk to the GitHub API at all). It always writes a
// single, predictable status file so the later, token-bearing publishing
// step has one place to look regardless of outcome.
//
//   node scripts/intake/process-github-event.mjs \
//     --event "$GITHUB_EVENT_PATH" \
//     --output-dir "$RUNNER_TEMP/vomaste-intake" \
//     --repository-commit "$GITHUB_SHA" \
//     --delivery-id "$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT" \
//     --expected-repository "$GITHUB_REPOSITORY" \
//     [--preflight]
import { readFileSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { EXIT_CODES, LIMITS } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";
import { adaptGithubIssueEvent, assertExpectedRepository, isSupportedGithubIssueAction } from "./adapters/github-event.mjs";
import { processIssueEvent } from "./process-issue.mjs";
import { createProductionDnsAdapter } from "./preflight/resolve-hostname.mjs";

const KNOWN_FLAGS = Object.freeze(["--event", "--output-dir", "--repository-commit", "--delivery-id", "--expected-repository", "--preflight", "--help"]);

export function parseCliArgs(argv) {
  const result = { preflight: false, help: false };
  const seen = new Set();
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (!KNOWN_FLAGS.includes(flag)) throw new IntakeError(ERROR_CODES.CLI_USAGE, `unknown argument: ${flag}`);
    if (seen.has(flag)) throw new IntakeError(ERROR_CODES.CLI_USAGE, `duplicate argument: ${flag}`);
    seen.add(flag);
    if (flag === "--help") {
      result.help = true;
      continue;
    }
    if (flag === "--preflight") {
      result.preflight = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) throw new IntakeError(ERROR_CODES.CLI_USAGE, `missing value for argument: ${flag}`);
    i += 1;
    if (flag === "--event") result.eventPath = value;
    else if (flag === "--output-dir") result.outputDir = value;
    else if (flag === "--repository-commit") result.repositoryCommit = value;
    else if (flag === "--delivery-id") result.deliveryId = value;
    else if (flag === "--expected-repository") result.expectedRepository = value;
  }
  return result;
}

function loadRawGithubPayload(eventPath) {
  const stat = statSync(eventPath); // throws ENOENT if missing — caller wraps
  if (!stat.isFile()) throw new IntakeError(ERROR_CODES.EVENT_NOT_REGULAR_FILE, `event path is not a regular file: ${eventPath}`);
  if (stat.size > LIMITS.maxEventFileBytes) throw new IntakeError(ERROR_CODES.EVENT_TOO_LARGE, `event file exceeds ${LIMITS.maxEventFileBytes} bytes`);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(eventPath, "utf8"));
  } catch {
    throw new IntakeError(ERROR_CODES.EVENT_INVALID_JSON, `event file is not valid JSON: ${eventPath}`);
  }
  return parsed;
}

function writeStatus(outputDir, status) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "_status.json"), `${JSON.stringify(status, null, 2)}\n`, "utf8");
}

// The whole entrypoint as one function so tests can call it directly
// (same pattern as processIssueEvent) — the CLI guard at the bottom is
// the only real call site otherwise.
export async function processGithubEvent({ eventPath, outputDir, repositoryCommit, deliveryId, expectedRepository, preflight = false, preflightDnsAdapter, generatedAt }) {
  const outputDirResolved = resolve(outputDir);
  const now = generatedAt ?? new Date().toISOString();

  let rawPayload;
  try {
    rawPayload = loadRawGithubPayload(eventPath);
  } catch (err) {
    const status = { status: "internal_error", failure_class: "internal_workflow_error", code: err?.code ?? "unknown", message: "failed to load the GitHub event payload", generated_at: now };
    writeStatus(outputDirResolved, status);
    return status;
  }

  const action = typeof rawPayload?.action === "string" ? rawPayload.action : null;
  if (!action || !isSupportedGithubIssueAction(action)) {
    const status = { status: "ignored_unsupported_action", action, generated_at: now };
    writeStatus(outputDirResolved, status);
    return status;
  }

  let adapted;
  try {
    adapted = adaptGithubIssueEvent(rawPayload, { deliveryId: deliveryId ?? `local-${Date.now()}` });
    assertExpectedRepository(adapted, expectedRepository);
  } catch (err) {
    const status = { status: "internal_error", failure_class: "internal_workflow_error", code: err?.code ?? "unknown", message: err?.message ?? "failed to adapt the GitHub event payload", generated_at: now };
    writeStatus(outputDirResolved, status);
    return status;
  }

  const scratchDir = mkdtempSync(join(tmpdir(), "vomaste-intake-adapted-"));
  try {
    const adaptedEventPath = join(scratchDir, "event.json");
    writeFileSync(adaptedEventPath, JSON.stringify(adapted), "utf8");

    let result;
    try {
      result = await processIssueEvent({
        eventPath: adaptedEventPath,
        outputDir: outputDirResolved,
        generatedAt: now,
        repositoryCommit,
        overwrite: true,
        preflight,
        preflightDnsAdapter: preflightDnsAdapter ?? (preflight ? createProductionDnsAdapter({ now: () => now }) : undefined),
      });
    } catch (err) {
      // A classified IntakeError here (missing marker, failed validation,
      // ...) is an ordinary, expected outcome for a real public
      // submission — not an internal_workflow_error. It gets its own
      // status class so the publishing step can post an honest "this
      // submission is invalid, here's why" comment instead of a generic
      // failure message.
      const isKnown = err instanceof IntakeError;
      const status = {
        status: isKnown ? "submission_rejected" : "internal_error",
        failure_class: isKnown ? "invalid_form" : "internal_workflow_error",
        code: err?.code ?? "unknown",
        message: isKnown ? err.message : "unexpected internal error while processing the submission",
        intake_action: action,
        event_updated_at: adapted.issue.updated_at,
        generated_at: now,
      };
      writeStatus(outputDirResolved, status);
      return status;
    }

    const intakeDir = dirname(result.manifest_path);
    const diagnostics = {
      generated_at: now,
      intake_id: result.intake_id,
      repository_commit: repositoryCommit,
      delivery_id: adapted.event.delivery_id,
      issue_number: adapted.issue.number,
      action,
      preflight_enabled: preflight,
      warnings_count: result.warnings?.length ?? 0,
    };
    writeFileSync(join(intakeDir, "diagnostics.json"), `${JSON.stringify(diagnostics, null, 2)}\n`, "utf8");

    const status = { status: "success", intake_id: result.intake_id, manifest_path: result.manifest_path, report_path: result.report_path, diagnostics_path: join(intakeDir, "diagnostics.json"), event_updated_at: adapted.issue.updated_at, generated_at: now };
    writeStatus(outputDirResolved, status);
    return status;
  } finally {
    rmSync(scratchDir, { recursive: true, force: true });
  }
}

const HELP_TEXT = `usage: node scripts/intake/process-github-event.mjs --event <path> --output-dir <dir> --repository-commit <sha> [--delivery-id <id>] [--expected-repository <owner/repo>] [--preflight]

Adapts a real GitHub "issues" webhook payload ($GITHUB_EVENT_PATH) to the
internal event shape and runs the existing local intake pipeline. Never
reads GITHUB_TOKEN or any GitHub API — this step's environment must not
carry it. Always writes <output-dir>/_status.json with a classified
outcome, even on failure. See docs/intake/github-actions-workflow.md.`;

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP_TEXT);
    process.exit(EXIT_CODES.success);
  }
  if (!args.eventPath || !args.outputDir || !args.repositoryCommit) {
    console.error("missing required argument: --event, --output-dir and --repository-commit are all required");
    console.error(HELP_TEXT);
    process.exit(EXIT_CODES.invalidCliUsage);
  }
  const status = await processGithubEvent(args);
  console.log(JSON.stringify(status, null, 2));
  // Only a genuinely unexpected internal error fails the workflow step —
  // "this submission is invalid" and "unsupported action" are expected,
  // classified outcomes the publishing step handles, not CI failures.
  process.exit(status.status === "internal_error" ? EXIT_CODES.internalError : EXIT_CODES.success);
}
