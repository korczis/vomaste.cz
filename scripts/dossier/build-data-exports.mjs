#!/usr/bin/env node
/*
 * Flat JSON exports of every registry, written to static/data/*.json.
 *
 * Two consumers, one file set:
 *   1. the in-browser SQL console (assets/js/modules/sql-console.js), which
 *      lets a reader query the dataset instead of trusting the site's own
 *      summary tiles — see docs/adr/duckdb-wasm-and-sigma.md;
 *   2. anyone who just wants the data: the files are plain JSON arrays at
 *      stable URLs, readable with curl and jq, no WASM required.
 *
 * Derived, never authored: every row comes from the same front matter the
 * pages render from. No status is computed here, no score, no ranking —
 * the export is a projection, not a second source of truth.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = join(ROOT, "static/data");
mkdirSync(OUT_DIR, { recursive: true });

const fm = (text) => (text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
const str = (b, k) => (b.match(new RegExp(`^${k}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1]?.replace(/\\(.)/g, "$1") ?? null;
const arr = (b, k) => {
  const m = b.match(new RegExp(`^${k}\\s*=\\s*\\[([^\\]]*)\\]`, "m"));
  return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]) : [];
};

const registry = loadDossierRegistry();
const rows = { claims: [], sources: [], cases: [], gaps: [], relations: [], entities: [], dossiers: [] };

for (const d of registry) {
  rows.dossiers.push({
    slug: d.slug,
    title: d.title,
    dossier_type: d.dossierType,
    subject: d.subject,
    canonical_dossier: d.canonicalDossier,
    url: `/dossiers/${d.slug}/`,
  });
}

// Per-record pages of every dossier that physically owns records.
for (const d of registry) {
  const base = join(ROOT, "content/dossiers", d.slug);
  const read = (sub) => {
    const dir = join(base, sub);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== "_index.md")
      .map((f) => ({ slug: f.replace(/\.md$/, ""), block: fm(readFileSync(join(dir, f), "utf8")) }));
  };

  for (const { slug, block } of read("claims")) {
    const id = str(block, "clm_id");
    if (!id) continue;
    rows.claims.push({
      clm_id: id,
      dossier: d.slug,
      status: str(block, "status"),
      status_label: str(block, "status_label"),
      summary: str(block, "summary"),
      sources: arr(block, "sources"),
      source_count: arr(block, "sources").length,
      subjects: arr(block, "subjects"),
      url: `/dossiers/${d.slug}/claims/${slug}/`,
    });
  }

  for (const { slug, block } of read("sources")) {
    const id = str(block, "src_id");
    if (!id) continue;
    rows.sources.push({
      src_id: id,
      dossier: d.slug,
      outlet: str(block, "outlet"),
      src_type: str(block, "src_type"),
      published: str(block, "published"),
      retrieved: str(block, "retrieved"),
      claims: arr(block, "claims"),
      claim_count: arr(block, "claims").length,
      subjects: arr(block, "subjects"),
      source_url: str(block, "url"),
      url: `/dossiers/${d.slug}/sources/${slug}/`,
    });
  }

  for (const { slug, block } of read("cases")) {
    const id = str(block, "case_id");
    if (!id) continue;
    rows.cases.push({
      case_id: id,
      dossier: d.slug,
      title: str(block, "title"),
      period: str(block, "period"),
      status: str(block, "status"),
      label: str(block, "label"),
      subjects: arr(block, "subjects"),
      url: `/dossiers/${d.slug}/cases/${slug}/`,
    });
  }

  for (const { slug, block } of read("gaps")) {
    const id = str(block, "gap_id");
    if (!id) continue;
    rows.gaps.push({
      gap_id: id,
      dossier: d.slug,
      priority: str(block, "priority"),
      checked: str(block, "checked"),
      claims: arr(block, "claims"),
      subjects: arr(block, "subjects"),
      url: `/dossiers/${d.slug}/gaps/${slug}/`,
    });
  }

  for (const { slug, block } of read("relations")) {
    rows.relations.push({
      relation_id: slug,
      dossier: d.slug,
      source: str(block, "source"),
      target: str(block, "target"),
      label: str(block, "label"),
      status: str(block, "status"),
      claims: arr(block, "claims"),
      subjects: arr(block, "subjects"),
      url: `/dossiers/${d.slug}/relations/${slug}/`,
    });
  }
}

// Global entity registry.
const entDir = join(ROOT, "content/entities");
if (existsSync(entDir)) {
  for (const f of readdirSync(entDir).filter((f) => f.endsWith(".md") && f !== "_index.md")) {
    const block = fm(readFileSync(join(entDir, f), "utf8"));
    rows.entities.push({
      entity_id: str(block, "entity_id") ?? f.replace(/\.md$/, ""),
      title: str(block, "title"),
      entity_type: str(block, "entity_type"),
      role: str(block, "role"),
      dossiers: arr(block, "dossiers"),
      url: `/entities/${f.replace(/\.md$/, "")}/`,
    });
  }
}

const manifest = [];
for (const [name, data] of Object.entries(rows)) {
  writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(data, null, 1) + "\n");
  manifest.push({ table: name, rows: data.length, url: `/data/${name}.json` });
}
writeFileSync(
  join(OUT_DIR, "manifest.json"),
  JSON.stringify({ generated_by: "scripts/dossier/build-data-exports.mjs", tables: manifest }, null, 1) + "\n",
);

console.log(
  `Wrote ${manifest.length} table(s) to static/data/: ` +
    manifest.map((m) => `${m.table}=${m.rows}`).join(", ") + ".",
);
