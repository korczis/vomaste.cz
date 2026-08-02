#!/usr/bin/env node
// Publishing step entrypoint (PHASE_006.md §21 step 9-10). The ONLY
// script in the workflow that reads GITHUB_TOKEN — process-github-event.mjs
// (the processing step) never has it in its environment. Reads the
// status file that step always writes, regardless of outcome, and
// decides what to publish.
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createProductionGithubAdapter } from "./github/production-adapter.mjs";
import { publishIntakeResult } from "./github/publish-intake-result.mjs";
import { handleClosedIssue } from "./github/handle-closed-issue.mjs";
import { buildInvalidSubmissionReport, buildInternalErrorReport, buildSecurityReviewReport } from "./github/build-safe-reports.mjs";
import { renderIntakeReport } from "./render-intake-report.mjs";
import { readCanonicalOwnerLogin } from "./github/constants.mjs";

const KNOWN_ACTIONS = new Set(["opened", "edited", "reopened", "labeled", "unlabeled", "closed"]);

export function parseCliArgs(argv) {
  const result = {};
  const flags = ["--status-dir", "--owner", "--repo", "--issue-number", "--action", "--run-url", "--artifact-name"];
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (!flags.includes(flag)) throw new Error(`unknown argument: ${flag}`);
    const value = argv[i + 1];
    if (value === undefined) throw new Error(`missing value for argument: ${flag}`);
    i += 1;
    const key = flag.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[key] = value;
  }
  return result;
}

function reportBodyForStatus(status) {
  if (status.status === "submission_rejected") return { body: buildInvalidSubmissionReport({ code: status.code }), intakeStatus: "invalid" };
  if (status.status === "internal_error") return { body: buildInternalErrorReport({ runUrl: status.runUrl }), intakeStatus: null };
  if (status.status !== "success") throw new Error(`publish-github-result: unexpected status "${status.status}"`);

  const manifest = JSON.parse(readFileSync(status.manifest_path, "utf8"));
  const intakeStatus = manifest.workflow.intake_status;
  const body = intakeStatus === "security_review_required" ? buildSecurityReviewReport(manifest) : renderIntakeReport(manifest);
  return { body, intakeStatus, manifest };
}

// `adapterOverride` exists solely so tests can inject the in-memory mock
// adapter instead of a real GitHub client — the CLI entrypoint below
// never passes it, so production always goes through
// createProductionGithubAdapter (the one file allowed to touch the
// network, per network-guard.test.mjs).
export async function publishGithubResult({ statusDir, owner, repo, issueNumber, action, runUrl, artifactName, token, ownerLoginOverride, adapterOverride }) {
  const statusPath = join(statusDir, "_status.json");
  if (!existsSync(statusPath)) throw new Error(`publish-github-result: no _status.json in ${statusDir} — did the processing step run?`);
  const status = JSON.parse(readFileSync(statusPath, "utf8"));
  status.runUrl = runUrl;

  if (status.status === "ignored_unsupported_action") {
    return { published: false, reason: "ignored_unsupported_action" };
  }

  const adapter = adapterOverride ?? createProductionGithubAdapter({ token, owner, repo, issueNumber: Number(issueNumber) });
  const ownerLogin = ownerLoginOverride ?? readCanonicalOwnerLogin();

  if (KNOWN_ACTIONS.has(action) && action === "closed") {
    const { body } = reportBodyForStatus(status);
    const result = await handleClosedIssue(adapter, { reportBody: body });
    return { published: true, closed: true, result };
  }

  const { body, intakeStatus } = reportBodyForStatus(status);
  if (!intakeStatus) {
    // internal_error: still post the safe report, but there is no valid
    // manifest state to project into labels — publish the comment only.
    const commentOnlyAdapter = adapter;
    const { upsertReportComment } = await import("./github/upsert-report-comment.mjs");
    const commentResult = await upsertReportComment(commentOnlyAdapter, body);
    return { published: true, intakeStatus: null, comment: commentResult };
  }

  const result = await publishIntakeResult(adapter, {
    intakeStatus,
    reportBody: body,
    eventUpdatedAt: status.event_updated_at ?? new Date().toISOString(),
    preflightComplete: intakeStatus !== "security_review_required",
    runUrl,
    artifactName,
    ownerLogin,
  });
  return { published: true, intakeStatus, result };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("publish-github-result: GITHUB_TOKEN is not set");
    process.exit(1);
  }
  try {
    const outcome = await publishGithubResult({
      statusDir: args.statusDir,
      owner: args.owner,
      repo: args.repo,
      issueNumber: args.issueNumber,
      action: args.action,
      runUrl: args.runUrl,
      artifactName: args.artifactName,
      token,
    });
    console.log(JSON.stringify(outcome, null, 2));
    if (process.env.GITHUB_STEP_SUMMARY) {
      const lines = [
        "## Dossier intake",
        `- Issue: #${args.issueNumber}`,
        `- Processing: ${outcome.published ? "published" : outcome.reason}`,
        outcome.intakeStatus ? `- Intake status: ${outcome.intakeStatus}` : "",
        outcome.result?.comment ? `- Comment: ${outcome.result.comment.action}` : "",
        outcome.result?.labels ? `- Labels: ${outcome.result.labels.status} (added: ${outcome.result.labels.added?.join(", ") || "none"})` : "",
        outcome.result?.pinged !== undefined ? `- Owner pinged: ${outcome.result.pinged}` : "",
        `- Artifact: ${args.artifactName}`,
        "",
      ]
        .filter(Boolean)
        .join("\n");
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines + "\n");
    }
    process.exit(0);
  } catch (err) {
    // §15.4 — if the comment can't be published, the workflow step must
    // fail visibly, never pretend success.
    console.error("publish-github-result FAILED:", err?.message ?? err);
    process.exit(1);
  }
}
