// Risk taxonomy (PHASE_003.md §12, §13, §14). One catalog entry per flag
// code — severity, category, and workflow effect are looked up here, not
// hardcoded per detector, so a flag's meaning can never drift between two
// places that emit it.
export const SEVERITY = Object.freeze(["info", "low", "medium", "high", "critical"]);
export const CATEGORY = Object.freeze(["privacy", "security", "editorial", "legal_review", "data_quality", "workflow", "abuse"]);

export const DETECTOR_VERSION = "1.0.0";

// effect is one of: needs_information | security_review_required |
// possible_duplicate | manual_review | audit_only — §14's own table.
export const FLAG_CATALOG = Object.freeze({
  missing_public_interest_basis: { severity: "medium", category: "editorial", effect: "needs_information" },
  missing_source_urls: { severity: "medium", category: "data_quality", effect: "needs_information" },
  contains_nonpublic_material_claim: { severity: "high", category: "security", effect: "security_review_required" },
  contains_confidentiality_request: { severity: "medium", category: "editorial", effect: "manual_review" },
  contains_possible_email_address: { severity: "high", category: "privacy", effect: "security_review_required" },
  contains_possible_phone_number: { severity: "high", category: "privacy", effect: "security_review_required" },
  contains_possible_postal_address: { severity: "medium", category: "privacy", effect: "manual_review" },
  contains_sensitive_personal_data_terms: { severity: "high", category: "privacy", effect: "security_review_required" },
  contains_unnamed_source_language: { severity: "medium", category: "editorial", effect: "manual_review" },
  contains_serious_adverse_allegation_language: { severity: "high", category: "legal_review", effect: "manual_review" },
  contains_criminal_allegation_language: { severity: "high", category: "legal_review", effect: "manual_review" },
  contains_threat_language: { severity: "high", category: "abuse", effect: "security_review_required" },
  contains_doxxing_pattern: { severity: "critical", category: "abuse", effect: "security_review_required" },
  contains_prompt_injection_language: { severity: "low", category: "security", effect: "audit_only" },
  contains_shell_instruction_language: { severity: "low", category: "security", effect: "audit_only" },
  contains_hidden_unicode_controls: { severity: "medium", category: "security", effect: "manual_review" },
  contains_mass_mentions: { severity: "medium", category: "abuse", effect: "manual_review" },
  possible_existing_subject: { severity: "info", category: "editorial", effect: "manual_review" },
  possible_duplicate_intake: { severity: "medium", category: "workflow", effect: "possible_duplicate" },
  conflicting_entity_identifiers: { severity: "high", category: "data_quality", effect: "manual_review" },
  manual_security_review_required: { severity: "high", category: "security", effect: "security_review_required" },

  // PHASE_004.md §15 — derived from scripts/intake/preflight/* results
  // by detect-preflight-risk.mjs. A "safety block" (private destination,
  // mixed DNS, credentials, redirect-to-private, TLS error) is a real
  // security signal worth a human security look; an ordinary "article
  // temporarily unreachable" (timeout, DNS failure, unsupported content
  // type) is not — it stays a low-severity/needs_information-or-audit
  // observation, per §15.1's explicit "rozliš unsafe URL a safe
  // destination, but server unavailable".
  url_invalid: { severity: "low", category: "data_quality", effect: "manual_review" },
  url_unsupported_protocol: { severity: "low", category: "data_quality", effect: "manual_review" },
  url_contains_credentials: { severity: "high", category: "security", effect: "security_review_required" },
  url_nonstandard_port: { severity: "low", category: "data_quality", effect: "manual_review" },
  url_private_destination: { severity: "high", category: "security", effect: "security_review_required" },
  url_mixed_public_private_dns: { severity: "high", category: "security", effect: "security_review_required" },
  url_dns_failure: { severity: "info", category: "data_quality", effect: "needs_information" },
  url_redirect_private_destination: { severity: "high", category: "security", effect: "security_review_required" },
  url_redirect_loop: { severity: "low", category: "data_quality", effect: "manual_review" },
  url_redirect_transport_downgrade: { severity: "medium", category: "security", effect: "manual_review" },
  url_tls_error: { severity: "medium", category: "data_quality", effect: "manual_review" },
  url_timeout: { severity: "info", category: "data_quality", effect: "needs_information" },
  url_response_too_large: { severity: "info", category: "data_quality", effect: "audit_only" },
  url_unsupported_content_type: { severity: "info", category: "data_quality", effect: "audit_only" },
  url_metadata_extraction_failed: { severity: "info", category: "data_quality", effect: "audit_only" },
  url_preflight_partial: { severity: "info", category: "workflow", effect: "audit_only" },
  url_preflight_failed: { severity: "low", category: "data_quality", effect: "needs_information" },
});

// §14.1 deterministic precedence — highest wins when deciding the
// resulting intake_status. security_review_required strictly outranks
// everything else; the rest follow the order PHASE_003.md gives.
export const EFFECT_PRECEDENCE = Object.freeze(["security_review_required", "needs_information", "possible_duplicate", "manual_review", "audit_only"]);

// §14.2: maps a winning effect to the ONLY intake_status values Phase 3
// is allowed to produce (still a strict subset of the ADR's full state
// machine — see docs/adr/ADR-public-dossier-intake.md).
export const EFFECT_TO_INTAKE_STATUS = Object.freeze({
  security_review_required: "security_review_required",
  needs_information: "needs_information",
  possible_duplicate: "possible_duplicate",
  manual_review: "triage",
  audit_only: "triage",
});
