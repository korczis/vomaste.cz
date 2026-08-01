#!/usr/bin/env node
// Regression tests for check-workflow-parity.mjs (coop task T-026). The
// load-bearing behavior is that the exact drift which broke production —
// a workflow that re-lists pipeline steps instead of calling `npm run
// build` — fails the check. A guard that only ever passes would be the
// same claimed-but-not-real enforcement it exists to prevent.
//
// Usage: node --test scripts/ci/check-workflow-parity.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const SCRIPT = path.join(__dirname, "check-workflow-parity.mjs");

function fixture(mutateWorkflow) {
  const dir = mkdtempSync(path.join(tmpdir(), "vomaste-parity-test-"));
  mkdirSync(path.join(dir, "scripts", "ci"), { recursive: true });
  mkdirSync(path.join(dir, "scripts", "build"), { recursive: true });
  mkdirSync(path.join(dir, ".github", "workflows"), { recursive: true });
  cpSync(SCRIPT, path.join(dir, "scripts", "ci", "check-workflow-parity.mjs"));
  // Fáze G: seznam kroků buildu žije v pipeline orchestrátoru — checker
  // ho čte, takže fixture ho potřebuje taky.
  cpSync(path.join(ROOT, "scripts", "build", "pipeline.mjs"), path.join(dir, "scripts", "build", "pipeline.mjs"));
  cpSync(path.join(ROOT, "package.json"), path.join(dir, "package.json"));
  const wf = readFileSync(path.join(ROOT, ".github/workflows/deploy.yml"), "utf8");
  writeFileSync(path.join(dir, ".github/workflows/deploy.yml"), mutateWorkflow(wf));
  return dir;
}

function run(dir) {
  try {
    return { status: 0, out: execFileSync("node", ["scripts/ci/check-workflow-parity.mjs"], { cwd: dir, stdio: "pipe" }).toString() };
  } catch (e) {
    return { status: e.status, out: (e.stdout || "").toString() + (e.stderr || "").toString() };
  }
}

test("the real workflow passes", () => {
  const out = execFileSync("node", [SCRIPT], { stdio: "pipe" }).toString();
  assert.match(out, /OK — CI runs the same pipeline/);
});

test("a workflow that stops calling `npm run build` fails", () => {
  const dir = fixture((wf) => wf.replace(/run: npm run build\s*$/m, "run: echo skipped"));
  try {
    const { status, out } = run(dir);
    assert.notEqual(status, 0);
    assert.match(out, /does not run `npm run build`/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("re-listing a pipeline step fails — this is the drift that broke production", () => {
  const dir = fixture((wf) =>
    wf.replace("      - name: Upload artifact", "      - name: Build JSON-LD exports\n        run: npm run build:jsonld-exports\n\n      - name: Upload artifact"),
  );
  try {
    const { status, out } = run(dir);
    assert.notEqual(status, 0);
    assert.match(out, /re-lists 1 script/);
    assert.match(out, /build:jsonld-exports/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a workflow uploading the wrong directory fails", () => {
  const dir = fixture((wf) => wf.replace(/path: \.\/public\s*$/m, "path: ./dist"));
  try {
    const { status, out } = run(dir);
    assert.notEqual(status, 0);
    assert.match(out, /does not upload \.\/public/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
