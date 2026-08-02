import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseCliArgs, processIssueEvent } from "./process-issue.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";
import { validateManifestShape } from "./lib/schema-validators.mjs";

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "tests", "fixtures", "intake");
const FIXED_CLOCK = "2026-08-02T00:00:00.000Z";
const FIXED_COMMIT = "0000000000000000000000000000000000000f";

async function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "intake-test-"));
  try {
    return await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function process(fixtureName, outputDir, overrides = {}) {
  return processIssueEvent({
    eventPath: join(FIXTURES_DIR, fixtureName),
    outputDir,
    generatedAt: FIXED_CLOCK,
    repositoryCommit: FIXED_COMMIT,
    overwrite: false,
    ...overrides,
  });
}

// ---- CLI argument parsing (§8.1) ----

test("parseCliArgs rejects an unknown flag", () => {
  assert.throws(() => parseCliArgs(["--bogus", "x"]), (err) => err instanceof IntakeError && err.code === ERROR_CODES.CLI_USAGE);
});

test("parseCliArgs rejects a missing value", () => {
  assert.throws(() => parseCliArgs(["--event"]), (err) => err instanceof IntakeError && err.code === ERROR_CODES.CLI_USAGE);
});

test("parseCliArgs rejects a duplicate flag", () => {
  assert.throws(() => parseCliArgs(["--event", "a", "--event", "b"]), (err) => err instanceof IntakeError && err.code === ERROR_CODES.CLI_USAGE);
});

test("parseCliArgs accepts --help with no other arguments", () => {
  assert.deepEqual(parseCliArgs(["--help"]), { overwrite: false, help: true, preflight: false });
});

test("parseCliArgs never accepts issue body as a positional/flag argument (no such flag exists)", () => {
  assert.throws(() => parseCliArgs(["--issue-body", "hello"]), (err) => err instanceof IntakeError && err.code === ERROR_CODES.CLI_USAGE);
});

test("parseCliArgs accepts --preflight as a bare flag", () => {
  assert.equal(parseCliArgs(["--preflight"]).preflight, true);
  assert.equal(parseCliArgs([]).preflight, false);
});

// ---- end-to-end fixture processing ----

const EXPECT_SUCCESS = new Set([
  "valid-new-dossier.json",
  "valid-new-entity.json",
  "valid-new-topic.json",
  "valid-link-existing-entities.json",
  "valid-czech-diacritics.json",
  "valid-markdown-links.json",
  "valid-crlf-body.json",
  "valid-minimum-fields.json",
  "valid-maximum-reasonable-size.json",
  "invalid-non-http-url.json", // §19: a "malicious"-named fixture that is a valid submission with a warning
  "invalid-shell-injection-text.json", // literal text, never executed — still a valid submission
  "invalid-prompt-injection-text.json", // literal text, never interpreted — still a valid submission
  "invalid-duplicate-marker.json", // second marker occurrence later in the body is inert
]);

const EXPECT_FAILURE_CODE = {
  "invalid-json.txt": ERROR_CODES.EVENT_INVALID_JSON,
  "invalid-missing-body.json": ERROR_CODES.EVENT_SCHEMA_INVALID,
  "invalid-missing-required-section.json": ERROR_CODES.MISSING_REQUIRED_SECTION,
  "invalid-duplicate-section.json": ERROR_CODES.DUPLICATE_SECTION,
  "invalid-unknown-form-version.json": ERROR_CODES.UNSUPPORTED_FORM_VERSION,
  "invalid-older-form-version.json": ERROR_CODES.UNSUPPORTED_FORM_VERSION,
  "invalid-missing-public-acknowledgement.json": ERROR_CODES.SUBMISSION_VALIDATION_FAILED,
  "invalid-confidential-material-acknowledgement.json": ERROR_CODES.SUBMISSION_VALIDATION_FAILED,
  "invalid-automatic-publication-acknowledgement.json": ERROR_CODES.SUBMISSION_VALIDATION_FAILED,
  "invalid-unsupported-submission-type.json": ERROR_CODES.SUBMISSION_VALIDATION_FAILED,
  "invalid-too-many-urls.json": ERROR_CODES.SUBMISSION_VALIDATION_FAILED,
  "invalid-too-long-subject.json": ERROR_CODES.SUBMISSION_VALIDATION_FAILED,
  "invalid-pathological-markdown.json": ERROR_CODES.DUPLICATE_SECTION,
  "invalid-hidden-marker-spoof.json": ERROR_CODES.MISSING_FORM_MARKER,
};

for (const fixtureName of EXPECT_SUCCESS) {
  test(`processes ${fixtureName} into a schema-valid, workflow-blocked manifest`, async () => {
    await withTmpDir(async (dir) => {
      const result = await process(fixtureName, dir);
      assert.equal(result.status, "success");
      const manifest = JSON.parse(readFileSync(join(dir, result.intake_id, "manifest.json"), "utf8"));
      assert.equal(manifest.workflow.authorization_status, "pending_owner");
      assert.equal(manifest.workflow.publication_status, "blocked");
      assert.deepEqual(validateManifestShape(manifest).errors, []);
    });
  });
}

for (const [fixtureName, expectedCode] of Object.entries(EXPECT_FAILURE_CODE)) {
  test(`fails ${fixtureName} with ${expectedCode} and writes no output directory`, async () => {
    await withTmpDir(async (dir) => {
      await assert.rejects(process(fixtureName, dir), (err) => err instanceof IntakeError && err.code === expectedCode);
      assert.deepEqual(readdirSync(dir), [], "a failed run must leave no output directory behind");
    });
  });
}

// ---- determinism (§7, §16.3) ----

test("the same event, clock and commit produce a byte-identical manifest and report across two independent runs", async () => {
  await withTmpDir(async (dirA) => {
    await withTmpDir(async (dirB) => {
      const a = await process("valid-new-dossier.json", dirA);
      const b = await process("valid-new-dossier.json", dirB);
      assert.equal(readFileSync(join(dirA, a.intake_id, "manifest.json"), "utf8"), readFileSync(join(dirB, b.intake_id, "manifest.json"), "utf8"));
      assert.equal(readFileSync(join(dirA, a.intake_id, "report.md"), "utf8"), readFileSync(join(dirB, b.intake_id, "report.md"), "utf8"));
    });
  });
});

test("editing the issue (an 'edited' action on the same issue number) does not change the intake ID", async () => {
  await withTmpDir(async (dir) => {
    const opened = await process("valid-new-dossier.json", dir);
    const eventPath = join(FIXTURES_DIR, "valid-new-dossier.json");
    const edited = JSON.parse(readFileSync(eventPath, "utf8"));
    edited.event.action = "edited";
    edited.issue.updated_at = "2026-08-02T12:00:00Z";
    const editedPath = join(dir, "edited-event.json");
    writeFileSync(editedPath, JSON.stringify(edited), "utf8");
    const editedResult = await process("edited-event.json", dir, { eventPath: editedPath, overwrite: true });
    assert.equal(opened.intake_id, editedResult.intake_id);
  });
});

// ---- output safety (§17, §24.3) ----

test("refuses to overwrite an existing intake output directory without --overwrite", async () => {
  await withTmpDir(async (dir) => {
    await process("valid-new-dossier.json", dir);
    await assert.rejects(process("valid-new-dossier.json", dir), (err) => err instanceof IntakeError && err.code === ERROR_CODES.OUTPUT_EXISTS);
  });
});

test("--overwrite replaces a prior run's output for the same intake ID", async () => {
  await withTmpDir(async (dir) => {
    const first = await process("valid-new-dossier.json", dir);
    const second = await process("valid-new-dossier.json", dir, { overwrite: true });
    assert.equal(first.intake_id, second.intake_id);
  });
});

test("leaves no partial output when validation fails before any output directory would have been created", async () => {
  await withTmpDir(async (dir) => {
    const before = readdirSync(dir);
    await assert.rejects(process("invalid-duplicate-section.json", dir));
    const after = readdirSync(dir);
    assert.deepEqual(before, after);
  });
});

test("refuses a symlinked event file (§8.2 symlink policy: refuse)", async () => {
  await withTmpDir(async (dir) => {
    const realTarget = join(dir, "real.json");
    writeFileSync(realTarget, readFileSync(join(FIXTURES_DIR, "valid-new-dossier.json")));
    const linkPath = join(dir, "link.json");
    symlinkSync(realTarget, linkPath);
    await assert.rejects(process("link.json", dir, { eventPath: linkPath }), (err) => err instanceof IntakeError && err.code === ERROR_CODES.EVENT_NOT_REGULAR_FILE);
  });
});

test("refuses an event path that is a directory", async () => {
  await withTmpDir(async (dir) => {
    const subdir = join(dir, "adir");
    mkdirSync(subdir);
    await assert.rejects(process("adir", dir, { eventPath: subdir }), (err) => err instanceof IntakeError && err.code === ERROR_CODES.EVENT_NOT_REGULAR_FILE);
  });
});

test("refuses an event file exceeding the size limit", async () => {
  await withTmpDir(async (dir) => {
    const bigPath = join(dir, "big.json");
    writeFileSync(bigPath, `{"padding":"${"x".repeat(1024 * 1024 + 100)}"}`);
    await assert.rejects(process("big.json", dir, { eventPath: bigPath }), (err) => err instanceof IntakeError && err.code === ERROR_CODES.EVENT_TOO_LARGE);
  });
});

// ---- Phase 4: --preflight stays opt-in; default run is offline (§23.1) ----

test("without --preflight, the manifest's source_preflight is entirely not_attempted — no network module is ever touched", async () => {
  await withTmpDir(async (dir) => {
    const result = await process("valid-markdown-links.json", dir);
    const manifest = JSON.parse(readFileSync(join(dir, result.intake_id, "manifest.json"), "utf8"));
    assert.ok(manifest.source_preflight.results.length > 0);
    assert.ok(manifest.source_preflight.results.every((r) => r.policy_decision === "not_attempted" && r.status === "not_attempted"));
  });
});

test("with preflight:true and an injected mock DNS adapter, source_preflight is populated with a real (mocked) outcome", async () => {
  await withTmpDir(async (dir) => {
    const result = await process("valid-markdown-links.json", dir, {
      preflight: true,
      preflightDnsAdapter: async () => ({ addresses: [{ address: "10.0.0.5", family: 4 }], resolvedAt: FIXED_CLOCK }),
    });
    const manifest = JSON.parse(readFileSync(join(dir, result.intake_id, "manifest.json"), "utf8"));
    assert.ok(manifest.source_preflight.results.some((r) => r.policy_decision === "blocked"), "a private-address mock DNS answer must be blocked, proving the SSRF policy actually ran");
  });
});
