// Adverse-allegation language detection (PHASE_003.md §13.2, §13,
// "Adverse language" test matrix in §20). Every flag here says only that
// a phrase was FOUND — never that the underlying allegation is true.
// False-positive discipline (§20 "False positives"): a term like
// "trestní právo" (criminal law, as a field of law) is NOT on these
// lists — only phrases that name a specific alleged act.
import { FLAG_CATALOG, DETECTOR_VERSION } from "./constants.mjs";
import { boundedExcerpt } from "./redact.mjs";

// §13.2's own example list, kept as-is — deliberately short and
// specific rather than a broad "anything sounding legal" net.
const CRIMINAL_ALLEGATION_TERMS = ["krádež", "podvod", "úplatek", "úplatkářství", "korupce", "trestný čin", "zpronevěra", "vydírání"];
const SERIOUS_ADVERSE_TERMS = ["znásilnění", "vražda", "domácí násilí", "sexuální zneužívání", "týrání"];
const THREAT_PHRASES = ["vyhrožoval", "pohrozil zabitím", "zabiju ho", "zabiju ji", "zničím ho", "zničím ji", "postarám se, aby litoval"];
const DOXXING_PHRASES = ["zveřejněte jeho adresu", "zveřejněte její adresu", "ať všichni vědí, kde bydlí", "chci, aby všichni věděli, kde bydlí", "zveřejněte jeho telefon"];

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
  contains_criminal_allegation_language: "Text obsahuje formulaci odpovídající trestněprávnímu obvinění. Toto NENÍ potvrzení, že k trestnému činu došlo.",
  contains_serious_adverse_allegation_language: "Text obsahuje formulaci závažného nepříznivého obvinění. Toto NENÍ potvrzení pravdivosti.",
  contains_threat_language: "Text obsahuje formulaci odpovídající vyhrožování.",
  contains_doxxing_pattern: "Text obsahuje formulaci odpovídající požadavku na zveřejnění soukromých údajů o třetí osobě (doxxing).",
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

export function detectAdverseAllegationLanguage(fields) {
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    flags.push(...findPhrases(text, CRIMINAL_ALLEGATION_TERMS, "contains_criminal_allegation_language", sourceField));
    flags.push(...findPhrases(text, SERIOUS_ADVERSE_TERMS, "contains_serious_adverse_allegation_language", sourceField));
    flags.push(...findPhrases(text, THREAT_PHRASES, "contains_threat_language", sourceField));
    flags.push(...findPhrases(text, DOXXING_PHRASES, "contains_doxxing_pattern", sourceField));
  }
  return flags;
}
