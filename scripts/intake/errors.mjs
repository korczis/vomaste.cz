// Structured, fail-closed errors for the intake processor (PHASE_002.md §1.4,
// §18). Every failure carries a stable `code` the CLI maps to an exit code
// and the processing-result JSON — never a bare thrown Error whose message
// text a caller would have to pattern-match.

export class IntakeError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "IntakeError";
    this.code = code;
    this.details = details;
  }
}

// One canonical list of codes so the CLI's exit-code mapping (constants.mjs
// EXIT_CODES) and this list can never drift silently — process-issue.mjs
// asserts every code below is mapped to an exit code.
export const ERROR_CODES = Object.freeze({
  // event loading (§8)
  EVENT_NOT_FOUND: "event_not_found",
  EVENT_NOT_REGULAR_FILE: "event_not_regular_file",
  EVENT_TOO_LARGE: "event_too_large",
  EVENT_INVALID_JSON: "event_invalid_json",
  EVENT_SCHEMA_INVALID: "event_schema_invalid",
  // form detection / parsing (§9, §10)
  UNSUPPORTED_FORM_VERSION: "unsupported_form_version",
  MISSING_FORM_MARKER: "missing_form_marker",
  DUPLICATE_SECTION: "duplicate_section",
  MISSING_REQUIRED_SECTION: "missing_required_section",
  // submission validation (§5, §11, §12, §13)
  UNSUPPORTED_SUBMISSION_TYPE: "unsupported_submission_type",
  MISSING_ACKNOWLEDGEMENT: "missing_acknowledgement",
  TEXT_TOO_LONG: "text_too_long",
  TOO_MANY_URLS: "too_many_urls",
  URL_LINE_TOO_LONG: "url_line_too_long",
  SUBMISSION_VALIDATION_FAILED: "submission_validation_failed",
  // manifest (§5.3, §7)
  MANIFEST_SCHEMA_INVALID: "manifest_schema_invalid",
  // CLI / output (§8.1, §17)
  CLI_USAGE: "cli_usage",
  OUTPUT_EXISTS: "output_exists",
  OUTPUT_PATH_UNSAFE: "output_path_unsafe",
  OUTPUT_WRITE_FAILED: "output_write_failed",
  INTERNAL_ERROR: "internal_error",
});
