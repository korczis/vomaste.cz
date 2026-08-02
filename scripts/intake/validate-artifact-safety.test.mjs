import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateArtifactSafety } from "./validate-artifact-safety.mjs";

function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "artifact-safety-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("a normal manifest/report/diagnostics set is safe", () => {
  withTmpDir((dir) => {
    const intakeDir = join(dir, "INTAKE-GH-korczis-vomaste-cz-000501");
    mkdirSync(intakeDir);
    writeFileSync(join(intakeDir, "manifest.json"), '{"id":"x"}');
    writeFileSync(join(intakeDir, "report.md"), "# report");
    writeFileSync(join(intakeDir, "processing-result.json"), '{"status":"success"}');
    writeFileSync(join(intakeDir, "diagnostics.json"), '{"issue_number":501}');
    writeFileSync(join(dir, "_status.json"), '{"status":"success"}');
    const result = validateArtifactSafety(dir);
    assert.equal(result.safe, true);
    assert.deepEqual(result.findings, []);
  });
});

test("a classic-format GitHub token anywhere in a file is flagged", () => {
  withTmpDir((dir) => {
    writeFileSync(join(dir, "diagnostics.json"), JSON.stringify({ leaked: "ghp_" + "a".repeat(36) }));
    const result = validateArtifactSafety(dir);
    assert.equal(result.safe, false);
    assert.ok(result.findings.some((f) => f.issue === "github_token"));
  });
});

test("an Authorization header is flagged", () => {
  withTmpDir((dir) => {
    writeFileSync(join(dir, "diagnostics.json"), "some log line\nAuthorization: Bearer abcdef123456\nmore text");
    const result = validateArtifactSafety(dir);
    assert.ok(result.findings.some((f) => f.issue === "authorization_header"));
  });
});

test("URL credentials (user:pass@host) are flagged", () => {
  withTmpDir((dir) => {
    writeFileSync(join(dir, "report.md"), "see https://user:hunter2@example.com/secret");
    const result = validateArtifactSafety(dir);
    assert.ok(result.findings.some((f) => f.issue === "url_credentials"));
  });
});

test("a private key block is flagged", () => {
  withTmpDir((dir) => {
    writeFileSync(join(dir, "diagnostics.json"), "-----BEGIN RSA PRIVATE KEY-----\nMIIB...\n-----END RSA PRIVATE KEY-----");
    const result = validateArtifactSafety(dir);
    assert.ok(result.findings.some((f) => f.issue === "private_key_block"));
  });
});

test("an unexpected filename is flagged even if its content is clean", () => {
  withTmpDir((dir) => {
    writeFileSync(join(dir, "raw-event.json"), '{"ok":true}');
    const result = validateArtifactSafety(dir);
    assert.equal(result.safe, false);
    assert.ok(result.findings.some((f) => f.file === "raw-event.json" && f.issue.includes("unexpected file")));
  });
});

test("an env-dump-style GITHUB_TOKEN= line is flagged", () => {
  withTmpDir((dir) => {
    writeFileSync(join(dir, "diagnostics.json"), "GITHUB_TOKEN=ghp_abcdef1234567890abcdef1234567890abcd");
    const result = validateArtifactSafety(dir);
    assert.ok(result.findings.some((f) => f.issue === "env_dump_marker"));
  });
});
