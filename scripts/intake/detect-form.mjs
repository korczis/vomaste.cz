// Deterministic issue-format recognition (PHASE_002.md §9). Never guesses
// from the issue title — only a hidden marker as the body's first
// non-blank line counts, so title wording can change freely without ever
// affecting parsing.
import { FORM_MARKER_PATTERN, SUPPORTED_FORM_VERSIONS } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";

// Returns the recognized form marker string (e.g. "vomaste-intake-form:v1").
// Throws IntakeError(MISSING_FORM_MARKER) if no line at all matches the
// marker pattern, IntakeError(UNSUPPORTED_FORM_VERSION) if a marker is
// present but names a version this processor does not know, or
// IntakeError(DUPLICATE_FORM_MARKER) if any marker-shaped line (any
// version, including a repeat of the real one) appears anywhere else in
// the body — e.g. injected into free-text description content
// (PHASE_005.md §25.1). Only the first non-blank line is ever trusted as
// the actual form identity; a second occurrence is rejected outright
// rather than silently ignored, so an attacker-controlled body can never
// even cosmetically claim a form version it didn't actually submit.
export function detectFormVersion(issueBody) {
  const lines = String(issueBody).split(/\r\n|\r|\n/);
  const firstNonBlankLine = lines.map((line) => line.trim()).find((line) => line.length > 0);

  const match = firstNonBlankLine ? FORM_MARKER_PATTERN.exec(firstNonBlankLine) : null;
  if (!match) {
    throw new IntakeError(ERROR_CODES.MISSING_FORM_MARKER, "issue body does not start with a recognized vomaste-intake-form marker");
  }

  const laterMarkerLines = lines.map((line) => line.trim()).filter((line) => line.length > 0);
  laterMarkerLines.shift(); // the trusted first line itself is not a "duplicate"
  if (laterMarkerLines.some((line) => FORM_MARKER_PATTERN.test(line))) {
    throw new IntakeError(ERROR_CODES.DUPLICATE_FORM_MARKER, "a second vomaste-intake-form marker line appears elsewhere in the issue body");
  }

  const marker = match[1];
  if (!SUPPORTED_FORM_VERSIONS.includes(marker)) {
    throw new IntakeError(ERROR_CODES.UNSUPPORTED_FORM_VERSION, `unsupported intake form version: ${marker}`, { marker });
  }
  return marker;
}
