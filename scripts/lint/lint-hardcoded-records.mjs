#!/usr/bin/env node
/*
 * Brána proti natvrdo zapsaným záznamům v šablonách.
 *
 * Šablony smí znát datový MODEL (že existuje tvrzení a má stav), ne
 * KONKRÉTNÍ ZÁZNAMY. Jakmile v šabloně stojí `CLM-07`, `SRC-15` nebo jméno
 * subjektu, vznikla konstanta, kterou musí někdo ručně přepočítat, až se
 * registr změní — a nikdo to neudělá, protože build zůstane zelený.
 * Přesně tak na úvodní stránce zestárla ukázka „CLM-07 → SRC-15" a ukázka
 * „ověřte si tvrzení", která mířila na konkrétní CLM-45.
 *
 * Kontroluje se jen to, co jde ověřit strojově:
 *   - identifikátory záznamů (CLM/SRC/CASE/GAP-##) mimo komentáře,
 *   - slugy dossierů z kanonického registru v cestách `@/dossiers/<slug>/`
 *     (T-028 fáze H: registrem je kanonický dataset),
 *   - slugy dossierů jako string literály ("<slug>") kdekoli v šabloně,
 *   - natvrdo zapsané POČTY ve stat dlaždicích (stat_tile(value=<číslo>)
 *     — počet musí jít z dat, ne ze šablony).
 * Jména osob se nekontrolují — v komentářích a příkladech jsou legitimní a
 * regulární výraz by z toho udělal hlídače slovníku.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "../dossier/lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TEMPLATES = join(ROOT, "templates");

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });

// Tera komentáře {#- … -#} jsou dokumentace, ne výstup — příklad v komentáři
// nic nerozbije. Stejně tak řádek s vlastní výjimkou.
const stripComments = (s) => s.replace(/\{#[\s\S]*?#\}/g, "");

const registry = loadDossierRegistry();
const slugs = registry.map((d) => d.slug);
const errors = [];

for (const file of walk(TEMPLATES)) {
  const rel = relative(ROOT, file);
  const body = stripComments(readFileSync(file, "utf8"));

  for (const m of body.matchAll(/\b(CLM|SRC|CASE|GAP)-\d+\b/g)) {
    errors.push(`${rel}: natvrdo zapsaný záznam "${m[0]}" — vyber ho z registru (get_section + filter), ať se ukázka posune sama.`);
  }
  for (const slug of slugs) {
    const re = new RegExp(`["'\`/]dossiers/${slug}[/"'\`]`);
    if (re.test(body)) {
      errors.push(`${rel}: natvrdo zapsaný slug dossieru "${slug}" — cestu skládej z proměnné (section.extra.dossier, kanonický registr přes view modely).`);
    }
    // Slug jako holý string literál (mimo cesty) — šablona nesmí znát
    // konkrétní dossier ani mimo URL kontext (T-028 fáze H).
    const literal = new RegExp(`["'\`]${slug}["'\`]`);
    if (literal.test(body)) {
      errors.push(`${rel}: natvrdo zapsaný slug dossieru "${slug}" jako literál — vyber ho z dat (view modely), ne ze šablony.`);
    }
  }
  // Natvrdo zapsané počty ve stat dlaždicích — číslo v šabloně zestárne
  // tiše; počty musí přicházet z view modelů/manifestů.
  for (const m of body.matchAll(/stat_tile\(\s*value\s*=\s*(\d+)/g)) {
    errors.push(`${rel}: stat_tile s natvrdo zapsaným počtem ${m[1]} — počet musí jít z dat, ne ze šablony.`);
  }
}

if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of [...new Set(errors)]) console.log(`  ERROR ${e}`);
  process.exit(1);
}
console.log(`lint:hardcoded-records -- OK (${walk(TEMPLATES).length} šablon, 0 natvrdo zapsaných záznamů nebo slugů).`);
