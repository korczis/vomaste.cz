#!/usr/bin/env node
// One-time migration: rewrite internal @/dossier/... markdown links to the
// new /dossiers/{slug}/... namespace after content/dossier/* was moved to
// content/dossiers/macinka-turek/* (zdroje->sources, tvrzeni->claims,
// kauzy->cases, mezery->gaps). Idempotent — running it again on already-
// migrated content is a no-op since the old @/dossier/ pattern won't match.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SLUG = "macinka-turek";

const SEGMENT_MAP = {
  "zdroje": "sources",
  "tvrzeni": "claims",
  "kauzy": "cases",
  "mezery": "gaps",
};

function rewriteLink(path) {
  // path looks like "dossier/zdroje/src-01.md" or "dossier/_index.md"
  const parts = path.split("/");
  // parts[0] === "dossier"
  const rest = parts.slice(1);
  if (rest.length === 0) return `dossiers/${SLUG}/_index.md`;
  const [first, ...remainder] = rest;
  if (first === "_index.md") {
    return `dossiers/${SLUG}/_index.md`;
  }
  if (SEGMENT_MAP[first]) {
    return `dossiers/${SLUG}/${SEGMENT_MAP[first]}/${remainder.join("/")}`;
  }
  // Shouldn't happen given the known content shape, but fail loudly rather
  // than silently emit a broken link.
  throw new Error(`Unrecognized dossier sub-path segment: "${first}" in "${path}"`);
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith(".md")) files.push(full);
  }
  return files;
}

const files = walk(join(ROOT, "content", "dossiers"));
let totalReplacements = 0;
let filesChanged = 0;

for (const file of files) {
  const text = readFileSync(file, "utf8");
  let replacements = 0;
  const rewritten = text.replace(/@\/(dossier\/[a-zA-Z0-9_/.-]*\.md)/g, (m, path) => {
    replacements++;
    return "@/" + rewriteLink(path);
  });
  if (replacements > 0) {
    writeFileSync(file, rewritten, "utf8");
    filesChanged++;
    totalReplacements += replacements;
  }
}

console.log(`Rewrote ${totalReplacements} @/dossier/ link(s) across ${filesChanged} file(s).`);
