// Submission validation (PHASE_002.md §11, §12, §13). Runs after parsing,
// before any normalization or manifest work — a submission that fails here
// never reaches manifest construction at all (§1.4 fail-closed).
//
// Deviation from Phase 1, recorded per §3/§22.3: the implementation plan
// left the missing-acknowledgement outcome ("explicitly invalid intake
// artifact" vs. hard failure) as a Phase 2 decision point without a
// concrete answer in the ADR. This module chooses the hard-failure branch
// §12 itself offers as the safe default — a missing acknowledgement means
// no manifest is created at all, not a manifest flagged invalid. See
// docs/intake/local-processor.md and reports/intake/phase-02-implementation-report.md.
import { LIMITS, SUBMISSION_TYPES, REQUIRED_ACKNOWLEDGEMENT_KEYS } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";

function checkTextLimit(errors, fieldName, text, maxChars) {
  if (typeof text === "string" && text.length > maxChars) {
    errors.push({ code: ERROR_CODES.TEXT_TOO_LONG, field: fieldName, message: `${fieldName} exceeds ${maxChars} characters` });
  }
}

// Throws a single IntakeError(SUBMISSION_VALIDATION_FAILED-shaped code)
// listing every problem found (not just the first), so a caller building
// a report can show the operator everything at once. Returns nothing on
// success — a thrown error is the only failure signal.
export function validateParsedSubmission(parsed) {
  const errors = [];

  if (!SUBMISSION_TYPES.includes(parsed.submission_type)) {
    errors.push({
      code: ERROR_CODES.UNSUPPORTED_SUBMISSION_TYPE,
      field: "submission_type",
      message: `unrecognized submission type: ${JSON.stringify(parsed.submission_type_raw ?? null)}`,
    });
  }

  checkTextLimit(errors, "subject_text", parsed.subject_text, LIMITS.subjectTextMaxChars);
  checkTextLimit(errors, "description_text", parsed.description_text, LIMITS.descriptionTextMaxChars);
  checkTextLimit(errors, "public_interest_text", parsed.public_interest_text, LIMITS.publicInterestTextMaxChars);
  checkTextLimit(errors, "identifiers_text", parsed.identifiers_text, LIMITS.identifiersTextMaxChars);
  checkTextLimit(errors, "known_unknowns_text", parsed.known_unknowns_text, LIMITS.knownUnknownsTextMaxChars);
  checkTextLimit(errors, "existing_references_text", parsed.existing_references_text, LIMITS.existingReferencesTextMaxChars);

  const urlLines = String(parsed.submitted_source_urls_raw ?? "")
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (urlLines.length > LIMITS.maxSourceUrls) {
    errors.push({ code: ERROR_CODES.TOO_MANY_URLS, field: "submitted_source_urls_raw", message: `more than ${LIMITS.maxSourceUrls} source URL lines` });
  }
  for (const line of urlLines) {
    if (line.length > LIMITS.sourceUrlLineMaxChars) {
      errors.push({ code: ERROR_CODES.URL_LINE_TOO_LONG, field: "submitted_source_urls_raw", message: `a source URL line exceeds ${LIMITS.sourceUrlLineMaxChars} characters` });
      break;
    }
  }

  for (const key of REQUIRED_ACKNOWLEDGEMENT_KEYS) {
    if (parsed.acknowledgements?.[key] !== true) {
      errors.push({ code: ERROR_CODES.MISSING_ACKNOWLEDGEMENT, field: `acknowledgements.${key}`, message: `required acknowledgement not confirmed: ${key}` });
    }
  }

  if (errors.length > 0) {
    throw new IntakeError(ERROR_CODES.SUBMISSION_VALIDATION_FAILED, "submission failed validation", { errors });
  }
}
