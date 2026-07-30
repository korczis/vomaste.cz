#!/usr/bin/env node
// Regression test for scaffold-entity-dossier.mjs. The load-bearing
// behavior is the safety gate -- it must refuse to scaffold anyone not
// already in AGENTS.md's authorization log, and must not overwrite an
// existing dossier. Same throwaway-fixture pattern as the other tooling
// tests in this directory.
//
// Usage: node --test scripts/dossier/scaffold-entity-dossier.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, "scaffold-entity-dossier.mjs");

const FIXTURE_AGENTS_MD = `# fixture

## Content about real parties

### Authorized subject: Jane Doe (on the record)

Authorized, on the record, for testing purposes only.
`;

function makeFixtureRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), "vomaste-scaffold-test-"));
  mkdirSync(path.join(dir, "scripts", "dossier"), { recursive: true });
  cpSync(SCRIPT_PATH, path.join(dir, "scripts", "dossier", path.basename(SCRIPT_PATH)));
  writeFileSync(path.join(dir, "AGENTS.md"), FIXTURE_AGENTS_MD);
  return dir;
}

function run(args, cwd) {
  try {
    const out = execFileSync("node", ["scripts/dossier/scaffold-entity-dossier.mjs", ...args], {
      cwd,
      stdio: "pipe",
    });
    return { status: 0, out: out.toString() };
  } catch (err) {
    return {
      status: err.status,
      out: (err.stdout || "").toString() + (err.stderr || "").toString(),
    };
  }
}

function withFixture(fn) {
  const dir = makeFixtureRepo();
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("refuses to scaffold someone not in the authorization log", () => {
  withFixture((dir) => {
    const { status, out } = run(["--slug=john-smith", "--title=John Smith"], dir);
    assert.equal(status, 1);
    assert.match(out, /BLOCKED/);
    assert.equal(existsSync(path.join(dir, "content", "dossiers", "john-smith")), false);
  });
});

test("scaffolds an authorized subject and writes the expected files", () => {
  withFixture((dir) => {
    const { status } = run(["--slug=jane-doe", "--title=Jane Doe"], dir);
    assert.equal(status, 0);
    for (const rel of [
      "content/dossiers/jane-doe/_index.md",
      "content/dossiers/jane-doe/sources/_index.md",
      "content/dossiers/jane-doe/claims/_index.md",
      "content/dossiers/jane-doe/cases/_index.md",
      "content/dossiers/jane-doe/gaps/_index.md",
      "content/dossiers/jane-doe/relations/_index.md",
      "content/dossiers/jane-doe/evidence/_index.md",
      "data/dossiers/jane-doe/graph.toml",
      "data/dossiers/jane-doe/updates.toml",
    ]) {
      assert.ok(existsSync(path.join(dir, rel)), `expected ${rel} to exist`);
    }
    // Never touches data/dossiers.toml -- registration stays a separate step.
    assert.equal(existsSync(path.join(dir, "data", "dossiers.toml")), false);
  });
});

test("refuses to overwrite an existing dossier directory", () => {
  withFixture((dir) => {
    run(["--slug=jane-doe", "--title=Jane Doe"], dir);
    const { status, out } = run(["--slug=jane-doe", "--title=Jane Doe"], dir);
    assert.equal(status, 1);
    assert.match(out, /already exists/);
  });
});

test("rejects a non-kebab-case slug before touching the authorization gate", () => {
  withFixture((dir) => {
    const { status, out } = run(["--slug=Jane_Doe", "--title=Jane Doe"], dir);
    assert.equal(status, 1);
    assert.match(out, /kebab-case/);
  });
});
