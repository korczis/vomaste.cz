// Form/parser compatibility tests (PHASE_005.md §14): proves the REAL
// .github/ISSUE_TEMPLATE/navrh-dossieru.yml — not an imagined shape —
// round-trips through the real parser (constants.mjs FORM_V1,
// detect-form.mjs, parse-issue-form.mjs). A change to either side that
// breaks the contract fails here, not in production against a real
// submitter's issue.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadFormBody, renderGithubFormBody } from "./render-github-form-body.mjs";
import { FORM_V1, SUPPORTED_FORM_VERSIONS } from "./constants.mjs";
import { detectFormVersion } from "./detect-form.mjs";
import { parseIssueFormV1 } from "./parse-issue-form.mjs";
import { validateParsedSubmission } from "./validate-submission.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FORM_PATH = join(ROOT, ".github/ISSUE_TEMPLATE/navrh-dossieru.yml");

function fieldsOf(body) {
  return body.filter((item) => item.type !== "markdown");
}

// §14.5 — the form's own first-line marker (never assumed, always read
// out of the real YAML) matches the parser's supported version exactly.
test("§14.5 the form's first body block is exactly the FORM_V1 marker, and it's a supported version", () => {
  const body = loadFormBody(FORM_PATH);
  assert.equal(body[0].type, "markdown", "first body item must be the marker markdown block");
  const markerLine = body[0].attributes.value.trim();
  assert.equal(markerLine, `<!-- ${FORM_V1.marker} -->`);
  assert.ok(SUPPORTED_FORM_VERSIONS.includes(FORM_V1.marker));
});

// §14.1/§14.2 — every field the form defines has a parser mapping (via
// its rendered heading), and every heading the parser requires actually
// exists in the form.
test("§14.1/§14.2 every form field's label matches a known parser heading, and every required heading is defined by some field", () => {
  const fields = fieldsOf(loadFormBody(FORM_PATH));
  const knownHeadings = new Set(Object.values(FORM_V1.headings));
  const formHeadings = new Set(fields.map((f) => f.attributes.label));

  const unmapped = fields.filter((f) => !knownHeadings.has(f.attributes.label));
  assert.deepEqual(
    unmapped.map((f) => f.id),
    [],
    "every field's label must equal one of FORM_V1.headings' values, or parse-issue-form.mjs files it under unparsed_sections"
  );

  for (const key of FORM_V1.requiredSections) {
    assert.ok(formHeadings.has(FORM_V1.headings[key]), `required heading "${FORM_V1.headings[key]}" (${key}) has no field in the form`);
  }
  for (const key of FORM_V1.optionalSections) {
    assert.ok(formHeadings.has(FORM_V1.headings[key]), `optional heading "${FORM_V1.headings[key]}" (${key}) has no field in the form — it would always be absent, not just sometimes blank`);
  }
});

// §14.3 — every dropdown option the form offers has an internal enum,
// and every enum the parser knows is actually reachable from the form.
test("§14.3 every submission_type dropdown option has an internal enum, and no enum is unreachable", () => {
  const fields = fieldsOf(loadFormBody(FORM_PATH));
  const dropdown = fields.find((f) => f.id === "submission_type");
  assert.ok(dropdown, "no field with id=submission_type");
  assert.equal(dropdown.type, "dropdown");

  const formOptions = dropdown.attributes.options;
  for (const option of formOptions) {
    assert.ok(option in FORM_V1.submissionTypeLabels, `dropdown option "${option}" has no entry in FORM_V1.submissionTypeLabels`);
  }
  const reachableEnums = new Set(formOptions.map((o) => FORM_V1.submissionTypeLabels[o]));
  for (const knownLabel of Object.keys(FORM_V1.submissionTypeLabels)) {
    assert.ok(formOptions.includes(knownLabel), `FORM_V1.submissionTypeLabels entry "${knownLabel}" is not one of the form's actual dropdown options — unreachable enum`);
  }
  assert.equal(reachableEnums.size, Object.keys(FORM_V1.submissionTypeLabels).length, "every internal enum value must be reachable from exactly the options the form offers");
});

