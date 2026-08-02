// Small, deterministic tokenizer shared by person/organization name
// normalization (PHASE_003.md §5). Splits on whitespace after the
// caller has already done its own case/diacritic handling — this module
// only handles the whitespace/Unicode-control layer common to both.
//
// Character classes are built from explicit \uXXXX escapes, never a
// literal invisible character typed into source — a literal zero-width
// or bidi-control character embedded in a regex is unauditable (it is
// indistinguishable from nothing in most editors and diff views).
const ZERO_WIDTH_POINTS = ["200B", "200C", "200D", "2060", "FEFF", "00AD"]; // space, non-joiner, joiner, word joiner, BOM, soft hyphen
const BIDI_CONTROL_POINTS = ["200E", "200F", "202A", "202B", "202C", "202D", "202E", "2066", "2067", "2068", "2069"];
const NON_BREAKING_SPACE_POINT = "00A0";

function classFromCodePoints(points) {
  return points.map((p) => `\\u${p}`).join("");
}

const ZERO_WIDTH = new RegExp(`[${classFromCodePoints(ZERO_WIDTH_POINTS)}]`, "g");
const BIDI_CONTROLS = new RegExp(`[${classFromCodePoints(BIDI_CONTROL_POINTS)}]`, "g");
const NON_BREAKING_SPACE = new RegExp(`\\u${NON_BREAKING_SPACE_POINT}`, "g");

// Returns { cleaned, observations } — observations records what was
// found (zero-width / bidi-control characters), never silently drops the
// finding (PHASE_003.md §5.2: "neodstraňuj potichu, přidej observation").
// The characters themselves ARE removed from `cleaned` (they are
// zero-visual-width by definition, so removing them cannot change what a
// human reads) — but the fact of their presence is preserved as data.
export function stripInvisibleControls(text) {
  const observations = [];
  if (ZERO_WIDTH.test(text)) observations.push("contains_zero_width_characters");
  if (BIDI_CONTROLS.test(text)) observations.push("contains_bidi_control_characters");
  const cleaned = text.replace(ZERO_WIDTH, "").replace(BIDI_CONTROLS, "").replace(NON_BREAKING_SPACE, " ");
  return { cleaned, observations };
}

export function tokenize(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}
