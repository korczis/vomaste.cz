#!/usr/bin/env node
/*
 * Referential-integrity check for every dossier's claim/source/case/gap
 * registry. Not a general TOML parser — tailored to this project's flat
 * front-matter shape (content/dossiers/<slug>/**), which is all it needs
 * to handle. Runs once per subdirectory of content/dossiers/, so adding a
 * new authorized dossier does not require touching this script. No network
 * access; deterministic; exits non-zero on any error across any dossier.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isCanonicalDossier } from "./lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function tomlUnescape(str) {
  return str.replace(/\\(.)/g, "$1");
}
function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? tomlUnescape(found[1]) : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return null;
  return [...found[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]);
}

function validateDossier(slug) {
  const BASE = join(DOSSIERS_ROOT, slug);
  const DOSSIER_MD = join(BASE, "_index.md");
  const SRC_DIR = join(BASE, "sources");
  const CLM_DIR = join(BASE, "claims");
  const CASE_DIR = join(BASE, "cases");
  const p = (rel) => `content/dossiers/${slug}/${rel}`;

  const dossierText = readFileSync(DOSSIER_MD, "utf8");

  // Every "| CLM-XX | ... |" row in the Registr tvrzení table. The ID cell
  // carries a leading `<a id="clm-XX"></a>` anchor (required — see below)
  // plus the visible id, which is itself a markdown link to that claim's
  // detail page under sources/claims/.
  const clmRowRe = /^\|\s*(?:<a id="clm-(\d+)"><\/a>)?\[?(CLM-\d+)\]?(?:\(@\/dossiers\/[a-z0-9-]+\/claims\/(clm-\d+)\.md\))?\s*\|\s*(.+?)\s*\|\s*<span class="status-badge (status-[a-z]+)">([^<]+)<\/span>\s*\|(.+)\|$/gm;
  const clmIds = new Map(); // id -> referenced SRC ids
  const clmTableRows = new Map(); // id -> { text, statusClass, statusLabel, srcRefs, linkSlug }
  let m;
  while ((m = clmRowRe.exec(dossierText))) {
    const [, anchorNum, id, linkSlug, text, statusClass, statusLabel, sourcesCell] = m;
    if (!/^CLM-\d{2,}$/.test(id)) err(`[${slug}] Malformed CLM id: "${id}"`);
    if (clmIds.has(id)) err(`[${slug}] Duplicate CLM id in registry table: ${id}`);
    if (!anchorNum) {
      err(`[${slug}] ${id}: table row has no <a id="clm-##"></a> anchor — it isn't directly linkable`);
    } else if (`CLM-${anchorNum}` !== id) {
      err(`[${slug}] ${id} row has mismatched anchor id="clm-${anchorNum}"`);
    }
    const expectedSlug = "clm-" + id.match(/CLM-(\d+)/)[1];
    if (!linkSlug) {
      err(`[${slug}] ${id}: table row id cell is not a link to its detail page (expected [${id}](@/dossiers/${slug}/claims/${expectedSlug}.md))`);
    } else if (linkSlug !== expectedSlug) {
      err(`[${slug}] ${id}: table row links to ${linkSlug}.md, expected ${expectedSlug}.md`);
    }
    const srcRefs = [...sourcesCell.matchAll(/SRC-\d+/g)].map((x) => x[0]);
    clmIds.set(id, srcRefs);
    clmTableRows.set(id, { text, statusClass, statusLabel: statusLabel.trim(), srcRefs, linkSlug });

    // Status vocabulary + evidentiary-floor checks. "CORROBORATED" is
    // defined on-page as "potvrzeno nezávisle více médii" — a row carrying
    // that badge with a single cited source is definitionally wrong (use
    // status-single instead). Symmetrically, status-single with 2+ sources
    // is an understatement that hides corroboration.
    const KNOWN_STATUSES = new Set([
      "status-corroborated",
      "status-single",
      "status-quote",
      "status-disputed",
      "status-opinion",
    ]);
    if (!KNOWN_STATUSES.has(statusClass)) {
      err(`[${slug}] ${id}: unknown claim status "${statusClass}" — allowed: ${[...KNOWN_STATUSES].join(", ")}`);
    }
    const distinctSrcs = new Set(srcRefs);
    if (statusClass === "status-corroborated" && distinctSrcs.size < 2) {
      err(`[${slug}] ${id}: status-corroborated with ${distinctSrcs.size} cited source(s) — the badge's own definition requires 2+ independent sources; use status-single or add a second source`);
    }
    if (statusClass === "status-single" && distinctSrcs.size > 1) {
      err(`[${slug}] ${id}: status-single but cites ${distinctSrcs.size} sources — either sources are not independent (document why) or the status should be status-corroborated`);
    }
  }
  if (clmIds.size === 0) err(`[${slug}] No CLM-## rows found in ${p("_index.md")} — table format may have changed.`);

  // Every SRC-## the dossier body links to (as internal @/... markdown links).
  const linkedSrcRe = new RegExp(`\\[([^\\]]*)\\]\\(@/dossiers/${slug}/sources/src-(\\d+)\\.md\\)`, "g");
  const linkedSrcIds = new Set();
  while ((m = linkedSrcRe.exec(dossierText))) {
    const linkText = m[1];
    const targetId = m[2];
    const textAsSrcId = linkText.match(/^SRC-(\d+)$/);
    if (textAsSrcId && textAsSrcId[1] !== targetId) {
      err(`[${slug}] Link text SRC-${textAsSrcId[1]} points at src-${targetId}.md — mismatched id in link.`);
    }
    linkedSrcIds.add(`SRC-${targetId.padStart(2, "0")}`);
  }

  // --- Load every source page ---
  const srcFiles = readdirSync(SRC_DIR).filter((f) => /^src-\d+\.md$/.test(f));
  const srcById = new Map();
  const urlToSrc = new Map();

  for (const file of srcFiles) {
    const full = join(SRC_DIR, file);
    const text = readFileSync(full, "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    if (!text.startsWith("+++") || fmEnd === -1) {
      err(`[${slug}] ${p("sources/" + file)}: missing or malformed +++ front matter delimiters`);
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
    if (!srcId) err(`[${slug}] ${file}: missing required field src_id`);
    else if (srcId !== expectedId) err(`[${slug}] ${file}: src_id "${srcId}" does not match filename (expected ${expectedId})`);
    if (!/^SRC-\d{2,}$/.test(srcId ?? "")) err(`[${slug}] ${file}: src_id "${srcId}" does not match format SRC-\\d{2,}`);
    if (!outlet) err(`[${slug}] ${file}: missing required field outlet`);
    if (!srcType) err(`[${slug}] ${file}: missing required field src_type`);
    if (!url) err(`[${slug}] ${file}: missing required field url`);
    else if (!/^https?:\/\//.test(url)) err(`[${slug}] ${file}: url "${url}" is not a valid http(s) URL`);
    if (!retrieved) err(`[${slug}] ${file}: missing required field retrieved (date added to dossier)`);
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(retrieved)) err(`[${slug}] ${file}: retrieved "${retrieved}" is not YYYY-MM-DD`);

    if (srcId) {
      if (srcById.has(srcId)) err(`[${slug}] Duplicate src_id across files: ${srcId} (${srcById.get(srcId).file} and ${file})`);
      else srcById.set(srcId, { file, outlet, srcType, url, claims, family });
    }
    if (url) {
      if (urlToSrc.has(url) && urlToSrc.get(url) !== srcId) {
        warn(`[${slug}] Duplicate canonical URL: ${url} used by both ${urlToSrc.get(url)} and ${srcId} — confirm this is intentional or merge.`);
      } else {
        urlToSrc.set(url, srcId);
      }
    }

    for (const c of claims) {
      if (!clmIds.has(c)) err(`[${slug}] ${file}: claims references ${c}, which does not exist in the Registr tvrzení table`);
    }
  }

  for (const [clmId, srcs] of clmIds) {
    if (srcs.length === 0) warn(`[${slug}] ${clmId}: no SRC-## reference in its table row`);
    for (const s of srcs) {
      if (!srcById.has(s)) err(`[${slug}] ${clmId} references ${s}, but ${p("sources/" + s.toLowerCase() + ".md")} does not exist`);
    }
  }

  for (const s of linkedSrcIds) {
    if (!srcById.has(s)) err(`[${slug}] Dossier body links to ${s}, but no matching source file exists`);
  }

  for (const [srcId, info] of srcById) {
    if (info.claims.length === 0 && !linkedSrcIds.has(srcId)) {
      warn(`[${slug}] ${srcId} (${info.file}) is claims = [] (context-only) and is not linked anywhere in the dossier body — dead page?`);
    }
  }

  const namedFamilies = new Set();
  let singletons = 0;
  for (const info of srcById.values()) {
    if (info.family) namedFamilies.add(info.family);
    else singletons++;
  }
  const familyCount = singletons + namedFamilies.size;

  // --- Per-record claim pages must exist 1:1 with table rows and carry
  // identical text/status/sources. ---
  const clmFiles = readdirSync(CLM_DIR).filter((f) => /^clm-\d+\.md$/.test(f));
  const clmPageIds = new Set();
  for (const file of clmFiles) {
    const text = readFileSync(join(CLM_DIR, file), "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    if (!text.startsWith("+++") || fmEnd === -1) {
      err(`[${slug}] ${p("claims/" + file)}: missing or malformed +++ front matter delimiters`);
      continue;
    }
    const fm = text.slice(0, fmEnd);
    const clmId = extractField(fm, "clm_id");
    const status = extractField(fm, "status");
    const summary = extractField(fm, "summary");
    const sources = extractArrayField(fm, "sources") ?? [];
    const pageDossier = extractField(fm, "dossier");

    const expectedId = "CLM-" + file.match(/^clm-(\d+)\.md$/)[1];
    if (!clmId) err(`[${slug}] ${p("claims/" + file)}: missing required field clm_id`);
    else if (clmId !== expectedId) err(`[${slug}] ${p("claims/" + file)}: clm_id "${clmId}" does not match filename (expected ${expectedId})`);
    else clmPageIds.add(clmId);
    if (pageDossier !== slug) err(`[${slug}] ${p("claims/" + file)}: extra.dossier "${pageDossier}" does not match its own directory "${slug}"`);

    if (clmId && !clmTableRows.has(clmId)) {
      err(`[${slug}] ${p("claims/" + file)}: ${clmId} has a detail page but no row in the Registr tvrzení table`);
      continue;
    }
    if (!clmId) continue;
    const row = clmTableRows.get(clmId);
    if (row.statusClass !== status) err(`[${slug}] ${clmId}: page status "${status}" does not match table status "${row.statusClass}"`);
    if (row.text !== summary) err(`[${slug}] ${clmId}: page summary does not match table text verbatim (drifted copy)`);
    const rowSrcSet = new Set(row.srcRefs);
    const pageSrcSet = new Set(sources);
    if (rowSrcSet.size !== pageSrcSet.size || [...rowSrcSet].some((s) => !pageSrcSet.has(s))) {
      err(`[${slug}] ${clmId}: page sources [${sources.join(", ")}] do not match table sources [${row.srcRefs.join(", ")}]`);
    }
  }
  for (const id of clmTableRows.keys()) {
    if (!clmPageIds.has(id)) err(`[${slug}] ${id}: table row has no matching detail page in ${p("claims/")}`);
  }

  // --- Per-record case pages must exist 1:1 with [[extra.cases]] entries. ---
  const caseBlockRe = /\[\[extra\.cases\]\]\n([\s\S]*?)(?=\n\[\[|\n\n|$)/g;
  const frontMatterEndIdx = dossierText.indexOf("\n+++", 4);
  const dossierFrontMatter = dossierText.slice(0, frontMatterEndIdx);
  const tableCase = [];
  let cm;
  while ((cm = caseBlockRe.exec(dossierFrontMatter))) {
    const block = cm[1];
    const get = (key) => {
      const f = block.match(new RegExp(`^${key} = "(.*)"$`, "m"));
      return f ? f[1] : null;
    };
    const getArray = (key) => {
      const f = block.match(new RegExp(`^${key} = (\\[.*\\])$`, "m"));
      return f ? [...f[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]) : [];
    };
    tableCase.push({
      anchor: get("anchor"),
      period: get("period"),
      title: get("title"),
      status: get("status"),
      label: get("label"),
      summary: get("summary"),
      claims: getArray("claims"),
    });
  }
  if (tableCase.length === 0) err(`[${slug}] No [[extra.cases]] entries found in ${p("_index.md")} front matter.`);

  const caseFiles = readdirSync(CASE_DIR).filter((f) => /^case-\d+\.md$/.test(f));
  if (caseFiles.length !== tableCase.length) {
    err(`[${slug}] ${p("cases/")} has ${caseFiles.length} case page(s) but front matter declares ${tableCase.length} — must match 1:1`);
  }
  for (const file of caseFiles) {
    const text = readFileSync(join(CASE_DIR, file), "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    if (!text.startsWith("+++") || fmEnd === -1) {
      err(`[${slug}] ${p("cases/" + file)}: missing or malformed +++ front matter delimiters`);
      continue;
    }
    const fm = text.slice(0, fmEnd);
    const caseId = extractField(fm, "case_id");
    const anchor = extractField(fm, "anchor");
    const period = extractField(fm, "period");
    const status = extractField(fm, "status");
    const label = extractField(fm, "label");
    const summary = extractField(fm, "summary");
    const pageClaims = extractArrayField(fm, "claims") ?? [];
    const pageSources = extractArrayField(fm, "sources") ?? [];

    const num = file.match(/^case-(\d+)\.md$/)[1];
    const expectedId = "CASE-" + num;
    if (!caseId) err(`[${slug}] ${p("cases/" + file)}: missing required field case_id`);
    else if (caseId !== expectedId) err(`[${slug}] ${p("cases/" + file)}: case_id "${caseId}" does not match filename (expected ${expectedId})`);

    const idx = parseInt(num, 10) - 1;
    const source = tableCase[idx];
    if (!source) {
      err(`[${slug}] ${p("cases/" + file)}: no [[extra.cases]] entry at position ${idx + 1}`);
      continue;
    }
    if (source.anchor !== anchor) err(`[${slug}] ${caseId}: page anchor "${anchor}" does not match cases[${idx}].anchor "${source.anchor}"`);
    if (source.period !== period) err(`[${slug}] ${caseId}: page period "${period}" does not match cases[${idx}].period "${source.period}"`);
    if (source.status !== status) err(`[${slug}] ${caseId}: page status "${status}" does not match cases[${idx}].status "${source.status}"`);
    if (source.label !== label) err(`[${slug}] ${caseId}: page label "${label}" does not match cases[${idx}].label "${source.label}"`);
    if (source.summary !== summary) err(`[${slug}] ${caseId}: page summary does not match cases[${idx}].summary verbatim (drifted copy)`);

    const tableClaimSet = new Set(source.claims);
    const pageClaimSet = new Set(pageClaims);
    if (tableClaimSet.size !== pageClaimSet.size || [...tableClaimSet].some((c) => !pageClaimSet.has(c))) {
      err(`[${slug}] ${caseId}: page claims [${pageClaims.join(", ")}] do not match cases[${idx}].claims [${source.claims.join(", ")}]`);
    }
    const derivedSources = new Set();
    for (const c of source.claims) {
      if (!clmTableRows.has(c)) {
        err(`[${slug}] ${caseId}: cases[${idx}].claims references ${c}, which does not exist in the Registr tvrzení table`);
        continue;
      }
      for (const s of clmTableRows.get(c).srcRefs) derivedSources.add(s);
    }
    const pageSourceSet = new Set(pageSources);
    if (derivedSources.size !== pageSourceSet.size || [...derivedSources].some((s) => !pageSourceSet.has(s))) {
      err(`[${slug}] ${caseId}: page sources [${pageSources.join(", ")}] do not equal the union of its claims' sources [${[...derivedSources].sort().join(", ")}] — run scripts/dossier/migrate-cases-to-pages.mjs to regenerate.`);
    }
  }

  // --- Gaps have no overview table on the main dossier page (unlike claims
  // and cases) — gaps/_index.md's section.pages *is* the registry. Just
  // check each gap page's own front-matter consistency (unique id, correct
  // dossier scoping) and that any inline "GAP-##" mention in the main page
  // prose is a real markdown link to that gap's detail page, not bare text. ---
  const GAP_DIR = join(BASE, "gaps");
  const gapFiles = readdirSync(GAP_DIR).filter((f) => /^gap-\d+\.md$/.test(f));
  const gapPageIds = new Set();
  for (const file of gapFiles) {
    const text = readFileSync(join(GAP_DIR, file), "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    if (!text.startsWith("+++") || fmEnd === -1) {
      err(`[${slug}] ${p("gaps/" + file)}: missing or malformed +++ front matter delimiters`);
      continue;
    }
    const fm = text.slice(0, fmEnd);
    const gapId = extractField(fm, "gap_id");
    const pageDossier = extractField(fm, "dossier");
    const expectedId = "GAP-" + file.match(/^gap-(\d+)\.md$/)[1];
    if (!gapId) err(`[${slug}] ${p("gaps/" + file)}: missing required field gap_id`);
    else if (gapId !== expectedId) err(`[${slug}] ${p("gaps/" + file)}: gap_id "${gapId}" does not match filename (expected ${expectedId})`);
    else if (gapPageIds.has(gapId)) err(`[${slug}] Duplicate gap_id across files: ${gapId}`);
    else gapPageIds.add(gapId);
    if (pageDossier !== slug) err(`[${slug}] ${p("gaps/" + file)}: extra.dossier "${pageDossier}" does not match its own directory "${slug}"`);
  }
  const linkedGapRe = new RegExp(`\\[(GAP-\\d+)\\]\\(@/dossiers/${slug}/gaps/gap-\\d+\\.md\\)`, "g");
  const linkedGapIds = new Set([...dossierText.matchAll(linkedGapRe)].map((x) => x[1]));
  for (const g of linkedGapIds) {
    if (!gapPageIds.has(g)) err(`[${slug}] Dossier body links to ${g}, but no matching gap file exists`);
  }

  return {
    slug,
    sourcesCount: srcById.size,
    claimsCount: clmIds.size,
    clmPagesCount: clmFiles.length,
    casePagesCount: caseFiles.length,
    familyCount,
    namedFamilies,
    singletons,
  };
}

const dossierSlugs = readdirSync(DOSSIERS_ROOT)
  .filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory())
  .filter(isCanonicalDossier);
if (dossierSlugs.length === 0) {
  console.error("No dossiers found under content/dossiers/.");
  process.exit(1);
}

const results = dossierSlugs.map(validateDossier);

for (const r of results) {
  console.log(`[${r.slug}] Checked ${r.sourcesCount} source files against ${r.claimsCount} claims.`);
  console.log(`[${r.slug}] Checked ${r.clmPagesCount} claim detail page(s) and ${r.casePagesCount} case detail page(s) for parity with their registries.`);
  console.log(`[${r.slug}] Source families: ${r.familyCount} (${r.namedFamilies.size} named group(s): ${[...r.namedFamilies].join(", ") || "none"}; ${r.singletons} singleton source(s)).`);
}
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
console.log(`\nOK — no referential-integrity errors across ${dossierSlugs.length} dossier(s).`);
