// Nonpublic-material / confidentiality-request phrase detection
// (PHASE_003.md §13.4, §20 "Confidentiality"). Plain substring matching
// on a fixed phrase list — no regex needed, so no backtracking risk at
// all (§15: "přednost jednoduchým token checks").
import { FLAG_CATALOG, DETECTOR_VERSION } from "./constants.mjs";
import { boundedExcerpt } from "./redact.mjs";

const NONPUBLIC_MATERIAL_PHRASES = ["mám interní dokument", "neveřejná smlouva", "uniklý e-mail", "uniklý email", "tajná nahrávka", "posílám přílohu", "posílám neveřejnou"];
const CONFIDENTIALITY_REQUEST_PHRASES = ["nechci zveřejnit své jméno", "nechci být jmenován", "prosím nezveřejňujte", "chci zůstat v anonymitě"];

function makeFlag(code, sourceField, text, index, matchLength) {
  const meta = FLAG_CATALOG[code];
  return {
    code,
    severity: meta.severity,
    category: meta.category,
    source_field: sourceField,
    evidence: { kind: "phrase_match", redacted_excerpt: boundedExcerpt(text, index, matchLength) },
    effect: meta.effect,
    explanation: EXPLANATIONS[code],
    detector_version: DETECTOR_VERSION,
  };
}

const EXPLANATIONS = {
  contains_nonpublic_material_claim: "Text tvrdí, že podání obsahuje nebo odkazuje na neveřejný/interní materiál.",
  contains_confidentiality_request: "Text obsahuje žádost o důvěrnost nebo anonymitu.",
};

function findPhrases(text, phrases, code, sourceField) {
  const lower = text.toLocaleLowerCase("cs-CZ");
  const flags = [];
  for (const phrase of phrases) {
    const index = lower.indexOf(phrase);
    if (index >= 0) flags.push(makeFlag(code, sourceField, text, index, phrase.length));
  }
  return flags;
}

export function detectSensitiveMaterialClaims(fields) {
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    flags.push(...findPhrases(text, NONPUBLIC_MATERIAL_PHRASES, "contains_nonpublic_material_claim", sourceField));
    flags.push(...findPhrases(text, CONFIDENTIALITY_REQUEST_PHRASES, "contains_confidentiality_request", sourceField));
  }
  return flags;
}
