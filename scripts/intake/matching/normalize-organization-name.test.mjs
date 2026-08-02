import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOrganizationName } from "./normalize-organization-name.mjs";

test("detects and reports a legal-form suffix without stripping it from comparisonName", () => {
  const result = normalizeOrganizationName("Příklad, s.r.o.");
  assert.equal(result.legalForm, "s.r.o.");
  assert.ok(result.comparisonName.includes("s.r.o."));
});

test("two entities differing only in legal form stay distinguishable", () => {
  const sro = normalizeOrganizationName("Příklad, s.r.o.");
  const as = normalizeOrganizationName("Příklad, a.s.");
  assert.notEqual(sro.comparisonName, as.comparisonName);
  assert.notEqual(sro.legalForm, as.legalForm);
});

test("returns null legalForm when no known suffix is present", () => {
  assert.equal(normalizeOrganizationName("Obec Testov").legalForm, null);
});

test("case-folds and collapses whitespace", () => {
  assert.equal(normalizeOrganizationName("  PŘÍKLAD   a.s.  ").comparisonName, "příklad a.s.");
});

test("recognizes SE as a legal form", () => {
  assert.equal(normalizeOrganizationName("Příklad Holding SE").legalForm, "se");
});
