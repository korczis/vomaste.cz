import { test } from "node:test";
import assert from "node:assert/strict";
import { extractCandidates } from "./extract-candidates.mjs";

test("extracts exactly one candidate from subject_text", () => {
  const { candidates } = extractCandidates({ subject_text: "Jan Testovací", identifiers_text: "" });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].raw_label, "Jan Testovací");
  assert.equal(candidates[0].source_field, "subject_text");
});

test("returns no candidates for an empty subject", () => {
  const { candidates } = extractCandidates({ subject_text: "   ", identifiers_text: "" });
  assert.deepEqual(candidates, []);
});

test("a valid IČO in identifiers_text sets candidate_type to organization", () => {
  const { candidates } = extractCandidates({ subject_text: "Testovací s.r.o.", identifiers_text: "IČO: 26168685" });
  assert.equal(candidates[0].candidate_type, "organization");
  assert.deepEqual(candidates[0].extracted_identifiers, { ico: "26168685" });
});

test("no identifier text means candidate_type stays unknown — a name alone never implies person or organization", () => {
  const { candidates } = extractCandidates({ subject_text: "Jan Testovací", identifiers_text: "" });
  assert.equal(candidates[0].candidate_type, "unknown");
  assert.deepEqual(candidates[0].extracted_identifiers, {});
});

test("an invalid-checksum 8-digit number is NOT treated as an identifier, and is recorded as an observation", () => {
  const { candidates, observations } = extractCandidates({ subject_text: "Testovací s.r.o.", identifiers_text: "IČO: 12345678" });
  assert.deepEqual(candidates[0].extracted_identifiers, {});
  assert.equal(candidates[0].candidate_type, "unknown");
  assert.ok(observations.includes("ico_like_pattern_failed_checksum"));
});

test("never extracts anything from description_text (no NER, §9.1)", () => {
  const { candidates } = extractCandidates({
    subject_text: "",
    description_text: "Jan Novák a Jana Nováková se potkali s Petrem Svobodou.",
    identifiers_text: "",
  });
  assert.deepEqual(candidates, []);
});

test("provides both person and organization normalization for the same candidate", () => {
  const { candidates } = extractCandidates({ subject_text: "Testovací s.r.o.", identifiers_text: "" });
  assert.equal(typeof candidates[0].normalized.person.comparisonName, "string");
  assert.equal(typeof candidates[0].normalized.organization.comparisonName, "string");
  assert.equal(candidates[0].normalized.organization.legalForm, "s.r.o.");
});
