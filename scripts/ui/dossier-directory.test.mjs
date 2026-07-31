// Regresní testy tvaru komponenty adresáře (coop T-027).
//
// POZOR NA HRANICI: tenhle soubor smí sahat jen na VERZOVANÉ soubory.
// `npm test` běží v pipeline PŘED generátory, takže static/data/dossiers.json
// ani data/generated/navigation.json v čerstvém checkoutu neexistují —
// u vývojáře ano, protože je má z dřívějších běhů. Kontroly nad
// generovanými daty jsou proto v scripts/dossier/validate-directory-index.mjs,
// který běží až za nimi.
//
// Použití: node --test scripts/ui/dossier-directory.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const COMPONENT = "templates/partials/dossier-directory.html";
const CONTROLLER = "assets/js/modules/table-filter.js";

// data/dossiers.toml je verzovaný registr, ne generovaný soubor.
const registrySlugs = () => [...read("data/dossiers.toml").matchAll(/^slug\s*=\s*"([^"]+)"/gm)].map((m) => m[1]);
const registryTitles = () => [...read("data/dossiers.toml").matchAll(/^title\s*=\s*"([^"]+)"/gm)].map((m) => m[1]);

test("komponenta vykresluje všechny tři projekce serverem", () => {
  // Progresivní vylepšení: bez JavaScriptu musí zůstat použitelný aspoň
  // jeden úplný pohled. Kdyby projekce stavěl až klient, byl by web bez
  // skriptu prázdný.
  const c = read(COMPONENT);
  for (const view of ["table", "list", "grid"]) {
    assert.match(c, new RegExp(`data-view="${view}"`), `chybí serverová projekce ${view}`);
  }
  assert.match(c, /data-record-key="\{\{ d\.slug \}\}"/, "záznamy nejsou spojené klíčem napříč projekcemi");
});

test("metriky jsou definované jednou pro všechny projekce", () => {
  // Kdyby si každá projekce psala vlastní seznam metrik, rozešly by se
  // významově — tabulka by ukazovala jiná čísla než dlaždice.
  const defs = read(COMPONENT).match(/set metrics = \[/g) ?? [];
  assert.equal(defs.length, 1, "seznam metrik není definovaný právě jednou");
});

test("tabulka jde přes sdílené makro, nevzniká druhá implementace", () => {
  const c = read(COMPONENT);
  assert.match(c, /table::advanced_table\(/, "projekce tabulky nepoužívá macros/table.html");
  // Komentáře se odstraní: vysvětlení, PROČ tu vlastní <table> není, samo
  // slovo <table> obsahuje. Kontrolovat se má vykreslovaný markup, ne text
  // o něm — jinak test trestá dokumentaci vlastního rozhodnutí.
  const markup = c.replace(/\{#[\s\S]*?#\}/g, "");
  assert.ok(!/<table[\s>]/.test(markup), "komponenta si píše vlastní <table>");
});

test("agregované dossiery zůstávají odlišené od entitních", () => {
  // Editorský invariant z AGENTS.md: agregát nikdy nesmí vypadat jako
  // další rovnocenný dossier o osobě.
  assert.match(read(COMPONENT), /dossier_type != "entity"/, "komponenta nerozlišuje agregát");
});

test("v komponentě ani v controlleru není natvrdo zapsaný žádný dossier", () => {
  // Regresní pojistka. Jakmile se do sdílené komponenty dostane jméno nebo
  // slug konkrétní osoby, přestane být komponentou a stane se stránkou
  // o někom.
  for (const file of [COMPONENT, CONTROLLER]) {
    const text = read(file);
    for (const slug of registrySlugs()) {
      assert.ok(!text.includes(slug), `${file}: natvrdo zapsaný slug "${slug}"`);
    }
    for (const title of registryTitles()) {
      assert.ok(!text.includes(title), `${file}: natvrdo zapsané jméno "${title}"`);
    }
  }
});

test("počty ani routy nejsou psané v šabloně", () => {
  // Šablona smí číst d.counts[...] a d.routes[...]; nesmí skládat cesty
  // z řetězců ani obsahovat konkrétní číslo jako metriku.
  const c = read(COMPONENT);
  assert.ok(!/"\/dossiers\/" ~/.test(c), "šablona skládá routu z řetězců místo čtení z manifestu");
  assert.match(c, /d\.routes\[/, "šablona nečte routy z dat");
  assert.match(c, /d\.counts\[/, "šablona nečte počty z dat");
});
