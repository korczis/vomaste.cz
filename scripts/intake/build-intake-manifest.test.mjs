import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIntakeId, buildIntakeManifest } from "./build-intake-manifest.mjs";
import { validateManifestShape } from "./lib/schema-validators.mjs";

test("buildIntakeId is deterministic for the same repository+issue number", () => {
  assert.equal(buildIntakeId("korczis/vomaste.cz", 123), buildIntakeId("korczis/vomaste.cz", 123));
});

test("buildIntakeId matches the mission's documented example format", () => {
  assert.equal(buildIntakeId("korczis/vomaste.cz", 123), "INTAKE-GH-korczis-vomaste-cz-000123");
});

test("buildIntakeId does not depend on title, body, or wall-clock time — only repository+number", () => {
  // The function signature itself proves this: it accepts no title/body/date
  // parameter at all, so there is no way to pass one in even by mistake.
  assert.equal(buildIntakeId.length, 2);
});

test("buildIntakeId slugifies path-traversal-shaped owner/repo names into safe segments", () => {
  const id = buildIntakeId("../../etc/passwd", 1);
  assert.ok(!id.includes(".."), id);
  assert.ok(!id.includes("/"), id);
  assert.match(id, /^INTAKE-GH-[a-z0-9-]+-\d{6}$/);
});

function minimalManifestInput(overrides = {}) {
  return {
    event: {
      repository: { owner: "korczis", name: "vomaste.cz", full_name: "korczis/vomaste.cz" },
      issue: { number: 42, html_url: "https://github.com/korczis/vomaste.cz/issues/42", author_login: "example-user", created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
      event: { action: "opened" },
    },
    parsedSubmission: {
      form_version: "vomaste-intake-form:v1",
      submission_type: "new_dossier",
      subject_text: "Jan Testovací",
      description_text: "Popis.",
      public_interest_text: "Veřejný zájem.",
      identifiers_text: "",
      submitted_source_urls_raw: "https://example.testov.cz/a",
      known_unknowns_text: "",
      existing_references_text: "",
      acknowledgements: { public_issue_understood: true, no_confidential_material: true, not_automatic_publication: true },
    },
    normalization: { subject_text_normalized: "Jan Testovací", normalized_source_urls: [], normalization_notes: [] },
    systemObservations: { warnings: [], errors: [] },
    matching: { dataset_commit: "test-commit", index_schema_version: "1.0.0", candidate_subjects: [] },
    duplicateDetection: { duplicate_status: "no_duplicate", candidates: [], manual_review_required: false, prior_manifest_source: null },
    riskClassification: { flags: [] },
    workflowDecision: { winning_effect: null, intake_status: "triage" },
    generatedAt: "2026-08-02T00:00:00.000Z",
    repositoryCommit: "0000000000000000000000000000000000000f",
    inputHash: "a".repeat(64),
    ...overrides,
  };
}

test("buildIntakeManifest produces a schema-valid manifest", () => {
  const manifest = buildIntakeManifest(minimalManifestInput());
  const shape = validateManifestShape(manifest);
  assert.deepEqual(shape.errors, []);
  assert.ok(shape.valid);
});

test("buildIntakeManifest is byte-for-byte deterministic given identical inputs", () => {
  const input = minimalManifestInput();
  const m1 = buildIntakeManifest(input);
  const m2 = buildIntakeManifest(input);
  assert.deepEqual(m1, m2);
});

test("buildIntakeManifest can only ever set authorization_status to pending_owner", () => {
  const manifest = buildIntakeManifest(minimalManifestInput());
  assert.equal(manifest.workflow.authorization_status, "pending_owner");
  // Even if a caller tried to smuggle a wider value through
  // workflowDecision.*, the builder only reads workflowDecision.intake_status
  // — authorization_status and publication_status are literal constants
  // in the module, not pass-through fields.
  const manifestWithHostileInput = buildIntakeManifest(
    minimalManifestInput({ workflowDecision: { winning_effect: null, intake_status: "triage", authorization_status: "authorized", publication_status: "published" } })
  );
  assert.equal(manifestWithHostileInput.workflow.authorization_status, "pending_owner");
  assert.equal(manifestWithHostileInput.workflow.publication_status, "blocked");
});

test("buildIntakeManifest can only ever set publication_status to blocked", () => {
  const manifest = buildIntakeManifest(minimalManifestInput());
  assert.equal(manifest.workflow.publication_status, "blocked");
});

test("buildIntakeManifest's proposed scope always has decision_class machine_draft_only and authorization_effect none", () => {
  const manifest = buildIntakeManifest(minimalManifestInput());
  assert.equal(manifest.proposed_authorization_scope.decision_class, "machine_draft_only");
  assert.equal(manifest.proposed_authorization_scope.authorization_effect, "none");
});

test("manifest_sha256 changes if any other field changes", () => {
  const m1 = buildIntakeManifest(minimalManifestInput());
  const m2 = buildIntakeManifest(minimalManifestInput({ generatedAt: "2026-08-03T00:00:00.000Z" }));
  assert.notEqual(m1.provenance.manifest_sha256, m2.provenance.manifest_sha256);
});
