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
 * Derived, never authored: every row comes from the COMPILED canonical
 * dataset (T-028 fáze G — data/dossiers/** JSON, tentýž model, ze
 * kterého se renderují stránky). No status is computed here, no score,
 * no ranking — the export is a projection, not a second source of truth.
 *
 * The row building itself lives in lib/record-tables.mjs, shared with
 * build-jsonld-exports.mjs so both export families are projections of ONE
 * compiled model instead of two drifting readers.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRecordTables, enrichDossiersForDirectory } from "./lib/record-tables.mjs";
import { validateExportRows } from "./lib/export-schemas.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = join(ROOT, "static/data");
mkdirSync(OUT_DIR, { recursive: true });

const rows = buildRecordTables(ROOT);

// Schema brána exportního kontraktu (T-028 fáze H — dřívější
// validate:schemas): žádný řádek, který neodpovídá schemas/*.schema.json,
// se nesmí zapsat do veřejného exportu.
{
  const schemaErrors = validateExportRows(ROOT, rows);
  if (schemaErrors.length) {
    console.error(`build-data-exports: ${schemaErrors.length} schema error(s):`);
    for (const e of schemaErrors) console.error(`  ERROR ${e}`);
    process.exit(1);
  }
}
// Adresář potřebuje počty, popis a routy; ty ale existují až po
// generátorech, takže se přidávají tady, ne do kanonických řádků.
rows.dossiers = enrichDossiersForDirectory(ROOT, rows.dossiers);

// Nezávislost doložení každého tvrzení: kolik CITOVANÝCH zdrojů a kolik
// z nich je nezávislých rodin.
//
// Zdroje sdílející jednu pojmenovanou rodinu se počítají jako JEDEN
// nezávislý zdroj — převzetí téže agenturní zprávy nebo tentýž článek na
// dvou doménách není druhé ověření. Zdroj bez rodiny je vlastní rodina.
// Stejná sémantika jako familyCount ve validate-dossier.mjs.
//
// NENÍ TO SKÓRE. Je to počet deklarované vlastnosti, stejně jako počet
// zdrojů — neříká nic o pravdivosti tvrzení, jen o tom, na kolika
// nezávislých redakcích citovaný výběr stojí.
//
// Počítá se tady, ne v šabloně: hledat rodinu ke každému zdroji každého
// tvrzení by byl průchod přes všechny zdroje dossieru pro každé tvrzení,
// tedy přesně ten kvadratický vzorec, který dnes stál 87 % času buildu.
const familyByKey = new Map(rows.sources.map((s) => [`${s.dossier}/${s.src_id}`, s.family || ""]));
const independence = {};
for (const c of rows.claims) {
  const families = new Set();
  let cited = 0;
  for (const sid of c.sources) {
    const fam = familyByKey.get(`${c.dossier}/${sid}`);
    if (fam === undefined) continue;
    cited++;
    // Prázdná rodina = samostatný zdroj, tedy vlastní rodina.
    families.add(fam || `__self__:${sid}`);
  }
  independence[`${c.dossier}/${c.clm_id}`] = { sources: cited, families: families.size };
}
mkdirSync(join(ROOT, "data/generated"), { recursive: true });
writeFileSync(
  join(ROOT, "data/generated/claim-independence.json"),
  JSON.stringify(independence, null, 1) + "\n",
);

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
