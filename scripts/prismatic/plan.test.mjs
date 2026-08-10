#!/usr/bin/env node
// Integration tests for scripts/prismatic/plan.mjs (Fáze 2.5, partial).
// Runs the real CLI as a subprocess against this repo's own real
// canonical dataset — no fixtures, since the whole point is that this
// command reads the live compiled model. Kept fast by using
// --max-records and a single --dossier scope rather than a full --all
// run in every test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "plan.mjs");

function run(args) {
  return execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" });
}

test("requires an explicit scope flag — no silent implicit --all", () => {
  assert.throws(() => execFileSync("node", [SCRIPT], { encoding: "utf8", stdio: "pipe" }));
});

test("--help exits 0 without requiring a scope flag", () => {
  const out = run(["--help"]);
  assert.match(out, /usage: npm run prismatic:plan/);
});

test("--json output is valid JSON with the documented shape", () => {
  const out = run(["--dossier=andrej-babis", "--json"]);
  const plan = JSON.parse(out);
  assert.equal(plan.scope, "dossier:andrej-babis");
  assert.equal(typeof plan.totalJobs, "number");
  assert.ok(Array.isArray(plan.jobs));
});

test("is deterministic: same scope, two separate process invocations, same job list", () => {
  const a = JSON.parse(run(["--dossier=andrej-babis", "--json"]));
  const b = JSON.parse(run(["--dossier=andrej-babis", "--json"]));
  assert.deepEqual(
    a.jobs.map((j) => j.subjectRef),
    b.jobs.map((j) => j.subjectRef),
  );
});

test("--entity scopes to exactly one entity's jobs, never a whole dossier's", () => {
  const dossierPlan = JSON.parse(run(["--dossier=andrej-babis", "--json"]));
  const oneEntityJob = dossierPlan.jobs.find((j) => j.jobType === "entity-ares-lookup");
  assert.ok(oneEntityJob, "expected at least one entity-ares-lookup job in this dossier to test against");
  const entityPlan = JSON.parse(run([`--entity=${oneEntityJob.subjectRef}`, "--json"]));
  assert.ok(entityPlan.jobs.every((j) => j.subjectRef === oneEntityJob.subjectRef));
});

test("--max-records truncates the job list and reports truncated: true", () => {
  const full = JSON.parse(run(["--all", "--json"]));
  if (full.totalJobs < 2) return; // not enough data in this checkout to meaningfully test truncation
  const truncated = JSON.parse(run(["--all", "--max-records=1", "--json"]));
  assert.equal(truncated.includedJobs, 1);
  assert.equal(truncated.truncated, true);
  assert.equal(truncated.totalJobs, full.totalJobs);
});

test("every entity-ares-lookup job cites the audit as its capability decision, never an unaudited capability", () => {
  const plan = JSON.parse(run(["--all", "--max-records=20", "--json"]));
  for (const job of plan.jobs) {
    if (job.jobType === "entity-ares-lookup") {
      assert.match(job.auditDecision, /docs\/audits\/2026-08-05-prismatic-capability-map\.md/);
    }
  }
});

test("is idempotent to run twice — job list identical apart from the generated-at timestamp", () => {
  const before = JSON.parse(run(["--dossier=andrej-babis", "--json"]));
  const after = JSON.parse(run(["--dossier=andrej-babis", "--json"]));
  assert.deepEqual(before.jobs, after.jobs);
});
