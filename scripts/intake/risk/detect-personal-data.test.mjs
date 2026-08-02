import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPersonalData } from "./detect-personal-data.mjs";

test("detects an email address and redacts it in evidence", () => {
  const flags = detectPersonalData({ description_text: "Kontakt: jan.testovaci@example.cz" });
  assert.equal(flags.length, 1);
  assert.equal(flags[0].code, "contains_possible_email_address");
  assert.ok(!flags[0].evidence.redacted_excerpt.includes("jan.testovaci@"));
});

test("detects a phone number and redacts all but the last digits", () => {
  const flags = detectPersonalData({ description_text: "Volejte na +420 777 123 456." });
  const phoneFlag = flags.find((f) => f.code === "contains_possible_phone_number");
  assert.ok(phoneFlag);
  assert.match(phoneFlag.evidence.redacted_excerpt, /\*\*\*.*456/);
});

test("possible postal address requires BOTH a street keyword and a postal-code-like pattern (heuristic, not certain)", () => {
  const withBoth = detectPersonalData({ description_text: "Bydlí na ulici Testovací 5, 110 00 Praha." });
  assert.ok(withBoth.some((f) => f.code === "contains_possible_postal_address"));
  const withOnlyNumber = detectPersonalData({ description_text: "Cena byla 110 00 Kč." });
  assert.ok(!withOnlyNumber.some((f) => f.code === "contains_possible_postal_address"));
});

test("detects a birth date pattern as sensitive personal data", () => {
  const flags = detectPersonalData({ description_text: "Narodil se 1. 1. 1980 v Praze." });
  assert.ok(flags.some((f) => f.code === "contains_sensitive_personal_data_terms"));
});

test("detects a health term as sensitive personal data", () => {
  const flags = detectPersonalData({ description_text: "Trpí vážným psychiatrickým onemocněním." });
  assert.ok(flags.some((f) => f.code === "contains_sensitive_personal_data_terms"));
});

test("no personal data at all yields no flags", () => {
  const flags = detectPersonalData({ description_text: "Obec schválila veřejnou zakázku na opravu silnice." });
  assert.deepEqual(flags, []);
});

test("each flag names its source field", () => {
  const flags = detectPersonalData({ subject_text: "jan@example.cz" });
  assert.equal(flags[0].source_field, "subject_text");
});
