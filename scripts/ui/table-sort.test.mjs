// Regresní testy řadicí logiky sdílené tabulky (coop T-019,
// assets/js/modules/table-filter.js). Nosné chování: čísla se řadí
// číselně (ne jako text), české řazení respektuje diakritiku, a prázdné
// hodnoty padají na konec v obou směrech.
//
// To poslední je editorsky podstatné: řádek bez údaje není „nejmenší",
// jen neúplný. Kdyby prázdné hodnoty vyplavaly nahoru při vzestupném
// řazení, nejnápadnějším obsahem tabulky by byla chybějící data.
//
// Použití: node --test scripts/ui/table-sort.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { compareValues } from "../../assets/js/modules/table-filter.js";

const sorted = (values, dir = 1) =>
  values.slice().sort((a, b) => compareValues(a, b, dir));

test("čísla se řadí číselně, ne lexikograficky", () => {
  assert.deepEqual(sorted(["10", "9", "2", "100"]), ["2", "9", "10", "100"]);
});

test("text se řadí podle českého pořadí", () => {
  assert.deepEqual(sorted(["Žák", "Adam", "Čapek", "Bláha"]), ["Adam", "Bláha", "Čapek", "Žák"]);
});

test("prázdné hodnoty jdou na konec při vzestupném řazení", () => {
  assert.deepEqual(sorted(["b", "", "a"]), ["a", "b", ""]);
});

test("prázdné hodnoty jdou na konec i při sestupném řazení", () => {
  assert.deepEqual(sorted(["b", "", "a"], -1), ["b", "a", ""]);
});

test("shodné hodnoty se považují za rovné", () => {
  assert.equal(compareValues("SRC-01", "SRC-01"), 0);
});

test("identifikátory se stejným prefixem se řadí podle čísla v textu", () => {
  assert.deepEqual(sorted(["CLM-10", "CLM-2", "CLM-1"]), ["CLM-1", "CLM-2", "CLM-10"]);
});

test("dvě prázdné hodnoty jsou rovné, ne nestabilní", () => {
  assert.equal(compareValues("", ""), 0);
});

test("datum ve tvaru ISO se řadí správně jako text", () => {
  assert.deepEqual(
    sorted(["2026-07-30", "2026-01-05", "2025-12-31"]),
    ["2025-12-31", "2026-01-05", "2026-07-30"],
  );
});
