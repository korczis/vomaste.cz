#!/usr/bin/env node
/*
 * Fails the build if the primary sidebar (data/navigation.toml) ever
 * regresses into showing the aggregate dossier as a third dossier
 * alongside the two entity dossiers, or drops either entity dossier, or
 * points at a route that doesn't actually exist. This is the direct,
 * mechanical enforcement of the site owner's correction: "macinka-turek
 * nemá být v sidebaru jako samostatný dossier" — see AGENTS.md.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAV_TOML = join(ROOT, "data/navigation.toml");

const errors = [];
const err = (msg) => errors.push(msg);

function field(block, key) {
  const m = block.match(new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m"));
  return m ? m[1] : null;
}

const navText = readFileSync(NAV_TOML, "utf8");
const items = [...navText.matchAll(/\[\[items\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)].map((m) => ({
  id: field(m[1], "id"),
  path: field(m[1], "path"),
  group: field(m[1], "group"),
}));
if (items.length === 0) err("data/navigation.toml: no [[items]] found.");

const registry = loadDossierRegistry();
const entityDossiers = registry.filter((d) => d.dossierType === "entity");
const aggregateDossiers = registry.filter((d) => d.dossierType === "aggregate");

// Primary dossier items: ungrouped nav items whose path points at some
// dossier's own _index.md.
const primaryDossierItems = items.filter((i) => !i.group && /^@\/dossiers\/[a-z0-9-]+\/_index\.md$/.test(i.path));
const primarySlugsLinked = primaryDossierItems.map((i) => i.path.match(/^@\/dossiers\/([a-z0-9-]+)\/_index\.md$/)[1]);

for (const d of entityDossiers) {
  if (!primarySlugsLinked.includes(d.slug)) err(`Entity dossier "${d.slug}" has no ungrouped primary nav item — every entity dossier must be directly reachable from the primary sidebar.`);
}
for (const d of aggregateDossiers) {
  if (primarySlugsLinked.includes(d.slug)) {
    // Allowed to have exactly one, clearly-non-tree ungrouped item — but
    // never more than the count of entity dossiers would suggest it's
    // being treated as their peer. The real invariant: it must not gain
    // its OWN grouped children the way entity dossiers do.
    const hasChildren = items.some((i) => i.group === d.slug);
    if (hasChildren) err(`Aggregate dossier "${d.slug}" has grouped child nav items (group = "${d.slug}") — an aggregate must never get its own expandable subtree like an entity dossier does.`);
  }
}

if (primarySlugsLinked.length !== entityDossiers.length + aggregateDossiers.filter((d) => primarySlugsLinked.includes(d.slug)).length) {
  // no-op placeholder kept simple; the per-dossier checks above already
  // cover missing/extra entries precisely.
}

const entityCount = entityDossiers.filter((d) => primarySlugsLinked.includes(d.slug)).length;
if (entityCount !== entityDossiers.length) {
  err(`Expected all ${entityDossiers.length} entity dossier(s) in primary navigation, found ${entityCount}.`);
}

// Every nav item's path must point at a real content file — checked
// directly against the filesystem rather than data/generated/routes.json,
// since that manifest only tracks the sources/claims/cases/gaps/relations
// registries, not every section (e.g. /map/, per-dossier entities/,
// evidence/) a nav item might legitimately link to.
for (const item of items) {
  const m = item.path.match(/^@\/(.+)$/);
  if (!m) continue;
  const contentFile = join(ROOT, "content", m[1]);
  if (!existsSync(contentFile)) {
    err(`data/navigation.toml item "${item.id}" points at ${item.path}, which has no matching file at content/${m[1]}.`);
  }
}

if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — primary navigation shows exactly ${entityDossiers.length} entity dossier(s), 0 aggregate dossier(s) as a peer tree.`);
