import { test } from "node:test";
import assert from "node:assert/strict";
import { desiredLabelsForStatus, planLabelSync, syncLabels } from "./sync-labels.mjs";
import { createMockGithubAdapter, createMockGithubAdapterWithRepoLabels } from "./mock-github-adapter.mjs";
import { LABELS } from "./constants.mjs";

test("desiredLabelsForStatus: triage gets the triage label plus both always-on labels", () => {
  assert.deepEqual(desiredLabelsForStatus("triage"), ["intake:triage", "authorization:pending-owner", "publication:blocked"]);
});

test("desiredLabelsForStatus: invalid gets ONLY intake:invalid — never pending-owner/blocked on top (§15.2)", () => {
  assert.deepEqual(desiredLabelsForStatus("invalid"), ["intake:invalid"]);
});

test("desiredLabelsForStatus: preflight-complete is additive and optional", () => {
  assert.deepEqual(desiredLabelsForStatus("triage", { preflightComplete: true }), ["intake:triage", "authorization:pending-owner", "publication:blocked", "intake:preflight-complete"]);
});

test("desiredLabelsForStatus: rejects an unrecognized status rather than silently producing no labels", () => {
  assert.throws(() => desiredLabelsForStatus("not_a_real_status"));
});

test("planLabelSync: no labels yet → everything desired is added, nothing removed", () => {
  const plan = planLabelSync([], desiredLabelsForStatus("triage"));
  assert.deepEqual(plan.toAdd.sort(), ["authorization:pending-owner", "intake:triage", "publication:blocked"].sort());
  assert.deepEqual(plan.toRemove, []);
});

test("planLabelSync: transitioning from needs-information to triage removes the stale state label and adds the new one", () => {
  const current = ["intake:needs-information", "authorization:pending-owner", "publication:blocked", "bug"];
  const plan = planLabelSync(current, desiredLabelsForStatus("triage"));
  assert.deepEqual(plan.toAdd, ["intake:triage"]);
  assert.deepEqual(plan.toRemove, ["intake:needs-information"]);
  assert.deepEqual(plan.preservedUnrelated, ["bug"]);
});

test("planLabelSync: an unrelated label is never touched, even across a full state change", () => {
  const current = ["intake:triage", "authorization:pending-owner", "publication:blocked", "good-first-issue", "help-wanted"];
  const plan = planLabelSync(current, desiredLabelsForStatus("security_review_required"));
  assert.deepEqual(plan.preservedUnrelated.sort(), ["good-first-issue", "help-wanted"].sort());
  assert.ok(!plan.toRemove.includes("good-first-issue"));
  assert.ok(!plan.toRemove.includes("help-wanted"));
});

test("syncLabels: applies the plan via the adapter and reports success", async () => {
  const adapter = createMockGithubAdapter({ labels: ["intake:needs-information", "authorization:pending-owner", "publication:blocked"] });
  const result = await syncLabels(adapter, "triage");
  assert.equal(result.status, "success");
  assert.deepEqual((await adapter.listLabels()).sort(), ["authorization:pending-owner", "intake:triage", "publication:blocked"].sort());
});

test("syncLabels: a missing repository label degrades to partial with a diagnostic, never throws or aborts other changes (§14 Varianta A)", async () => {
  const adapter = createMockGithubAdapterWithRepoLabels({
    labels: ["intake:needs-information", "authorization:pending-owner", "publication:blocked"],
    existingRepoLabels: ["authorization:pending-owner", "publication:blocked", "intake:needs-information"], // intake:triage doesn't "exist" in the repo yet
  });
  const result = await syncLabels(adapter, "triage");
  assert.equal(result.status, "partial");
  assert.deepEqual(result.missingRepoLabels, ["intake:triage"]);
  // The stale state label removal must still have happened even though the add partially failed.
  assert.ok(!(await adapter.listLabels()).includes("intake:needs-information"));
});

test("syncLabels: unrelated labels are preserved through a full run", async () => {
  const adapter = createMockGithubAdapter({ labels: ["intake:triage", "authorization:pending-owner", "publication:blocked", "duplicate?"] });
  await syncLabels(adapter, "possible_duplicate");
  const finalLabels = await adapter.listLabels();
  assert.ok(finalLabels.includes("duplicate?"));
});

test("no label in LABELS ever claims authorized/publishable/verified status (§13.4, redundant with constants.test.mjs but pinned here at the sync-plan level too)", () => {
  const plan = planLabelSync([], desiredLabelsForStatus("triage"));
  for (const label of [...plan.toAdd]) {
    assert.ok(!/authorized$|publish$|verified|corroborated|guilty/.test(label));
  }
});
