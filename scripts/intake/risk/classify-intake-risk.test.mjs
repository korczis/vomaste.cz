import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyIntakeRisk } from "./classify-intake-risk.mjs";

function submission(overrides = {}) {
  return {
    subject_text: "Jan Testovací",
    description_text: "Běžný popis bez rizikových prvků.",
    public_interest_text: "Veřejný zájem existuje.",
    identifiers_text: "",
    known_unknowns_text: "",
    existing_references_text: "",
    ...overrides,
  };
}

const NO_MATCHING = { candidate_subjects: [], normalizedSourceUrlCount: 1 };
const NO_DUPLICATE = { duplicate_status: "no_duplicate", candidates: [] };

test("a clean submission with a source URL and public interest text yields no flags and triage", () => {
  const result = classifyIntakeRisk({ submission: submission(), matchingResult: NO_MATCHING, duplicateResult: NO_DUPLICATE });
  assert.deepEqual(result.flags, []);
  assert.equal(result.workflow_decision.intake_status, "triage");
  assert.equal(result.workflow_decision.winning_effect, null);
});

test("missing public interest text is flagged and drives needs_information", () => {
  const result = classifyIntakeRisk({ submission: submission({ public_interest_text: "" }), matchingResult: NO_MATCHING, duplicateResult: NO_DUPLICATE });
  assert.ok(result.flags.some((f) => f.code === "missing_public_interest_basis"));
  assert.equal(result.workflow_decision.intake_status, "needs_information");
});

test("missing source URLs is flagged and drives needs_information", () => {
  const result = classifyIntakeRisk({ submission: submission(), matchingResult: { candidate_subjects: [], normalizedSourceUrlCount: 0 }, duplicateResult: NO_DUPLICATE });
  assert.ok(result.flags.some((f) => f.code === "missing_source_urls"));
  assert.equal(result.workflow_decision.intake_status, "needs_information");
});

test("a possible_duplicate result drives intake_status possible_duplicate when nothing more severe is present", () => {
  const result = classifyIntakeRisk({
    submission: submission(),
    matchingResult: NO_MATCHING,
    duplicateResult: { duplicate_status: "possible_duplicate", candidates: [{ intake_id: "x", duplicate_type: "same_issue", matched_signals: [] }] },
  });
  assert.equal(result.workflow_decision.intake_status, "possible_duplicate");
});

test("security_review_required (from an email address) outranks a possible_duplicate signal (§14.1 precedence)", () => {
  const result = classifyIntakeRisk({
    submission: submission({ description_text: "Kontakt: jan@example.cz" }),
    matchingResult: NO_MATCHING,
    duplicateResult: { duplicate_status: "possible_duplicate", candidates: [{ intake_id: "x", duplicate_type: "same_issue", matched_signals: [] }] },
  });
  assert.equal(result.workflow_decision.intake_status, "security_review_required");
});

test("security_review_required outranks needs_information", () => {
  const result = classifyIntakeRisk({
    submission: submission({ public_interest_text: "", description_text: "Kontakt: jan@example.cz" }),
    matchingResult: NO_MATCHING,
    duplicateResult: NO_DUPLICATE,
  });
  assert.equal(result.workflow_decision.intake_status, "security_review_required");
});

test("a manual_security_review_required roll-up flag is added whenever any security_review_required flag exists", () => {
  const result = classifyIntakeRisk({ submission: submission({ description_text: "Kontakt: jan@example.cz" }), matchingResult: NO_MATCHING, duplicateResult: NO_DUPLICATE });
  assert.ok(result.flags.some((f) => f.code === "manual_security_review_required"));
});

test("no roll-up flag when nothing needs security review", () => {
  const result = classifyIntakeRisk({ submission: submission(), matchingResult: NO_MATCHING, duplicateResult: NO_DUPLICATE });
  assert.ok(!result.flags.some((f) => f.code === "manual_security_review_required"));
});

test("possible_existing_subject flag derives from an ambiguous/possible-matches matching resolution", () => {
  const matchingResult = {
    candidate_subjects: [{ resolution_status: "possible_matches", input: { raw_label: "Jan Testovací" }, matches: [{ entity_id: "x" }] }],
    normalizedSourceUrlCount: 1,
  };
  const result = classifyIntakeRisk({ submission: submission(), matchingResult, duplicateResult: NO_DUPLICATE });
  assert.ok(result.flags.some((f) => f.code === "possible_existing_subject"));
});

test("conflicting_entity_identifiers flag derives from a conflicting_identifiers matching resolution", () => {
  const matchingResult = {
    candidate_subjects: [{ resolution_status: "conflicting_identifiers", input: { raw_label: "Jan Testovací" }, matches: [{ entity_id: "x" }] }],
    normalizedSourceUrlCount: 1,
  };
  const result = classifyIntakeRisk({ submission: submission(), matchingResult, duplicateResult: NO_DUPLICATE });
  assert.ok(result.flags.some((f) => f.code === "conflicting_entity_identifiers"));
});

test("flag order is deterministic for identical input", () => {
  const a = classifyIntakeRisk({ submission: submission({ description_text: "jan@example.cz +420 777 123 456" }), matchingResult: NO_MATCHING, duplicateResult: NO_DUPLICATE });
  const b = classifyIntakeRisk({ submission: submission({ description_text: "jan@example.cz +420 777 123 456" }), matchingResult: NO_MATCHING, duplicateResult: NO_DUPLICATE });
  assert.deepEqual(a.flags.map((f) => f.code), b.flags.map((f) => f.code));
});

test("no flag ever declares the submission true, false, or guilty (§1.2)", () => {
  const result = classifyIntakeRisk({
    submission: submission({ description_text: "Šlo o podvod. Byl zde anonymní svědek. Mám interní dokument." }),
    matchingResult: NO_MATCHING,
    duplicateResult: NO_DUPLICATE,
  });
  for (const flag of result.flags) {
    assert.doesNotMatch(flag.explanation.toLowerCase(), /je pravd|je vinen|lže|nepravdivé podání/);
  }
});
