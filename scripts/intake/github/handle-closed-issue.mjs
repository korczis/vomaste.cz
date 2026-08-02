// Closed-issue behavior (PHASE_006.md §29). A maintainer (or the
// submitter) closing the issue is a human, out-of-band act this workflow
// never interprets as a decision: closing is not rejection and not
// authorization, so the report is never deleted and
// `publication:blocked` is never removed — only the active `intake:*`
// state label is cleared, since "closed" isn't itself one of the five
// intake states machine-tracked by sync-labels.mjs.
import { LABELS } from "./constants.mjs";
import { upsertReportComment } from "./upsert-report-comment.mjs";

export function closedIssueNote() {
  return "**Issue byla uzavřena.** Uzavření samo o sobě neznamená zamítnutí ani schválení — je to lidské rozhodnutí, ne automatický závěr. Publikace zůstává blokována.";
}

// Returns { commentAction, removedStateLabel }. Never removes
// authorization:pending-owner or publication:blocked, never pings.
export async function handleClosedIssue(adapter, { reportBody }) {
  const bodyWithClosedNote = `${reportBody}\n\n${closedIssueNote()}`;
  const commentResult = await upsertReportComment(adapter, bodyWithClosedNote);

  const currentLabels = await adapter.listLabels();
  const activeStateLabel = Object.values(LABELS.intakeState).find((l) => currentLabels.includes(l));
  if (activeStateLabel) await adapter.removeLabel(activeStateLabel);

  return { commentAction: commentResult.action, removedStateLabel: activeStateLabel ?? null };
}
