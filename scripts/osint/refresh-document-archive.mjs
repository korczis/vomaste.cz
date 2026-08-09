#!/usr/bin/env node

/**
 * Networked refresh owner for the official-document archive.
 *
 * --public refreshes only publishable Zone A derivatives, then runs the
 * offline gate. Raw Justice metadata and non-empty noticeboard responses are
 * still written outside Git. --private downloads all indexed Justice files to
 * persistent Zone B storage and requires a complete checksum inventory.
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const mode = process.argv.includes("--public") ? "public" : process.argv.includes("--private") ? "private" : null;
if (!mode) {
  console.error("usage: node scripts/osint/refresh-document-archive.mjs --public|--private");
  process.exit(2);
}

function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: ROOT, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (mode === "public") {
  run(["scripts/osint/archive-ares-entities.mjs", "--fetch"]);
  run(["scripts/osint/archive-justice-entities.mjs", "--fetch"]);
  run(["scripts/osint/archive-court-noticeboards.mjs", "--fetch"]);
  run(["scripts/osint/check-document-archive.mjs"]);
} else {
  run(["scripts/osint/archive-justice-entities.mjs", "--download"]);
  run(["scripts/osint/check-private-document-archive.mjs", "--write-inventory", "--require-complete"]);
}
