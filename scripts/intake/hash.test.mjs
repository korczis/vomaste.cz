import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalJsonStringify } from "./canonical-json.mjs";
import { sha256Hex, hashEventInput, hashManifest } from "./hash.mjs";

test("canonicalJsonStringify is stable across key insertion order", () => {
  const a = { b: 1, a: 2, c: { z: 1, y: 2 } };
  const b = { a: 2, c: { y: 2, z: 1 }, b: 1 };
  assert.equal(canonicalJsonStringify(a), canonicalJsonStringify(b));
});

test("canonicalJsonStringify preserves array order", () => {
  assert.equal(canonicalJsonStringify([3, 1, 2]), canonicalJsonStringify([3, 1, 2]));
  assert.notEqual(canonicalJsonStringify([3, 1, 2]), canonicalJsonStringify([1, 2, 3]));
});

test("hashEventInput is stable regardless of key order", () => {
  const a = { repository: { owner: "korczis", name: "x" }, issue: { number: 1 } };
  const b = { issue: { number: 1 }, repository: { name: "x", owner: "korczis" } };
  assert.equal(hashEventInput(a), hashEventInput(b));
});

test("sha256Hex matches the known digest of the empty string", () => {
  assert.equal(sha256Hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

test("hashManifest excludes provenance.manifest_sha256 from its own input", () => {
  const base = { a: 1, provenance: { generated_at: "x", input_sha256: "y" } };
  const withHash1 = { ...base, provenance: { ...base.provenance, manifest_sha256: "aaaa" } };
  const withHash2 = { ...base, provenance: { ...base.provenance, manifest_sha256: "bbbb" } };
  assert.equal(hashManifest(withHash1), hashManifest(withHash2));
});

test("hashManifest changes when non-hash content changes", () => {
  const m1 = { a: 1, provenance: { generated_at: "x", manifest_sha256: "aaaa" } };
  const m2 = { a: 2, provenance: { generated_at: "x", manifest_sha256: "aaaa" } };
  assert.notEqual(hashManifest(m1), hashManifest(m2));
});
