import { test } from "node:test";
import assert from "node:assert/strict";
import { parseIssueFormV1 } from "./parse-issue-form.mjs";
import { FORM_V1 } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";

const SUBMISSION_TYPE_LABEL = Object.keys(FORM_V1.submissionTypeLabels)[0];
const ACK_LABELS = Object.keys(FORM_V1.acknowledgementLabels);

function section(key, content) {
  return `### ${FORM_V1.headings[key]}\n\n${content}\n\n`;
}

function validBody({ eol = "\n", extraAckLine = "", descriptionText = "Popis." } = {}) {
  const parts =
    section("submissionType", SUBMISSION_TYPE_LABEL) +
    section("subjectText", "Jan Testovací") +
    section("descriptionText", descriptionText) +
    section("publicInterestText", "Veřejný zájem.") +
    section("sourceUrls", "https://example.testov.cz/a") +
    section("acknowledgements", ACK_LABELS.map((label) => `- [X] ${label}`).join("\n") + extraAckLine);
  return (`<!-- ${FORM_V1.marker} -->\n\n${parts}`).replace(/\n/g, eol);
}

test("parses a well-formed v1 body into the §9.2 contract shape", () => {
  const parsed = parseIssueFormV1(validBody());
  assert.equal(parsed.form_version, FORM_V1.marker);
  assert.equal(parsed.submission_type, "new_dossier");
  assert.equal(parsed.subject_text, "Jan Testovací");
  assert.equal(parsed.description_text, "Popis.");
  assert.deepEqual(parsed.acknowledgements, {
    public_issue_understood: true,
    no_confidential_material: true,
    not_automatic_publication: true,
  });
  assert.deepEqual(parsed.unparsed_sections, []);
});

test("tolerates CRLF line endings", () => {
  const parsed = parseIssueFormV1(validBody({ eol: "\r\n" }));
  assert.equal(parsed.subject_text, "Jan Testovací");
  assert.equal(parsed.submission_type, "new_dossier");
});

test("tolerates trailing whitespace on lines", () => {
  const body = validBody().replace("Jan Testovací", "Jan Testovací   ");
  assert.equal(parseIssueFormV1(body).subject_text, "Jan Testovací");
});

test("rejects a body with a duplicated heading", () => {
  const body = validBody().replace(`### ${FORM_V1.headings.subjectText}`, `### ${FORM_V1.headings.submissionType}`);
  assert.throws(() => parseIssueFormV1(body), (err) => err instanceof IntakeError && err.code === ERROR_CODES.DUPLICATE_SECTION);
});

test("rejects a body missing a required section", () => {
  const body = validBody().replace(section("publicInterestText", "Veřejný zájem."), "");
  assert.throws(() => parseIssueFormV1(body), (err) => err instanceof IntakeError && err.code === ERROR_CODES.MISSING_REQUIRED_SECTION);
});

test("an unrecognized checkbox label under acknowledgements is retained as a warning signal, not silently dropped", () => {
  const body = validBody({ extraAckLine: "\n- [X] Nějaké neznámé potvrzení, které formulář nedefinuje." });
  const parsed = parseIssueFormV1(body);
  assert.equal(parsed.unrecognized_acknowledgement_labels.length, 1);
  assert.equal(parsed.acknowledgements.public_issue_understood, true);
});

test("a checkbox left unchecked is recorded as false, not silently true", () => {
  const body = validBody().replace(`- [X] ${ACK_LABELS[1]}`, `- [ ] ${ACK_LABELS[1]}`);
  const parsed = parseIssueFormV1(body);
  assert.equal(parsed.acknowledgements.no_confidential_material, false);
});

test("an unrecognized heading is kept in unparsed_sections, not discarded", () => {
  const body = validBody() + "### Nějaká neznámá sekce\n\nObsah, který formulář nedefinuje.\n";
  const parsed = parseIssueFormV1(body);
  assert.equal(parsed.unparsed_sections.length, 1);
  assert.equal(parsed.unparsed_sections[0].heading, "Nějaká neznámá sekce");
});

test("an unrecognized submission-type label resolves to null (validator, not parser, rejects it)", () => {
  const body = validBody().replace(section("submissionType", SUBMISSION_TYPE_LABEL), section("submissionType", "Jiné (neuvedené)"));
  const parsed = parseIssueFormV1(body);
  assert.equal(parsed.submission_type, null);
  assert.equal(parsed.submission_type_raw, "Jiné (neuvedené)");
});

test("a heading injected inside another section's free text is treated as a real duplicate, fail-closed", () => {
  // Markdown-injection case (§24.2): a submitter pastes a line that looks
  // exactly like one of the form's own headings inside a textarea field.
  const injected = `Normální text.\n\n### ${FORM_V1.headings.submissionType}\n\nVložený text.`;
  const body = validBody({ descriptionText: injected });
  assert.throws(() => parseIssueFormV1(body), (err) => err instanceof IntakeError && err.code === ERROR_CODES.DUPLICATE_SECTION);
});
