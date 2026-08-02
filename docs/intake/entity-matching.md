# Entity matching, deduplication (Phase 3)

Reference for `scripts/intake/build-matching-index.mjs` and
`scripts/intake/matching/*` — candidate retrieval against this repo's
existing entity/dossier dataset, and duplicate-intake detection. See
`docs/adr/ADR-public-dossier-intake.md` for the architecture decision,
`reports/intake/phase-03-matching-inventory.md` for the underlying data
audit, and `docs/intake/local-processor.md` for the CLI this plugs into.

**Matching retrieves candidates. It never identifies a person.** Every
match carries `match_type`, `score`, `confidence_class`, `matched_fields`,
`conflicting_fields`, `reasons`, and `manual_review_required: true` —
always `true`, even for an exact identifier match. Nothing in this
subsystem ever sets `resolution_status` to anything asserting identity;
the strongest value it produces is `possible_matches`.

## Source data

Two canonical sources, read-only (`reports/intake/phase-03-matching-inventory.md`
has the full field-by-field audit):

- `data/dossiers/*/dossier.json` where `dossierType: "entity"` (23 rows)
  — already-authorized dossier subjects.
- `data/dossiers/_shared/entities/*.json` (503 rows, ~425 of them one of
  the five matchable `entityType`s) — the registry of context/discovered
  entities.

**Known data limitation, load-bearing for how to read match results**:
`alternateNames` and `externalIds` are populated on **0 of 503** shared
entities today. Alias matching and identifier matching are fully
implemented and tested (against a synthetic dataset), but against the
real dataset they currently only ever produce `no_match` — not because
the code is wrong, but because the data has nothing in those fields yet.
Name matching (exact/near) is the only layer with real signal against
today's data.

## Index

`scripts/intake/build-matching-index.mjs` (`npm run intake:index`) derives
one flat, deterministically-sorted JSON array from the two sources above
— a read-only artifact, never a new source of truth. Regenerate it any
time; nothing downstream depends on a stale copy being kept around
(`data/generated/intake-matching-index.json` is gitignored, matching
this repo's convention for every other build-generated file).

## Normalization

- `scripts/intake/matching/normalize-person-name.mjs` — case-folds and
  collapses whitespace; **preserves diacritics** (no invented
  diacritic-free comparison variant); strips a known academic title
  (`Bc.`, `Mgr.`, `Ing.`, …) for comparison while recording it separately;
  exposes a `tokenOrderVariant` (surname-first ⇄ given-name-first) as a
  distinct field, never silently folded into the main comparison name.
- `scripts/intake/matching/normalize-organization-name.mjs` — detects a
  legal-form suffix (`s.r.o.`, `a.s.`, `SE`, …) but keeps it IN the
  comparison string — `"Příklad, a.s."` and `"Příklad, s.r.o."` stay
  distinguishable, never collapsed.
- `scripts/intake/matching/normalize-identifier.mjs` — Czech IČO checksum
  validation (mod-11). An invalid-checksum IČO is never used as identity
  evidence.
- Zero-width and bidi-control Unicode characters are detected and
  reported as an observation (never silently stripped) by
  `scripts/intake/matching/tokenize-name.mjs`'s `stripInvisibleControls`.

## Match classes and confidence

| `match_type` | `confidence_class` | Meaning |
|---|---|---|
| `exact_identifier` | `very_high` | A validated identifier (e.g. IČO) is equal on both sides. |
| `exact_alias` | `high` | Equals a canonically-stored alias — never a guessed nickname. |
| `exact_canonical_name` | `medium` (person) / `medium`–`high` (org, higher if legal form also matches) | Normalized names equal. |
| `token_equivalent` | `medium` | A 2-token name matches after reversing token order only. |
| `near_name` | `low` | Bounded-Levenshtein similarity ≥ 0.72 (`UNVALIDATED_HEURISTIC.nearNameFloor` — see Thresholds). |
| `conflicting_identifier` | `conflict` | Name matches strongly, but a validated identifier both sides carry **differs**. Never presented as a probable match. |

`NO_MATCH`/`AMBIGUOUS` are not per-match types — they are the candidate's
overall `resolution_status` (`scripts/intake/matching/match-entities.mjs`'s
`resolveCandidate`): `no_match`, `possible_matches`, `ambiguous` (two or
more top matches within 0.03 of each other at the same confidence class
— never auto-picks the higher one), or `conflicting_identifiers`.

## Scoring

Every score is a sum of **named** components
(`scripts/intake/matching/score-name-match.mjs`) — `{rule, weight, value,
contribution}` — scoped to the chosen `match_type` only (an
`exact_identifier` match's score never gets a bonus from an unrelated
near-name signal that happened to also be true; see that module's
"scoped to the CHOSEN match_type" comment for why this matters).
Forbidden signals (§7.2 of the mission): claim count, case count, media
coverage, relation count, authorization status, popularity, search rank,
dossier completeness — none of these appear anywhere in scoring.

### Thresholds — `UNVALIDATED_HEURISTIC`

No Phase 1 calibration data exists, so every threshold in
`score-name-match.mjs`'s `UNVALIDATED_HEURISTIC` is explicitly labeled as
such and used **only** for candidate ranking/retrieval — never for
automatic merge or resolution.

## Candidate extraction

`scripts/intake/matching/extract-candidates.mjs` — no NER, no LLM. Exactly
one candidate per submission, from `submission.subject_text` alone, plus
an IČO pattern (checksum-validated) from `identifiers_text` if present. A
valid IČO sets `candidate_type: "organization"`; otherwise `"unknown"` —
a name alone never implies `"person"`.

## Candidate filtering (performance)

`scripts/intake/matching/match-entities.mjs`'s `retrieveCandidateEntities`
never scans the full index for near-name similarity. Three cheap
lookups feed it: an identifier map, an exact-name/alias map, and a
surname/first-token bucket (diacritic-folded for the bucket KEY only —
comparison itself stays diacritic-preserving, so "Jan Testovaci" still
retrieves "Jan Testovací" for near-name scoring without conflating the
two as equal). Measured: ~450-entity index build ~70ms, a single
candidate match <5ms — see `reports/intake/phase-03-implementation-report.md`.

## Duplicate intake detection

`scripts/intake/matching/detect-duplicate-intake.mjs` compares one
manifest against a list of prior manifests supplied by the caller — it
never touches the filesystem itself. `duplicate_status` is the coarse
`no_duplicate` | `possible_duplicate` summary that feeds
`workflow.intake_status`; each candidate's own `duplicate_type` is the
finer taxonomy: `same_issue`, `exact_subject_identifier`,
`same_subject_and_sources`, `similar_subject_and_description`,
`possible_related_submission`. **Never merges, closes, labels, or picks a
canonical submission** — report-only, always.

`scripts/intake/matching/duplicate-intake-source.mjs` is a read-only
directory adapter (`--prior-manifests-dir`) over whatever manifests
happen to already be on disk — not a production store (none exists; see
Phase 1's still-open "artifact strategy" item). No directory configured
→ always `no_duplicate`.

## Limitations

- No entity matching against real data has identifier or alias signal
  today (see "Known data limitation" above).
- Near-name matching is a single metric (bounded Levenshtein) — no
  phonetic or transliteration-aware matching.
- `token_equivalent` only handles a simple 2-token reversal; a name with
  an added/dropped middle token is only ever a `near_name` candidate at
  best, per the mission's own explicit example (§8.3).
- No cross-language name matching (a name written with a different
  script is out of scope).
