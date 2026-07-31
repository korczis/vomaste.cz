/*
 * Regression tests for the duplicate check in expand-entity.mjs.
 *
 * Both cases below are real: they were found by running the script against
 * live ARES data and noticing the answer was wrong, which only worked
 * because the right answer was already known. Encoded here so the next
 * change to the script does not have to rediscover them.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { findPossibleDuplicate, baseName, slugify } from "./lib/entity-dedupe.mjs";

const page = (title, body = "") => `+++\ntitle = "${title}"\n+++\n\n${body}`;

const registry = new Map([
  ["agrofert", page("Agrofert", "Kontextová entita bez uvedeného IČO.")],
  ["gmrgas-cz", page("GMR GAS s.r.o. (Brno)", "Česká společnost (IČO 28274318, Brno).")],
  ["vencalek", page("Petr Vencálek (vlastník GMR GAS s.r.o.)")],
  ["mrazova", page("Zuzana Mrázová (ministryně spravedlnosti)")],
]);

test("company is matched by IČO appearing anywhere in an existing page", () => {
  const hit = findPossibleDuplicate(
    { id: "gmr-gas-s-r-o", ico: "28274318", name: "GMR GAS s.r.o." },
    registry,
  );
  assert.equal(hit?.id, "gmrgas-cz");
});

test("company is matched by name once the legal form is stripped", () => {
  // The existing agrofert.md mentions no IČO at all, so IČO matching alone
  // let the script propose a second page for the same company.
  const hit = findPossibleDuplicate(
    { id: "agrofert-a-s", ico: "26185610", name: "AGROFERT, a.s." },
    registry,
  );
  assert.equal(hit?.id, "agrofert");
});

test("person is matched on an exact surname token", () => {
  const hit = findPossibleDuplicate(
    { id: "petr-vencalek", slugSource: "PETR VENCÁLEK", name: "Bc. Petr Vencálek" },
    registry,
  );
  assert.equal(hit?.id, "vencalek");
});

test("a shared surname stem is NOT a match", () => {
  // Josef Mráz vs Zuzana Mrázová: substring matching claimed these were the
  // same person and suppressed creating the former. A false match here does
  // not warn, it skips creation — so it must not fire on a stem.
  const hit = findPossibleDuplicate(
    { id: "josef-mraz", slugSource: "JOSEF MRÁZ", name: "Ing. Josef Mráz" },
    registry,
  );
  assert.equal(hit, null);
});

test("an unrelated company is not matched", () => {
  const hit = findPossibleDuplicate(
    { id: "ico-12345678", ico: "12345678", name: "Nesouvisející podnik s.r.o." },
    registry,
  );
  assert.equal(hit, null);
});

test("a candidate never matches itself", () => {
  const self = new Map([["agrofert", page("Agrofert")]]);
  assert.equal(findPossibleDuplicate({ id: "agrofert", ico: "26185610", name: "Agrofert" }, self), null);
});

test("baseName strips the legal form, slugify strips diacritics", () => {
  assert.equal(baseName("AGROFERT, a.s."), "agrofert");
  assert.equal(baseName("GMR GAS s.r.o."), "gmr-gas");
  assert.equal(slugify("Zbyněk Průša"), "zbynek-prusa");
});

test("a very short surname is ignored rather than matched loosely", () => {
  // Three-letter tokens collide far too easily to be evidence of identity.
  const hit = findPossibleDuplicate({ id: "jan-lev", slugSource: "JAN LEV" }, registry);
  assert.equal(hit, null);
});
