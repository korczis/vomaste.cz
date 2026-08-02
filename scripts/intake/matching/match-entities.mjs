// Core matcher (PHASE_003.md §6, §10, §22.1). Two phases per candidate:
// (1) cheap candidate RETRIEVAL — identifier map, exact-name/alias map,
// and a surname/first-token bucket, never a full scan of the index for
// near-name similarity; (2) explainable EVALUATION of each retrieved
// entity, producing at most one match_type per entity by strict
// precedence (identifier conflict beats everything, then exact
// identifier, then alias, then exact name, then token order, then near
// name).
import { compareIdentifierSets } from "./compare-identifiers.mjs";
import { normalizedSimilarity, scoreComponents, UNVALIDATED_HEURISTIC } from "./score-name-match.mjs";
import { rankMatches } from "./rank-candidates.mjs";
import { normalizeIco } from "./normalize-identifier.mjs";

const ORG_LIKE_TYPES = ["company", "organization", "public_institution", "political_party"];
const MAX_MATCHES_RETURNED = 10;

// Diacritic-folded ONLY for the retrieval bucket key — comparison and
// scoring stay diacritic-preserving throughout (see normalize-person-name.mjs's
// header comment). Without this fold, "Jan Testovaci" (missing diacritics
// — a common real-world submission variant) would land in a different
// bucket than "Jan Testovací" and never even be retrieved for near-name
// scoring, silently missing an obvious near match.
// Built from explicit \uXXXX escapes (not a literal combining-mark
// character typed into source) for the same auditability reason as
// tokenize-name.mjs's invisible-character handling.
const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
function foldForBucketKey(token) {
  return token.normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

function bucketTokenFor(entityType, normalizedName) {
  const tokens = normalizedName.split(" ").filter(Boolean);
  if (tokens.length === 0) return null;
  const token = entityType === "person" ? tokens[tokens.length - 1] : tokens[0];
  return foldForBucketKey(token);
}

// Derived, read-only lookup structures over one matching index — built
// once per process run (or once per test), reused across every
// candidate in a submission (§22: index build cost is paid once, not
// per-candidate).
export function buildIndexLookups(index) {
  const byIdentifier = new Map();
  const byExactName = new Map();
  const byBucket = new Map();
  for (const entity of index.entities) {
    for (const [key, value] of Object.entries(entity.identifiers ?? {})) {
      const normValue = key === "ico" ? normalizeIco(value).normalized : String(value).trim();
      if (!normValue) continue;
      const idKey = `${key}:${normValue}`;
      if (!byIdentifier.has(idKey)) byIdentifier.set(idKey, []);
      byIdentifier.get(idKey).push(entity);
    }
    const nameKey = `${entity.entity_type}:${entity.normalized_name}`;
    if (!byExactName.has(nameKey)) byExactName.set(nameKey, []);
    byExactName.get(nameKey).push(entity);
    for (const alias of entity.normalized_aliases) {
      const aliasKey = `${entity.entity_type}:${alias}`;
      if (!byExactName.has(aliasKey)) byExactName.set(aliasKey, []);
      byExactName.get(aliasKey).push(entity);
    }
    const bucketToken = bucketTokenFor(entity.entity_type, entity.normalized_name);
    if (bucketToken) {
      const bucketKey = `${entity.entity_type}:${bucketToken}`;
      if (!byBucket.has(bucketKey)) byBucket.set(bucketKey, []);
      byBucket.get(bucketKey).push(entity);
    }
  }
  return { byIdentifier, byExactName, byBucket };
}

function entityTypesFor(candidateType) {
  if (candidateType === "person") return ["person"];
  if (candidateType === "organization") return ORG_LIKE_TYPES;
  return ["person", ...ORG_LIKE_TYPES]; // "unknown" — try both interpretations, conservatively
}

function comparisonFor(candidate, entityType) {
  return entityType === "person" ? candidate.normalized.person : candidate.normalized.organization;
}

// One retrieval pass: every entity that COULD be relevant to this
// candidate, deduplicated by entity_id — never the full index.
function retrieveCandidateEntities(candidate, lookups) {
  const byId = new Map();
  const add = (entity) => byId.set(entity.entity_id, entity);

  for (const [key, rawValue] of Object.entries(candidate.extracted_identifiers ?? {})) {
    const normValue = key === "ico" ? normalizeIco(rawValue).normalized : String(rawValue).trim();
    if (!normValue) continue;
    for (const entity of lookups.byIdentifier.get(`${key}:${normValue}`) ?? []) add(entity);
  }

  for (const entityType of entityTypesFor(candidate.candidate_type)) {
    const comparison = comparisonFor(candidate, entityType);
    for (const entity of lookups.byExactName.get(`${entityType}:${comparison.comparisonName}`) ?? []) add(entity);
    if (entityType === "person" && comparison.tokenOrderVariant !== comparison.comparisonName) {
      for (const entity of lookups.byExactName.get(`person:${comparison.tokenOrderVariant}`) ?? []) add(entity);
    }
    const bucketToken = bucketTokenFor(entityType, comparison.comparisonName);
    if (bucketToken) {
      for (const entity of lookups.byBucket.get(`${entityType}:${bucketToken}`) ?? []) add(entity);
    }
  }
  return [...byId.values()];
}

// Evaluates one candidate/entity pair holistically and returns a single
// match object, or null if nothing clears the near-name floor (NO_MATCH
// — not returned at all, never surfaced as a weak match, §10.3).
function evaluatePair(candidate, entity) {
  const comparison = comparisonFor(candidate, entity.entity_type);
  const idCmp = compareIdentifierSets(candidate.extracted_identifiers, entity.identifiers);
  const nameEqual = comparison.comparisonName === entity.normalized_name;
  const aliasEqual = entity.normalized_aliases.includes(comparison.comparisonName);
  const tokenEquivalent = entity.entity_type === "person" && !nameEqual && comparison.tokenOrderVariant === entity.normalized_name;
  const legalFormEqual = entity.entity_type !== "person" && comparison.legalForm != null && comparison.legalForm === entity.legal_form;
  const nearSimilarity = nameEqual || aliasEqual || tokenEquivalent ? 0 : normalizedSimilarity(comparison.comparisonName, entity.normalized_name);

  const matchedFields = [
    ...idCmp.equalKeys,
    ...(nameEqual ? ["canonical_name"] : []),
    ...(aliasEqual ? ["alias"] : []),
    ...(tokenEquivalent ? ["canonical_name_token_order"] : []),
    ...(legalFormEqual ? ["legal_form"] : []),
  ];

  let matchType;
  let confidenceClass;
  const reasons = [];

  if (idCmp.conflictingKeys.length > 0 && (nameEqual || aliasEqual || tokenEquivalent)) {
    matchType = "conflicting_identifier";
    confidenceClass = "conflict";
    reasons.push(`name_matches_but_identifier_conflicts:${idCmp.conflictingKeys.join(",")}`);
  } else if (idCmp.equalKeys.length > 0 && idCmp.conflictingKeys.length === 0) {
    matchType = "exact_identifier";
    confidenceClass = "very_high";
    reasons.push(`valid_identifier_equal:${idCmp.equalKeys.join(",")}`);
  } else if (aliasEqual) {
    matchType = "exact_alias";
    confidenceClass = "high";
    reasons.push("normalized_alias_equal");
  } else if (nameEqual) {
    matchType = "exact_canonical_name";
    confidenceClass = entity.entity_type !== "person" && legalFormEqual ? "high" : "medium";
    reasons.push("normalized_canonical_name_equal");
  } else if (tokenEquivalent) {
    matchType = "token_equivalent";
    confidenceClass = "medium";
    reasons.push("token_order_equivalent_name");
  } else if (nearSimilarity >= UNVALIDATED_HEURISTIC.nearNameFloor) {
    matchType = "near_name";
    confidenceClass = "low";
    reasons.push(`near_name_similarity_above_floor:${nearSimilarity.toFixed(3)}`);
  } else {
    return null; // NO_MATCH for this pair — not returned
  }

  // Score components are scoped to the CHOSEN match_type, not to every
  // signal that happened to be true — e.g. an exact_identifier match
  // never adds a near_name_similarity component just because the names
  // also happen to differ slightly (that would misleadingly conflate
  // "certain" evidence with "fuzzy" evidence in one number). Corroborating
  // signals (name equality alongside an identifier match, legal form
  // alongside a name match) DO still contribute — only the never-relevant
  // combination (near-name similarity when a stronger signal already won)
  // is excluded.
  const scored =
    matchType === "conflicting_identifier"
      ? { totalScore: 0, components: [] }
      : scoreComponents({
          identifierEqualFraction: matchType === "exact_identifier" ? 1 : 0,
          canonicalNameEqual: matchType === "exact_identifier" || matchType === "exact_canonical_name" ? nameEqual : false,
          aliasEqual: matchType === "exact_identifier" || matchType === "exact_alias" ? aliasEqual : false,
          tokenEquivalent: matchType === "token_equivalent",
          nearNameSimilarity: matchType === "near_name" ? nearSimilarity : 0,
          legalFormEqual,
        });

  return {
    entity_id: entity.entity_id,
    entity_type: entity.entity_type,
    match_type: matchType,
    score: Math.round(scored.totalScore * 1000) / 1000,
    score_components: scored.components,
    confidence_class: confidenceClass,
    matched_fields: matchedFields,
    conflicting_fields: idCmp.conflictingKeys,
    reasons,
    // §6.1: even an exact identifier match still requires human review in
    // the intake flow — there is no code path in this module that ever
    // sets this false.
    manual_review_required: true,
  };
}

// Returns { matches, total_candidates_considered, total_matches_above_floor }
// for one extracted candidate against one matching index. `matches` is
// already ranked and capped at MAX_MATCHES_RETURNED (§10.2).
export function matchCandidateAgainstIndex(candidate, index, lookups) {
  const retrieved = retrieveCandidateEntities(candidate, lookups);
  const evaluated = retrieved.map((entity) => evaluatePair(candidate, entity)).filter(Boolean);
  const ranked = rankMatches(evaluated);
  return {
    matches: ranked.slice(0, MAX_MATCHES_RETURNED),
    total_candidates_considered: retrieved.length,
    total_matches_above_floor: ranked.length,
  };
}

// §1.3 fail-closed resolution: never auto-pick a winner. Ambiguous when
// two or more top-ranked matches are separated by less than a small,
// documented margin at the SAME confidence class (§1.3: "nikdy nevybírej
// kandidáta jen proto, že má nejvyšší skóre o několik setin").
const AMBIGUITY_SCORE_MARGIN = 0.03;

export function resolveCandidate(matches) {
  if (matches.length === 0) return "no_match";
  if (matches.some((m) => m.match_type === "conflicting_identifier")) return "conflicting_identifiers";
  const [first, second] = matches;
  if (second && first.confidence_class === second.confidence_class && Math.abs(first.score - second.score) < AMBIGUITY_SCORE_MARGIN) {
    return "ambiguous";
  }
  return "possible_matches";
}
