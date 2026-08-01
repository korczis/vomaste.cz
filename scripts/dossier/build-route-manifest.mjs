#!/usr/bin/env node
/*
 * Builds a single, explicit id -> route manifest across every dossier, so
 * no template or script has to hand-construct a URL from an id in more
 * than one place. Deterministic, stable-sorted, no network access.
 *
 * T-028 fáze G: zdrojem už není content/** front matter, ale COMPILED
 * kanonický dataset — `compiled.routes` nese přesně stejné kompozitní
 * klíče a route tvary jako dřívější sken souborů (viz routeFor v
 * scripts/data/normalize.mjs); tenhle skript k nim doplňuje registry
 * indexové routy a kořeny (/dossiers/, /entities/), které nejsou
 * záznamy. Shodu id ↔ název souboru a čitelnost vstupů vynucuje
 * kanonická brána `npm run data:validate` na začátku buildu.
 *
 * Output: data/generated/routes.json
 *   { "<id>": { "type": "source|claim|case|gap|dossier|dossier-index",
 *               "dossier": "<slug>", "route": "/dossiers/<slug>/..." } }
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_FILE = join(ROOT, "data/generated/routes.json");

// Registry indexy — stejné klíče/typy jako dřívější sken adresářů.
const REGISTRIES = [
  { dir: "sources", type: "source" },
  { dir: "claims", type: "claim" },
  { dir: "cases", type: "case" },
  { dir: "gaps", type: "gap" },
  { dir: "relations", type: "relation" },
];

const compiled = getCompiledModel(ROOT);

const routes = {};
const seenRoutes = new Map(); // route -> id, to catch collisions
const errors = [];

function register(id, entry) {
  if (routes[id]) errors.push(`Duplicate id across manifest: ${id} (already registered as ${routes[id].route})`);
  if (seenRoutes.has(entry.route)) errors.push(`Route collision: "${entry.route}" claimed by both ${seenRoutes.get(entry.route)} and ${id}`);
  seenRoutes.set(entry.route, id);
  routes[id] = entry;
}

register("dossiers", { type: "dossier-registry", dossier: null, route: "/dossiers/" });

// Dossiery + jejich registry indexy. Každý dossier (včetně entity views,
// které nevlastní žádné záznamy) má všech pět registry rout — stejný
// invariant jako dřívější sken (content adaptéry těch sekcí existují pro
// všechny dossiery).
const dossierSlugs = compiled.records
  .filter((w) => w.registry === "dossier")
  .map((w) => w.dossier)
  .sort();

for (const slug of dossierSlugs) {
  const base = `/dossiers/${slug}/`;
  register(`DOSSIER:${slug}`, { type: "dossier", dossier: slug, route: base });
  for (const { dir, type } of REGISTRIES) {
    register(`${dir.toUpperCase()}-INDEX:${slug}`, { type: `${type}-index`, dossier: slug, route: `${base}${dir}/` });
  }
}

// Záznamy a entity — kompozitní klíče přímo z compiled.routes.
// COMPOSITE key: "<dossier-slug>:<LOCAL-ID>". Record ids restart at 01 in
// every dossier by design (CLM-01 exists in each), so a bare local id is
// not globally unique and cannot be a manifest key. `local_id` keeps the
// bare id available for display and lookups.
for (const [key, entry] of Object.entries(compiled.routes)) {
  if (entry.type === "dossier") continue; // registered above (with indexes)
  register(key, entry);
}

// Entities are GLOBAL — one registry, not one per dossier.
register("ENTITIES-INDEX", { type: "entity-index", dossier: null, route: "/entities/" });

if (errors.length) {
  console.error(`build-route-manifest: ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ERROR ${e}`);
  process.exit(1);
}

mkdirSync(dirname(OUT_FILE), { recursive: true });
const sortedRoutes = Object.fromEntries(Object.entries(routes).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT_FILE, JSON.stringify(sortedRoutes, null, 2) + "\n", "utf8");
console.log(`Wrote ${OUT_FILE}: ${Object.keys(routes).length} route(s) across ${dossierSlugs.length} dossier(s), no collisions.`);
