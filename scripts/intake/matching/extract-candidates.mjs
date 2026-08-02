// Deterministic candidate extraction (PHASE_003.md §9). No NER, no LLM —
// only the explicit `subject_text` field and an explicit IČO pattern
// inside `identifiers_text`. Nothing is pulled out of free-form
// `description_text` (§9.1: "nevytahuj automaticky každé velké písmeno z
// popisu jako osobu").
import { normalizePersonName } from "./normalize-person-name.mjs";
import { normalizeOrganizationName } from "./normalize-organization-name.mjs";
import { normalizeIco } from "./normalize-identifier.mjs";

const ICO_PATTERN = /\b(\d{8})\b/;

// Only a VALID (checksum-passing) IČO is ever treated as an identifier
// for matching — an invalid one is recorded as an observation, never
// used as identity evidence (§5.6).
function extractIco(identifiersText) {
  const match = ICO_PATTERN.exec(String(identifiersText ?? ""));
  if (!match) return { ico: null, observation: null };
  const { valid, normalized } = normalizeIco(match[1]);
  return valid ? { ico: normalized, observation: null } : { ico: null, observation: "ico_like_pattern_failed_checksum" };
}

// Phase 2's v1 form has exactly one subject field — one candidate per
// submission (§9.1: no multi-subject list field exists yet to iterate
// over). Returns [] if subject_text is empty/whitespace-only.
export function extractCandidates(submission) {
  const rawLabel = String(submission.subject_text ?? "").trim();
  if (rawLabel.length === 0) return { candidates: [], observations: [] };

  const { ico, observation } = extractIco(submission.identifiers_text);
  const candidateType = ico ? "organization" : "unknown";

  const candidate = {
    candidate_id: "candidate-001",
    candidate_type: candidateType,
    raw_label: rawLabel,
    normalized: {
      person: normalizePersonName(rawLabel),
      organization: normalizeOrganizationName(rawLabel),
    },
    extracted_identifiers: ico ? { ico } : {},
    source_field: "subject_text",
  };

  return { candidates: [candidate], observations: observation ? [observation] : [] };
}
