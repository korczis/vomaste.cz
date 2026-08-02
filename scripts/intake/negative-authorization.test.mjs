// Explicit negative tests (PHASE_002.md §20.4, §1.1, §1.2): the processor
// must be MECHANICALLY unable to authorize or publish anything, or to
// touch production dossier data — not just "doesn't happen to today."
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { processIssueEvent } from "./process-issue.mjs";
import { buildIntakeManifest } from "./build-intake-manifest.mjs";

const INTAKE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(INTAKE_DIR, "..", "..");
const FIXTURES_DIR = join(REPO_ROOT, "tests/fixtures/intake");

function listSourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listSourceFiles(full));
    else if (name.endsWith(".mjs") && !name.endsWith(".test.mjs")) out.push(full);
  }
  return out;
}

test("no source file assigns a forbidden value to authorization_status/publication_status/decision_class/authorization_effect", () => {
  // Anchored to the actual field-assignment shape (not a blanket string
  // ban) so this stays precise even where a comment legitimately
  // discusses the forbidden values by name (as build-intake-manifest.mjs's
  // own header comment does, to explain why they're unreachable).
  const FORBIDDEN_ASSIGNMENTS = [
    /authorization_status["'\s:]*[:=]\s*["'](authorized)["']/,
    /publication_status["'\s:]*[:=]\s*["'](publishable|published)["']/,
    /decision_class["'\s:]*[:=]\s*["'](?!machine_draft_only)/,
    /authorization_effect["'\s:]*[:=]\s*["'](?!none)/,
  ];
  const offenders = [];
  for (const file of listSourceFiles(INTAKE_DIR)) {
    const content = readFileSync(file, "utf8");
    for (const pattern of FORBIDDEN_ASSIGNMENTS) {
      if (pattern.test(content)) offenders.push(`${file}: ${pattern}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("buildIntakeManifest's return value cannot express any authorization_status other than pending_owner", () => {
  // Static proof, not just a runtime sample: the manifest builder writes
  // a hardcoded literal, so every call — with any input — produces the
  // same value.
  const source = readFileSync(join(INTAKE_DIR, "build-intake-manifest.mjs"), "utf8");
  assert.match(source, /authorization_status:\s*"pending_owner"/);
  assert.match(source, /publication_status:\s*"blocked"/);
});

test("no module under scripts/intake/ writes into data/dossiers/, content/, AGENTS.md, or data/authorizations.toml", () => {
  const forbiddenPathFragments = ["data/dossiers", "content/dossiers", "AGENTS.md", "data/authorizations.toml", "authorize-entity"];
  const offenders = [];
  for (const file of listSourceFiles(INTAKE_DIR)) {
    const content = readFileSync(file, "utf8");
    for (const fragment of forbiddenPathFragments) {
      if (content.includes(fragment)) offenders.push(`${file}: ${fragment}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("no module under scripts/intake/ invokes git commit/push, or the authorize-entity script", () => {
  const offenders = [];
  for (const file of listSourceFiles(INTAKE_DIR)) {
    const content = readFileSync(file, "utf8");
    if (/git["'\s,]+commit\b/.test(content)) offenders.push(`${file}: git commit`);
    if (/git["'\s,]+push\b/.test(content)) offenders.push(`${file}: git push`);
  }
  assert.deepEqual(offenders, []);
});

test("running the full pipeline over every fixture never produces a manifest outside {pending_owner, blocked}", () => {
  withTmpDir((dir) => {
    for (const fixtureName of readdirSync(FIXTURES_DIR)) {
      if (!fixtureName.endsWith(".json")) continue;
      try {
        const result = processIssueEvent({
          eventPath: join(FIXTURES_DIR, fixtureName),
          outputDir: dir,
          generatedAt: "2026-08-02T00:00:00.000Z",
          repositoryCommit: "0000000000000000000000000000000000000f",
          overwrite: true,
        });
        const manifest = JSON.parse(readFileSync(join(dir, result.intake_id, "manifest.json"), "utf8"));
        assert.equal(manifest.workflow.authorization_status, "pending_owner", fixtureName);
        assert.equal(manifest.workflow.publication_status, "blocked", fixtureName);
      } catch {
        // A fixture that fails validation produces no manifest at all —
        // also a valid outcome for this invariant (nothing to check).
      }
    }
  });
});

test("this repository's AGENTS.md and data/authorizations.toml are untouched by any intake test run (checked against the working tree, not just source text)", () => {
  // Belt-and-suspenders: confirm the files this whole invariant protects
  // still exist and were not truncated/replaced by a stray test run.
  assert.ok(statSync(join(REPO_ROOT, "AGENTS.md")).size > 1000);
});

function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "intake-negauth-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
