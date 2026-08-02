# Risk classification (Phase 3)

Reference for `scripts/intake/risk/*`. See
`docs/adr/ADR-public-dossier-intake.md` for the architecture decision and
`docs/intake/local-processor.md` for the pipeline this plugs into.

**A risk flag is a pattern observation, never a conclusion.** The
classifier never asserts: the submission is false, the submitter is
lying, a crime occurred, a named person is the perpetrator, or a source
is untrustworthy (`docs/missions/intake/PHASE_003.md` §1.2). Every flag's
`explanation` says only that a pattern was found in the text — enforced
by `scripts/intake/risk/classify-intake-risk.test.mjs`'s explicit
assertion that no flag explanation ever claims something is confirmed,
true, or guilty.

## Flag shape

```json
{
  "code": "contains_possible_email_address",
  "severity": "high",
  "category": "privacy",
  "source_field": "description_text",
  "evidence": { "kind": "pattern_match", "redacted_excerpt": "jan**********@example.cz" },
  "effect": "security_review_required",
  "explanation": "Text obsahuje řetězec odpovídající e-mailové adrese.",
  "detector_version": "1.0.0"
}
```

## Severity and category

- `severity`: `info` | `low` | `medium` | `high` | `critical`. `critical`
  is rare and mechanically justified — only `contains_doxxing_pattern`
  uses it today.
- `category`: `privacy` | `security` | `editorial` | `legal_review` |
  `data_quality` | `workflow` | `abuse`. `legal_review` means "needs a
  human to look," never a legal conclusion.

## The 21 flags

All defined in `scripts/intake/risk/constants.mjs`'s `FLAG_CATALOG` —
the single place severity/category/effect are looked up, so a flag's
meaning can never drift between two detectors that emit it.

| Code | Detector | Effect |
|---|---|---|
| `missing_public_interest_basis` | `classify-intake-risk.mjs` (derived) | `needs_information` |
| `missing_source_urls` | `classify-intake-risk.mjs` (derived) | `needs_information` |
| `contains_nonpublic_material_claim` | `detect-sensitive-material-claims.mjs` | `security_review_required` |
| `contains_confidentiality_request` | `detect-sensitive-material-claims.mjs` | `manual_review` |
| `contains_possible_email_address` | `detect-personal-data.mjs` | `security_review_required` |
| `contains_possible_phone_number` | `detect-personal-data.mjs` | `security_review_required` |
| `contains_possible_postal_address` | `detect-personal-data.mjs` (heuristic) | `manual_review` |
| `contains_sensitive_personal_data_terms` | `detect-personal-data.mjs` (heuristic) | `security_review_required` |
| `contains_unnamed_source_language` | `detect-anonymous-source-language.mjs` | `manual_review` |
| `contains_serious_adverse_allegation_language` | `detect-adverse-allegation-language.mjs` | `manual_review` |
| `contains_criminal_allegation_language` | `detect-adverse-allegation-language.mjs` | `manual_review` |
| `contains_threat_language` | `detect-adverse-allegation-language.mjs` | `security_review_required` |
| `contains_doxxing_pattern` | `detect-adverse-allegation-language.mjs` | `security_review_required` |
| `contains_prompt_injection_language` | `detect-injection-markers.mjs` | `audit_only` |
| `contains_shell_instruction_language` | `detect-injection-markers.mjs` | `audit_only` |
| `contains_hidden_unicode_controls` | `detect-injection-markers.mjs` | `manual_review` |
| `contains_mass_mentions` | `detect-injection-markers.mjs` | `manual_review` |
| `possible_existing_subject` | `classify-intake-risk.mjs` (from matching) | `manual_review` |
| `possible_duplicate_intake` | `classify-intake-risk.mjs` (from duplicate detection) | `possible_duplicate` |
| `conflicting_entity_identifiers` | `classify-intake-risk.mjs` (from matching) | `manual_review` |
| `manual_security_review_required` | `classify-intake-risk.mjs` (roll-up) | `security_review_required` |

`manual_security_review_required` is not an independent detector — it is
added whenever any other flag's effect is already
`security_review_required`, as a single convenience summary. It never
appears alone.

## False positives (deliberately excluded, tested)

- "Článek pojednává o trestním právu obecně" (an article about criminal
  law as a subject) never triggers `contains_criminal_allegation_language`
  — the term list names specific alleged acts (`podvod`, `krádež`, …),
  never the general field of law.
- "Podle veřejné výroční zprávy…" (citing a named public document) never
  triggers `contains_unnamed_source_language`.
- A single inline code span (`` `git status` ``) is not flagged as high
  severity — `contains_shell_instruction_language` is `low`/`audit_only`
  by design, precisely because it has real false-positive exposure.

See `scripts/intake/risk/detect-*.test.mjs` for the executable versions
of every case above.

## Known limitation: substring matching, not morphology

Czech is a heavily inflected language; every phrase/term list here is
matched as a literal (case-folded) substring, not a stemmed or
lemmatized form. `"zpronevěra"` (nominative) will not match
`"zpronevěře"` (a declined form) in running text. This is a deliberate
scope decision (`docs/missions/intake/PHASE_003.md` §33: "Nevymýšlej ML
systém tam, kde stačí několik explicitních map a pravidel") — a real
morphological analyzer is out of scope for Phase 3. A small number of
common inflected forms were added where cheap (e.g. `"ulici"` alongside
`"ulice"` for the postal-address heuristic); this is not exhaustive.

## Redaction

`scripts/intake/risk/redact.mjs` — every piece of evidence a personal-data
detector emits is redacted before it reaches `evidence.redacted_excerpt`
(`jan**********@example.cz`, `+*** *** 456`, credentials stripped from a
URL). Phrase-based detectors (adverse language, injection markers) use a
bounded excerpt (`boundedExcerpt`, max 80 chars) instead — never the full
surrounding paragraph.

## Workflow precedence (§14.1)

```text
security_review_required > needs_information > possible_duplicate > (everything else → triage)
```

`scripts/intake/risk/constants.mjs`'s `EFFECT_PRECEDENCE` +
`EFFECT_TO_INTAKE_STATUS` implement this as one deterministic lookup —
never a chain of manually-ordered `if` statements duplicated per caller.
The resulting `workflow.intake_status` can only ever be one of `triage`,
`needs_information`, `possible_duplicate`, `security_review_required` —
`authorized`/`publishable`/`published` remain structurally absent from
the schema, unaffected by anything this classifier can produce.

## What this classifier never does

Decide the submission is true or false; decide the submitter is lying;
decide a crime occurred; name a perpetrator; judge source credibility;
authorize anything; publish anything; block a submission from being
retried after a human review clears it (that decision belongs entirely
to the human reviewer, outside Phase 3).
