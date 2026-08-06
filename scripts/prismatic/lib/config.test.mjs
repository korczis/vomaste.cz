#!/usr/bin/env node
// Unit tests for scripts/prismatic/lib/config.mjs (Fáze 2.1). Covers the
// resolution order and the "Prismatic absent" happy path — the public
// build must never require this path to resolve to something real.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseFlatToml,
  resolvePlatformPath,
  validatePlatformPath,
  contractVersionSupported,
  defaultConcurrency,
} from "./config.mjs";

test("parseFlatToml reads strings, numbers, and booleans, skips comments/blank lines", () => {
  const parsed = parseFlatToml(
    '# a comment\n\nname = "value"\ncount = 3\nratio = 0.5\nflag = true\n',
  );
  assert.deepEqual(parsed, { name: "value", count: 3, ratio: 0.5, flag: true });
});

test("parseFlatToml unescapes backslash-escaped quotes inside string values", () => {
  const parsed = parseFlatToml('note = "a \\"quoted\\" word"\n');
  assert.equal(parsed.note, 'a "quoted" word');
});

test("resolvePlatformPath prefers PRISMATIC_PLATFORM_PATH env var", () => {
  const result = resolvePlatformPath({ PRISMATIC_PLATFORM_PATH: "/tmp/somewhere" });
  assert.equal(result.source, "env");
  assert.equal(result.path, "/tmp/somewhere");
});

test("resolvePlatformPath falls back to the versioned default sibling path", () => {
  const result = resolvePlatformPath({});
  assert.equal(result.source, "default");
  assert.ok(result.path.endsWith("prismatic-platform"));
});

test("contractVersionSupported and defaultConcurrency read the versioned config", () => {
  assert.equal(typeof contractVersionSupported(), "string");
  assert.ok(contractVersionSupported().length > 0);
  assert.equal(typeof defaultConcurrency(), "number");
  assert.ok(defaultConcurrency() > 0);
});

test("validatePlatformPath reports path-not-found for a nonexistent directory — the normal 'Prismatic absent' state", () => {
  const result = validatePlatformPath("/nonexistent/definitely/not/here");
  assert.deepEqual(result, {
    ok: false,
    path: "/nonexistent/definitely/not/here",
    reason: "path-not-found",
  });
});

test("validatePlatformPath reports not-a-git-repo for an existing non-git directory", () => {
  const dir = mkdtempSync(join(tmpdir(), "prismatic-config-test-"));
  try {
    const result = validatePlatformPath(dir);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "not-a-git-repo");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("validatePlatformPath succeeds against this very repository (it is a real Git repo)", () => {
  const result = validatePlatformPath(process.cwd());
  assert.equal(result.ok, true);
  assert.match(result.commit, /^[0-9a-f]{40}$/);
});
