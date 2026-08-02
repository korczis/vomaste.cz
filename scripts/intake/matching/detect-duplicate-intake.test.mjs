import { test } from "node:test";
import assert from "node:assert/strict";
import { detectDuplicateIntake } from "./detect-duplicate-intake.mjs";

function manifest(overrides = {}) {
  return {
    id: "INTAKE-GH-korczis-vomaste-cz-000001",
    source_event: { repository: "korczis/vomaste.cz", issue_number: 1 },
    normalization: { subject_text_normalized: "Jan Testovací", normalized_source_urls: [{ normalized: "https://a.testov.cz/x", raw: "", syntax_observations: [] }] },
    submission: { description_text: "Popis podnětu o panu Testovacím a jeho jednání v obci Testov." },
    proposed_authorization_scope: { subject_candidates: [{ extracted_identifiers: {} }] },
    ...overrides,
  };
}

test("no prior manifests means no_duplicate", () => {
  const result = detectDuplicateIntake(manifest(), []);
  assert.equal(result.duplicate_status, "no_duplicate");
  assert.equal(result.manual_review_required, false);
});

test("same repository + issue number is same_issue", () => {
  const prior = manifest({ id: "INTAKE-GH-korczis-vomaste-cz-000001-old" });
  const result = detectDuplicateIntake(manifest(), [prior]);
  assert.equal(result.duplicate_status, "possible_duplicate");
  assert.equal(result.candidates[0].duplicate_type, "same_issue");
});

test("a manifest never matches itself", () => {
  const self = manifest();
  const result = detectDuplicateIntake(self, [self]);
  assert.equal(result.duplicate_status, "no_duplicate");
});

test("shared exact identifier is exact_subject_identifier", () => {
  const current = manifest({
    source_event: { repository: "korczis/vomaste.cz", issue_number: 2 },
    proposed_authorization_scope: { subject_candidates: [{ extracted_identifiers: { ico: "26168685" } }] },
  });
  const prior = manifest({
    id: "INTAKE-GH-korczis-vomaste-cz-000003",
    source_event: { repository: "korczis/vomaste.cz", issue_number: 3 },
    proposed_authorization_scope: { subject_candidates: [{ extracted_identifiers: { ico: "26168685" } }] },
  });
  const result = detectDuplicateIntake(current, [prior]);
  assert.equal(result.candidates[0].duplicate_type, "exact_subject_identifier");
});

test("same normalized subject and overlapping source URLs is same_subject_and_sources", () => {
  const current = manifest({ source_event: { repository: "korczis/vomaste.cz", issue_number: 4 } });
  const prior = manifest({ id: "INTAKE-GH-korczis-vomaste-cz-000005", source_event: { repository: "korczis/vomaste.cz", issue_number: 5 } });
  const result = detectDuplicateIntake(current, [prior]);
  assert.equal(result.candidates[0].duplicate_type, "same_subject_and_sources");
});

test("unrelated manifests produce no candidate at all", () => {
  const current = manifest({ source_event: { repository: "korczis/vomaste.cz", issue_number: 6 } });
  const prior = manifest({
    id: "INTAKE-GH-korczis-vomaste-cz-000007",
    source_event: { repository: "korczis/vomaste.cz", issue_number: 7 },
    normalization: { subject_text_normalized: "Zcela Jiný Subjekt", normalized_source_urls: [{ normalized: "https://unrelated.example/x", raw: "", syntax_observations: [] }] },
    submission: { description_text: "Naprosto odlišný text o něčem jiném a nesouvisejícím tématu vůbec." },
  });
  const result = detectDuplicateIntake(current, [prior]);
  assert.equal(result.duplicate_status, "no_duplicate");
});

test("never merges, closes, or picks a canonical submission — output has no such field", () => {
  const prior = manifest({ id: "INTAKE-GH-korczis-vomaste-cz-000001-old" });
  const result = detectDuplicateIntake(manifest(), [prior]);
  assert.equal("merged_into" in result, false);
  assert.equal("canonical_id" in result, false);
  assert.equal("closed" in result, false);
});

test("result ordering is deterministic regardless of prior-manifest array order", () => {
  const priorA = manifest({ id: "INTAKE-GH-korczis-vomaste-cz-000008", source_event: { repository: "korczis/vomaste.cz", issue_number: 8 } });
  const priorB = manifest({ id: "INTAKE-GH-korczis-vomaste-cz-000009", source_event: { repository: "korczis/vomaste.cz", issue_number: 9 } });
  const current = manifest({ source_event: { repository: "korczis/vomaste.cz", issue_number: 10 } });
  const a = detectDuplicateIntake(current, [priorA, priorB]);
  const b = detectDuplicateIntake(current, [priorB, priorA]);
  assert.deepEqual(
    a.candidates.map((c) => c.intake_id).sort(),
    b.candidates.map((c) => c.intake_id).sort()
  );
});
