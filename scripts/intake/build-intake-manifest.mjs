// Manifest assembly (PHASE_002.md §6, §7, §15). This is the ONLY place a
// manifest object is constructed — every authorization/publication field
// it writes is a literal constant, never a variable that could carry a
// wider value in from elsewhere (§1.1: those states must be mechanically
// unreachable, not just unused).
import { SCHEMA_VERSION, GENERATOR_VERSION, PARSER_VERSION } from "./constants.mjs";
import { hashManifest } from "./hash.mjs";

// §6 deterministic ID: derived only from repository full_name + issue
// number, never from title, body, or wall-clock time — the same issue
// always yields the same ID, and editing the issue never changes it.
export function buildIntakeId(repositoryFullName, issueNumber) {
  const [owner, repo] = repositoryFullName.split("/");
  const slug = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const paddedNumber = String(issueNumber).padStart(6, "0");
  return `INTAKE-GH-${slug(owner)}-${slug(repo)}-${paddedNumber}`;
}

// `inputHash`, `repositoryCommit` and `generatedAt` are always caller-supplied
// (never computed with new Date()/Date.now() in here) so the same inputs
// reproduce a byte-identical manifest under test (§7).
export function buildIntakeManifest({
  event,
  parsedSubmission,
  normalization,
  systemObservations,
  matching,
  duplicateDetection,
  riskClassification,
  workflowDecision,
  generatedAt,
  repositoryCommit,
  inputHash,
}) {
  const id = buildIntakeId(event.repository.full_name, event.issue.number);

  const manifestWithoutHash = {
    schema_version: SCHEMA_VERSION,
    id,
    source_event: {
      provider: "github",
      repository: event.repository.full_name,
      issue_number: event.issue.number,
      issue_url: event.issue.html_url,
      issue_author_login: event.issue.author_login,
      event_action: event.event.action,
      created_at: event.issue.created_at,
      updated_at: event.issue.updated_at,
    },
    submission: {
      submission_type: parsedSubmission.submission_type,
      subject_text: parsedSubmission.subject_text,
      description_text: parsedSubmission.description_text,
      public_interest_text: parsedSubmission.public_interest_text,
      identifiers_text: parsedSubmission.identifiers_text,
      submitted_source_urls_raw: parsedSubmission.submitted_source_urls_raw,
      known_unknowns_text: parsedSubmission.known_unknowns_text,
      existing_references_text: parsedSubmission.existing_references_text,
      acknowledgements: {
        public_issue_understood: parsedSubmission.acknowledgements.public_issue_understood === true,
        no_confidential_material: parsedSubmission.acknowledgements.no_confidential_material === true,
        not_automatic_publication: parsedSubmission.acknowledgements.not_automatic_publication === true,
      },
    },
    normalization,
    system_observations: {
      parser_version: PARSER_VERSION,
      form_version: parsedSubmission.form_version,
      warnings: systemObservations.warnings,
      errors: systemObservations.errors,
    },
    // §15.2 (Phase 2) / PHASE_003.md §10 (Phase 3): the proposed scope
    // stays a mechanical echo of the submission plus Phase 3's OWN
    // matching output (never an AI inference) — entity_id is always null
    // here regardless of how confident a match was; matching retrieves
    // candidates, it never asserts identity (§1.1). decision_class/
    // authorization_effect are hardcoded constants, matching the
    // schema's `const` on both fields.
    proposed_authorization_scope: {
      decision_class: "machine_draft_only",
      authorization_effect: "none",
      subject_candidates: matching.candidate_subjects.map((c) => ({
        label_from_submission: c.input.raw_label,
        entity_id: null,
        resolution_status: c.resolution_status,
        extracted_identifiers: c.extracted_identifiers ?? {},
      })),
      topics: [],
      explicit_exclusions: ["nonpublic_material", "private_life_without_public_interest", "unnamed_third_parties_not_publicly_identified"],
      sourcing_limits: ["publicly_available_sources_only", "independent_named_sources_required"],
    },
    matching: { dataset_commit: matching.dataset_commit, index_schema_version: matching.index_schema_version, candidate_subjects: matching.candidate_subjects },
    duplicate_detection: duplicateDetection,
    risk_classification: riskClassification,
    workflow_decision: workflowDecision,
    // §1.1 / PHASE_002.md §15.1 / PHASE_003.md §14.2: the only values this
    // processor is capable of writing for authorization/publication —
    // there is no branch anywhere in this module that can produce
    // "authorized" or "publishable"/"published". intake_status comes
    // straight from workflowDecision, itself computed by
    // scripts/intake/risk/classify-intake-risk.mjs's fixed precedence.
    workflow: {
      intake_status: workflowDecision.intake_status,
      authorization_status: "pending_owner",
      publication_status: "blocked",
    },
    provenance: {
      generated_at: generatedAt,
      generator_name: "vomaste-intake-processor",
      generator_version: GENERATOR_VERSION,
      repository_commit: repositoryCommit,
      input_sha256: inputHash,
    },
  };

  const manifestSha256 = hashManifest(manifestWithoutHash);
  return { ...manifestWithoutHash, provenance: { ...manifestWithoutHash.provenance, manifest_sha256: manifestSha256 } };
}
