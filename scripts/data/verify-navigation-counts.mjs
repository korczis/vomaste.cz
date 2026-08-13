#!/usr/bin/env node
/*
 * Post-build verifier: every navigation count in the BUILT HTML must equal
 * the value in data/generated/navigation-metrics.json, and no item may carry
 * a badge it was never given a metric for.
 *
 * WHY A POST-BUILD CHECK AT ALL — the pre-build validator proves the metric
 * is computable; it cannot prove the template rendered it. A component edit that
 * silently drops the badge, or a stale manifest read by Zola, both produce a
 * green pre-build and wrong pages. This closes that gap.
 *
 * WHY THIS PARSES ATTRIBUTES INSTEAD OF REGEXING FOR THEM — the HTML is
 * minified: quotes are stripped and attribute order is not preserved, so the
 * badge ships as
 *
 *   <span class="nav-count-badge justify-self-end" aria-hidden=true
 *         data-count=22 data-metric-id=dossiers.total>22<
 *
 * A regex looking for `data-metric-id="..." data-count="..."` matches
 * nothing against that — which is exactly the false alarm that happened
 * while building this feature: the first verification attempt reported the
 * badges missing when they were present and correct. So: find the tag, then
 * tokenize its attributes, handling double-quoted, single-quoted and
 * unquoted values.
 *
 * No HTML-parser dependency is added for this. The surface is one span and
 * one anchor with known class names; a tokenizer for that is a few lines and
 * is testable, whereas pulling in a full parser to read two attributes would
 * be the larger change. The reason regexes were wrong here is the fixed
 * quoting assumption, not regexes as such.
 *
 * Usage:
 *   node scripts/data/verify-navigation-counts.mjs [--dir public]
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const dirArg = process.argv.indexOf("--dir");
const OUT_DIR = path.resolve(ROOT, dirArg > -1 ? process.argv[dirArg + 1] : "public");
const MANIFEST = path.join(ROOT, "data", "generated", "navigation-metrics.json");

const errors = [];
const fail = (msg) => errors.push(msg);

if (!existsSync(MANIFEST)) {
  console.error(`verify-navigation-counts: ${path.relative(ROOT, MANIFEST)} is missing — run \`npm run data:metrics\`.`);
  process.exit(1);
}
if (!existsSync(OUT_DIR)) {
  console.error(`verify-navigation-counts: ${path.relative(ROOT, OUT_DIR)} does not exist — run the site build first.`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const expected = new Map(Object.entries(manifest.metrics).map(([id, m]) => [id, m.value]));

/**
 * Tokenize the attributes of a single start tag body (everything between the
 * tag name and the closing `>`). Handles `k="v"`, `k='v'`, `k=v` and bare `k`.
 */
export function parseAttributes(tagBody) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(tagBody)) !== null) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}

/** Find every `<span ...class contains nav-count-badge...>TEXT</span>`. */
function findBadges(html) {
  const found = [];
  const re = /<span([^>]*)>([^<]*)<\/span>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttributes(m[1]);
    if (!(attrs.class ?? "").split(/\s+/).includes("nav-count-badge")) continue;
    found.push({ attrs, text: m[2].trim() });
  }
  return found;
}

function htmlFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) htmlFiles(full, acc);
    else if (entry.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const pages = htmlFiles(OUT_DIR);
if (pages.length === 0) fail(`no HTML files under ${path.relative(ROOT, OUT_DIR)} — did the build run?`);

let badgesChecked = 0;
let pagesWithNav = 0;
const seenMetrics = new Set();

for (const file of pages) {
  const rel = path.relative(OUT_DIR, file);
  const html = readFileSync(file, "utf8");
  const badges = findBadges(html);
  if (badges.length === 0) continue;
  pagesWithNav++;

  for (const { attrs, text } of badges) {
    badgesChecked++;
    const id = attrs["data-metric-id"];
    const dataCount = attrs["data-count"];

    if (!id) {
      fail(`${rel}: a nav-count-badge has no data-metric-id — the value cannot be traced to a metric.`);
      continue;
    }
    // Grouped per-dossier metric: keyed by slug, not present in the totals map.
    if (id === "claims.by_dossier") {
      const slug = attrs["data-dossier"];
      if (!slug) {
        fail(`${rel}: a claims.by_dossier badge has no data-dossier — its number cannot be attributed.`);
        continue;
      }
      const group = manifest.perDossier?.[slug];
      if (!group) {
        fail(`${rel}: badge claims dossier "${slug}", which has no per-dossier entry in the manifest.`);
        continue;
      }
      seenMetrics.add(id);
      const wantGroup = String(group.claims);
      if (dataCount !== wantGroup) fail(`${rel}: dossier "${slug}" — data-count is ${dataCount}, manifest says ${wantGroup}.`);
      if (text !== wantGroup) fail(`${rel}: dossier "${slug}" — visible text is "${text}", manifest says ${wantGroup}.`);
      continue;
    }

    // Grouped per-entity-type metric: keyed by data-group.
    if (id === "entities.by_type") {
      const key = attrs["data-group"];
      const group = key ? manifest.perType?.[key] : null;
      if (!key) {
        fail(`${rel}: an entities.by_type badge has no data-group — its number cannot be attributed.`);
        continue;
      }
      if (!group) {
        fail(`${rel}: badge claims entity type "${key}", which has no per-type entry in the manifest.`);
        continue;
      }
      seenMetrics.add(id);
      const wantType = String(group.entities);
      if (dataCount !== wantType) fail(`${rel}: entity type "${key}" — data-count is ${dataCount}, manifest says ${wantType}.`);
      if (text !== wantType) fail(`${rel}: entity type "${key}" — visible text is "${text}", manifest says ${wantType}.`);
      continue;
    }

    if (!expected.has(id)) {
      // A number rendered from a metric that no longer exists is the exact
      // failure mode "no hand-written counts" is meant to prevent.
      fail(`${rel}: badge declares metric "${id}", which is not in the manifest.`);
      continue;
    }
    seenMetrics.add(id);

    const want = String(expected.get(id));
    if (dataCount !== want) fail(`${rel}: metric "${id}" — data-count is ${dataCount}, manifest says ${want}.`);
    if (text !== want) fail(`${rel}: metric "${id}" — visible text is "${text}", manifest says ${want}.`);
  }
}

// Every declared metric that a nav item points at must actually reach a page.
// (Metrics may legitimately exist without a nav item; the reverse must not.)
const navMetrics = new Set();
const navJson = path.join(ROOT, "data", "generated", "navigation.json");
if (existsSync(navJson)) {
  for (const item of JSON.parse(readFileSync(navJson, "utf8")).items ?? []) {
    if (item.countMetric) navMetrics.add(item.countMetric);
  }
}
for (const id of navMetrics) {
  if (!seenMetrics.has(id)) fail(`navigation declares metric "${id}" but no badge for it was rendered in any page.`);
}

if (errors.length > 0) {
  console.error(`verify-navigation-counts: ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log(
  `verify-navigation-counts: OK — ${badgesChecked} badge(s) across ${pagesWithNav} page(s) match the manifest ` +
    `(${seenMetrics.size} distinct metric(s): ${[...seenMetrics].sort().join(", ")}).`,
);
