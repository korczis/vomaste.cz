// Unnamed-source language detection (PHASE_003.md §13.3). Flags the
// PATTERN of an unnamed source, never the truth of what they allegedly
// said. "podle veřejné výroční zprávy" (§20's own false-positive
// example) is deliberately absent from the list — citing a named public
// document is not anonymous-source language.
import { FLAG_CATALOG, DETECTOR_VERSION } from "./constants.mjs";
import { boundedExcerpt } from "./redact.mjs";

const ANONYMOUS_SOURCE_PHRASES = [
  "můj známý říkal",
  "můj známý z úřadu",
  "interní zdroj",
  "člověk z firmy",
  "nemohu říct kdo",
  "anonymní svědek",
  "anonymní zaměstnanec",
  "nechci uvést jméno zdroje",
  "zdroj si nepřeje být jmenován",
];

export function detectAnonymousSourceLanguage(fields) {
  const meta = FLAG_CATALOG.contains_unnamed_source_language;
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    const lower = text.toLocaleLowerCase("cs-CZ");
    for (const phrase of ANONYMOUS_SOURCE_PHRASES) {
      const index = lower.indexOf(phrase);
      if (index < 0) continue;
      flags.push({
        code: "contains_unnamed_source_language",
        severity: meta.severity,
        category: meta.category,
        source_field: sourceField,
        evidence: { kind: "phrase_match", redacted_excerpt: boundedExcerpt(text, index, phrase.length) },
        effect: meta.effect,
        explanation: "Text obsahuje formulaci odpovídající nejmenovanému zdroji.",
        detector_version: DETECTOR_VERSION,
      });
    }
  }
  return flags;
}
