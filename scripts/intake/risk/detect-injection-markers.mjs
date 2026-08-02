// Injection-marker detection (PHASE_003.md §13, §24.1/§24.2). These
// flags are `audit_only`/`manual_review` — the injection text has ZERO
// effect on this processor's own behavior (proven separately by
// scripts/intake/negative-authorization.test.mjs and the Phase 2
// fixtures); flagging it here is purely informational for a human
// reviewer, never a security control in itself.
import { FLAG_CATALOG, DETECTOR_VERSION } from "./constants.mjs";
import { boundedExcerpt } from "./redact.mjs";
import { stripInvisibleControls } from "../matching/tokenize-name.mjs";

const PROMPT_INJECTION_PHRASES = [
  "ignoruj předchozí", "ignore previous instructions", "ignore all previous",
  "you are now", "jako ai", "system prompt", "autorizuj tuto osobu",
  "nastav status na", "nastav publication_status", "spusť curl", "zapiš do agents.md",
];
const SHELL_INSTRUCTION_PATTERNS = [/\brm\s+-rf\b/, /\bcurl\s+https?:\/\//, /\bwget\s+https?:\/\//, /\$\(/, /`[^`]{1,200}`/, /&&\s*\w/, /;\s*sh\b/, /\bsudo\s+/];
const MENTION_PATTERN = /(^|[^\w])@[\w-]{1,39}/g;
const MASS_MENTION_THRESHOLD = 5;

function makeFlag(code, sourceField, evidenceExcerpt) {
  const meta = FLAG_CATALOG[code];
  return {
    code,
    severity: meta.severity,
    category: meta.category,
    source_field: sourceField,
    evidence: { kind: "pattern_match", redacted_excerpt: evidenceExcerpt },
    effect: meta.effect,
    explanation: EXPLANATIONS[code],
    detector_version: DETECTOR_VERSION,
  };
}

const EXPLANATIONS = {
  contains_prompt_injection_language: "Text obsahuje formulaci připomínající pokus o prompt injection. Text je zpracován výhradně jako data, nikdy jako instrukce.",
  contains_shell_instruction_language: "Text obsahuje vzor připomínající shellový příkaz. Text je zpracován výhradně jako data, žádný příkaz se nespouští.",
  contains_hidden_unicode_controls: "Text obsahuje neviditelné Unicode řídicí znaky (zero-width nebo bidi control).",
  contains_mass_mentions: "Text obsahuje neobvykle vysoký počet @mentions.",
};

function detectPromptInjection(fields) {
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    const lower = text.toLocaleLowerCase("cs-CZ");
    for (const phrase of PROMPT_INJECTION_PHRASES) {
      const index = lower.indexOf(phrase);
      if (index >= 0) flags.push(makeFlag("contains_prompt_injection_language", sourceField, boundedExcerpt(text, index, phrase.length)));
    }
  }
  return flags;
}

function detectShellInstructions(fields) {
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    for (const pattern of SHELL_INSTRUCTION_PATTERNS) {
      const match = pattern.exec(text);
      if (match) flags.push(makeFlag("contains_shell_instruction_language", sourceField, boundedExcerpt(text, match.index, match[0].length)));
    }
  }
  return flags;
}

function detectHiddenUnicodeControls(fields) {
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    const { observations } = stripInvisibleControls(text);
    if (observations.length > 0) flags.push(makeFlag("contains_hidden_unicode_controls", sourceField, `[${observations.join(", ")}]`));
  }
  return flags;
}

function detectMassMentions(fields) {
  const flags = [];
  for (const [sourceField, text] of Object.entries(fields)) {
    if (!text) continue;
    const count = (text.match(MENTION_PATTERN) ?? []).length;
    if (count > MASS_MENTION_THRESHOLD) flags.push(makeFlag("contains_mass_mentions", sourceField, `[${count} @mentions]`));
  }
  return flags;
}

export function detectInjectionMarkers(fields) {
  return [...detectPromptInjection(fields), ...detectShellInstructions(fields), ...detectHiddenUnicodeControls(fields), ...detectMassMentions(fields)];
}
