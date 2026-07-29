#!/usr/bin/env node
// Regression test for verify-authorization-log-append-only.mjs. This
// script protects AGENTS.md's most safety-critical rule (the "Content
// about real parties" authorization log is append-only) — a bug here
// would silently stop catching a real edit/deletion of an authorization
// record, which is exactly the kind of failure that must never go
// unnoticed. Uses node's built-in test runner (`node --test`, Node 18+,
// this repo pins Node 24) — no new devDependency for a single test file.
//
// Each test builds a throwaway git repo fixture (mkdtemp, outside this
// repo), copies the validator into it so its ROOT-relative git commands
// resolve correctly, commits a known-good AGENTS.md, then mutates it and
// checks the validator's exit code. Mirrors the manual sandbox
// verification this script was originally checked against before being
// wired into the build gate — now permanent instead of thrown away.
//
// Usage: node --test scripts/dossier/verify-authorization-log-append-only.test.mjs
// (or: npm test, which runs every scripts/**/*.test.mjs)

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
  rmSync,
  cpSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, "verify-authorization-log-append-only.mjs");

const FIXTURE_AGENTS_MD = `# fixture

## Content about real parties

### Authorized subject: Alice (on the record)

Original text, must never change.

### Scope extension, 2026-01-01: more stuff

Also original text.
`;

function sh(cmd, cwd) {
  execFileSync("/bin/sh", ["-c", cmd], { cwd, stdio: "pipe" });
}

function makeFixtureRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), "vomaste-append-only-test-"));
  mkdirSync(path.join(dir, "scripts", "dossier"), { recursive: true });
  cpSync(SCRIPT_PATH, path.join(dir, "scripts", "dossier", path.basename(SCRIPT_PATH)));
  writeFileSync(path.join(dir, "AGENTS.md"), FIXTURE_AGENTS_MD);
  sh("git init -q", dir);
  sh('git -c user.email=t@t -c user.name=t add -A', dir);
  sh('git -c user.email=t@t -c user.name=t commit -q -m init', dir);
  return dir;
}

function runValidator(dir) {
  try {
    execFileSync("node", ["scripts/dossier/verify-authorization-log-append-only.mjs"], {
      cwd: dir,
      stdio: "pipe",
    });
    return 0;
  } catch (err) {
    return err.status;
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

test("passes when AGENTS.md is unchanged", () => {
  withFixture((dir) => {
    assert.equal(runValidator(dir), 0);
  });
});

test("passes when only a new dated entry is appended", () => {
  withFixture((dir) => {
    appendFileSync(
      path.join(dir, "AGENTS.md"),
      "\n### Structural change, 2026-02-02: something new\n\nBrand new entry, fine to add.\n",
    );
    assert.equal(runValidator(dir), 0);
  });
});

test("fails when an existing entry's text is edited", () => {
  withFixture((dir) => {
    const p = path.join(dir, "AGENTS.md");
    const content = readFileSync(p, "utf8").replace(
      "Original text, must never change.",
      "Original text, SNEAKILY EDITED.",
    );
    writeFileSync(p, content);
    assert.equal(runValidator(dir), 1);
  });
});

test("fails when an existing entry is removed entirely", () => {
  withFixture((dir) => {
    const p = path.join(dir, "AGENTS.md");
    const content = readFileSync(p, "utf8").replace(
      /\n### Scope extension, 2026-01-01: more stuff[\s\S]*/,
      "\n",
    );
    writeFileSync(p, content);
    assert.equal(runValidator(dir), 1);
  });
});
