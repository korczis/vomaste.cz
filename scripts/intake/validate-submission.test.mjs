import { test } from "node:test";
import assert from "node:assert/strict";
import { validateParsedSubmission } from "./validate-submission.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";
import { LIMITS } from "./constants.mjs";

function validParsed(overrides = {}) {
  return {
    submission_type: "new_dossier",
    subject_text: "Jan Testovací",
    description_text: "Popis.",
    public_interest_text: "Veřejný zájem.",
    identifiers_text: "",
    submitted_source_urls_raw: "https://example.testov.cz/a",
    known_unknowns_text: "",
    existing_references_text: "",
    acknowledgements: { public_issue_understood: true, no_confidential_material: true, not_automatic_publication: true },
    ...overrides,
  };
}

test("accepts a fully valid parsed submission", () => {
  assert.doesNotThrow(() => validateParsedSubmission(validParsed()));
});

test("rejects an unresolved/unsupported submission type", () => {
  assert.throws(
    () => validateParsedSubmission(validParsed({ submission_type: null, submission_type_raw: "Jiné" })),
    (err) => err instanceof IntakeError && err.code === ERROR_CODES.SUBMISSION_VALIDATION_FAILED && err.details.errors.some((e) => e.code === ERROR_CODES.UNSUPPORTED_SUBMISSION_TYPE)
  );
});

test("rejects text exceeding the subject_text limit", () => {
  assert.throws(
    () => validateParsedSubmission(validParsed({ subject_text: "S".repeat(LIMITS.subjectTextMaxChars + 1) })),
    (err) => err.details.errors.some((e) => e.code === ERROR_CODES.TEXT_TOO_LONG && e.field === "subject_text")
  );
});

test("accepts text exactly at the limit", () => {
  assert.doesNotThrow(() => validateParsedSubmission(validParsed({ subject_text: "S".repeat(LIMITS.subjectTextMaxChars) })));
});

test("rejects when a required acknowledgement is false", () => {
  assert.throws(
    () => validateParsedSubmission(validParsed({ acknowledgements: { public_issue_understood: false, no_confidential_material: true, not_automatic_publication: true } })),
    (err) => err.details.errors.some((e) => e.code === ERROR_CODES.MISSING_ACKNOWLEDGEMENT && e.field === "acknowledgements.public_issue_understood")
  );
});

test("rejects when an acknowledgement is missing entirely (never treated as implicit yes)", () => {
  assert.throws(
    () => validateParsedSubmission(validParsed({ acknowledgements: { no_confidential_material: true, not_automatic_publication: true } })),
    (err) => err.details.errors.some((e) => e.field === "acknowledgements.public_issue_understood")
  );
});

test("rejects more than the maximum number of source URL lines", () => {
  const urls = Array.from({ length: LIMITS.maxSourceUrls + 1 }, (_, i) => `https://example.testov.cz/${i}`).join("\n");
  assert.throws(
    () => validateParsedSubmission(validParsed({ submitted_source_urls_raw: urls })),
    (err) => err.details.errors.some((e) => e.code === ERROR_CODES.TOO_MANY_URLS)
  );
});

test("rejects a source URL line exceeding the per-line length limit", () => {
  const longLine = `https://example.testov.cz/${"a".repeat(LIMITS.sourceUrlLineMaxChars)}`;
  assert.throws(
    () => validateParsedSubmission(validParsed({ submitted_source_urls_raw: longLine })),
    (err) => err.details.errors.some((e) => e.code === ERROR_CODES.URL_LINE_TOO_LONG)
  );
});

test("reports every validation problem at once, not just the first", () => {
  try {
    validateParsedSubmission(
      validParsed({
        submission_type: null,
        subject_text: "S".repeat(LIMITS.subjectTextMaxChars + 1),
        acknowledgements: {},
      })
    );
    assert.fail("expected to throw");
  } catch (err) {
    assert.ok(err.details.errors.length >= 5, `expected multiple errors, got ${err.details.errors.length}`);
  }
});
