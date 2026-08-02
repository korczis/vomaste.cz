// Ties comment + labels + owner notification together (PHASE_006.md §16,
// §17) — the single orchestrator the workflow's publishing step calls.
// Everything here is pure orchestration over the injected adapter; no
// network, no token read directly (the adapter already carries whatever
// credential it needs) — fully testable against the mock adapter.
import { upsertReportComment, condenseReportIfNeeded } from "./upsert-report-comment.mjs";
import { syncLabels } from "./sync-labels.mjs";
import { previousIntakeStatusFromLabels, shouldPingOwner, buildOwnerPingLine } from "./determine-notification.mjs";
import { readCanonicalOwnerLogin } from "./constants.mjs";

// §17.1 — a security-review outcome gets a REDUCED report: intake ID,
// generic status, risk flag codes, a call for manual review — never the
// submitter's raw text repeated back. `buildReducedSecurityReviewReport`
// is the caller's job (it has the manifest); this module only enforces
// that the CALLER supplied a body — the actual redaction decision lives
// with whoever builds `reportBody`, documented in
// docs/intake/security-boundary.md.

// §16.5 — out-of-order runs: re-fetch the issue's current `updated_at`
// and refuse to publish a report for an event that is no longer the
// latest one GitHub has recorded. `eventUpdatedAt` is the event this
// specific run was triggered by (adapted-event issue.updated_at, GitHub-
// controlled metadata, never derived from issue body content).
export async function publishIntakeResult(adapter, { intakeStatus, reportBody, eventUpdatedAt, preflightComplete = false, runUrl, artifactName, ownerLogin }) {
  const issue = await adapter.getIssue();
  if (new Date(issue.updated_at).getTime() > new Date(eventUpdatedAt).getTime()) {
    return { status: "stale_event_skipped", currentUpdatedAt: issue.updated_at, eventUpdatedAt };
  }

  const currentLabels = await adapter.listLabels();
  const previousIntakeStatus = previousIntakeStatusFromLabels(currentLabels);
  const ping = shouldPingOwner({ previousIntakeStatus, newIntakeStatus: intakeStatus });
  const resolvedOwnerLogin = ownerLogin ?? readCanonicalOwnerLogin();
  const pingLine = ping ? buildOwnerPingLine(resolvedOwnerLogin) : null;

  const bodyWithPing = pingLine ? `${reportBody}\n\n${pingLine}` : reportBody;
  const { body: finalBody, condensed } = condenseReportIfNeeded(bodyWithPing, { runUrl, artifactName });

  const commentResult = await upsertReportComment(adapter, finalBody);
  const labelResult = await syncLabels(adapter, intakeStatus, { preflightComplete });

  return {
    status: "published",
    pinged: ping,
    previousIntakeStatus,
    comment: commentResult,
    labels: labelResult,
    reportCondensed: condensed,
  };
}
