#!/usr/bin/env node
/*
 * Kontrola prezentačního indexu adresáře (coop T-027).
 *
 * PROČ TO NENÍ V `npm test`: kontroly potřebují static/data/dossiers.json
 * a data/generated/navigation.json, což jsou GENEROVANÉ soubory. `npm test`
 * běží v pipeline před generátory, takže v čerstvém checkoutu ještě
 * neexistují — u vývojáře ano, protože je má z dřívějších běhů, a přesně
 * tenhle rozdíl už dnes dvakrát shodil CI. Kontroly nad generovanými daty
 * patří za generátory, ne před ně.
 *
 * Co se ověřuje:
 *   1. index nese vše, co adresář potřebuje (žádné prázdné pole navíc),
 *   2. počty se shodují s compiled kanonickým modelem (T-028 fáze H —
 *      dřívější stats.toml zaniklo; sémantiku viditelných počtů vlastní
 *      readDossierStats v lib/record-tables.mjs) — tedy pocházejí
 *      z kanonických dat, ne z ručně dopsaného čísla,
 *   3. routy registrů se shodují s navigačním manifestem — tedy se ČTOU,
 *      neskládají z řetězců.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readDossierStats } from "./lib/record-tables.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const errors = [];
const err = (m) => errors.push(m);

const INDEX = "static/data/dossiers.json";
const NAV = "data/generated/navigation.json";

for (const f of [INDEX, NAV]) {
  if (!existsSync(join(ROOT, f))) {
    console.log(`FAILED — chybí ${f}; spusť generátory (npm run build) před touto kontrolou.`);
    process.exit(1);
  }
}

const rows = JSON.parse(read(INDEX));
const nav = JSON.parse(read(NAV));

if (!rows.length) err("prezentační index je prázdný");

// 1. úplnost
for (const d of rows) {
  if (!d.slug) err("záznam bez slugu");
  if (!d.title) err(`${d.slug}: chybí titulek`);
  if (typeof d.description !== "string" || !d.description) err(`${d.slug}: chybí popis`);
  if (!d.counts) err(`${d.slug}: chybí počty`);
  if (!d.routes?.dossier) err(`${d.slug}: chybí routa dossieru`);
}

// 2. počty pocházejí z kanonického modelu
let checkedCounts = 0;
for (const d of rows) {
  const canonical = readDossierStats(ROOT, d.slug);
  if (!canonical) {
    err(`${d.slug}: dossier v indexu nemá kanonický záznam — počty nejde ověřit`);
    continue;
  }
  for (const key of ["claims", "sources", "cases", "gaps", "entities", "relations"]) {
    if (d.counts[key] !== canonical[key]) {
      err(`${d.slug}: počet ${key}=${d.counts[key]} nesouhlasí s kanonickým modelem (${canonical[key]}) — číslo nepochází z kanonických dat`);
    }
  }
  checkedCounts++;
}

// 3. routy se čtou z navigačního manifestu
const dossiersItem = (nav.items ?? []).find((i) => i.matchPrefix === "/dossiers/");
const known = new Map(
  (dossiersItem?.children ?? []).map((c) => [
    (c.matchPrefix ?? "").split("/").filter(Boolean)[1],
    new Set((c.children ?? []).map((x) => x.matchPrefix)),
  ]),
);
let checkedRoutes = 0;
for (const d of rows) {
  const fromNav = known.get(d.slug);
  if (!fromNav) continue;
  for (const [key, route] of Object.entries(d.routes)) {
    if (key === "dossier") continue;
    if (!fromNav.has(route)) {
      err(`${d.slug}: routa ${key}=${route} není v navigačním manifestu — cesta se někde skládá z řetězců`);
    }
    checkedRoutes++;
  }
}

console.log(
  `validate:directory-index — ${rows.length} dossier(ů); počty ověřeny proti ${checkedCounts} kanonickým záznamům, ` +
    `${checkedRoutes} rout proti navigačnímu manifestu.`,
);
if (errors.length) {
  console.log(`\n${errors.length} chyb(a):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log("\nFAILED");
  process.exit(1);
}
console.log("OK — prezentační index odpovídá kanonickým zdrojům.");
