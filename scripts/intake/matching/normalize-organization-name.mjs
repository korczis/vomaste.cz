// Organization-name normalization for matching (PHASE_003.md §5.5). Legal
// form is separated out but never discarded from comparison — "Příklad,
// a.s." and "Příklad, s.r.o." must stay distinguishable, so
// `comparisonName` keeps the legal form token; `legalForm` is reported
// alongside for callers that want to reason about it explicitly (e.g. a
// future score component), never applied as an automatic ignore.
import { stripInvisibleControls, tokenize } from "./tokenize-name.mjs";

// Legal-form suffixes actually meaningful for Czech/EU entities
// (PHASE_003.md §5.5's own example list — nothing invented beyond it).
const LEGAL_FORMS = ["s.r.o.", "a.s.", "z.s.", "o.p.s.", "se", "v.o.s.", "k.s.", "z.ú.", "spol. s r.o."];

function detectLegalForm(normalizedTail) {
  for (const form of LEGAL_FORMS) {
    const formFolded = form.toLocaleLowerCase("cs-CZ");
    if (normalizedTail === formFolded || normalizedTail.endsWith(` ${formFolded}`) || normalizedTail.endsWith(`,${formFolded}`) || normalizedTail.endsWith(`, ${formFolded}`)) {
      return form;
    }
  }
  return null;
}

// Returns { comparisonName, legalForm, observations }. `comparisonName`
// folds case/whitespace/punctuation-around-commas but keeps the legal
// form IN the string (never stripped for comparison — §5.5: "neignoruj
// automaticky suffix, pokud by to vytvářelo kolize").
export function normalizeOrganizationName(rawName) {
  const { cleaned, observations } = stripInvisibleControls(String(rawName ?? ""));
  const unicodeNormalized = cleaned.normalize("NFC");
  const collapsed = tokenize(unicodeNormalized.replace(/,/g, " ").replace(/\s+/g, " ")).join(" ");
  const folded = collapsed.toLocaleLowerCase("cs-CZ");
  const legalForm = detectLegalForm(folded);
  return { comparisonName: folded, legalForm, observations };
}
