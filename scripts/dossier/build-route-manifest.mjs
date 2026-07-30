#!/usr/bin/env node
/*
 * Builds a single, explicit id -> route manifest across every dossier, so
 * no template or script has to hand-construct a URL from an id in more
 * than one place. Deterministic, stable-sorted, no network access.
 * Written before `zola build` so it reflects the content actually being
 * built, not (yet) validated against the built HTML — verify-anchors.mjs
 * is the post-build check for that.
 *
 * Output: data/generated/routes.json
 *   { "<id>": { "type": "source|claim|case|gap|dossier|dossier-index",
 *               "dossier": "<slug>", "route": "/dossiers/<slug>/..." } }
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const ENTITIES_ROOT = join(ROOT, "content/entities");
const OUT_FILE = join(ROOT, "data/generated/routes.json");

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}

const REGISTRY = {
  sources: { dir: "sources", filePattern: /^src-(\d+)\.md$/, idField: "src_id", idPrefix: "SRC", type: "source" },
  claims: { dir: "claims", filePattern: /^clm-(\d+)\.md$/, idField: "clm_id", idPrefix: "CLM", type: "claim" },
  cases: { dir: "cases", filePattern: /^case-(\d+)\.md$/, idField: "case_id", idPrefix: "CASE", type: "case" },
  gaps: { dir: "gaps", filePattern: /^gap-(\d+)\.md$/, idField: "gap_id", idPrefix: "GAP", type: "gap" },
};

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

const dossierSlugs = readdirSync(DOSSIERS_ROOT)
  .filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory())
  .sort();

for (const slug of dossierSlugs) {
  const base = `/dossiers/${slug}/`;
  register(`DOSSIER:${slug}`, { type: "dossier", dossier: slug, route: base });

  for (const [key, cfg] of Object.entries(REGISTRY)) {
    const dir = join(DOSSIERS_ROOT, slug, cfg.dir);
    register(`${key.toUpperCase()}-INDEX:${slug}`, {
      type: `${cfg.type}-index`,
      dossier: slug,
      route: `${base}${cfg.dir}/`,
    });

    const files = readdirSync(dir).filter((f) => cfg.filePattern.test(f)).sort();
    for (const file of files) {
      const text = readFileSync(join(dir, file), "utf8");
      const fmEnd = text.indexOf("\n+++", 3);
      const fm = text.slice(0, fmEnd);
      const id = extractField(fm, cfg.idField);
      const num = file.match(cfg.filePattern)[1];
      const expectedId = `${cfg.idPrefix}-${num}`;
      if (!id) {
        errors.push(`${slug}/${cfg.dir}/${file}: missing ${cfg.idField}, cannot register in route manifest`);
        continue;
      }
      if (id !== expectedId) {
        errors.push(`${slug}/${cfg.dir}/${file}: ${cfg.idField} "${id}" does not match filename (expected ${expectedId})`);
      }
      // COMPOSITE key: "<dossier-slug>:<LOCAL-ID>". Record ids restart at
      // 01 in every dossier by design (CLM-01 exists in each), so a bare
      // local id is not globally unique and cannot be a manifest key —
      // the first dossier registered would block every later one. The
      // dossier/index entries above already use this same scheme
      // ("DOSSIER:<slug>"), so this makes records consistent with them
      // rather than introducing a new convention. `local_id` keeps the
      // bare id available for display and lookups.
      register(`${slug}:${id}`, {
        type: cfg.type,
        dossier: slug,
        local_id: id,
        route: `${base}${cfg.dir}/${file.replace(/\.md$/, "")}/`,
      });
    }
  }

  // Relations use their own stable, semantic id (e.g. "edge-macinka-motoriste")
  // rather than an NN-numbered filename — the id *is* the filename stem, so
  // no idPrefix/num check applies here the way it does for sources/claims/
  // cases/gaps above. Relations stay dossier-scoped (a dossier's own local
  // graph); entities are handled once, globally, below.
  const relDir = join(DOSSIERS_ROOT, slug, "relations");
  register(`RELATIONS-INDEX:${slug}`, { type: "relation-index", dossier: slug, route: `${base}relations/` });
  const relFiles = readdirSync(relDir).filter((f) => f !== "_index.md" && f.endsWith(".md")).sort();
  for (const file of relFiles) {
    const text = readFileSync(join(relDir, file), "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    const fm = text.slice(0, fmEnd);
    const id = extractField(fm, "rel_id");
    const expectedId = file.replace(/\.md$/, "");
    if (!id) {
      errors.push(`${slug}/relations/${file}: missing rel_id, cannot register in route manifest`);
      continue;
    }
    if (id !== expectedId) {
      errors.push(`${slug}/relations/${file}: rel_id "${id}" does not match filename (expected ${expectedId})`);
    }
    // Composite for the same reason as records above: a relation id is
    // semantic (edge-<a>-<b>) and dossier-local, so two dossiers can
    // legitimately both have e.g. edge-klempir-vlada.
    register(`${slug}:${id}`, { type: "relation", dossier: slug, local_id: id, route: `${base}relations/${expectedId}/` });
  }
}

// Entities are GLOBAL — one registry, not one per dossier.
register("ENTITIES-INDEX", { type: "entity-index", dossier: null, route: "/entities/" });
const entityFiles = readdirSync(ENTITIES_ROOT).filter((f) => f !== "_index.md" && f.endsWith(".md")).sort();
for (const file of entityFiles) {
  const text = readFileSync(join(ENTITIES_ROOT, file), "utf8");
  const fmEnd = text.indexOf("\n+++", 3);
  const fm = text.slice(0, fmEnd);
  const id = extractField(fm, "entity_id");
  const expectedId = file.replace(/\.md$/, "");
  if (!id) {
    errors.push(`entities/${file}: missing entity_id, cannot register in route manifest`);
    continue;
  }
  if (id !== expectedId) {
    errors.push(`entities/${file}: entity_id "${id}" does not match filename (expected ${expectedId})`);
  }
  register(id, { type: "entity", dossier: null, route: `/entities/${expectedId}/` });
}

if (errors.length) {
  console.error(`build-route-manifest: ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ERROR ${e}`);
  process.exit(1);
}

mkdirSync(dirname(OUT_FILE), { recursive: true });
const sortedRoutes = Object.fromEntries(Object.entries(routes).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT_FILE, JSON.stringify(sortedRoutes, null, 2) + "\n", "utf8");
console.log(`Wrote ${OUT_FILE}: ${Object.keys(routes).length} route(s) across ${dossierSlugs.length} dossier(s), no collisions.`);
