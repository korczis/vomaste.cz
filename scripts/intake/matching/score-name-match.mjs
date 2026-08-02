// Explainable scoring (PHASE_003.md §7, §8). Exactly one similarity
// metric (normalized Levenshtein) is used for near-name matching — not
// an "algorithmic buffet" (§8's own phrase). Every score is a sum of
// named, individually-inspectable components; nothing is ever a bare
// opaque number.
const MAX_COMPARED_LENGTH = 200; // §8.1: bounded input, no catastrophic complexity

// Classic O(n*m) DP Levenshtein, bounded by MAX_COMPARED_LENGTH on both
// inputs before this is ever called (see normalizedSimilarity) — safe
// for name-length strings, never invoked on unbounded text.
function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[rows - 1][cols - 1];
}

// Bounded 0-1: 1.0 = identical, 0.0 = completely dissimilar (distance >=
// max length). §8.2: short strings are NOT given a free pass — the
// normalization by length already penalizes short-name near-misses
// naturally (one edit on a 5-letter name moves the score much more than
// one edit on a 15-letter name).
export function normalizedSimilarity(a, b) {
  const boundedA = a.slice(0, MAX_COMPARED_LENGTH);
  const boundedB = b.slice(0, MAX_COMPARED_LENGTH);
  const maxLen = Math.max(boundedA.length, boundedB.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(boundedA, boundedB) / maxLen;
}

// §7.3: thresholds are unvalidated heuristics (no Phase 1 calibration
// data existed) — used only for candidate ranking, never automatic merge.
export const UNVALIDATED_HEURISTIC = Object.freeze({
  nearNameFloor: 0.72, // below this, a candidate is not even retrieved (§10.3 match floor)
  exactCanonicalNameWeight: 0.55,
  legalFormEqualWeight: 0.1,
  identifierEqualWeight: 0.35,
  aliasWeight: 0.5,
  tokenEquivalentWeight: 0.45,
  nearNameWeight: 0.4,
});

// Builds the §7 component list for one candidate/entity pair given
// pre-computed booleans/values — this module never re-derives identifier
// or name equality itself (that's compare-identifiers.mjs and the
// normalize-*-name modules), it only turns named facts into a scored,
// explainable breakdown.
export function scoreComponents({ identifierEqualFraction, canonicalNameEqual, aliasEqual, tokenEquivalent, nearNameSimilarity, legalFormEqual }) {
  const components = [];
  if (identifierEqualFraction > 0) {
    components.push({ rule: "identifier_equal", weight: UNVALIDATED_HEURISTIC.identifierEqualWeight, value: identifierEqualFraction, contribution: UNVALIDATED_HEURISTIC.identifierEqualWeight * identifierEqualFraction });
  }
  if (canonicalNameEqual) {
    components.push({ rule: "normalized_canonical_name_equal", weight: UNVALIDATED_HEURISTIC.exactCanonicalNameWeight, value: 1, contribution: UNVALIDATED_HEURISTIC.exactCanonicalNameWeight });
  }
  if (aliasEqual) {
    components.push({ rule: "normalized_alias_equal", weight: UNVALIDATED_HEURISTIC.aliasWeight, value: 1, contribution: UNVALIDATED_HEURISTIC.aliasWeight });
  }
  if (tokenEquivalent && !canonicalNameEqual) {
    components.push({ rule: "token_order_equivalent", weight: UNVALIDATED_HEURISTIC.tokenEquivalentWeight, value: 1, contribution: UNVALIDATED_HEURISTIC.tokenEquivalentWeight });
  }
  if (!canonicalNameEqual && !aliasEqual && !tokenEquivalent && nearNameSimilarity > 0) {
    components.push({ rule: "near_name_similarity", weight: UNVALIDATED_HEURISTIC.nearNameWeight, value: nearNameSimilarity, contribution: UNVALIDATED_HEURISTIC.nearNameWeight * nearNameSimilarity });
  }
  if (legalFormEqual === true) {
    components.push({ rule: "legal_form_equal", weight: UNVALIDATED_HEURISTIC.legalFormEqualWeight, value: 1, contribution: UNVALIDATED_HEURISTIC.legalFormEqualWeight });
  }
  const totalScore = Math.min(1, components.reduce((sum, c) => sum + c.contribution, 0));
  return { totalScore, components };
}
