#!/usr/bin/env node
/*
 * Post-build check for the JSON-LD emitted by templates/partials/jsonld.html.
 * Must run after `zola build`. Three jobs:
 *
 * 1. Every `application/ld+json` block in public/ parses as valid JSON.
 * 2. No block anywhere contains truth-adjudicating markup — no ClaimReview,
 *    no Rating/AggregateRating @type, no reviewRating/ratingValue keys.
 *    This is the mechanical form of editorial rules 3 & 7: the site's
 *    statuses describe sourcing, not adjudicated truth, and the structured
 *    data must not imply otherwise.
 * 3. Coverage + shape: every claim detail page emits a Claim node with a
 *    non-empty `appearance` (rule 1 — no uncited claim), every entity
 *    dossier main page emits exactly one Person, and the aggregate dossier
 *    emits none; required fields per @type are present.
 * 4. Citation identity: a Claim's `appearance` is exactly the sources that
 *    claim declares, resolved inside its own dossier — no foreign records.
 *
 * Job 4 exists because job 3 was not enough. It required `appearance` to be
 * non-empty and stopped there, so a claim could cite twenty documents about
 * twenty other people and still pass. That is precisely what happened: the
 * template used to resolve a claim's SRC-## ids by scanning every dossier,
 * but SRC ids are numbered per dossier, so every dossier has a SRC-01. A
 * claim citing SRC-01 collected the SRC-01 of all 21 dossiers. Measured on
 * the built site: 17 606 embedded citations of which 1 114 were the claim's
 * own — 94 % pointed at unrelated records. Nothing caught it, because
 * "has citations" was checked and "has the right citations" was not.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";
import { FORBIDDEN_KEYS, FORBIDDEN_TYPES, citationFingerprint } from "./lib/jsonld-shared.mjs";
import { buildRecordTables } from "./lib/record-tables.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// --dir lets the gate run against any built tree, matching verify-export.mjs.
// Without it a check like job 4 can only ever be observed passing; being able
// to point it at a known-bad build is what proves it still catches the bug.
const dirArg = process.argv.indexOf("--dir");
const PUBLIC_ROOT = dirArg !== -1 && process.argv[dirArg + 1] ? process.argv[dirArg + 1] : join(ROOT, "public");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");

const errors = [];
const err = (msg) => errors.push(msg);

// The minifier may drop attribute quotes: <script type=application/ld+json>
const BLOCK_RE = /<script type="?application\/ld\+json"?>([\s\S]*?)<\/script>/g;
// FORBIDDEN_KEYS / FORBIDDEN_TYPES now live in lib/jsonld-shared.mjs,
// shared with verify-export.mjs so HTML and export enforcement can't drift.

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith(".html")) yield p;
  }
}

function* nodes(value) {
  if (Array.isArray(value)) for (const v of value) yield* nodes(value === v ? [] : v);
  else if (value && typeof value === "object") {
    if (value["@type"]) yield value;
    for (const v of Object.values(value)) yield* nodes(v);
  }
}

// Expected citations per claim, from the same parser the exports use, so the
// gate cannot drift from the data it is meant to guard. Key: the built page
// path, because that is what identifies a page during the scan below.
const tables = buildRecordTables(ROOT);
const sourceUrlById = new Map(tables.sources.map((s) => [`${s.dossier}/${s.src_id}`, s.source_url]));
const expectedCitations = new Map();
for (const c of tables.claims) {
  const page = join("dossiers", c.dossier, "claims", c.clm_id.toLowerCase(), "index.html");
  // Scoped per dossier: SRC-01 of this dossier, never SRC-01 of some other.
  const urls = c.sources.map((sid) => sourceUrlById.get(`${c.dossier}/${sid}`)).filter(Boolean);
  expectedCitations.set(page, new Set(urls));
}

function checkNode(node, tag) {
  const type = node["@type"];
  if (FORBIDDEN_TYPES.has(type)) err(`${tag}: forbidden @type "${type}" — this site must not emit truth ratings.`);
  for (const key of Object.keys(node)) {
    if (FORBIDDEN_KEYS.has(key)) err(`${tag}: forbidden key "${key}" on @type "${type}".`);
  }
  const need = (field) => {
    if (!node[field] || (typeof node[field] === "string" && node[field].trim() === ""))
      err(`${tag}: @type "${type}" is missing required field "${field}".`);
  };
  if (["WebSite", "WebPage", "ProfilePage", "Person", "SiteNavigationElement"].includes(type)) need("name");
  if (["SiteNavigationElement", "NewsArticle", "OpinionNewsArticle", "Article"].includes(type)) need("url");
  if (type === "Claim") {
    need("text");
    if (!Array.isArray(node.appearance) || node.appearance.length === 0)
      err(`${tag}: Claim node has no non-empty "appearance" — a claim without cited reporting (rule 1).`);
    else if (expectedCitations.has(tag)) {
      const want = expectedCitations.get(tag);
      const got = new Set(node.appearance.map((a) => a?.url).filter(Boolean));
      const foreign = [...got].filter((u) => !want.has(u));
      const missing = [...want].filter((u) => !got.has(u));
      if (foreign.length)
        err(`${tag}: Claim cites ${foreign.length} record(s) it does not declare, e.g. ${foreign[0]} — citations must resolve inside the claim's own dossier.`);
      if (missing.length)
        err(`${tag}: Claim declares ${missing.length} source(s) absent from its citations, e.g. ${missing[0]}.`);
    }
  }
  // Embedded citation fingerprints (T-010): if a source node carries one,
  // it must recompute from the node's own visible fields — same formula
  // and same shared helper as the /data/*.jsonld exports, so the HTML
  // and the export can never drift apart silently.
  if (node["vomaste:citationFingerprint"]) {
    const recomputed = citationFingerprint({
      url: node.url,
      retrieved: node["vomaste:retrieved"],
      outlet: node.publisher?.name,
    });
    if (recomputed !== node["vomaste:citationFingerprint"])
      err(`${tag}: citation fingerprint on ${type} node does not recompute from its visible fields (url/retrieved/outlet).`);
  }
  if (type === "BreadcrumbList") {
    if (!Array.isArray(node.itemListElement) || node.itemListElement.length === 0)
      err(`${tag}: BreadcrumbList without itemListElement.`);
    else for (const li of node.itemListElement) {
      if (!li.position || !li.name) err(`${tag}: ListItem without position/name.`);
    }
  }
}

let files = 0, blocks = 0, nodeCount = 0, claimNodes = 0;
const personPages = new Map(); // rel html path -> count of Person nodes
// Full-page doctrine: source pages must emit a citation node (the cited
// record itself), not only page/nav scaffolding.
const SCAFFOLDING_TYPES = new Set([
  "WebSite", "WebPage", "ProfilePage", "BreadcrumbList", "ListItem",
  "SiteNavigationElement", "Person", "Organization",
]);
const sourcePages = new Set();
const sourceCitationPages = new Set();

for (const file of htmlFiles(PUBLIC_ROOT)) {
  const rel = relative(PUBLIC_ROOT, file);
  const html = readFileSync(file, "utf8");
  files++;
  for (const m of html.matchAll(BLOCK_RE)) {
    blocks++;
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch (e) {
      err(`${rel}: JSON-LD block does not parse: ${e.message}`);
      continue;
    }
    for (const node of nodes(parsed)) {
      nodeCount++;
      checkNode(node, rel);
      if (node["@type"] === "Claim") claimNodes++;
      if (node["@type"] === "Person") personPages.set(rel, (personPages.get(rel) ?? 0) + 1);
      // Citation-node coverage for source pages (full-page doctrine): a
      // source page must carry at least one node describing the cited
      // external record itself, not just page/nav scaffolding.
      if (/\/sources\/src-\d+\/index\.html$/.test(rel) &&
          !SCAFFOLDING_TYPES.has(node["@type"])) {
        sourceCitationPages.add(rel);
      }
    }
    if (/\/sources\/src-\d+\/index\.html$/.test(rel)) sourcePages.add(rel);
  }
}

// Full-page doctrine: every built source page emits a citation node.
for (const rel of sourcePages) {
  if (!sourceCitationPages.has(rel))
    err(`${rel}: source page has no citation node in JSON-LD (only page/nav scaffolding) — full-page doctrine requires the cited record itself to be machine-readable.`);
}

// Coverage: one Claim node per physical claim record, wherever it lives.
let claimFiles = 0;
for (const slug of readdirSync(DOSSIERS_ROOT).filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory())) {
  const dir = join(DOSSIERS_ROOT, slug, "claims");
  try {
    claimFiles += readdirSync(dir).filter((f) => /^clm-\d+\.md$/.test(f)).length;
  } catch { /* dossier without a physical claims registry */ }
}
if (claimNodes !== claimFiles)
  err(`coverage: ${claimFiles} claim record file(s) on disk but ${claimNodes} Claim node(s) in the built site.`);

// Person markup exactly on entity dossier main pages, never on the aggregate.
const registry = loadDossierRegistry();
const entitySlugs = registry.filter((d) => d.dossierType === "entity").map((d) => d.slug);
const aggregateSlugs = registry.filter((d) => d.dossierType === "aggregate").map((d) => d.slug);
for (const slug of entitySlugs) {
  const page = join("dossiers", slug, "index.html");
  if ((personPages.get(page) ?? 0) !== 1) err(`coverage: entity dossier page ${page} must emit exactly one Person node.`);
}
for (const [page, count] of personPages) {
  const isEntityMain = entitySlugs.some((slug) => page === join("dossiers", slug, "index.html"));
  if (!isEntityMain) err(`${page}: emits ${count} Person node(s) but is not an entity dossier main page.`);
}
for (const slug of aggregateSlugs) {
  const page = join("dossiers", slug, "index.html");
  if (personPages.has(page)) err(`${page}: the aggregate view must never carry Person markup.`);
}

console.log(`Checked ${blocks} JSON-LD block(s) / ${nodeCount} node(s) across ${files} built HTML file(s); ${claimNodes} Claim, ${entitySlugs.length} entity Person page(s).`);
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — all JSON-LD parses, carries required fields, and contains no truth-rating markup.`);
