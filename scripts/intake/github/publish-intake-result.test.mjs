import { test } from "node:test";
import assert from "node:assert/strict";
import { publishIntakeResult } from "./publish-intake-result.mjs";
import { createMockGithubAdapter } from "./mock-github-adapter.mjs";
import { REPORT_MARKER } from "../constants.mjs";

const REPORT = `${REPORT_MARKER}\n\n## report\n\nsome content`;

test("first-time triage publish: creates comment, pings owner, applies triage + always-on labels", async () => {
  const adapter = createMockGithubAdapter({ issue: { updated_at: "2026-08-02T12:00:00Z" } });
  const result = await publishIntakeResult(adapter, { intakeStatus: "triage", reportBody: REPORT, eventUpdatedAt: "2026-08-02T12:00:00Z", ownerLogin: "korczis" });
  assert.equal(result.status, "published");
  assert.equal(result.pinged, true);
  assert.equal(result.comment.action, "created");
  const comments = await adapter.listComments();
  assert.match(comments[0].body, /@korczis/);
  assert.deepEqual((await adapter.listLabels()).sort(), ["authorization:pending-owner", "intake:triage", "publication:blocked"].sort());
});

test("a rerun that stays in triage: updates the same comment, does NOT ping again", async () => {
  const adapter = createMockGithubAdapter({ issue: { updated_at: "2026-08-02T12:00:00Z" }, labels: ["intake:triage", "authorization:pending-owner", "publication:blocked"] });
  await adapter.createComment(REPORT); // simulate a prior run's comment already existing
  const result = await publishIntakeResult(adapter, { intakeStatus: "triage", reportBody: REPORT, eventUpdatedAt: "2026-08-02T12:00:00Z", ownerLogin: "korczis" });
  assert.equal(result.pinged, false);
  assert.equal(result.comment.action, "updated");
});

test("stale event: issue was updated AFTER this event → publish is skipped entirely", async () => {
  const adapter = createMockGithubAdapter({ issue: { updated_at: "2026-08-02T13:00:00Z" } }); // issue is newer than the event below
  const result = await publishIntakeResult(adapter, { intakeStatus: "triage", reportBody: REPORT, eventUpdatedAt: "2026-08-02T12:00:00Z", ownerLogin: "korczis" });
  assert.equal(result.status, "stale_event_skipped");
  assert.equal((await adapter.listComments()).length, 0, "a stale run must never publish a comment");
  assert.equal((await adapter.listLabels()).length, 0, "a stale run must never sync labels");
});

test("current event (issue.updated_at == event timestamp) is published, not treated as stale", async () => {
  const adapter = createMockGithubAdapter({ issue: { updated_at: "2026-08-02T12:00:00Z" } });
  const result = await publishIntakeResult(adapter, { intakeStatus: "triage", reportBody: REPORT, eventUpdatedAt: "2026-08-02T12:00:00Z", ownerLogin: "korczis" });
  assert.equal(result.status, "published");
});

test("needs_information → triage transition pings; needs_information alone never did", async () => {
  const adapter = createMockGithubAdapter({ issue: { updated_at: "2026-08-02T12:00:00Z" }, labels: ["intake:needs-information", "authorization:pending-owner", "publication:blocked"] });
  const result = await publishIntakeResult(adapter, { intakeStatus: "triage", reportBody: REPORT, eventUpdatedAt: "2026-08-02T12:00:00Z", ownerLogin: "korczis" });
  assert.equal(result.pinged, true);
  assert.equal(result.previousIntakeStatus, "needs_information");
});

test("invalid submission: applies ONLY intake:invalid, no pending-owner/blocked labels, no ping", async () => {
  const adapter = createMockGithubAdapter({ issue: { updated_at: "2026-08-02T12:00:00Z" } });
  const result = await publishIntakeResult(adapter, { intakeStatus: "invalid", reportBody: REPORT, eventUpdatedAt: "2026-08-02T12:00:00Z", ownerLogin: "korczis" });
  assert.equal(result.pinged, false);
  assert.deepEqual(await adapter.listLabels(), ["intake:invalid"]);
});

test("without an explicit ownerLogin, falls back to the canonical data/maintainers.toml config", async () => {
  const adapter = createMockGithubAdapter({ issue: { updated_at: "2026-08-02T12:00:00Z" } });
  const result = await publishIntakeResult(adapter, { intakeStatus: "triage", reportBody: REPORT, eventUpdatedAt: "2026-08-02T12:00:00Z" });
  assert.equal(result.pinged, true);
  const comments = await adapter.listComments();
  assert.match(comments[0].body, /@korczis/);
});
