#!/usr/bin/env node

/**
 * One offline owner for the public official-document archive policy.
 *
 * The three registry-specific checks prove file coverage, sanitization and
 * SHA-256 parity. This wrapper additionally proves that the policy remains
 * wired into every normal quality gate, that Zone B paths are absent from
 * Git, and that the scheduled network refresh can only open a reviewable PR.
 * It never accesses the network and never writes.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(import.meta.dirname, "../..");
const DOCTRINE_MARKER = "DOCUMENT_ARCHIVE_DOCTRINE_V1";

function fail(message) {
  throw new Error(`document archive policy: ${message}`);
}

function run(script, mode = "--check") {
  const result = spawnSync(process.execPath, [script, mode], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    fail([`${script} ${mode} failed`, result.stdout, result.stderr].filter(Boolean).join("\n"));
  }
  if (result.stdout.trim()) process.stdout.write(result.stdout);
}

for (const script of [
  "scripts/osint/archive-ares-entities.mjs",
  "scripts/osint/archive-justice-entities.mjs",
  "scripts/osint/archive-court-noticeboards.mjs",
]) {
  run(script);
}

const requiredDocs = ["AGENTS.md", "README.md", "CLAUDE.md"];
for (const file of requiredDocs) {
  const text = readFileSync(join(ROOT, file), "utf8");
  for (const token of [DOCTRINE_MARKER, "archive:check", "Zone A", "Zone B", "VOMASTE_JUSTICE_ARCHIVE_ROOT"]) {
    if (!text.includes(token)) fail(`${file} lacks required doctrine token ${token}`);
  }
}

const { MODES } = await import(pathToFileURL(join(ROOT, "scripts/build/pipeline.mjs")).href);
for (const mode of ["build", "dev", "check"]) {
  if (!MODES?.[mode]?.includes("archive:check")) fail(`archive:check is missing from pipeline mode ${mode}`);
}

const precommit = readFileSync(join(ROOT, ".githooks/pre-commit"), "utf8");
if (!/FAST_CHECKS=\([\s\S]*?\n\s*archive:check\b[\s\S]*?\n\)/m.test(precommit)) {
  fail("archive:check is missing from the pre-commit FAST_CHECKS array");
}

const workflowPath = join(ROOT, ".github/workflows/archive-refresh.yml");
if (!existsSync(workflowPath)) fail("scheduled .github/workflows/archive-refresh.yml is missing");
const workflow = readFileSync(workflowPath, "utf8");
for (const [label, pattern] of [
  ["schedule", /^\s*schedule:\s*$/m],
  ["manual dispatch", /^\s*workflow_dispatch:\s*$/m],
  ["public refresh", /run:\s*npm run archive:refresh-public\s*$/m],
  ["offline archive gate", /run:\s*npm run archive:check\s*$/m],
  ["full build", /run:\s*npm run build\s*$/m],
  ["review PR", /gh pr (?:create|edit)/m],
  ["pull-request permission", /^\s*pull-requests:\s*write\s*$/m],
]) {
  if (!pattern.test(workflow)) fail(`archive refresh workflow lacks ${label}`);
}
for (const [label, pattern] of [
  ["private archive download", /archive:refresh-private|archive-justice-entities\.mjs[^\n]*--download/],
  ["direct master push", /git push[^\n]*(?:refs\/heads\/)?master\b/],
  ["raw Zone B artifact upload", /upload-artifact[\s\S]*(?:justice-api-metadata|sbirka-listin|court-noticeboards-raw)/],
]) {
  if (pattern.test(workflow)) fail(`archive refresh workflow contains forbidden ${label}`);
}

const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const forbiddenTracked = tracked.filter((file) =>
  /(?:^|\/)(?:vomaste-archive|justice-api-metadata|sbirka-listin|court-noticeboards-raw)(?:\/|$)|\.part$/i.test(file),
);
if (forbiddenTracked.length) fail(`Zone B or partial files are tracked: ${forbiddenTracked.join(", ")}`);

for (const file of ["content/dokumenty/_index.md", "templates/document-archive.html", "data/document-archive.json"]) {
  if (!existsSync(join(ROOT, file))) fail(`public archive UI dependency is missing: ${file}`);
}

console.log(`Document archive policy OK: registry coverage, hashes, doctrine wiring, Zone A/B boundary and scheduled review workflow verified (${DOCTRINE_MARKER}).`);
