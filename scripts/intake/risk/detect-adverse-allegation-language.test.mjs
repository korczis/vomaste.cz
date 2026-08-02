import { test } from "node:test";
import assert from "node:assert/strict";
import { detectAdverseAllegationLanguage } from "./detect-adverse-allegation-language.mjs";

test("detects criminal allegation language", () => {
  // §15/§13.2: substring matching, not morphological stemming — the
  // fixture text keeps the term in its base/accusative-identical form
  // ("podvod" is an inanimate masculine noun, so nominative = accusative)
  // rather than a heavily declined case form a stemmer would be needed
  // for; see docs/intake/risk-classification.md's documented limitation.
  const flags = detectAdverseAllegationLanguage({ description_text: "Podle dokumentů šlo o podvod s veřejnými prostředky." });
  assert.ok(flags.some((f) => f.code === "contains_criminal_allegation_language"));
});

test("detects serious adverse allegation language", () => {
  const flags = detectAdverseAllegationLanguage({ description_text: "Bývalá partnerka popsala dlouhodobé domácí násilí." });
  assert.ok(flags.some((f) => f.code === "contains_serious_adverse_allegation_language"));
});

test("detects threat language", () => {
  const flags = detectAdverseAllegationLanguage({ description_text: "Svědek uvedl, že jí vyhrožoval." });
  assert.ok(flags.some((f) => f.code === "contains_threat_language"));
});

test("detects a doxxing pattern", () => {
  const flags = detectAdverseAllegationLanguage({ description_text: "Chci, aby všichni věděli, kde bydlí." });
  assert.ok(flags.some((f) => f.code === "contains_doxxing_pattern"));
});

// §20's own explicit false-positive requirement.
test("false positive: a neutral article about criminal law in general does not trigger a criminal allegation flag", () => {
  const flags = detectAdverseAllegationLanguage({ description_text: "Článek pojednává o trestním právu obecně." });
  assert.deepEqual(flags, []);
});

test("false positive: citing a named public annual report is not anonymous-source or adverse language", () => {
  const flags = detectAdverseAllegationLanguage({ description_text: "Podle veřejné výroční zprávy firma zvýšila obrat." });
  assert.deepEqual(flags, []);
});

test("false positive: vague, non-specific criticism is not flagged as a criminal allegation", () => {
  const flags = detectAdverseAllegationLanguage({ description_text: "Mnozí občané jsou s jeho prací nespokojeni." });
  assert.deepEqual(flags, []);
});

test("no flag ever asserts the allegation is true — explanation text says only that language was found", () => {
  const flags = detectAdverseAllegationLanguage({ description_text: "Došlo k podvodu." });
  for (const flag of flags) {
    assert.doesNotMatch(flag.explanation.toLowerCase(), /potvrzen[oáý]|je pravd/);
  }
});
