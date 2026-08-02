// Person-name normalization for matching (PHASE_003.md §5.3, §5.4). Never
// rewrites the raw name; produces a separate `comparisonName` plus
// explicit observations. Deliberately does NOT determine gender,
// nationality, birth surname, or "fix" a name — §5.3's forbidden list.
import { stripInvisibleControls, tokenize } from "./tokenize-name.mjs";

// Common Czech academic/professional titles (PHASE_003.md §5.4 — no such
// list existed elsewhere in the repo, checked before adding this one).
// Titles are stripped for comparison but never for the raw name, and
// never given more matching weight than an identity match itself.
const ACADEMIC_TITLES = [
  "Bc.", "Mgr.", "Ing.", "JUDr.", "MUDr.", "MVDr.", "PhDr.", "RNDr.", "PharmDr.",
  "Ph.D.", "CSc.", "DrSc.", "doc.", "prof.", "Th.D.", "ThLic.",
];

function stripTitles(tokens) {
  const found = [];
  const kept = tokens.filter((token) => {
    const isTitle = ACADEMIC_TITLES.some((title) => title.toLowerCase() === token.toLowerCase().replace(/,$/, ""));
    if (isTitle) found.push(token);
    return !isTitle;
  });
  return { kept, foundTitles: found };
}

// Returns { comparisonName, tokenOrderVariant, foundTitles, observations }.
// `comparisonName` is diacritic-preserving but case-folded and
// whitespace-collapsed — diacritics are semantically load-bearing in
// Czech names ("Novak" vs "Nováková" are not obviously the same token),
// so only case and whitespace are normalized away, per §5.3's explicit
// permission list (case conversion, whitespace collapse) and its
// explicit prohibition on inventing a diacritic-free "comparison variant"
// without evidence it's needed. `tokenOrderVariant` (surname-first vs
// given-name-first) is exposed separately, not folded into
// `comparisonName`, since §8.3 treats reordering as a distinct match
// signal, not a silent equivalence.
export function normalizePersonName(rawName) {
  const { cleaned, observations } = stripInvisibleControls(String(rawName ?? ""));
  const unicodeNormalized = cleaned.normalize("NFC");
  const rawTokens = tokenize(unicodeNormalized);
  const { kept, foundTitles } = stripTitles(rawTokens);
  const foldedTokens = kept.map((t) => t.toLocaleLowerCase("cs-CZ"));
  const comparisonName = foldedTokens.join(" ");
  const tokenOrderVariant = foldedTokens.length > 1 ? [...foldedTokens].reverse().join(" ") : comparisonName;
  return { comparisonName, tokenOrderVariant, tokens: foldedTokens, foundTitles, observations };
}
