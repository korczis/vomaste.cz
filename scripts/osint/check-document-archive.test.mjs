import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");

test("the archive doctrine is offline, complete and permanently wired", () => {
  const result = spawnSync(process.execPath, ["scripts/osint/check-document-archive.mjs"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Document archive policy OK/);
});
