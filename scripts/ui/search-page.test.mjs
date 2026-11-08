#!/usr/bin/env node
// Testy logiky stránky /hledat/ (assets/js/modules/search-core.js:
// searchPage, facetOptions, readPageState, writePageState).
//
// Co nese záruku: filtry se skládají (AND), filtr stavu propustí jen
// tvrzení, prázdný dotaz bez filtru nic nevypíše (není to odpověď),
// volby filtrů pocházejí z indexu (žádný seznam v kódu), stav v URL
// jde tam a zpátky beze ztráty a výchozí pohled má čistou adresu.
// Fixture je vymyšlená — žádné skutečné jméno.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { searchPage, facetOptions, readPageState, writePageState } = await import(
  path.join(__dirname, "..", "..", "assets", "js", "modules", "search-core.js")
);

const rec = (id, type, dossier, title, extra = "") => ({
  id, type, dossier, title, summary: title, extra, route: `/x/${dossier}/${id.toLowerCase()}/`,
});
const INDEX = [
  rec("DOSSIER:alfa", "dossier", "alfa", "Žofie Alfová"),
  rec("DOSSIER:beta", "dossier", "beta", "Čeněk Beta"),
  rec("CLM-01", "claim", "alfa", "Alfová vede úřad", "CORROBORATED"),
  rec("CLM-02", "claim", "alfa", "Alfová podepsala smlouvu", "SPORNÉ"),
  rec("CLM-10", "claim", "alfa", "Alfová řekla větu", "CITACE"),
  rec("CLM-01", "claim", "beta", "Beta vede firmu", "1 ZDROJ"),
  rec("SRC-01", "source", "alfa", "Úřední věstník o smlouvě", "SPORNÉ"),
  rec("GAP-01", "gap", "beta", "Nedoložený podíl ve firmě"),
  rec("ent-x", "entity", null, "Firma X", "context"),
];

test("prázdný dotaz bez filtru nevrací nic a hlásí prázdný stav", () => {
  const r = searchPage(INDEX, { q: "  " });
  assert.equal(r.total, 0);
  assert.equal(r.empty, true);
});

test("filtr bez dotazu prochází záznamy (všechna tvrzení dossieru)", () => {
  const r = searchPage(INDEX, { type: "claim", dossier: "alfa" });
  assert.equal(r.total, 3);
  assert.deepEqual(r.items.map((i) => i.id), ["CLM-01", "CLM-02", "CLM-10"]); // numericky, ne lexikálně
});

test("filtr stavu propustí jen tvrzení — zdroj se stejným textem v extra ne", () => {
  const r = searchPage(INDEX, { status: "SPORNÉ" });
  assert.deepEqual(r.items.map((i) => `${i.type}:${i.id}`), ["claim:CLM-02"]);
});

test("dotaz je bez diakritiky a filtry se skládají (AND)", () => {
  const all = searchPage(INDEX, { q: "alfova" });
  assert.ok(all.total >= 3);
  const narrowed = searchPage(INDEX, { q: "alfova", status: "CITACE" });
  assert.deepEqual(narrowed.items.map((i) => i.id), ["CLM-10"]);
  assert.equal(searchPage(INDEX, { q: "alfova", dossier: "beta" }).total, 0);
});

test("přesná shoda ID řadí výš než zmínka v textu", () => {
  const r = searchPage(INDEX, { q: "GAP-01" });
  assert.equal(r.items[0].id, "GAP-01");
  assert.equal(r.items[0].hlField, "id");
});

test("počty podle typu jsou nad CELÝM výsledkem, ne nad stránkou", () => {
  const r = searchPage(INDEX, { q: "a" }, { limit: 2 });
  assert.equal(r.items.length, 2);
  assert.equal(r.truncated, true);
  const sum = Object.values(r.byType).reduce((a, b) => a + b, 0);
  assert.equal(sum, r.total);
});

test("volby filtrů pocházejí z indexu; dossier nese název, stavy jen z tvrzení", () => {
  const f = facetOptions(INDEX);
  assert.deepEqual(f.dossiers.map((d) => [d.value, d.label]), [["beta", "Čeněk Beta"], ["alfa", "Žofie Alfová"]]);
  assert.deepEqual(f.statuses.map((s) => s.value).sort(), ["1 ZDROJ", "CITACE", "CORROBORATED", "SPORNÉ"].sort());
  assert.deepEqual(f.types.map((t) => t.value), ["dossier", "entity", "claim", "source", "gap"]);
});

test("neznámý typ záznamu se v nabídce neztratí", () => {
  const f = facetOptions([...INDEX, rec("N-1", "novinka", "alfa", "Něco nového")]);
  assert.ok(f.types.some((t) => t.value === "novinka"));
});

test("stav v URL tam a zpátky; výchozí pohled má čistou adresu", () => {
  const state = { q: "Šťastná smlouva", type: "claim", dossier: "alfa", status: "1 ZDROJ" };
  const qs = writePageState(state);
  assert.match(qs, /typ=claim/);
  assert.match(qs, /stav=1\+ZDROJ/);
  assert.deepEqual(readPageState(qs), state);
  assert.equal(writePageState({ q: "", type: "", dossier: "", status: "" }), "");
  assert.deepEqual(readPageState(""), { q: "", type: "", dossier: "", status: "" });
});
