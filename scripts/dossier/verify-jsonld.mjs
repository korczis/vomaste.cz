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
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC_ROOT = join(ROOT, "public");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");

const errors = [];
const err = (msg) => errors.push(msg);

// The minifier may drop attribute quotes: <script type=application/ld+json>
const BLOCK_RE = /<script type="?application\/ld\+json"?>([\s\S]*?)<\/script>/g;
const FORBIDDEN_KEYS = new Set(["reviewRating", "ratingValue", "bestRating", "worstRating", "reviewAspect"]);
const FORBIDDEN_TYPES = new Set(["ClaimReview", "Review", "Rating", "AggregateRating"]);

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
    }
  }
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
const registry = readFileSync(join(ROOT, "data/dossiers.toml"), "utf8");
const entitySlugs = [...registry.matchAll(/\[\[dossiers\]\]\s*\nslug = "([^"]+)"\s*\ntitle = "[^"]*"\s*\ndossier_type = "entity"/g)].map((m) => m[1]);
const aggregateSlugs = [...registry.matchAll(/\[\[dossiers\]\]\s*\nslug = "([^"]+)"\s*\ntitle = "[^"]*"\s*\ndossier_type = "aggregate"/g)].map((m) => m[1]);
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
