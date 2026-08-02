// Exercises the real CLI process (not the library function) so the exit
// codes documented in docs/intake/local-processor.md (PHASE_002.md §18)
// are verified against actual `node scripts/intake/process-issue.mjs`
// invocations, not just the internal error codes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { EXIT_CODES } from "./constants.mjs";

const INTAKE_DIR = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(INTAKE_DIR, "process-issue.mjs");
const FIXTURES_DIR = join(INTAKE_DIR, "..", "..", "tests", "fixtures", "intake");

function runCli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], { encoding: "utf8" });
}

function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "intake-cli-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("exit 0 and prints a JSON result on a valid fixture", () => {
  withTmpDir((dir) => {
    const result = runCli([
      "--event", join(FIXTURES_DIR, "valid-new-dossier.json"),
      "--output-dir", dir,
      "--generated-at", "2026-08-02T00:00:00.000Z",
      "--repository-commit", "0000000000000000000000000000000000000f",
    ]);
    assert.equal(result.status, EXIT_CODES.success);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.status, "success");
  });
});

test("exit code for invalid CLI usage (unknown flag)", () => {
  const result = runCli(["--bogus-flag", "x"]);
  assert.equal(result.status, EXIT_CODES.invalidCliUsage);
});

test("exit code for invalid CLI usage (missing required arguments)", () => {
  const result = runCli([]);
  assert.equal(result.status, EXIT_CODES.invalidCliUsage);
});

test("--help exits 0 without requiring --event/--output-dir", () => {
  const result = runCli(["--help"]);
  assert.equal(result.status, EXIT_CODES.success);
  assert.match(result.stdout, /usage: node scripts\/intake\/process-issue\.mjs/);
});

test("exit code for invalid event JSON", () => {
  withTmpDir((dir) => {
    const result = runCli(["--event", join(FIXTURES_DIR, "invalid-json.txt"), "--output-dir", dir]);
    assert.equal(result.status, EXIT_CODES.invalidEventJson);
  });
});

test("exit code for unsupported form version", () => {
  withTmpDir((dir) => {
    const result = runCli(["--event", join(FIXTURES_DIR, "invalid-unknown-form-version.json"), "--output-dir", dir]);
    assert.equal(result.status, EXIT_CODES.unsupportedForm);
  });
});

test("exit code for submission validation failure", () => {
  withTmpDir((dir) => {
    const result = runCli(["--event", join(FIXTURES_DIR, "invalid-too-long-subject.json"), "--output-dir", dir]);
    assert.equal(result.status, EXIT_CODES.submissionValidationFailed);
  });
});

test("exit code for output-exists without --overwrite", () => {
  withTmpDir((dir) => {
    const args = ["--event", join(FIXTURES_DIR, "valid-new-dossier.json"), "--output-dir", dir, "--generated-at", "2026-08-02T00:00:00.000Z", "--repository-commit", "0000000000000000000000000000000000000f"];
    const first = runCli(args);
    assert.equal(first.status, EXIT_CODES.success);
    const second = runCli(args);
    assert.equal(second.status, EXIT_CODES.outputFailure);
  });
});

test("stderr on failure is structured JSON, never a raw stack trace", () => {
  withTmpDir((dir) => {
    const result = runCli(["--event", join(FIXTURES_DIR, "invalid-json.txt"), "--output-dir", dir]);
    assert.doesNotMatch(result.stderr, /at\s+\S+\s+\(.*:\d+:\d+\)/, "stderr must not contain a JS stack trace frame");
    const parsed = JSON.parse(result.stderr);
    assert.equal(parsed.status, "error");
    assert.ok(parsed.code);
  });
});
