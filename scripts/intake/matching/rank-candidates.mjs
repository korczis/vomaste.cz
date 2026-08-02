// Stable candidate ranking (PHASE_003.md §10.1). The same input always
// produces the same order — sort keys are fully specified so there is no
// residual dependency on array insertion order or filesystem iteration
// order.
const CONFIDENCE_ORDER = ["very_high", "high", "medium", "low", "conflict"];
const MATCH_TYPE_PRIORITY = ["exact_identifier", "exact_alias", "exact_canonical_name", "token_equivalent", "near_name", "conflicting_identifier"];

export function rankMatches(matches) {
  return [...matches].sort((a, b) => {
    const confidenceDiff = CONFIDENCE_ORDER.indexOf(a.confidence_class) - CONFIDENCE_ORDER.indexOf(b.confidence_class);
    if (confidenceDiff !== 0) return confidenceDiff;
    if (a.score !== b.score) return b.score - a.score; // descending
    const typeDiff = MATCH_TYPE_PRIORITY.indexOf(a.match_type) - MATCH_TYPE_PRIORITY.indexOf(b.match_type);
    if (typeDiff !== 0) return typeDiff;
    return a.entity_id < b.entity_id ? -1 : a.entity_id > b.entity_id ? 1 : 0;
  });
}
