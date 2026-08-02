// Assertion-based equivalent of PHASE_005.md §31's "golden snapshots" —
// this repo's existing convention for pinning expected computed values is
// assertions against a real run (see scripts/data/compiled-golden.test.mjs),
// not opaque committed diff files. Runs the golden tests/fixtures/intake/
// e2e-*.json fixtures through the real pipeline and checks the outcomes
// PHASE_005.md §32's test matrix specifies, plus edit semantics (§22) and
// one genuinely network-reachable (mocked, local-only) happy path.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runAllE2eFixtures } from "./run-e2e-fixture.mjs";
import { processIssueEvent } from "./process-issue.mjs";
import { preflightUrls } from "./preflight/preflight-urls.mjs";
import { startMockServer } from "./preflight/testing/mock-http-server.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES_DIR = join(ROOT, "tests/fixtures/intake");

async function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "intake-e2e-test-"));
  try {
    return await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function outcomeOf(results, name) {
  const r = results.find((x) => x.name === name);
  assert.ok(r, `no e2e result for fixture "${name}" — did the fixture file get renamed or deleted?`);
  return r;
}

test("§32 test matrix: every scenario reaches its specified pass/fail outcome", async () => {
  const results = await runAllE2eFixtures();

  const expectRejected = (name, code) => assert.equal(outcomeOf(results, name).code, code, name);
  const expectProcessed = (name) => assert.equal(outcomeOf(results, name).outcome, "processed", name);

  expectProcessed("e2e-valid-new-dossier");
  expectProcessed("e2e-valid-new-entity");
  expectProcessed("e2e-valid-new-topic");
  expectProcessed("e2e-valid-link-entities");
  expectProcessed("e2e-valid-no-source-url");
  expectProcessed("e2e-valid-markdown-in-description");
  expectProcessed("e2e-valid-czech-diacritics");
  expectProcessed("e2e-valid-long-description");
  expectProcessed("e2e-valid-edited-issue-original");
  expectProcessed("e2e-valid-edited-issue");
  expectProcessed("e2e-invalid-confidential-material"); // structurally valid; risk-flagged, not parser-rejected

  expectRejected("e2e-invalid-missing-marker", "missing_form_marker");
  expectRejected("e2e-invalid-unknown-version", "unsupported_form_version");
  expectRejected("e2e-invalid-changed-heading", "missing_required_section");
  expectRejected("e2e-invalid-duplicate-heading", "duplicate_section");
  expectRejected("e2e-invalid-missing-acknowledgement", "submission_validation_failed");
  expectRejected("e2e-invalid-edited-acknowledgement", "submission_validation_failed");
  expectRejected("e2e-invalid-spoofed-acknowledgement", "submission_validation_failed");
  expectRejected("e2e-invalid-unknown-submission-type", "submission_validation_failed");
});

test("§32: missing-URL scenario lands on needs_information via missing_source_urls, not a parser failure", async () => {
  await withTmpDir(async (dir) => {
    const result = await processIssueEvent({
      eventPath: join(FIXTURES_DIR, "e2e-valid-no-source-url.json"),
      outputDir: dir,
      generatedAt: "2026-08-02T12:00:00.000Z",
      repositoryCommit: "0000000000000000000000000000000000000e",
      overwrite: true,
    });
    const manifest = JSON.parse(readFileSync(join(dir, result.intake_id, "manifest.json"), "utf8"));
    assert.equal(manifest.workflow.intake_status, "needs_information");
    assert.ok(manifest.risk_classification.flags.some((f) => f.code === "missing_source_urls"));
  });
});

test("§32: confidential-material scenario lands on security_review_required, not triage", async () => {
  await withTmpDir(async (dir) => {
    const result = await processIssueEvent({
      eventPath: join(FIXTURES_DIR, "e2e-invalid-confidential-material.json"),
      outputDir: dir,
      generatedAt: "2026-08-02T12:00:00.000Z",
      repositoryCommit: "0000000000000000000000000000000000000e",
      overwrite: true,
    });
    const manifest = JSON.parse(readFileSync(join(dir, result.intake_id, "manifest.json"), "utf8"));
    assert.equal(manifest.workflow.intake_status, "security_review_required");
  });
});

test("§22: editing an issue keeps the intake ID stable but changes the input hash", async () => {
  await withTmpDir(async (dir) => {
    const original = await processIssueEvent({
      eventPath: join(FIXTURES_DIR, "e2e-valid-edited-issue-original.json"),
      outputDir: join(dir, "original"),
      generatedAt: "2026-08-02T12:00:00.000Z",
      repositoryCommit: "0000000000000000000000000000000000000e",
      overwrite: true,
    });
    const edited = await processIssueEvent({
      eventPath: join(FIXTURES_DIR, "e2e-valid-edited-issue.json"),
      outputDir: join(dir, "edited"),
      generatedAt: "2026-08-02T12:00:00.000Z",
      repositoryCommit: "0000000000000000000000000000000000000e",
      overwrite: true,
    });
    assert.equal(original.intake_id, edited.intake_id, "editing an issue must never change its intake ID");

    const originalManifest = JSON.parse(readFileSync(join(dir, "original", original.intake_id, "manifest.json"), "utf8"));
    const editedManifest = JSON.parse(readFileSync(join(dir, "edited", edited.intake_id, "manifest.json"), "utf8"));
    assert.notEqual(originalManifest.provenance.input_sha256, editedManifest.provenance.input_sha256, "editing the body content must change the input hash");
  });
});

test("§22.4: removing a previously-checked acknowledgement on edit makes the new run fail, never inherits the prior valid result", async () => {
  await withTmpDir(async (dir) => {
    await assert.rejects(
      processIssueEvent({
        eventPath: join(FIXTURES_DIR, "e2e-invalid-edited-acknowledgement.json"),
        outputDir: dir,
        generatedAt: "2026-08-02T12:00:00.000Z",
        repositoryCommit: "0000000000000000000000000000000000000e",
        overwrite: true,
      }),
      (err) => err.code === "submission_validation_failed"
    );
  });
});

// One genuinely network-reachable (mocked, loopback-only) round trip —
// the static golden fixtures above always resolve to a private address
// by design (they can't embed an ephemeral port), so this is the one
// scenario that actually exercises a real HTTP response through the full
// preflight pipeline via the script-level preflightRunner override
// (process-issue.mjs itself stays free of any bypass vocabulary — see
// its own header comment on the preflightRunner parameter).
test("a mocked, genuinely reachable HTTP round trip via a local server produces a non-blocked preflight result", async () => {
  const mock = await startMockServer();
  try {
    await withTmpDir(async (dir) => {
      // Reuse the real golden fixture verbatim, only swapping its source
      // URL for one pointing at the just-started live mock server — every
      // other field (marker, headings, acknowledgements) stays exactly
      // what the real form produces.
      const eventPath = join(dir, "event.json");
      const original = JSON.parse(readFileSync(join(FIXTURES_DIR, "e2e-valid-new-dossier.json"), "utf8"));
      const body = original.issue.body.replace("https://www.testov.cz/zapisy/2026-05-01.pdf", `${mock.baseUrl}/ok`);
      const event = { ...original, issue: { ...original.issue, number: 999, body } };
      writeFileSync(eventPath, JSON.stringify(event));

      const mockDnsAdapter = async () => ({ addresses: [{ address: "127.0.0.1", family: 4 }], resolvedAt: "2026-08-02T12:00:00.000Z" });
      const preflightRunner = (normalizedUrls, opts) => preflightUrls(normalizedUrls, { ...opts, testAllowedPrivateAddresses: ["127.0.0.1"], testExtraAllowedPorts: [mock.port] });

      const result = await processIssueEvent({
        eventPath,
        outputDir: dir,
        generatedAt: "2026-08-02T12:00:00.000Z",
        repositoryCommit: "0000000000000000000000000000000000000e",
        overwrite: true,
        preflight: true,
        preflightDnsAdapter: mockDnsAdapter,
        preflightRunner,
      });
      const manifest = JSON.parse(readFileSync(join(dir, result.intake_id, "manifest.json"), "utf8"));
      const preflightResult = manifest.source_preflight.results[0];
      assert.equal(preflightResult.policy_decision, "allowed");
      assert.equal(preflightResult.http.status, 200);
    });
  } finally {
    await mock.close();
  }
});
