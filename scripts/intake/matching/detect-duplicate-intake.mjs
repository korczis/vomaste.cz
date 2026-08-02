// Duplicate intake detection (PHASE_003.md §11). Compares one manifest
// against a list of PRIOR manifests already loaded by the caller — this
// module never touches the filesystem or invents a production store
// (§11.4, §11.3). It only ever reports; it never closes, labels, merges,
// or picks a canonical submission.
import { normalizedSimilarity } from "./score-name-match.mjs";

const SIMILARITY_DESCRIPTION_PREFIX_LENGTH = 500; // bounded — never full-text Levenshtein on a 20k-char field (§15)
const SUBJECT_SIMILARITY_FLOOR = 0.85;
const DESCRIPTION_SIMILARITY_FLOOR = 0.7;

function normalizedUrlSet(manifest) {
  return new Set((manifest.normalization?.normalized_source_urls ?? []).map((u) => u.normalized));
}

function setsIntersect(a, b) {
  for (const item of a) if (b.has(item)) return true;
  return false;
}

function extractedIdentifiersOf(manifest) {
  return manifest.proposed_authorization_scope?.subject_candidates?.[0]?.extracted_identifiers ?? {};
}

// Classifies ONE current-vs-prior pair. Returns null if no signal at all
// clears the "possible_related_submission" floor — a genuinely unrelated
// prior manifest is not returned as a candidate.
function classifyPair(current, prior) {
  if (current.id === prior.id) return null; // never compare a manifest to itself

  if (current.source_event.repository === prior.source_event.repository && current.source_event.issue_number === prior.source_event.issue_number) {
    return { duplicate_type: "same_issue", matched_signals: ["repository", "issue_number"] };
  }

  const currentIds = extractedIdentifiersOf(current);
  const priorIds = extractedIdentifiersOf(prior);
  const sharedIdKeys = Object.keys(currentIds).filter((k) => priorIds[k] && priorIds[k] === currentIds[k]);
  if (sharedIdKeys.length > 0) {
    return { duplicate_type: "exact_subject_identifier", matched_signals: sharedIdKeys };
  }

  const currentSubject = current.normalization.subject_text_normalized;
  const priorSubject = prior.normalization.subject_text_normalized;
  const subjectEqual = currentSubject.toLocaleLowerCase("cs-CZ") === priorSubject.toLocaleLowerCase("cs-CZ");
  const urlsOverlap = setsIntersect(normalizedUrlSet(current), normalizedUrlSet(prior));

  if (subjectEqual && urlsOverlap) {
    return { duplicate_type: "same_subject_and_sources", matched_signals: ["subject_text_normalized", "normalized_source_urls"] };
  }

  const subjectSimilarity = normalizedSimilarity(currentSubject.toLocaleLowerCase("cs-CZ"), priorSubject.toLocaleLowerCase("cs-CZ"));
  const currentDescPrefix = current.submission.description_text.slice(0, SIMILARITY_DESCRIPTION_PREFIX_LENGTH).toLocaleLowerCase("cs-CZ");
  const priorDescPrefix = prior.submission.description_text.slice(0, SIMILARITY_DESCRIPTION_PREFIX_LENGTH).toLocaleLowerCase("cs-CZ");
  const descriptionSimilarity = normalizedSimilarity(currentDescPrefix, priorDescPrefix);

  if (subjectSimilarity >= SUBJECT_SIMILARITY_FLOOR && descriptionSimilarity >= DESCRIPTION_SIMILARITY_FLOOR) {
    return { duplicate_type: "similar_subject_and_description", matched_signals: [`subject_similarity:${subjectSimilarity.toFixed(2)}`, `description_prefix_similarity:${descriptionSimilarity.toFixed(2)}`] };
  }

  if (subjectEqual || urlsOverlap) {
    return { duplicate_type: "possible_related_submission", matched_signals: [subjectEqual ? "subject_text_normalized" : "normalized_source_urls"] };
  }

  return null;
}

// Returns { duplicate_status, candidates, manual_review_required }.
// `priorManifests` is an already-loaded array (see
// scripts/intake/matching/duplicate-intake-source.mjs for how the
// fixture/CLI adapter loads them) — pass [] when no prior-manifest source
// is configured, which always yields "no_duplicate", never an error.
export function detectDuplicateIntake(currentManifest, priorManifests) {
  const candidates = [];
  for (const prior of priorManifests) {
    const classification = classifyPair(currentManifest, prior);
    if (classification) candidates.push({ intake_id: prior.id, ...classification });
  }

  // §11.2 lists the fine-grained taxonomy for each CANDIDATE's own
  // duplicate_type; the top-level duplicate_status is the coarser
  // "possible_duplicate | no_duplicate" summary §14.2's workflow enum
  // actually consumes — any candidate at all, even the weakest
  // possible_related_submission signal, means a human should look.
  if (candidates.length === 0) {
    return { duplicate_status: "no_duplicate", candidates: [], manual_review_required: false };
  }
  return { duplicate_status: "possible_duplicate", candidates, manual_review_required: true };
}
