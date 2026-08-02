// Finds this workflow's own managed report comment among an issue's
// comments (PHASE_006.md §10.2, §10.3). Trust requires BOTH conditions —
// neither alone is sufficient:
//
//   author is the trusted GitHub Actions bot
//   AND body starts with the exact root marker
//
// A comment written by any other user, even one that pastes the exact
// marker text, is never treated as "ours" — §10.3's whole point is that
// nothing in issue content (including a spoofed comment) can make this
// workflow believe a comment it didn't create is its own report.
import { REPORT_MARKER } from "../constants.mjs";

export const TRUSTED_BOT_LOGIN = "github-actions[bot]";

function isTrustedManagedComment(comment) {
  return comment.author_is_bot === true && comment.author_login === TRUSTED_BOT_LOGIN && typeof comment.body === "string" && comment.body.startsWith(REPORT_MARKER);
}

// Returns { comment: <the one to update, or null if none exist>,
// duplicates: <any other trusted managed comments found, never touched> }.
// §10.2 item 6: when more than one exists, the OLDEST (first created) is
// the one kept up to date — it's the comment most likely already
// bookmarked/subscribed to — and every other one is reported as a
// duplicate for diagnostics, never silently deleted.
export function findManagedComment(comments) {
  const managed = comments.filter(isTrustedManagedComment).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  if (managed.length === 0) return { comment: null, duplicates: [] };
  const [oldest, ...duplicates] = managed;
  return { comment: oldest, duplicates };
}
