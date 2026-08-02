// Create-or-update the one managed report comment (PHASE_006.md §10.2,
// §10.4, §10.5). Pure orchestration over the adapter interface — no
// network, no token, fully testable with mock-github-adapter.mjs.
import { findManagedComment } from "./find-managed-comment.mjs";
import { MAX_COMMENT_BODY_BYTES } from "./constants.mjs";
import { REPORT_MARKER } from "../constants.mjs";

// §10.5: a report that would exceed the safe comment-body budget is
// replaced with a short, honest condensed version — never silently
// truncated mid-sentence (which could cut off a disclaimer) and never
// dropping the marker or the "not authorization" wording.
export function condenseReportIfNeeded(reportBody, { runUrl, artifactName }) {
  const bytes = Buffer.byteLength(reportBody, "utf8");
  if (bytes <= MAX_COMMENT_BODY_BYTES) return { body: reportBody, condensed: false };

  const condensed = `${REPORT_MARKER}

## Automatické předzpracování veřejného podnětu

> Tento report není autorizace, redakční závěr ani publikovaný dossier.
> Issue je veřejná. Rozsah zatím nebyl autorizován a publikace zůstává blokována.

**Plný report je příliš dlouhý pro komentář issue** (${bytes} B > ${MAX_COMMENT_BODY_BYTES} B limit) a je dostupný jako workflow artifact.

- Workflow run: ${runUrl ?? "(neuvedeno)"}
- Artifact: \`${artifactName ?? "(neuvedeno)"}\`

Technická dostupnost URL neznamená důvěryhodnost, nezávislost ani potvrzení obsahu. Možná shoda entity není potvrzení identity. Rizikový příznak není skutkový ani právní závěr.
`;
  return { body: condensed, condensed: true };
}

// Returns { action: "created"|"updated", commentId, duplicateBotComments }.
export async function upsertReportComment(adapter, reportBody) {
  const comments = await adapter.listComments();
  const { comment: existing, duplicates } = findManagedComment(comments);

  if (existing) {
    const updated = await adapter.updateComment(existing.id, reportBody);
    return { action: "updated", commentId: updated.id, duplicateBotComments: duplicates.length > 0, duplicateCommentIds: duplicates.map((d) => d.id) };
  }
  const created = await adapter.createComment(reportBody);
  return { action: "created", commentId: created.id, duplicateBotComments: false, duplicateCommentIds: [] };
}
