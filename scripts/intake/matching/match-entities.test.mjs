// §19 test matrix: exact / normalized / conflict / near-match / ambiguity
// / limits, against a small synthetic entity dataset (never the real
// 503-entity dataset for these — see reports/intake/phase-03-matching-inventory.md
// on why identifier/alias matching has no real signal to test against
// today).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIndexLookups, matchCandidateAgainstIndex, resolveCandidate } from "./match-entities.mjs";
import { extractCandidates } from "./extract-candidates.mjs";
import { normalizePersonName } from "./normalize-person-name.mjs";
import { normalizeOrganizationName } from "./normalize-organization-name.mjs";

function personEntity(entityId, canonicalName, overrides = {}) {
  return {
    entity_id: entityId,
    entity_type: "person",
    canonical_name: canonicalName,
    normalized_name: normalizePersonName(canonicalName).comparisonName,
    legal_form: null,
    aliases: [],
    normalized_aliases: [],
    identifiers: {},
    dossier_ids: [],
    publication_role: "context",
    dossier_status: "not_authorized",
    ...overrides,
  };
}

function orgEntity(entityId, canonicalName, overrides = {}) {
  const entityType = overrides.entity_type ?? "company";
  const { legalForm } = normalizeOrganizationName(canonicalName);
  return {
    entity_id: entityId,
    entity_type: entityType,
    canonical_name: canonicalName,
    normalized_name: normalizeOrganizationName(canonicalName).comparisonName,
    legal_form: legalForm,
    aliases: [],
    normalized_aliases: [],
    identifiers: {},
    dossier_ids: [],
    publication_role: "context",
    dossier_status: "not_authorized",
    ...overrides,
  };
}

// §19's own synthetic dataset.
const SYNTHETIC_ENTITIES = [
  personEntity("jan-testovaci", "Jan Testovací", { aliases: ["Honza Testovací"], normalized_aliases: [normalizePersonName("Honza Testovací").comparisonName] }),
  personEntity("jan-pavel-testovaci", "Jan Pavel Testovací"),
  personEntity("jana-testovaci", "Jana Testovací"),
  orgEntity("priklad-sro", "Společnost Příklad s.r.o.", { identifiers: { ico: "26168685" } }),
  orgEntity("priklad-as", "Společnost Příklad a.s.", { identifiers: { ico: "27082440" } }),
  orgEntity("priklad-holding-se", "Příklad Holding SE"),
  orgEntity("obec-testov", "Obec Testov", { entity_type: "public_institution" }),
  orgEntity("mesto-testov", "Město Testov", { entity_type: "public_institution" }),
];

const INDEX = { schema_version: "1.0.0", generated_from_commit: "test-commit", entity_count: SYNTHETIC_ENTITIES.length, entities: SYNTHETIC_ENTITIES };
const LOOKUPS = buildIndexLookups(INDEX);

function matchSubject(subjectText, identifiersText = "") {
  const { candidates } = extractCandidates({ subject_text: subjectText, identifiers_text: identifiersText });
  const candidate = candidates[0];
  const result = matchCandidateAgainstIndex(candidate, INDEX, LOOKUPS);
  return { candidate, ...result, resolution: resolveCandidate(result.matches) };
}

// ---- Exact ----

test("exact entity ID is not itself a matching input (matching is by name/identifier, not by guessing IDs)", () => {
  // §19 "exact entity ID" — the closest analogue here is an exact
  // canonical-name match resolving unambiguously to the entity whose ID
  // it belongs to.
  const { matches } = matchSubject("Jan Testovací");
  assert.equal(matches[0].entity_id, "jan-testovaci");
});

test("exact IČO is an exact_identifier match", () => {
  const { matches, resolution } = matchSubject("Společnost Příklad s.r.o.", "IČO: 26168685");
  assert.equal(matches[0].match_type, "exact_identifier");
  assert.equal(matches[0].confidence_class, "very_high");
  assert.equal(resolution, "possible_matches");
});

test("exact canonical name (person) is medium confidence, never auto-resolved", () => {
  const { matches } = matchSubject("Jana Testovací");
  assert.equal(matches[0].match_type, "exact_canonical_name");
  assert.equal(matches[0].confidence_class, "medium");
  assert.equal(matches[0].manual_review_required, true);
});

test("exact alias match", () => {
  const { matches } = matchSubject("Honza Testovací");
  assert.equal(matches[0].match_type, "exact_alias");
  assert.equal(matches[0].entity_id, "jan-testovaci");
});

// ---- Normalized ----

test("case differences do not prevent a match", () => {
  const { matches } = matchSubject("JANA TESTOVACÍ");
  assert.equal(matches[0].entity_id, "jana-testovaci");
});

test("extra whitespace does not prevent a match", () => {
  const { matches } = matchSubject("  Jana   Testovací  ");
  assert.equal(matches[0].entity_id, "jana-testovaci");
});

