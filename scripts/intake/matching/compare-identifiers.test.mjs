import { test } from "node:test";
import assert from "node:assert/strict";
import { compareIdentifier, compareIdentifierSets } from "./compare-identifiers.mjs";

test("equal IČO values compare as equal after normalization", () => {
  assert.equal(compareIdentifier("ico", "261 686 85", "26168685").status, "equal");
});

test("different IČO values compare as conflict", () => {
  assert.equal(compareIdentifier("ico", "26168685", "27082440").status, "conflict");
});

test("a missing value on either side is not_comparable, never a conflict", () => {
  assert.equal(compareIdentifier("ico", "26168685", undefined).status, "not_comparable");
  assert.equal(compareIdentifier("ico", null, "26168685").status, "not_comparable");
});

test("compareIdentifierSets separates equal from conflicting keys", () => {
  const result = compareIdentifierSets({ ico: "26168685", databox: "abc123" }, { ico: "26168685", databox: "different" });
  assert.deepEqual(result.equalKeys, ["ico"]);
  assert.deepEqual(result.conflictingKeys, ["databox"]);
});

test("compareIdentifierSets with no shared keys yields empty arrays, never a false conflict", () => {
  const result = compareIdentifierSets({ ico: "26168685" }, { databox: "abc123" });
  assert.deepEqual(result.equalKeys, []);
  assert.deepEqual(result.conflictingKeys, []);
});
