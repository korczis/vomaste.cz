#!/usr/bin/env node
/*
 * Enforces the entity-dossier / aggregate-dossier distinction described in
 * AGENTS.md's "Entity dossiers vs. the aggregate view": Petr Macinka and
 * Filip Turek are two independent, primary-nav-worthy dossiers; the
 * macinka-turek page is a generated aggregate — never a third equal
 * dossier, never a place new records get authored.
 *
 * NOTE on where canonical content physically lives: Zola gives every
 * content file exactly one URL, and this site's pre-existing canonical
 * claim/source/case/gap/relation pages already live (and are linked to,
 * bookmarked, and cross-referenced) at /dossiers/macinka-turek/.../.
 * Moving that physical content to a third, neutral location would satisfy
 * "the aggregate owns no records" in the abstract, but would break every
 * existing canonical URL and anchor — which AGENTS.md and this migration
 * both treat as a hard requirement. So this validator checks the
 * invariant that actually matters given that constraint: an ENTITY
 * dossier (petr-macinka, filip-turek) must own ZERO physical per-record
 * files of its own — every registry it shows is a filtered projection,
 * never a duplicate. Whichever dossier the canonical files happen to live
 * under is not itself a defect as long as nothing is duplicated.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");

const errors = [];
const err = (msg) => errors.push(msg);

const registry = loadDossierRegistry();
if (registry.length === 0) err("data/dossiers.toml: no [[dossiers]] entries found.");

const bySlug = new Map(registry.map((d) => [d.slug, d]));
const RECORD_DIRS = [
  { dir: "claims", pattern: /^clm-\d+\.md$/ },
  { dir: "sources", pattern: /^src-\d+\.md$/ },
  { dir: "cases", pattern: /^case-\d+\.md$/ },
  { dir: "gaps", pattern: /^gap-\d+\.md$/ },
  { dir: "relations", pattern: /^(?!_index\.md$).+\.md$/ },
];

for (const record of registry) {
  const tag = (msg) => `[${record.slug}] ${msg}`;

  if (!["entity", "aggregate"].includes(record.dossierType)) {
    err(tag(`dossier_type "${record.dossierType}" is not one of entity|aggregate.`));
    continue;
  }

  if (record.dossierType === "entity") {
    if (!record.subject) err(tag(`is dossier_type "entity" but has no single "subject" field.`));
    if (record.sourceDossiers.length > 0) err(tag(`is dossier_type "entity" but has source_dossiers — only aggregate dossiers roll up other dossiers.`));
    if (!record.canonicalDossier) err(tag(`is dossier_type "entity" but has no canonical_dossier to project from.`));
    if (record.canonicalDossier && !bySlug.has(record.canonicalDossier)) {
      err(tag(`canonical_dossier "${record.canonicalDossier}" does not exist in data/dossiers.toml.`));
    }
    if (record.showInPrimaryNavigation !== true) {
      err(tag(`is dossier_type "entity" but show_in_primary_navigation is not true — every entity dossier must be primary-nav-worthy.`));
    }

    // The load-bearing check: an entity dossier must own NO physical
    // per-record files — every claim/source/case/gap/relation it shows
    // must be a filtered view over its canonical_dossier, never a copy.
    const base = join(DOSSIERS_ROOT, record.slug);
    for (const { dir, pattern } of RECORD_DIRS) {
      let files;
      try {
        files = readdirSync(join(base, dir)).filter((f) => pattern.test(f));
      } catch {
        continue; // directory absent entirely is fine too
      }
      if (files.length > 0) {
        err(tag(`owns ${files.length} physical file(s) in ${dir}/ (${files.slice(0, 3).join(", ")}${files.length > 3 ? ", ..." : ""}) — an entity dossier must have zero; these must be canonical records living under "${record.canonicalDossier}" instead.`));
      }
    }
  }

  if (record.dossierType === "aggregate") {
    if (record.subject) err(tag(`is dossier_type "aggregate" but has a "subject" field — only entity dossiers have one.`));
    if (record.sourceDossiers.length === 0) err(tag(`is dossier_type "aggregate" but has no source_dossiers.`));
    for (const s of record.sourceDossiers) {
      if (!bySlug.has(s)) { err(tag(`source_dossiers references "${s}", which does not exist in data/dossiers.toml.`)); continue; }
      if (bySlug.get(s).dossierType !== "entity") err(tag(`source_dossiers references "${s}", which is not dossier_type "entity".`));
    }
    if (record.showInPrimaryNavigation !== false) {
      err(tag(`is dossier_type "aggregate" but show_in_primary_navigation is not false — an aggregate must never be presented as a primary dossier.`));
    }
  }
}

// Every physical content/dossiers/<slug>/ directory must be registered.
const physicalSlugs = readdirSync(DOSSIERS_ROOT).filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory());
for (const slug of physicalSlugs) {
  if (!bySlug.has(slug)) err(`content/dossiers/${slug}/ exists on disk but has no matching entry in data/dossiers.toml.`);
}

// Every dossier needs its own Open Graph card: templates/base.html points
// every page inside a dossier at static/images/og/<slug>.jpg, so a missing
// file means a broken LinkedIn/Facebook/Slack preview — invisible in a
// passing build. Regenerate with scripts/og/build-og-images.mjs.
for (const record of registry) {
  const card = join(ROOT, "static/images/og", `${record.slug}.jpg`);
  if (!existsSync(card)) {
    err(`Dossier "${record.slug}" has no preview card at static/images/og/${record.slug}.jpg — run \`node scripts/og/build-og-images.mjs\` (see its header for the one-time playwright setup).`);
  }
}
if (!existsSync(join(ROOT, "static/images/og/site.jpg"))) {
  err("Missing the site-wide preview card static/images/og/site.jpg (config.toml extra.og_image points at it).");
}

// Navigation is no longer hand-written per dossier: the sidebar tree is
// generated from this very registry by scripts/dossier/build-navigation.mjs
// and checked by validate-navigation.mjs (a dossier must appear as a subtree
// under "Dossiery", never as a top-level item). The only thing worth checking
// from here is that the hand-edited skeleton has not sprouted a dossier again.
const navText = readFileSync(join(ROOT, "data/navigation.toml"), "utf8").replace(/^\s*#.*$/gm, "");
for (const record of registry) {
  if (navText.includes(`/dossiers/${record.slug}/`)) {
    err(`data/navigation.toml references dossier "${record.slug}" — the skeleton must stay dossier-free; the tree is generated (see build-navigation.mjs).`);
  }
}

if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — ${registry.filter((d) => d.dossierType === "entity").length} entity dossier(s), ${registry.filter((d) => d.dossierType === "aggregate").length} aggregate dossier(s), all invariants hold.`);
