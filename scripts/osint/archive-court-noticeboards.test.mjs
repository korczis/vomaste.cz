import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");

test("the committed court-noticeboard checks are docket-only and hash-valid", () => {
  const result = spawnSync(process.execPath, ["scripts/osint/archive-court-noticeboards.mjs", "--check"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Court-noticeboard archive integrity OK/);
});
