import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");

test("the committed Justice metadata archive is sanitized, complete and hash-valid", () => {
  const result = spawnSync(process.execPath, ["scripts/osint/archive-justice-entities.mjs", "--check"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Justice archive integrity OK/);
});
