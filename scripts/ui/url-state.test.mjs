// Regresní testy sdíleného URL stavu (coop T-019, assets/js/modules/
// url-state.js). Nosné chování: výchozí pohled má čistou URL, cizí
// parametry se nepřepisují ani neztrácejí, a round-trip readState →
// stateToSearch → readState vrací totéž — na tom stojí slib, že sdílený
// odkaz ukáže druhé straně stejný výřez dat.
//
// Použití: node --test scripts/ui/url-state.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readState, stateToSearch } from "../../assets/js/modules/url-state.js";

const SPEC = { q: "", sort: "id", dir: "asc", status: "" };

test("prázdný query string dá výchozí stav", () => {
  assert.deepEqual(readState(SPEC, ""), { q: "", sort: "id", dir: "asc", status: "" });
});

test("hodnoty z URL přebijí výchozí", () => {
  const s = readState(SPEC, "?q=babi%C5%A1&sort=status&dir=desc");
  assert.equal(s.q, "babiš");
  assert.equal(s.sort, "status");
  assert.equal(s.dir, "desc");
  assert.equal(s.status, "", "nezadaný parametr zůstává na výchozí hodnotě");
});

test("prázdný parametr se chová jako nezadaný, ne jako prázdná volba", () => {
  assert.equal(readState(SPEC, "?sort=").sort, "id");
});

test("klíče mimo spec se do stavu nedostanou", () => {
  const s = readState(SPEC, "?utm_source=twitter&q=test");
  assert.equal(s.q, "test");
  assert.equal(s.utm_source, undefined);
});

test("výchozí stav serializuje na prázdný řetězec — čistá URL", () => {
  assert.equal(stateToSearch({ q: "", sort: "id", dir: "asc", status: "" }, SPEC), "");
});

test("jen nevýchozí hodnoty se zapíší", () => {
  const qs = stateToSearch({ q: "", sort: "status", dir: "asc", status: "" }, SPEC);
  assert.equal(qs, "?sort=status");
});

test("návrat na výchozí hodnotu parametr z URL odstraní", () => {
  const qs = stateToSearch({ q: "", sort: "id", dir: "asc", status: "" }, SPEC, "?sort=status&q=x");
  assert.equal(qs, "", "jinak by v adrese zůstal filtr, který už neplatí");
});

test("cizí parametry v URL přežijí zápis stavu", () => {
  const qs = stateToSearch({ q: "test", sort: "id", dir: "asc", status: "" }, SPEC, "?utm_source=twitter");
  const p = new URLSearchParams(qs);
  assert.equal(p.get("utm_source"), "twitter");
  assert.equal(p.get("q"), "test");
});

test("round-trip zachová stav včetně diakritiky a mezer", () => {
  const original = { q: "Vojtěch a spol", sort: "status", dir: "desc", status: "status-disputed" };
  const restored = readState(SPEC, stateToSearch(original, SPEC));
  assert.deepEqual(restored, original);
});

test("hodnoty se escapují, ne konkatenují — & v dotazu nerozbije URL", () => {
  const qs = stateToSearch({ q: "a&sort=hacked", sort: "id", dir: "asc", status: "" }, SPEC);
  assert.equal(readState(SPEC, qs).q, "a&sort=hacked");
  assert.equal(readState(SPEC, qs).sort, "id", "vložený parametr se nesmí protlačit do jiného klíče");
});
