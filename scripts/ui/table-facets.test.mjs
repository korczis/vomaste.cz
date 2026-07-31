// Regresní testy URL stavu selektorových faset (coop T-019,
// assets/js/modules/table-filter.js + url-state.js).
//
// Selektorové fasety mají oproti čipům navíc jednu past: jejich hodnoty
// nejsou napsané v šabloně, ale sbírají se z dat. Když se zdroj přejmenuje
// nebo zmizí, dřív sdílený odkaz nese hodnotu, kterou data už nenabízejí.
// Komponenta ji proto přijme jen tehdy, když ji ve svých volbách najde —
// jinak spadne zpět na plný pohled. Prázdná tabulka bez vysvětlení by
// vypadala jako chyba webu, ne jako zastaralý odkaz.
//
// Testuje se čistá vrstva (spec + readState/stateToSearch), protože právě
// tam se rozhoduje, co se z adresy přečte a co se do ní zapíše. Chování
// nad DOM pokrývá až Playwright (T-021, zatím neexistuje) — tenhle soubor
// netvrdí, že testuje kliknutí v prohlížeči.
//
// Použití: node --test scripts/ui/table-facets.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readState, stateToSearch } from "../../assets/js/modules/url-state.js";

// Tvar, který si komponenta staví v spec(): základ + jeden klíč na každou
// selektorovou fasetu, pojmenovaný podle data-atributu řádku.
const BASE = { q: "", sort: "", dir: "asc", f: "" };
const specWith = (...attrs) =>
  attrs.reduce((acc, a) => Object.assign(acc, { [a]: "" }), Object.assign({}, BASE));

test("faseta se čte z URL pod názvem svého atributu", () => {
  const spec = specWith("type", "family");
  const s = readState(spec, "?type=zpravodajstv%C3%AD&family=ctk");
  assert.equal(s.type, "zpravodajství");
  assert.equal(s.family, "ctk");
});

test("dvě fasety se v adrese nemíchají", () => {
  const spec = specWith("type", "family");
  const qs = stateToSearch({ type: "tabloid", family: "" }, spec);
  const p = new URLSearchParams(qs);
  assert.equal(p.get("type"), "tabloid");
  assert.equal(p.get("family"), null, "nevyplněná faseta se do adresy nepíše");
});

test("registr bez selektorů nezanechá v adrese jejich klíče", () => {
  const qs = stateToSearch({ q: "test", sort: "id", dir: "asc", f: "" }, BASE);
  assert.equal(qs, "?q=test&sort=id");
});

test("hodnota, kterou data nenabízejí, se má zahodit — kontrakt komponenty", () => {
  // Komponenta porovnává přečtenou hodnotu se svými facetOptions; tady se
  // ověřuje jen ta část, kterou dělá url-state: hodnotu vrátí tak, jak
  // stojí v adrese, a rozhodnutí nechá na volajícím.
  const spec = specWith("type");
  const s = readState(spec, "?type=neexistujici-typ");
  assert.equal(s.type, "neexistujici-typ");
  const options = ["zpravodajství", "tabloid"];
  const accepted = options.indexOf(s.type) !== -1 ? s.type : "";
  assert.equal(accepted, "", "zastaralý odkaz spadne zpět na plný pohled");
});

test("faseta přežije round-trip i s diakritikou a mezerou", () => {
  const spec = specWith("type", "priority");
  const original = { q: "", sort: "priority", dir: "desc", f: "", type: "oficiální dokument", priority: "vysoká" };
  assert.deepEqual(readState(spec, stateToSearch(original, spec)), original);
});

test("řazení a faseta koexistují v jedné adrese", () => {
  const spec = specWith("priority");
  const qs = stateToSearch({ q: "", sort: "checked", dir: "desc", f: "", priority: "vysoká" }, spec);
  const s = readState(spec, qs);
  assert.equal(s.sort, "checked");
  assert.equal(s.dir, "desc");
  assert.equal(s.priority, "vysoká");
});
