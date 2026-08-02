#!/usr/bin/env node
// `npm run intake:preflight-fixture` (PHASE_004.md §23.2): the same
// fixture as `intake:fixture`, but with `--preflight` exercised through
// a MOCK DNS transport — never real network, so this stays safe to run
// in `npm run build`/CI. The fixture's source URL resolves (via the
// injected mock adapter, never node:dns) to a private address, so the
// SSRF policy fires and blocks it — proving the --preflight code path
// runs end to end and populates a real, non-empty `source_preflight`
// section, without ever needing a private-destination bypass in
// production code (there isn't one — see
// scripts/intake/preflight/validate-destination.mjs's header comment).
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { processIssueEvent } from "./process-issue.mjs";
import { EXIT_CODES } from "./constants.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURE_PATH = join(ROOT, "tests/fixtures/intake/valid-markdown-links.json");
const OUTPUT_DIR = join(ROOT, ".tmp/intake/preflight-fixture-run");

// Every hostname the fixture's source URLs use resolves to a private
// address — this is what proves the SSRF policy actually engages, not a
// happy-path request to somewhere reachable.
const MOCK_DNS_ADAPTER = async () => ({ addresses: [{ address: "10.0.0.5", family: 4 }], resolvedAt: "2026-08-02T00:00:00.000Z" });

async function main() {
  try {
    const result = await processIssueEvent({
      eventPath: FIXTURE_PATH,
      outputDir: OUTPUT_DIR,
      generatedAt: "2026-08-02T00:00:00.000Z",
      repositoryCommit: "0000000000000000000000000000000000000f",
      overwrite: true,
      preflight: true,
      preflightDnsAdapter: MOCK_DNS_ADAPTER,
    });
    console.log("intake:preflight-fixture OK");
    console.log(`  manifest: ${result.manifest_path}`);
    console.log(`  report:   ${result.report_path}`);
    process.exit(EXIT_CODES.success);
  } catch (err) {
    console.error("intake:preflight-fixture FAILED");
    console.error(err);
    process.exit(EXIT_CODES.internalError);
  }
}

await main();
