// Identifier comparison (PHASE_003.md §6.1, §6.5). An identifier match is
// binary and exact — never fuzzy, never partial credit. A validated IČO
// is the only identifier this repo's data actually carries a slot for
// (see reports/intake/phase-03-matching-inventory.md); anything else in
// `identifiers`/`extracted_identifiers` is compared the same generic way.
import { normalizeIco } from "./normalize-identifier.mjs";

// Returns { status: "equal" | "conflict" | "not_comparable", key }
// for one identifier key shared between a candidate and an index entity.
// "conflict" means both sides have a value for this key and they differ
// — the strongest possible negative signal (§6.5), never silently
// ignored. "not_comparable" means at least one side has no value.
export function compareIdentifier(key, candidateValue, entityValue) {
  if (!candidateValue || !entityValue) return { status: "not_comparable", key };
  const normalize = key === "ico" ? (v) => normalizeIco(v).normalized : (v) => String(v).trim();
  const a = normalize(candidateValue);
  const b = normalize(entityValue);
  if (a.length === 0 || b.length === 0) return { status: "not_comparable", key };
  return { status: a === b ? "equal" : "conflict", key };
}

// Compares every identifier key present on either side. Returns
// { equalKeys, conflictingKeys } — both are needed: `matched_fields` /
// `conflicting_fields` in the §10 match output come directly from these.
export function compareIdentifierSets(candidateIdentifiers, entityIdentifiers) {
  const keys = new Set([...Object.keys(candidateIdentifiers ?? {}), ...Object.keys(entityIdentifiers ?? {})]);
  const equalKeys = [];
  const conflictingKeys = [];
  for (const key of [...keys].sort()) {
    const result = compareIdentifier(key, candidateIdentifiers?.[key], entityIdentifiers?.[key]);
    if (result.status === "equal") equalKeys.push(key);
    else if (result.status === "conflict") conflictingKeys.push(key);
  }
  return { equalKeys, conflictingKeys };
}
