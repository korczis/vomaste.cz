// PHASE_006.md §25's explicit test matrix, gathered in one file so the
// full list is auditable in one place — the individual modules
// (upsert-report-comment.test.mjs, sync-labels.test.mjs,
// determine-notification.test.mjs, publish-intake-result.test.mjs)
// already cover most of these scenarios as they were built test-first;
// this file adds the remaining gaps: comment create/update FAILURE
// handling (§15.4), a label-sync API failure distinct from "missing
// repository label", and closed-issue behavior (§29, acceptance
// criterion #60).
import { test } from "node:test";
import assert from "node:assert/strict";
import { upsertReportComment } from "./upsert-report-comment.mjs";
import { syncLabels } from "./sync-labels.mjs";
import { handleClosedIssue, closedIssueNote } from "./handle-closed-issue.mjs";
import { createMockGithubAdapter } from "./mock-github-adapter.mjs";
import { REPORT_MARKER } from "../constants.mjs";

const REPORT = `${REPORT_MARKER}\n\n## report`;

// ---- Comments: failure handling (§15.4) ----

test("Comments: a createComment failure propagates rather than being silently swallowed", async () => {
  const adapter = createMockGithubAdapter({});
  adapter.createComment = async () => {
    throw new Error("simulated GitHub API failure");
  };
  await assert.rejects(upsertReportComment(adapter, REPORT), /simulated GitHub API failure/);
});

test("Comments: an updateComment failure propagates rather than being silently swallowed", async () => {
  const adapter = createMockGithubAdapter({ comments: [{ id: 1, author_login: "github-actions[bot]", author_is_bot: true, body: REPORT, created_at: "2026-08-01T00:00:00Z" }] });
  adapter.updateComment = async () => {
    throw new Error("simulated GitHub API failure");
  };
  await assert.rejects(upsertReportComment(adapter, REPORT + "\n\nupdated"), /simulated GitHub API failure/);
});

// ---- Labels: API failure distinct from "missing repository label" ----

test("Labels: an unexpected addLabels failure (not label_not_found) propagates, not silently treated as partial success", async () => {
  const adapter = createMockGithubAdapter({});
  adapter.addLabels = async () => {
    throw new Error("simulated rate limit");
  };
  await assert.rejects(syncLabels(adapter, "triage"), /simulated rate limit/);
});

test("Labels: no labels present at all on a freshly opened valid issue → the full desired set is added", async () => {
  const adapter = createMockGithubAdapter({});
  const result = await syncLabels(adapter, "triage");
  assert.equal(result.status, "success");
  assert.deepEqual(result.added.sort(), ["authorization:pending-owner", "intake:triage", "publication:blocked"].sort());
});

// ---- Closed issue (§29, acceptance #60) ----

test("Closed issue: report is updated (never deleted), never interpreted as rejected", async () => {
  const adapter = createMockGithubAdapter({ labels: ["intake:triage", "authorization:pending-owner", "publication:blocked"] });
  await adapter.createComment(REPORT);
  const result = await handleClosedIssue(adapter, { reportBody: REPORT });
  assert.equal(result.commentAction, "updated");
  const comments = await adapter.listComments();
  assert.equal(comments.length, 1, "the report must still exist, never deleted");
  assert.match(comments[0].body, /Issue byla uzavřena/);
});

test("Closed issue: the active intake:* state label is removed, but publication:blocked and authorization:pending-owner survive", async () => {
  const adapter = createMockGithubAdapter({ labels: ["intake:triage", "authorization:pending-owner", "publication:blocked", "good-first-issue"] });
  const result = await handleClosedIssue(adapter, { reportBody: REPORT });
  assert.equal(result.removedStateLabel, "intake:triage");
  const finalLabels = await adapter.listLabels();
  assert.ok(finalLabels.includes("authorization:pending-owner"));
  assert.ok(finalLabels.includes("publication:blocked"));
  assert.ok(!finalLabels.includes("intake:triage"));
  assert.ok(finalLabels.includes("good-first-issue"), "unrelated labels must survive closing too");
});

test("Closed issue: closedIssueNote never claims 'rejected' or 'approved'", () => {
  const note = closedIssueNote();
  assert.ok(!/zamítnut[oa]|schválen[oa]|approved|rejected/i.test(note) || /neznamená zamítnutí ani schválení/.test(note));
  assert.match(note, /Publikace zůstává blokována/);
});

test("Closed issue: an issue with no active intake:* label (e.g. was already invalid) is handled without error", async () => {
  const adapter = createMockGithubAdapter({ labels: ["intake:invalid"] });
  const result = await handleClosedIssue(adapter, { reportBody: REPORT });
  assert.equal(result.removedStateLabel, "intake:invalid");
});
