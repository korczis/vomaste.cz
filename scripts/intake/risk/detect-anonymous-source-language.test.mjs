import { test } from "node:test";
import assert from "node:assert/strict";
import { detectAnonymousSourceLanguage } from "./detect-anonymous-source-language.mjs";

test("detects an unnamed-source phrase", () => {
  const flags = detectAnonymousSourceLanguage({ description_text: "Řekl mi to můj známý z úřadu." });
  assert.equal(flags.length, 1);
  assert.equal(flags[0].code, "contains_unnamed_source_language");
});

test("detects 'anonymní svědek'", () => {
  const flags = detectAnonymousSourceLanguage({ description_text: "Byl zde anonymní svědek, který vše potvrdil." });
  assert.ok(flags.length >= 1);
});

test("false positive: citing a named public document is not anonymous-source language", () => {
  const flags = detectAnonymousSourceLanguage({ description_text: "Podle veřejné výroční zprávy k tomu došlo v březnu." });
  assert.deepEqual(flags, []);
});

test("false positive: plain reporting with no source-attribution language at all", () => {
  const flags = detectAnonymousSourceLanguage({ description_text: "Zastupitelstvo schválilo rozpočet na příští rok." });
  assert.deepEqual(flags, []);
});
