#!/usr/bin/env node
// One-time migration companion to migrate-to-dossiers-namespace.mjs: adds
// `aliases` (top-level, for old /dossier/... URLs) and `[extra] dossier` /
// `record_type` (for genuine multi-dossier generality) to every page under
// content/dossiers/macinka-turek/. Idempotent — skips a file if it already
// has an `aliases` line.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASE = join(ROOT, "content", "dossiers", "macinka-turek");
const SLUG = "macinka-turek";

const OLD_SEGMENT = {
  sources: "zdroje",
  claims: "tvrzeni",
  cases: "kauzy",
  gaps: "mezery",
};
const RECORD_TYPE = {
  sources: "source",
  claims: "claim",
  cases: "case",
  gaps: "gap",
};

function oldUrlFor(relPath) {
  // relPath like "_index.md", "sources/_index.md", "sources/src-01.md"
  const parts = relPath.split("/");
  if (parts.length === 1) return "/dossier/";
  const [dir, file] = parts;
  const oldSeg = OLD_SEGMENT[dir];
  if (file === "_index.md") return `/dossier/${oldSeg}/`;
  const slug = file.replace(/\.md$/, "");
  return `/dossier/${oldSeg}/${slug}/`;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith(".md")) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(BASE)) {
  const relPath = relative(BASE, file);
  const text = readFileSync(file, "utf8");
  if (/^aliases\s*=/m.test(text)) continue; // already migrated

  const fmEnd = text.indexOf("\n+++", 3);
  if (!text.startsWith("+++") || fmEnd === -1) {
    console.error(`SKIP ${relPath}: no front matter delimiters found`);
    continue;
  }
  let fm = text.slice(4, fmEnd); // strip leading "+++\n"
  const body = text.slice(fmEnd);

  const oldUrl = oldUrlFor(relPath);

  // Insert aliases right after the top-level fields, before [extra].
  const extraIdx = fm.indexOf("\n[extra]");
  if (extraIdx === -1) {
    console.error(`SKIP ${relPath}: no [extra] block found`);
    continue;
  }
  const topLevel = fm.slice(0, extraIdx);
  const extraBlock = fm.slice(extraIdx);

  const newTopLevel = topLevel.replace(/\n$/, "") + `\naliases = ["${oldUrl}"]\n`;

  const dir = relPath.split("/")[0]; // "sources" | "claims" | "cases" | "gaps" | "_index.md" (main page)
  const isMainPage = relPath === "_index.md";
  const isIndexPage = relPath.endsWith("/_index.md");
  let extraInsert = `dossier = "${SLUG}"\n`;
  if (isMainPage) extraInsert += `record_type = "dossier"\n`;
  else if (!isIndexPage && RECORD_TYPE[dir]) extraInsert += `record_type = "${RECORD_TYPE[dir]}"\n`;

  const newExtraBlock = extraBlock.replace(/^\n\[extra\]\n/, `\n[extra]\n${extraInsert}`);

  const newFm = newTopLevel + newExtraBlock;
  writeFileSync(file, "+++" + newFm + body, "utf8");
  changed++;
}

console.log(`Added aliases + dossier/record_type front matter to ${changed} file(s).`);
