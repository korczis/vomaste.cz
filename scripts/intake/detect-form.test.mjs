import { test } from "node:test";
import assert from "node:assert/strict";
import { detectFormVersion } from "./detect-form.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";

test("recognizes the v1 marker as the first non-blank line", () => {
  assert.equal(detectFormVersion("<!-- vomaste-intake-form:v1 -->\n\n### x\n"), "vomaste-intake-form:v1");
});

test("tolerates leading blank lines before the marker", () => {
  assert.equal(detectFormVersion("\n\n  <!-- vomaste-intake-form:v1 -->\n"), "vomaste-intake-form:v1");
});

test("rejects a body with no marker at all", () => {
  assert.throws(() => detectFormVersion("### Typ podnětu\n\nnew_dossier\n"), (err) => err instanceof IntakeError && err.code === ERROR_CODES.MISSING_FORM_MARKER);
});

test("rejects an unknown (future) form version", () => {
  assert.throws(() => detectFormVersion("<!-- vomaste-intake-form:v2 -->\n"), (err) => err instanceof IntakeError && err.code === ERROR_CODES.UNSUPPORTED_FORM_VERSION);
});

test("rejects an unknown (older/pre-release) form version", () => {
  assert.throws(() => detectFormVersion("<!-- vomaste-intake-form:v0 -->\n"), (err) => err instanceof IntakeError && err.code === ERROR_CODES.UNSUPPORTED_FORM_VERSION);
});

test("a marker appearing later in the body (not the first line) does not count", () => {
  const body = "Nějaký text bez markeru na začátku.\n\n<!-- vomaste-intake-form:v1 -->\n";
  assert.throws(() => detectFormVersion(body), (err) => err instanceof IntakeError && err.code === ERROR_CODES.MISSING_FORM_MARKER);
});
