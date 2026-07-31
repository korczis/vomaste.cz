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
 *
 * The row building itself lives in lib/record-tables.mjs, shared with
 * build-jsonld-exports.mjs so both export families are projections of ONE
 * parser instead of two drifting copies.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRecordTables, enrichDossiersForDirectory } from "./lib/record-tables.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = join(ROOT, "static/data");
mkdirSync(OUT_DIR, { recursive: true });

const rows = buildRecordTables(ROOT);
// Adresář potřebuje počty, popis a routy; ty ale existují až po
// generátorech, takže se přidávají tady, ne do kanonických řádků.
rows.dossiers = enrichDossiersForDirectory(ROOT, rows.dossiers);

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
