// Risk classification orchestrator (PHASE_003.md §12, §14). Combines the
// five text-based detectors with three signals derived from Phase 3's
// OTHER two subsystems (matching, duplicate detection) into one flag
// list, then applies the deterministic precedence to decide the single
// workflow effect this run implies. Never itself decides truth, guilt,
// or source credibility (§1.2) — every flag it emits is one of the
// sentences §1.2 explicitly allows ("text obsahuje...", never "podání je
// nepravdivé").
import { FLAG_CATALOG, DETECTOR_VERSION, EFFECT_PRECEDENCE, EFFECT_TO_INTAKE_STATUS } from "./constants.mjs";
import { detectPersonalData } from "./detect-personal-data.mjs";
import { detectSensitiveMaterialClaims } from "./detect-sensitive-material-claims.mjs";
import { detectAdverseAllegationLanguage } from "./detect-adverse-allegation-language.mjs";
import { detectAnonymousSourceLanguage } from "./detect-anonymous-source-language.mjs";
import { detectInjectionMarkers } from "./detect-injection-markers.mjs";
import { detectPreflightRisk } from "./detect-preflight-risk.mjs";

const SCANNED_TEXT_FIELDS = ["subject_text", "description_text", "public_interest_text", "identifiers_text", "known_unknowns_text", "existing_references_text"];

function textFieldsOf(submission) {
  const fields = {};
  for (const field of SCANNED_TEXT_FIELDS) fields[field] = submission[field] ?? "";
  return fields;
}

function makeDerivedFlag(code, sourceField, explanation) {
  const meta = FLAG_CATALOG[code];
  return {
    code,
    severity: meta.severity,
    category: meta.category,
    source_field: sourceField,
    evidence: { kind: "derived", redacted_excerpt: null },
    effect: meta.effect,
    explanation,
    detector_version: DETECTOR_VERSION,
  };
}

// §13.1: missing source URLs is a data-quality observation, never
// evidence the submission is false.
function detectMissingBasics(submission, normalizedUrlCount) {
  const flags = [];
  if (!submission.public_interest_text || submission.public_interest_text.trim().length === 0) {
    flags.push(makeDerivedFlag("missing_public_interest_basis", "public_interest_text", "Pole veřejného zájmu je prázdné."));
  }
  if (normalizedUrlCount === 0) {
    flags.push(makeDerivedFlag("missing_source_urls", "submitted_source_urls_raw", "Podání neobsahuje žádnou rozpoznanou veřejnou URL."));
  }
  return flags;
}

function detectFromMatching(matchingResult) {
  const flags = [];
  for (const candidate of matchingResult.candidate_subjects) {
    if (candidate.resolution_status === "possible_matches" || candidate.resolution_status === "ambiguous") {
      flags.push(makeDerivedFlag("possible_existing_subject", "subject_text", `Kandidát „${candidate.input.raw_label}" má ${candidate.matches.length} možnou/možné shodu/shody v datasetu.`));
    }
    if (candidate.resolution_status === "conflicting_identifiers") {
      flags.push(makeDerivedFlag("conflicting_entity_identifiers", "subject_text", `Kandidát „${candidate.input.raw_label}" má shodné jméno, ale rozdílný validovaný identifikátor oproti existujícímu záznamu.`));
    }
  }
  return flags;
}

function detectFromDuplicates(duplicateResult) {
  if (duplicateResult.duplicate_status === "possible_duplicate") {
    return [makeDerivedFlag("possible_duplicate_intake", "source_event", `Nalezeno ${duplicateResult.candidates.length} možné/možných související/souvisejících podání.`)];
  }
  return [];
}

// Deterministic order: text detectors first (stable per-field iteration
// order from SCANNED_TEXT_FIELDS), then derived flags — so the same
// manifest + matching + duplicate result always produces the same flag
// array order (§21 determinism).
export function classifyIntakeRisk({ submission, matchingResult, duplicateResult, sourcePreflight }) {
  const fields = textFieldsOf(submission);
  const normalizedUrlCount = matchingResult?.normalizedSourceUrlCount ?? 0;

  const flags = [
    ...detectMissingBasics(submission, normalizedUrlCount),
    ...detectPersonalData(fields),
    ...detectSensitiveMaterialClaims(fields),
    ...detectAdverseAllegationLanguage(fields),
    ...detectAnonymousSourceLanguage(fields),
    ...detectInjectionMarkers(fields),
    ...detectFromMatching(matchingResult),
    ...detectFromDuplicates(duplicateResult),
    ...(sourcePreflight ? detectPreflightRisk(sourcePreflight) : []),
  ];

  // §14: a roll-up flag whenever ANY other flag already implies
  // security_review_required — a convenience summary, not an
  // independent detector, and it never appears alone.
  if (flags.some((f) => f.effect === "security_review_required")) {
    flags.push(makeDerivedFlag("manual_security_review_required", "manifest", "Alespoň jeden příznak vyžaduje bezpečnostní revizi."));
  }

  const winningEffect = EFFECT_PRECEDENCE.find((effect) => flags.some((f) => f.effect === effect)) ?? null;
  const intakeStatus = winningEffect ? EFFECT_TO_INTAKE_STATUS[winningEffect] : "triage";

  return { flags, workflow_decision: { winning_effect: winningEffect, intake_status: intakeStatus } };
}
