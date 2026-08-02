#!/usr/bin/env node
// `npm run intake:fixture` (PHASE_002.md §21.1): processes one synthetic
// valid fixture with a fixed clock and commit, into the gitignored
// .tmp/intake/ scratch directory, and prints the resulting paths. Purely
// a smoke check that the whole pipeline still works end to end — leaves
// no tracked changes (§21.2).
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { processIssueEvent } from "./process-issue.mjs";
import { EXIT_CODES } from "./constants.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURE_PATH = join(ROOT, "tests/fixtures/intake/valid-new-dossier.json");
const OUTPUT_DIR = join(ROOT, ".tmp/intake/fixture-run");

function main() {
  try {
    const result = processIssueEvent({
      eventPath: FIXTURE_PATH,
      outputDir: OUTPUT_DIR,
      generatedAt: "2026-08-02T00:00:00.000Z",
      repositoryCommit: "0000000000000000000000000000000000000f",
      overwrite: true,
    });
    console.log("intake:fixture OK");
    console.log(`  manifest: ${result.manifest_path}`);
    console.log(`  report:   ${result.report_path}`);
    process.exit(EXIT_CODES.success);
  } catch (err) {
    console.error("intake:fixture FAILED");
    console.error(err);
    process.exit(EXIT_CODES.internalError);
  }
}

main();