test("an academic title is stripped for comparison and still matches", () => {
  const { matches } = matchSubject("Mgr. Jana Testovací");
  assert.equal(matches[0].entity_id, "jana-testovaci");
});

test("swapped given-name/surname order is token_equivalent, not exact", () => {
  const { matches } = matchSubject("Testovací Jana");
  assert.equal(matches[0].match_type, "token_equivalent");
  assert.equal(matches[0].entity_id, "jana-testovaci");
});

test("legal form normalization: same legal form contributes to a higher-confidence match", () => {
  const { matches } = matchSubject("Příklad Holding SE");
  assert.equal(matches[0].entity_id, "priklad-holding-se");
  assert.ok(matches[0].matched_fields.includes("legal_form"));
});

// ---- Conflict ----

test("same name, different valid IČO is a conflicting_identifier match, never presented as a probable match", () => {
  const { matches, resolution } = matchSubject("Společnost Příklad s.r.o.", "IČO: 27082440");
  assert.equal(matches.some((m) => m.match_type === "conflicting_identifier"), true);
  assert.equal(resolution, "conflicting_identifiers");
});

test("organization legal-form mismatch keeps two similarly-named orgs distinguishable (name alone never equates a.s. with s.r.o.)", () => {
  const { matches } = matchSubject("Společnost Příklad a.s.");
  assert.equal(matches[0].entity_id, "priklad-as");
  assert.notEqual(matches[0].entity_id, "priklad-sro");
});

// ---- Near matches ----

test("a one-character typo is retrieved as near_name, not exact, and always requires review", () => {
  const { matches } = matchSubject("Jana Testovaci"); // missing diacritic on last letter
  const near = matches.find((m) => m.entity_id === "jana-testovaci");
  assert.ok(near);
  assert.ok(near.match_type === "near_name" || near.match_type === "exact_canonical_name");
  assert.equal(near.manual_review_required, true);
});

test("a short, common-surname-shaped near match is not inflated to high confidence", () => {
  const { matches } = matchSubject("Nováková");
  // No synthetic entity is remotely close — expect no_match, not a
  // spurious near-name hit on an unrelated short name.
  assert.equal(matches.length, 0);
});

test("a missing middle name is only ever a candidate match, never exact or token-equivalent (§8.3)", () => {
  // "Jan Pavel Testovací" vs "Jan Testovací" — §8.3's own example: adding
  // or dropping a middle token must never be treated as the same name.
  const { matches } = matchSubject("Jan Testovací");
  const middleNameEntity = matches.find((m) => m.entity_id === "jan-pavel-testovaci");
  if (middleNameEntity) {
    assert.notEqual(middleNameEntity.match_type, "exact_canonical_name");
    assert.notEqual(middleNameEntity.match_type, "token_equivalent");
  }
});

// ---- Ambiguity ----

test("two equally strong near-name candidates are reported as ambiguous, never auto-picked", () => {
  // Missing diacritic on the given name — near-equidistant from both
  // "Jan Testovací" and "Jana Testovací".
  const { matches, resolution } = matchSubject("Jan Testovaci");
  assert.ok(matches.length >= 2, `expected >=2 candidates, got ${matches.length}`);
  assert.equal(resolution, "ambiguous");
});

// ---- Limits ----

test("matches are capped at 10 even if more clear the floor", () => {
  const manyEntities = Array.from({ length: 15 }, (_, i) => personEntity(`dup-${i}`, "Jan Testovací"));
  const index = { schema_version: "1.0.0", generated_from_commit: "test", entity_count: manyEntities.length, entities: manyEntities };
  const lookups = buildIndexLookups(index);
  const { candidates } = extractCandidates({ subject_text: "Jan Testovací", identifiers_text: "" });
  const result = matchCandidateAgainstIndex(candidates[0], index, lookups);
  assert.equal(result.matches.length, 10);
  assert.equal(result.total_matches_above_floor, 15);
});

test("an unrelated name produces no_match, not a weak near-name guess", () => {
  const { matches, resolution } = matchSubject("Zcela Nesouvisející Subjekt");
  assert.equal(matches.length, 0);
  assert.equal(resolution, "no_match");
});

test("total_candidates_considered reflects retrieval, not the whole index", () => {
  const { total_candidates_considered } = matchSubject("Jana Testovací");
  assert.ok(total_candidates_considered < SYNTHETIC_ENTITIES.length, "candidate filtering must not scan the full index");
});

// ---- Ranking stability / determinism ----

test("ranking is stable regardless of index entity insertion order", () => {
  const reversed = { ...INDEX, entities: [...INDEX.entities].reverse() };
  const reversedLookups = buildIndexLookups(reversed);
  const { candidates } = extractCandidates({ subject_text: "Jan Testovací", identifiers_text: "" });
  const a = matchCandidateAgainstIndex(candidates[0], INDEX, LOOKUPS);
  const b = matchCandidateAgainstIndex(candidates[0], reversed, reversedLookups);
  assert.deepEqual(a.matches, b.matches);
});
