// Regresní testy adresáře dossierů (coop T-027).
//
// Adresář nabízí tři projekce (tabulka, seznam, dlaždice) nad JEDNÍM
// kanonickým datasetem. Tyhle testy hlídají to, co se u takové komponenty
// rozpadá nejdřív: že projekce zůstanou projekcemi téhož, že čísla
// pocházejí z generovaných dat a že se do komponenty nedostane konkrétní
// dossier.
//
// Použití: node --test scripts/ui/dossier-directory.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const EXPORT = "static/data/dossiers.json";
const COMPONENT = "templates/partials/dossier-directory.html";

const dossiers = () => JSON.parse(read(EXPORT));

test("kanonický export nese vše, co adresář potřebuje", () => {
  const rows = dossiers();
  assert.ok(rows.length > 0, "export je prázdný");
  for (const d of rows) {
    assert.ok(d.slug, "chybí slug");
    assert.ok(d.title, `${d.slug}: chybí titulek`);
    assert.equal(typeof d.description, "string", `${d.slug}: chybí popis`);
    assert.ok(d.counts, `${d.slug}: chybí počty`);
    assert.ok(d.routes?.dossier, `${d.slug}: chybí routa dossieru`);
  }
});

test("počty pocházejí z generovaných stats, ne z ručních čísel", () => {
  // Kdyby někdo počty dopsal do šablony nebo do exportu ručně, rozešly by
  // se s registry při první změně obsahu. Tenhle test je porovnává se
  // souborem, který generuje generate-stats.mjs z reálných registrů.
  for (const d of dossiers()) {
    const stats = join(ROOT, "data/dossiers", d.slug, "stats.toml");
    if (!existsSync(stats)) continue;
    const raw = readFileSync(stats, "utf8");
    const num = (k) => Number((raw.match(new RegExp(`^${k}\\s*=\\s*(\\d+)`, "m")) ?? [])[1] ?? 0);
    assert.equal(d.counts.claims, num("claims_total"), `${d.slug}: počet tvrzení nesouhlasí se stats.toml`);
    assert.equal(d.counts.sources, num("sources_total"), `${d.slug}: počet zdrojů nesouhlasí`);
    assert.equal(d.counts.gaps, num("gaps_total"), `${d.slug}: počet mezer nesouhlasí`);
  }
});

test("routy registrů se čtou z navigačního manifestu, ne skládají z řetězců", () => {
  // Manifest je kanonický: přejmenování registru se projeví na jednom
  // místě. Skládání cest v šabloně by tichý rozchod nezachytilo.
  const nav = JSON.parse(read("data/generated/navigation.json"));
  const root = nav.items.find((i) => i.matchPrefix === "/dossiers/");
  const known = new Map(
    (root?.children ?? []).map((c) => [
      c.matchPrefix.split("/").filter(Boolean)[1],
      new Set((c.children ?? []).map((x) => x.matchPrefix)),
    ]),
  );
  for (const d of dossiers()) {
    const fromNav = known.get(d.slug);
    if (!fromNav) continue;
    for (const [key, route] of Object.entries(d.routes)) {
      if (key === "dossier") continue;
      assert.ok(fromNav.has(route), `${d.slug}: routa ${key}=${route} není v navigačním manifestu`);
    }
  }
});

test("agregované dossiery zůstávají odlišené od entitních", () => {
  // Editorský invariant z AGENTS.md: agregát nikdy nesmí vypadat jako
  // další rovnocenný dossier o osobě.
  const rows = dossiers();
  const types = new Set(rows.map((d) => d.dossier_type));
  assert.ok(types.has("entity"), "chybí entitní dossiery");
  const component = read(COMPONENT);
  assert.match(
    component,
    /dossier_type != "entity"/,
    "komponenta nerozlišuje agregát od entitního dossieru",
  );
});

test("v komponentě není natvrdo zapsaný žádný konkrétní dossier", () => {
  // Regresní pojistka. Jakmile se do sdílené komponenty dostane jméno
  // nebo slug konkrétní osoby, přestane být komponentou a stane se
  // stránkou o někom. Stejný důvod má lint:hardcoded-records u šablon.
  const sources = [COMPONENT, "assets/js/modules/table-filter.js"];
  const slugs = dossiers().map((d) => d.slug);
  const titles = dossiers().map((d) => d.title);
  for (const file of sources) {
    const text = read(file);
    for (const slug of slugs) {
      assert.ok(!text.includes(slug), `${file}: natvrdo zapsaný slug "${slug}"`);
    }
    for (const title of titles) {
      assert.ok(!text.includes(title), `${file}: natvrdo zapsané jméno "${title}"`);
    }
  }
});

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
  const c = read(COMPONENT);
  const defs = c.match(/set metrics = \[/g) ?? [];
  assert.equal(defs.length, 1, "seznam metrik není definovaný právě jednou");
});