// §14.4 — every acknowledgement checkbox option the form defines is
// `required: true` and has a parser mapping; the parser expects no
// checkbox the form doesn't actually create.
test("§14.4 every acknowledgements checkbox option is required and mapped, and the parser expects nothing the form omits", () => {
  const fields = fieldsOf(loadFormBody(FORM_PATH));
  const acks = fields.find((f) => f.id === "acknowledgements");
  assert.ok(acks, "no field with id=acknowledgements");
  assert.equal(acks.type, "checkboxes");

  const formOptionLabels = acks.attributes.options.map((o) => o.label);
  for (const option of acks.attributes.options) {
    assert.equal(option.required, true, `checkbox option "${option.label}" must be required: true`);
    assert.ok(option.label in FORM_V1.acknowledgementLabels, `checkbox option "${option.label}" has no entry in FORM_V1.acknowledgementLabels`);
  }
  for (const knownLabel of Object.keys(FORM_V1.acknowledgementLabels)) {
    assert.ok(formOptionLabels.includes(knownLabel), `FORM_V1.acknowledgementLabels entry "${knownLabel}" is not one of the form's actual checkbox options`);
  }
});

test("field ids are unique across the whole form (a GitHub Issue Forms hard requirement)", () => {
  const fields = fieldsOf(loadFormBody(FORM_PATH));
  const ids = fields.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length, `duplicate field id(s) in ${FORM_PATH}`);
});

test("required-in-FORM_V1.requiredSections fields that are GitHub-required use validations.required: true, except sourceUrls (§6.6: heading-required, GitHub-optional by design)", () => {
  const fields = fieldsOf(loadFormBody(FORM_PATH));
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]));
  for (const id of ["submission_type", "subject", "description", "public_interest"]) {
    assert.equal(byId[id]?.validations?.required, true, `${id} must be validations.required: true`);
  }
  assert.equal(byId.source_urls?.validations?.required, false, "source_urls must stay GitHub-optional (§6.6) — the risk classifier flags a missing URL, not client-side validation");
});

// Full end-to-end round trip against the REAL rendered form, not a
// hand-typed body string — this is the actual proof the audit exists to
// produce (PHASE_005.md §0's stated goal).
function fullSubmissionValues() {
  return {
    submission_type: "Nový dossier (nová osoba/subjekt)",
    subject: "Jan Testovací, starosta obce Testov",
    description: "Podle zveřejněného zápisu ze zastupitelstva obce Testov schválil starosta zakázku bez veřejné soutěže.",
    public_interest: "Jan Testovací je veřejně volený starosta, jde o nakládání s veřejnými prostředky.",
    source_urls: "https://www.testov.cz/zapisy/2026-05-01.pdf",
    identifiers: "IČO 00000001",
    known_unknowns: "Není jasné, zda zakázka podléhala veřejné soutěži.",
    existing_references: "",
    acknowledgements: Object.fromEntries(Object.keys(FORM_V1.acknowledgementLabels).map((label) => [label, true])),
  };
}

test("a fully answered real-form submission parses and validates cleanly end to end", () => {
  const body = renderGithubFormBody(FORM_PATH, fullSubmissionValues());
  const marker = detectFormVersion(body);
  assert.equal(marker, FORM_V1.marker);
  const parsed = parseIssueFormV1(body);
  assert.equal(parsed.submission_type, "new_dossier");
  assert.equal(parsed.subject_text, "Jan Testovací, starosta obce Testov");
  assert.equal(parsed.identifiers_text, "IČO 00000001");
  assert.deepEqual(parsed.unparsed_sections, []);
  assert.deepEqual(parsed.unrecognized_acknowledgement_labels, []);
  assert.doesNotThrow(() => validateParsedSubmission(parsed));
});

test("a minimal real-form submission (all optional fields left blank) round-trips '_No response_' to empty strings, not literal placeholder text", () => {
  const values = fullSubmissionValues();
  delete values.identifiers;
  delete values.known_unknowns;
  delete values.existing_references;
  delete values.source_urls;
  const body = renderGithubFormBody(FORM_PATH, values);
  const parsed = parseIssueFormV1(body);
  assert.equal(parsed.identifiers_text, "");
  assert.equal(parsed.known_unknowns_text, "");
  assert.equal(parsed.existing_references_text, "");
  assert.equal(parsed.submitted_source_urls_raw, "");
  assert.ok(!parsed.identifiers_text.includes("No response"));
});

test("a real-form submission with one acknowledgement unchecked fails validateParsedSubmission, not silently accepted", () => {
  const values = fullSubmissionValues();
  const firstLabel = Object.keys(FORM_V1.acknowledgementLabels)[0];
  values.acknowledgements = { ...values.acknowledgements, [firstLabel]: false };
  const body = renderGithubFormBody(FORM_PATH, values);
  const parsed = parseIssueFormV1(body);
  assert.throws(() => validateParsedSubmission(parsed));
});
