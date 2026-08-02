import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeIco } from "./normalize-identifier.mjs";

// Known real Czech company IČOs (checksum-valid, publicly known values).
for (const ico of ["26168685", "27082440", "26185610"]) {
  test(`normalizeIco accepts valid checksum for ${ico}`, () => {
    assert.equal(normalizeIco(ico).valid, true);
  });
}

test("normalizeIco rejects an invalid checksum", () => {
  assert.equal(normalizeIco("12345678").valid, false);
});

test("normalizeIco rejects non-8-digit input", () => {
  assert.equal(normalizeIco("1234567").valid, false);
  assert.equal(normalizeIco("123456789").valid, false);
});

test("normalizeIco strips whitespace and preserves leading zero", () => {
  const result = normalizeIco("  012 345 61");
  assert.equal(result.normalized, "01234561");
});

test("normalizeIco rejects non-numeric input without throwing", () => {
  assert.equal(normalizeIco("abcdefgh").valid, false);
  assert.equal(normalizeIco(null).valid, false);
  assert.equal(normalizeIco(undefined).valid, false);
});
