#!/usr/bin/env node
// `npm run intake:e2e-fixture` (PHASE_005.md §12): runs every golden
// tests/fixtures/intake/e2e-*.json through the FULL pipeline — parse,
// validate, normalize, entity matching, risk classification, URL
// preflight, manifest, report — with a fixed clock/commit and a mock DNS
// adapter, into .tmp/intake/e2e-run/ (gitignored). Never touches the public
// internet, never writes production dossier data, never calls the
// GitHub API.
//
// Every fixture's source URLs resolve (via the injected mock adapter) to
// a private address, the same "prove the SSRF policy fires" design
// run-preflight-fixture.mjs already uses — this script's job is to prove
// the WHOLE pipeline runs deterministically end to end across every
// submission-type and adversarial scenario, not to re-prove individual
// preflight HTTP behaviors (scripts/intake/preflight/*.test.mjs already
// does that against a real local mock server). A genuinely-reachable
// mocked HTTP round trip, for completeness, lives in
// run-e2e-fixture.test.mjs's own dynamic scenario instead of here, since
// that needs an ephemeral port a static committed fixture file can't
// embed.
import { readdirSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { processIssueEvent } from "./process-issue.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES_DIR = join(ROOT, "tests/fixtures/intake");
const OUTPUT_DIR = join(ROOT, ".tmp/intake/e2e-run");
const FIXED_CLOCK = "2026-08-02T12:00:00.000Z";
const FIXED_COMMIT = "0000000000000000000000000000000000000e";

// Every hostname resolves to a private address — the same deterministic
// "policy fires" proof run-preflight-fixture.mjs already establishes.
const MOCK_DNS_ADAPTER = async () => ({ addresses: [{ address: "10.0.0.5", family: 4 }], resolvedAt: FIXED_CLOCK });

export async function runAllE2eFixtures() {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const fixtureFiles = readdirSync(FIXTURES_DIR)
    .filter((f) => f.startsWith("e2e-") && f.endsWith(".json"))
    .sort();

  const results = [];
  for (const file of fixtureFiles) {
    const name = file.replace(/\.json$/, "");
    try {
      const result = await processIssueEvent({
        eventPath: join(FIXTURES_DIR, file),
        outputDir: OUTPUT_DIR,
        generatedAt: FIXED_CLOCK,
        repositoryCommit: FIXED_COMMIT,
        overwrite: true,
        preflight: true,
        preflightDnsAdapter: MOCK_DNS_ADAPTER,
      });
      results.push({ name, outcome: "processed", intake_id: result.intake_id, manifest_path: result.manifest_path });
    } catch (err) {
      results.push({ name, outcome: "rejected", code: err?.code ?? "unknown_error", message: err?.message ?? String(err) });
    }
  }
  return results;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const results = await runAllE2eFixtures();
  const width = Math.max(...results.map((r) => r.name.length));
  for (const r of results) {
    const label = r.name.padEnd(width);
    if (r.outcome === "processed") console.log(`  OK       ${label}  intake_id=${r.intake_id}`);
    else console.log(`  REJECTED ${label}  ${r.code}`);
  }
  console.log(`\nintake:e2e-fixture: processed ${results.filter((r) => r.outcome === "processed").length}/${results.length} fixture(s) into ${OUTPUT_DIR}`);
}
