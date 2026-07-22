#!/usr/bin/env node
/*
 * Referential-integrity check for the dossier's claim/source registry.
 * Not a general TOML parser — tailored to this project's flat front-matter
 * shape (content/dossier/zdroje/src-*.md), which is all it needs to handle.
 * No network access; deterministic; exits non-zero on any error.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIER_MD = join(ROOT, "content/dossier/_index.md");
const SRC_DIR = join(ROOT, "content/dossier/zdroje");

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

// --- Load the main dossier and extract the claims registry table ---
const dossierText = readFileSync(DOSSIER_MD, "utf8");

// Every "| CLM-XX | ... |" row in the Registr tvrzení table.
const clmRowRe = /^\|\s*(CLM-\d+)\s*\|(.+)\|$/gm;
const clmIds = new Map(); // id -> referenced SRC ids
let m;
while ((m = clmRowRe.exec(dossierText))) {
  const id = m[1];
  const row = m[2];
  if (!/^CLM-\d{2,}$/.test(id)) err(`Malformed CLM id: "${id}"`);
  if (clmIds.has(id)) err(`Duplicate CLM id in registry table: ${id}`);
  const srcRefs = [...row.matchAll(/SRC-\d+/g)].map((x) => x[0]);
  clmIds.set(id, srcRefs);
}
if (clmIds.size === 0) err("No CLM-## rows found in content/dossier/_index.md — table format may have changed.");

// Every SRC-## the dossier body links to (as internal @/... markdown links).
// Link text may be "SRC-XX" or an outlet name ("[Deník N](@/dossier/zdroje/src-14.md)")
// — what matters for "is this source clickable from the body" is the target, not the text.
const linkedSrcRe = /\[([^\]]*)\]\(@\/dossier\/zdroje\/src-(\d+)\.md\)/g;
const linkedSrcIds = new Set();
while ((m = linkedSrcRe.exec(dossierText))) {
  const linkText = m[1];
  const targetId = m[2];
  const textAsSrcId = linkText.match(/^SRC-(\d+)$/);
  if (textAsSrcId && textAsSrcId[1] !== targetId) {
    err(`Link text SRC-${textAsSrcId[1]} points at src-${targetId}.md — mismatched id in link.`);
  }
  linkedSrcIds.add(`SRC-${targetId.padStart(2, "0")}`);
}

// --- Load every source page ---
const srcFiles = readdirSync(SRC_DIR).filter((f) => /^src-\d+\.md$/.test(f));
const srcById = new Map(); // SRC-XX -> { file, extra fields }
const urlToSrc = new Map();

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m");
  const found = text.match(re);
  return found ? found[1] : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return null;
  return [...found[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]);
}

for (const file of srcFiles) {
  const full = join(SRC_DIR, file);
  const text = readFileSync(full, "utf8");
  const fmEnd = text.indexOf("\n+++", 3);
  if (!text.startsWith("+++") || fmEnd === -1) {
    err(`${file}: missing or malformed +++ front matter delimiters`);
    continue;
  }
  const fm = text.slice(0, fmEnd);

  const srcId = extractField(fm, "src_id");
  const outlet = extractField(fm, "outlet");
  const srcType = extractField(fm, "src_type");
  const url = extractField(fm, "url");
  const retrieved = extractField(fm, "retrieved");
  const family = extractField(fm, "family");
  const claims = extractArrayField(fm, "claims") ?? [];

  const expectedId = "SRC-" + file.match(/^src-(\d+)\.md$/)[1];
  if (!srcId) err(`${file}: missing required field src_id`);
  else if (srcId !== expectedId) err(`${file}: src_id "${srcId}" does not match filename (expected ${expectedId})`);
  if (!/^SRC-\d{2,}$/.test(srcId ?? "")) err(`${file}: src_id "${srcId}" does not match format SRC-\\d{2,}`);
  if (!outlet) err(`${file}: missing required field outlet`);
  if (!srcType) err(`${file}: missing required field src_type`);
  if (!url) err(`${file}: missing required field url`);
  else if (!/^https?:\/\//.test(url)) err(`${file}: url "${url}" is not a valid http(s) URL`);
  if (!retrieved) err(`${file}: missing required field retrieved (date added to dossier)`);
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(retrieved)) err(`${file}: retrieved "${retrieved}" is not YYYY-MM-DD`);

  if (srcId) {
    if (srcById.has(srcId)) err(`Duplicate src_id across files: ${srcId} (${srcById.get(srcId).file} and ${file})`);
    else srcById.set(srcId, { file, outlet, srcType, url, claims, family });
  }
  if (url) {
    if (urlToSrc.has(url) && urlToSrc.get(url) !== srcId) {
      warn(`Duplicate canonical URL: ${url} used by both ${urlToSrc.get(url)} and ${srcId} — confirm this is intentional (e.g. two distinct claims from the same article) or merge.`);
    } else {
      urlToSrc.set(url, srcId);
    }
  }

  for (const c of claims) {
    if (!clmIds.has(c)) err(`${file}: claims references ${c}, which does not exist in the Registr tvrzení table`);
  }
}

// --- Cross-check: every SRC-## the CLM table cites must exist as a file ---
for (const [clmId, srcs] of clmIds) {
  if (srcs.length === 0) warn(`${clmId}: no SRC-## reference in its table row`);
  for (const s of srcs) {
    if (!srcById.has(s)) err(`${clmId} references ${s}, but content/dossier/zdroje/${s.toLowerCase()}.md does not exist`);
  }
}

// --- Cross-check: every SRC-## file linked from the dossier body must resolve ---
for (const s of linkedSrcIds) {
  if (!srcById.has(s)) err(`Dossier body links to ${s}, but no matching source file exists`);
}

// --- Orphan sources: exist on disk, support no claim, but weren't declared claims = [] on purpose ---
for (const [srcId, info] of srcById) {
  if (info.claims.length === 0 && !linkedSrcIds.has(srcId)) {
    warn(`${srcId} (${info.file}) is claims = [] (context-only) and is not linked anywhere in the dossier body — dead page?`);
  }
}

// --- Source families: named families count as one; sources with no
// declared family are their own singleton family. ---
const namedFamilies = new Set();
let singletons = 0;
for (const info of srcById.values()) {
  if (info.family) namedFamilies.add(info.family);
  else singletons++;
}
const familyCount = singletons + namedFamilies.size;

// --- Report ---
console.log(`Checked ${srcById.size} source files against ${clmIds.size} claims.`);
console.log(`Source families: ${familyCount} (${namedFamilies.size} named group(s): ${[...namedFamilies].join(", ") || "none"}; ${singletons} singleton source(s)).`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  WARN  ${w}`);
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`\nOK — no referential-integrity errors.`);
