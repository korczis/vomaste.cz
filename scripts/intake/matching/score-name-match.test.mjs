import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizedSimilarity, scoreComponents } from "./score-name-match.mjs";

test("identical strings have similarity 1", () => {
  assert.equal(normalizedSimilarity("jan testovací", "jan testovací"), 1);
});

test("completely different strings of equal length approach 0", () => {
  assert.ok(normalizedSimilarity("aaaaaaaaaa", "zzzzzzzzzz") < 0.05);
});

test("similarity is bounded within [0, 1] for very long adversarial input (no catastrophic blowup)", () => {
  const a = "a".repeat(100000);
  const b = "b".repeat(100000);
  const start = Date.now();
  const sim = normalizedSimilarity(a, b);
  const elapsed = Date.now() - start;
  assert.ok(sim >= 0 && sim <= 1);
  assert.ok(elapsed < 2000, `expected bounded runtime, took ${elapsed}ms`);
});

test("empty strings are similarity 1 (both empty = identical)", () => {
  assert.equal(normalizedSimilarity("", ""), 1);
});

test("scoreComponents caps total_score at 1 even if components would sum higher", () => {
  const result = scoreComponents({ identifierEqualFraction: 1, canonicalNameEqual: true, aliasEqual: true, tokenEquivalent: false, nearNameSimilarity: 0, legalFormEqual: true });
  assert.ok(result.totalScore <= 1);
});

test("every component in the breakdown has rule/weight/value/contribution", () => {
  const result = scoreComponents({ identifierEqualFraction: 1, canonicalNameEqual: false, aliasEqual: false, tokenEquivalent: false, nearNameSimilarity: 0, legalFormEqual: false });
  for (const component of result.components) {
    assert.equal(typeof component.rule, "string");
    assert.equal(typeof component.weight, "number");
    assert.equal(typeof component.value, "number");
    assert.equal(typeof component.contribution, "number");
  }
});

test("no components at all yields score 0", () => {
  const result = scoreComponents({ identifierEqualFraction: 0, canonicalNameEqual: false, aliasEqual: false, tokenEquivalent: false, nearNameSimilarity: 0, legalFormEqual: false });
  assert.equal(result.totalScore, 0);
  assert.deepEqual(result.components, []);
});
