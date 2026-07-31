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
 *   2. počty se shodují se stats.toml — tedy pocházejí z generátoru,
 *      ne z ručně dopsaného čísla,
 *   3. routy registrů se shodují s navigačním manifestem — tedy se ČTOU,
 *      neskládají z řetězců.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

// 2. počty pocházejí z generovaných stats
const num = (b, k) => Number((b.match(new RegExp(`^${k}\\s*=\\s*(\\d+)`, "m")) ?? [])[1] ?? 0);
let checkedCounts = 0;
for (const d of rows) {
  const statsFile = join(ROOT, "data/dossiers", d.slug, "stats.toml");
  if (!existsSync(statsFile)) continue;
  const b = readFileSync(statsFile, "utf8");
  for (const [key, tomlKey] of [
    ["claims", "claims_total"], ["sources", "sources_total"], ["cases", "cases_total"],
    ["gaps", "gaps_total"], ["entities", "entities_total"], ["relations", "relations_total"],
  ]) {
    if (d.counts[key] !== num(b, tomlKey)) {
      err(`${d.slug}: počet ${key}=${d.counts[key]} nesouhlasí se stats.toml (${num(b, tomlKey)}) — číslo nepochází z generátoru`);
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
  `validate:directory-index — ${rows.length} dossier(ů); počty ověřeny proti ${checkedCounts} stats.toml, ` +
    `${checkedRoutes} rout proti navigačnímu manifestu.`,
);
if (errors.length) {
  console.log(`\n${errors.length} chyb(a):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log("\nFAILED");
  process.exit(1);
}
console.log("OK — prezentační index odpovídá kanonickým zdrojům.");
