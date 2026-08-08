import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE_SCRIPT = resolve(HERE, "archive-ares-entities.mjs");

test("the committed public-document archive is complete and hash-valid", () => {
  const result = spawnSync(process.execPath, [ARCHIVE_SCRIPT, "--check"], {
    cwd: resolve(HERE, "../.."),
    encoding: "utf8",
  });

  assert.equal(
    result.status,
    0,
    [result.stdout, result.stderr].filter(Boolean).join("\n"),
  );
});
