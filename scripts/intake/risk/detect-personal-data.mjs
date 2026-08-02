// Privacy detectors (PHASE_003.md §13.5). Conservative on purpose: email
// and phone use a real pattern match; postal address and "sensitive
// personal data terms" are explicitly labeled heuristics (§5's
// "heuristika" language), never claimed as certain detections. Every
// regex here is a single bounded pass with no nested unbounded
// quantifiers (§15).
import { FLAG_CATALOG, DETECTOR_VERSION } from "./constants.mjs";
import { redactEmail, redactPhone } from "./redact.mjs";

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/g;
// A run of digits/spaces/dashes/dots with 9-13 total digits, optionally
// prefixed by +420 — bounded length, no backtracking risk (character
// class + fixed reasonable max repeat count).
const PHONE_PATTERN = /(?:\+\d{1,3}[\s.-]?)?(?:\d[\s.-]?){9,13}/g;
const POSTAL_CODE_PATTERN = /\b\d{3}\s?\d{2}\b/;
const STREET_KEYWORDS = ["ulice", "ulici", "ul.", "nám.", "náměstí", "č.p.", "čp.", "psč"];
const BIRTH_DATE_PATTERN = /\b\d{1,2}\.\s?\d{1,2}\.\s?(19|20)\d{2}\b/;
const HEALTH_TERMS = ["diagnóza", "zdravotní stav", "psychiatrick", "postižení", "onemocnění", "hiv pozitiv"];
const BIRTH_NUMBER_TERM = "rodné číslo";

function makeFlag(code, sourceField, redactedExcerpt) {
  const meta = FLAG_CATALOG[code];
  return {
    code,
    severity: meta.severity,
    category: meta.category,
    source_field: sourceField,
    evidence: { kind: "pattern_match", redacted_excerpt: redactedExcerpt },
    effect: meta.effect,
    explanation: EXPLANATIONS[code],
    detector_version: DETECTOR_VERSION,
  };
}

const EXPLANATIONS = {
  contains_possible_email_address: "Text obsahuje řetězec odpovídající e-mailové adrese.",
  contains_possible_phone_number: "Text obsahuje řetězec odpovídající telefonnímu číslu.",
  contains_possible_postal_address: "Text obsahuje kombinaci PSČ-like vzoru a ulicového klíčového slova (heuristika, ne jistota).",
  contains_sensitive_personal_data_terms: "Text obsahuje výraz odpovídající datu narození, rodnému číslu nebo zdravotnímu údaji.",
};

function detectEmails(text, sourceField) {
  const flags = [];
  for (const match of text.matchAll(EMAIL_PATTERN)) {
    flags.push(makeFlag("contains_possible_email_address", sourceField, redactEmail(match[0])));
  }
  return flags;
}

function detectPhones(text, sourceField) {
  const flags = [];
  for (const match of text.matchAll(PHONE_PATTERN)) {
    const digitCount = (match[0].match(/\d/g) ?? []).length;
    if (digitCount < 9 || digitCount > 13) continue;
    flags.push(makeFlag("contains_possible_phone_number", sourceField, redactPhone(match[0])));
  }
  return flags;
}

function detectPostalAddress(text, sourceField) {
  const lower = text.toLocaleLowerCase("cs-CZ");
  const hasKeyword = STREET_KEYWORDS.some((k) => lower.includes(k));
  const postalMatch = POSTAL_CODE_PATTERN.exec(text);
  if (hasKeyword && postalMatch) {
    return [makeFlag("contains_possible_postal_address", sourceField, "[PSČ-like]")];
  }
  return [];
}

function detectSensitiveTerms(text, sourceField) {
  const lower = text.toLocaleLowerCase("cs-CZ");
  const hasBirthDate = BIRTH_DATE_PATTERN.test(text) || lower.includes(BIRTH_NUMBER_TERM);
  const hasHealthTerm = HEALTH_TERMS.some((t) => lower.includes(t));
  if (hasBirthDate || hasHealthTerm) {
    return [makeFlag("contains_sensitive_personal_data_terms", sourceField, "[redacted]")];
  }
  return [];
}

// Runs all four privacy detectors over one {fieldName: text} map (the
// caller decides which submission fields to scan — see
// classify-intake-risk.mjs) and returns the combined flag list.
export function detectPersonalData(fields) {
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    flags.push(...detectEmails(text, sourceField), ...detectPhones(text, sourceField), ...detectPostalAddress(text, sourceField), ...detectSensitiveTerms(text, sourceField));
  }
  return flags;
}
