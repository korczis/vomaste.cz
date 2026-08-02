import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePersonName } from "./normalize-person-name.mjs";

test("preserves diacritics — never invents a diacritic-free comparison variant", () => {
  assert.equal(normalizePersonName("Jan Novák").comparisonName, "jan novák");
});

test("case folding is applied", () => {
  assert.equal(normalizePersonName("JAN NOVÁK").comparisonName, "jan novák");
});

test("collapses internal whitespace and trims", () => {
  assert.equal(normalizePersonName("  Jan   Novák  ").comparisonName, "jan novák");
});

test("strips a known academic title from the comparison name but records it", () => {
  const result = normalizePersonName("Mgr. Jan Novák");
  assert.equal(result.comparisonName, "jan novák");
  assert.deepEqual(result.foundTitles, ["Mgr."]);
});

test("does not strip a word that merely resembles a title", () => {
  const result = normalizePersonName("Docela Novák"); // "Docela" is not "doc."
  assert.equal(result.comparisonName, "docela novák");
});

test("exposes a token-order variant for swapped given-name/surname order", () => {
  const forward = normalizePersonName("Jan Novák");
  const reversed = normalizePersonName("Novák Jan");
  assert.equal(forward.tokenOrderVariant, reversed.comparisonName);
});

test("a single-token name has no distinct token-order variant", () => {
  const result = normalizePersonName("Novák");
  assert.equal(result.tokenOrderVariant, result.comparisonName);
});

test("normalizes composed vs decomposed Unicode to the same comparison name", () => {
  const nfc = normalizePersonName("Jan Novák".normalize("NFC"));
  const nfd = normalizePersonName("Jan Novák".normalize("NFD"));
  assert.equal(nfc.comparisonName, nfd.comparisonName);
});

test("reports zero-width characters as an observation without silently vanishing the name's meaning", () => {
  const result = normalizePersonName("Ja​n Novák");
  assert.ok(result.observations.includes("contains_zero_width_characters"));
  assert.equal(result.comparisonName, "jan novák");
});

test("reports bidi control characters as an observation", () => {
  const result = normalizePersonName("Jan‮Novák");
  assert.ok(result.observations.includes("contains_bidi_control_characters"));
});

test("does not determine gender, nationality, or merge similar surnames — comparisonName is a literal fold, nothing more", () => {
  const novak = normalizePersonName("Jan Novák");
  const novotny = normalizePersonName("Jan Novotný");
  assert.notEqual(novak.comparisonName, novotny.comparisonName);
});
