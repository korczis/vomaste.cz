// Deterministic issue-format recognition (PHASE_002.md §9). Never guesses
// from the issue title — only a hidden marker as the body's first
// non-blank line counts, so title wording can change freely without ever
// affecting parsing.
import { FORM_MARKER_PATTERN, SUPPORTED_FORM_VERSIONS } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";

// Returns the recognized form marker string (e.g. "vomaste-intake-form:v1").
// Throws IntakeError(MISSING_FORM_MARKER) if no line at all matches the
// marker pattern, or IntakeError(UNSUPPORTED_FORM_VERSION) if a marker is
// present but names a version this processor does not know — in both
// cases fail closed, never best-effort parse.
export function detectFormVersion(issueBody) {
  const firstNonBlankLine = String(issueBody)
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const match = firstNonBlankLine ? FORM_MARKER_PATTERN.exec(firstNonBlankLine) : null;
  if (!match) {
    throw new IntakeError(ERROR_CODES.MISSING_FORM_MARKER, "issue body does not start with a recognized vomaste-intake-form marker");
  }

  const marker = match[1];
  if (!SUPPORTED_FORM_VERSIONS.includes(marker)) {
    throw new IntakeError(ERROR_CODES.UNSUPPORTED_FORM_VERSION, `unsupported intake form version: ${marker}`, { marker });
  }
  return marker;
}
