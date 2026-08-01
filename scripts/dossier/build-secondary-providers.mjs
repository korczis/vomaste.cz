#!/usr/bin/env node
/*
 * Secondary-provider data model (T-011, application shell master prompt
 * §6.2/§10-13). The primary sidebar (data/generated/navigation.json) is a
 * single flat+nested tree; a secondary sidebar/explorer needs its data
 * shaped differently — per-dossier subtrees loadable independently, and
 * catalog/explorer listings with facet-ready fields — not a second copy
 * of the same tree. This generator owns exactly those three artifacts,
 * built once from the compiled canonical model (T-028 fáze G) plus the
 * same data/navigation.toml registry list build-navigation.mjs already
 * uses, so registry labels/icons/order never drift between the primary
 * and secondary sidebars.
 *
 * Outputs (all under data/generated/, gitignored, rebuilt every build):
 *   navigation-secondary.json — dossier slug -> its own registry subtree,
 *     independently loadable so the primary sidebar can stay flat (no
 *     dossier subtree at all) once a shell renders this instead.
 *   dossier-catalog.json — one row per dossier with facet-ready fields
 *     (type, subject, per-registry counts) for a dossier explorer.
 *   entity-explorer.json — one row per global entity, plus server-computed
 *     facets (by type/dossier/role) so an explorer UI never needs to
 *     invent its own grouping logic client-side from a flat list.
 *
 * No hardcoded slug anywhere in this file: every slug, count and facet key
 * comes from the compiled model or from data/navigation.toml's registry
 * list (itself dossier-free — see that file's own header).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";
import { getCompiledModel } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAV_TOML = join(ROOT, "data/navigation.toml");
const outFlagIndex = process.argv.indexOf("--out");
const OUT_DIR = outFlagIndex !== -1 ? process.argv[outFlagIndex + 1] : join(ROOT, "data/generated");
const OUT_SECONDARY = join(OUT_DIR, "navigation-secondary.json");
const OUT_CATALOG = join(OUT_DIR, "dossier-catalog.json");
const OUT_EXPLORER = join(OUT_DIR, "entity-explorer.json");

// Stejný TOML block-parser jako build-navigation.mjs — read-only, žádný
// zápis, takže duplicita dvou malých regexů je levnější než sdílená
// závislost mezi dvěma generátory bez společného volajícího.
const navText = readFileSync(NAV_TOML, "utf8");
const str = (block, key) => (block.match(new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1] ?? null;
const num = (block, key) => {
  const m = block.match(new RegExp(`^${key}\\s*=\\s*(\\d+)`, "m"));
  return m ? Number(m[1]) : 0;
};
const blocks = (name) => [...navText.matchAll(new RegExp(`\\[\\[${name}\\]\\]\\n([\\s\\S]*?)(?=\\n\\[|\\n*$)`, "g"))].map((m) => m[1]);
const registries = blocks("registries")
  .map((b) => ({ id: str(b, "id"), label: str(b, "label"), order: num(b, "order"), icon: str(b, "icon") }))
  .sort((a, b) => a.order - b.order);

const compiled = getCompiledModel(ROOT);
const dossierRegistry = loadDossierRegistry();

// dossier+registry -> počet záznamů, stejný filtr jako countsOf() v
// build-view-models.mjs (fáze F): entity dossier čte záznamy svého
// canonicalDossier filtrované podle subjects, aggregate/canonical
// dossier vlastní záznamy přímo.
const recordsByDossierRegistry = new Map(); // "<slug>/<registry>" -> wrapper[]
for (const w of compiled.records) {
  if (w.registry === "dossier") continue;
  const key = `${w.dossier}/${w.registry}`;
  const list = recordsByDossierRegistry.get(key) ?? [];
  list.push(w);
  recordsByDossierRegistry.set(key, list);
}
const dossierBySlug = new Map(dossierRegistry.map((d) => [d.slug, d]));
// "entities" and "evidence" are not canonical record registries (compiled
// model only knows claim/source/case/gap/relation) — entities is the
// global entity registry filtered by dossier membership, evidence is a
// synthesized cross-view over claims+sources with no count of its own.
const entityCountBySlug = new Map();
for (const w of compiled.entities) {
  for (const slug of w.record.dossiers ?? []) {
    entityCountBySlug.set(slug, (entityCountBySlug.get(slug) ?? 0) + 1);
  }
}
const countOf = (slug, registryId) => {
  if (registryId === "entities") return entityCountBySlug.get(slug) ?? 0;
  if (registryId === "evidence") return null;
  const d = dossierBySlug.get(slug);
  const isView = d?.canonicalDossier && d.canonicalDossier !== slug;
  const owner = isView ? d.canonicalDossier : slug;
  const rows = recordsByDossierRegistry.get(`${owner}/${registryId}`) ?? [];
  return isView ? rows.filter((w) => (w.record.subjects ?? []).includes(d.subject)).length : rows.length;
};

// --- 1) navigation-secondary.json ------------------------------------------
const secondary = {};
for (const d of dossierRegistry) {
  secondary[d.slug] = {
    title: d.title,
    route: `/dossiers/${d.slug}/`,
    isAggregate: d.dossierType !== "entity",
    overviewLabel: d.dossierType !== "entity" ? null : "Přehled dossieru",
    registries:
      d.dossierType !== "entity"
        ? []
        : registries.map((r) => ({
            id: r.id,
            label: r.label,
            route: `/dossiers/${d.slug}/${r.id}/`,
            icon: r.icon,
            count: countOf(d.slug, r.id),
          })),
  };
}

// --- 2) dossier-catalog.json ------------------------------------------------
const catalogRows = dossierRegistry.map((d) => ({
  slug: d.slug,
  title: d.title,
  route: `/dossiers/${d.slug}/`,
  dossierType: d.dossierType,
  isAggregate: d.dossierType !== "entity",
  subject: d.subject ?? null,
  canonicalDossier: d.canonicalDossier ?? null,
  counts: Object.fromEntries(registries.map((r) => [r.id, countOf(d.slug, r.id)])),
}));

// --- 3) entity-explorer.json -------------------------------------------------
const entityRows = compiled.entities.map((w) => {
  const r = w.record;
  return {
    entityId: r.entityId,
    title: r.title,
    entityType: r.entityType,
    publicationRole: r.publicationRole,
    route: w.route,
    dossiers: (r.dossiers ?? []).map((slug) => ({
      slug,
      title: dossierBySlug.get(slug)?.title ?? slug,
    })),
  };
});
const countBy = (keyFn) => {
  const out = {};
  for (const row of entityRows) {
    const k = keyFn(row);
    if (k === null || k === undefined) continue;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
};
const explorer = {
  count: entityRows.length,
  rows: entityRows,
  facets: {
    byType: countBy((r) => r.entityType),
    byRole: countBy((r) => r.publicationRole),
    byDossier: (() => {
      const out = {};
      for (const row of entityRows) for (const d of row.dossiers) out[d.slug] = (out[d.slug] ?? 0) + 1;
      return out;
    })(),
  },
};

mkdirSync(dirname(OUT_SECONDARY), { recursive: true });
writeFileSync(OUT_SECONDARY, JSON.stringify(secondary, null, 2) + "\n");
writeFileSync(OUT_CATALOG, JSON.stringify({ count: catalogRows.length, rows: catalogRows }, null, 2) + "\n");
writeFileSync(OUT_EXPLORER, JSON.stringify(explorer, null, 2) + "\n");

console.log(
  `build-secondary-providers: navigation-secondary.json (${Object.keys(secondary).length} dossierů), ` +
    `dossier-catalog.json (${catalogRows.length} řádků), entity-explorer.json (${entityRows.length} entit, ` +
    `${Object.keys(explorer.facets.byType).length} typů, ${Object.keys(explorer.facets.byDossier).length} dossierů ve fasetě).`,
);
console.log("OK");
