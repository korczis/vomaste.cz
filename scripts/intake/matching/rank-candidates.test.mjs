import { test } from "node:test";
import assert from "node:assert/strict";
import { rankMatches } from "./rank-candidates.mjs";

function match(overrides) {
  return { entity_id: "x", match_type: "near_name", score: 0.5, confidence_class: "low", ...overrides };
}

test("higher confidence class ranks first regardless of score", () => {
  const ranked = rankMatches([match({ entity_id: "low", confidence_class: "low", score: 0.99 }), match({ entity_id: "high", confidence_class: "very_high", score: 0.1 })]);
  assert.equal(ranked[0].entity_id, "high");
});

test("within the same confidence class, higher score ranks first", () => {
  const ranked = rankMatches([match({ entity_id: "a", score: 0.3 }), match({ entity_id: "b", score: 0.8 })]);
  assert.equal(ranked[0].entity_id, "b");
});

test("ties on confidence and score break by match_type priority", () => {
  const ranked = rankMatches([
    match({ entity_id: "near", match_type: "near_name", score: 0.5, confidence_class: "low" }),
    match({ entity_id: "token", match_type: "token_equivalent", score: 0.5, confidence_class: "low" }),
  ]);
  assert.equal(ranked[0].entity_id, "token");
});

test("final tiebreak is entity_id ascending", () => {
  const ranked = rankMatches([match({ entity_id: "zebra" }), match({ entity_id: "alpha" })]);
  assert.equal(ranked[0].entity_id, "alpha");
});

test("ranking is a pure function — does not mutate the input array", () => {
  const input = [match({ entity_id: "b" }), match({ entity_id: "a" })];
  const copy = [...input];
  rankMatches(input);
  assert.deepEqual(input, copy);
});
