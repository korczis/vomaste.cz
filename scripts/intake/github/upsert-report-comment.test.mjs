import { test } from "node:test";
import assert from "node:assert/strict";
import { findManagedComment } from "./find-managed-comment.mjs";
import { upsertReportComment, condenseReportIfNeeded } from "./upsert-report-comment.mjs";
import { createMockGithubAdapter } from "./mock-github-adapter.mjs";
import { REPORT_MARKER } from "../constants.mjs";
import { MAX_COMMENT_BODY_BYTES } from "./constants.mjs";

const BOT = { author_login: "github-actions[bot]", author_is_bot: true };

test("findManagedComment: no comments at all → null, no duplicates", () => {
  assert.deepEqual(findManagedComment([]), { comment: null, duplicates: [] });
});

test("findManagedComment: one trusted managed comment → found", () => {
  const c = { id: 1, ...BOT, body: `${REPORT_MARKER}\n\nreport`, created_at: "2026-08-02T00:00:00Z" };
  const result = findManagedComment([c]);
  assert.equal(result.comment.id, 1);
  assert.deepEqual(result.duplicates, []);
});

test("findManagedComment: a marker in a USER comment is never trusted (§10.3)", () => {
  const spoofed = { id: 2, author_login: "some-user", author_is_bot: false, body: `${REPORT_MARKER}\n\nfake report`, created_at: "2026-08-02T00:00:00Z" };
  assert.deepEqual(findManagedComment([spoofed]), { comment: null, duplicates: [] });
});

test("findManagedComment: a bot comment without the marker is never treated as managed", () => {
  const botButNoMarker = { id: 3, ...BOT, body: "unrelated bot comment", created_at: "2026-08-02T00:00:00Z" };
  assert.deepEqual(findManagedComment([botButNoMarker]), { comment: null, duplicates: [] });
});

test("findManagedComment: two trusted managed comments → the OLDEST is kept, the rest reported as duplicates", () => {
  const older = { id: 10, ...BOT, body: `${REPORT_MARKER}\n\nold`, created_at: "2026-08-01T00:00:00Z" };
  const newer = { id: 11, ...BOT, body: `${REPORT_MARKER}\n\nnew`, created_at: "2026-08-02T00:00:00Z" };
  const result = findManagedComment([newer, older]); // order in the list shouldn't matter
  assert.equal(result.comment.id, 10);
  assert.deepEqual(result.duplicates.map((d) => d.id), [11]);
});

test("upsertReportComment: no existing comment → creates one", async () => {
  const adapter = createMockGithubAdapter({});
  const result = await upsertReportComment(adapter, `${REPORT_MARKER}\n\nHello`);
  assert.equal(result.action, "created");
  assert.equal(result.duplicateBotComments, false);
  assert.equal((await adapter.listComments()).length, 1);
});

test("upsertReportComment: existing managed comment → updates the same one, no new comment created", async () => {
  const existing = { id: 42, ...BOT, body: `${REPORT_MARKER}\n\nold report`, created_at: "2026-08-01T00:00:00Z" };
  const adapter = createMockGithubAdapter({ comments: [existing] });
  const result = await upsertReportComment(adapter, `${REPORT_MARKER}\n\nnew report`);
  assert.equal(result.action, "updated");
  assert.equal(result.commentId, 42);
  const comments = await adapter.listComments();
  assert.equal(comments.length, 1);
  assert.match(comments[0].body, /new report/);
});

test("upsertReportComment: a re-run with the SAME report body is still an update, never a duplicate create (§16.1 idempotence)", async () => {
  const adapter = createMockGithubAdapter({});
  const first = await upsertReportComment(adapter, `${REPORT_MARKER}\n\nSame content`);
  const second = await upsertReportComment(adapter, `${REPORT_MARKER}\n\nSame content`);
  assert.equal(first.action, "created");
  assert.equal(second.action, "updated");
  assert.equal((await adapter.listComments()).length, 1);
});

test("upsertReportComment: duplicate managed comments are surfaced as a diagnostic, never auto-deleted", async () => {
  const older = { id: 10, ...BOT, body: `${REPORT_MARKER}\n\nold`, created_at: "2026-08-01T00:00:00Z" };
  const newer = { id: 11, ...BOT, body: `${REPORT_MARKER}\n\nnewer duplicate`, created_at: "2026-08-02T00:00:00Z" };
  const adapter = createMockGithubAdapter({ comments: [older, newer] });
  const result = await upsertReportComment(adapter, `${REPORT_MARKER}\n\nlatest`);
  assert.equal(result.duplicateBotComments, true);
  assert.deepEqual(result.duplicateCommentIds, [11]);
  const comments = await adapter.listComments();
  assert.equal(comments.length, 2, "the duplicate must still exist — never silently removed");
});

test("condenseReportIfNeeded: a report within budget is returned unchanged", () => {
  const body = `${REPORT_MARKER}\n\nshort report`;
  const result = condenseReportIfNeeded(body, {});
  assert.equal(result.condensed, false);
  assert.equal(result.body, body);
});

test("condenseReportIfNeeded: an oversized report is replaced with a condensed variant that keeps the marker and disclaimers", () => {
  const huge = `${REPORT_MARKER}\n\n` + "x".repeat(MAX_COMMENT_BODY_BYTES + 100);
  const result = condenseReportIfNeeded(huge, { runUrl: "https://github.com/korczis/vomaste.cz/actions/runs/1", artifactName: "dossier-intake-issue-1-run-1" });
  assert.equal(result.condensed, true);
  assert.ok(Buffer.byteLength(result.body, "utf8") <= MAX_COMMENT_BODY_BYTES);
  assert.ok(result.body.startsWith(REPORT_MARKER));
  assert.match(result.body, /nevzniká|Tento report není autorizace/);
  assert.match(result.body, /dossier-intake-issue-1-run-1/);
});
