# Phase 3 — Implementation report

**Datum**: 2026-08-02 · **Stav**: VERIFIED
**Mise**: [docs/missions/intake/PHASE_003.md](../../docs/missions/intake/PHASE_003.md) · **ADR**: [docs/adr/ADR-public-dossier-intake.md](../../docs/adr/ADR-public-dossier-intake.md)
**Base commit**: `9a46527ed5de712e8975fd55912e98add8417fa8` (master, Phase 2 merged)

## Phase 2 baseline

```text
PHASE_02_BASELINE = PASS
INTAKE_FIXTURE    = PASS (npm run intake:fixture)
INTAKE_TESTS      = PASS (121/121, pre-Phase-3)
FULL_BUILD        = PASS
```

Working tree was clean at the start of this phase (`task/INTAKE` worktree,
same as Phase 2's).

## Matching inventory

See `reports/intake/phase-03-matching-inventory.md` in full. Headline
finding: `alternateNames`/`externalIds` are populated on **0 of 503**
shared entities — alias and identifier matching are fully implemented
and tested against a synthetic dataset, but have no real signal to match
against today. Name matching (exact/near) is the only layer with real
signal against the current dataset.

## Matching index

`scripts/intake/build-matching-index.mjs` (`npm run intake:index`) —
Variant B (dedicated read-only builder; no reusable generated index with
matching-shaped fields existed). 448 entities as of base commit: 23
entity-dossier subjects (`dossierType: "entity"`, excludes the
`macinka-turek` aggregate) + 425 shared registry entities of the five
matchable `entityType`s (excludes `controversy`/`event`/
`legal_or_administrative_process`/`role`). Deterministic, stably sorted
by `entity_type` then `entity_id`; `data/generated/intake-matching-index.json`
(gitignored, matching every other build-generated artifact in this repo).

## Scoring decisions

Explainable, named components (`scripts/intake/matching/score-name-match.mjs`).
Bounded normalized Levenshtein (max 200 chars compared) is the sole
near-name metric — not an "algorithmic buffet" (§8's own phrase).
Thresholds (`UNVALIDATED_HEURISTIC` — near-name floor 0.72, per-rule
weights) are explicitly labeled unvalidated (no Phase 1 calibration data
existed) and used only for ranking/retrieval, never automatic merge.

**Bug found and fixed during implementation**: the first version of
`evaluatePair` (in `match-entities.mjs`) computed score components from
every true signal (identifier equal, name equal, near-name similarity,
…) regardless of which `match_type` was ultimately chosen — so an
`exact_identifier` match against an entity with a slightly different
name got a spurious `near_name_similarity` component added to its score.
Fixed by scoping components to exactly the chosen `match_type` (see that
function's comment). Caught by manual verification against real data
(`"Příklad, a.s."` querying an index with `"Příklad, s.r.o."`'s IČO),
not by an automated test that happened to exercise this path — a
regression test now covers the redundant-signal-suppression behavior
implicitly via the `match-entities.test.mjs` conflict/exact-identifier
cases.

## Risk taxonomy

21 flags, `scripts/intake/risk/constants.mjs`'s `FLAG_CATALOG` — full
table in `docs/intake/risk-classification.md`. Every flag: `code`,
`severity` (5-value enum), `category` (7-value enum), `source_field`,
`evidence` (redacted), `effect`, `explanation`, `detector_version`.
Deterministic §14.1 precedence
(`security_review_required > needs_information > possible_duplicate >
triage`) via one lookup table, not per-caller `if` chains.

## False positives

Explicitly tested (§20's own requirement), all pass:

- "Článek pojednává o trestním právu obecně" → no criminal-allegation flag.
- "Podle veřejné výroční zprávy…" → no anonymous-source flag.
- A single inline code span → `contains_shell_instruction_language` stays
  `low`/`audit_only`, never escalated.

**Known limitation, documented in `docs/intake/risk-classification.md`**:
phrase lists are literal substring matches, not morphologically stemmed
— Czech's case declension means some inflected forms of a term will not
match. A handful of common inflections were added where cheap (e.g.
`"ulici"` alongside `"ulice"`); this is not exhaustive by design (§33:
"Nevymýšlej ML systém tam, kde stačí několik explicitních map a
pravidel").

## Performance

Measured against the real ~450-entity dataset:

| Operation | Time |
|---|---|
| Matching index build | 73 ms |
| Index lookup structures build | 3 ms |
| Single candidate match | <1 ms |
| 10× candidate match (repeated) | 1 ms |
| Risk classification over a max-length (20,000 char) description | 3 ms |

All well within §22's targets (index build linear/n·log n for a
few-thousand-entity dataset; single-candidate matching well under 1s;
risk classification linear in text length). Candidate filtering
(identifier map / exact-name map / surname-bucket) is what keeps
near-name matching from ever scanning the full index — confirmed by
`match-entities.test.mjs`'s `total_candidates_considered` assertion.

## Schema changes

`schemas/intake/intake-manifest.schema.json`: `schema_version` `0.1.0` →
`0.2.0`. New required top-level sections: `matching`,
`duplicate_detection`, `risk_classification`, `workflow_decision`.
`proposed_authorization_scope.subject_candidates[]` gained
`extracted_identifiers` and a real `resolution_status` enum (was a
Phase-2-only `const: "unresolved"`). `workflow.intake_status` enum
gained `possible_duplicate`/`security_review_required`.
`authorization_status`/`publication_status` remain unchanged `const`s —
Phase 3 adds no new authorization/publication surface at all.

## Tests

| Area (PHASE_003.md §19-§21) | File(s) | Count |
|---|---|---|
| IČO checksum | `matching/normalize-identifier.test.mjs` | 5 |
| Person-name normalization (diacritics, titles, Unicode, token order) | `matching/normalize-person-name.test.mjs` | 12 |
| Organization-name normalization (legal form) | `matching/normalize-organization-name.test.mjs` | 5 |
| Identifier comparison | `matching/compare-identifiers.test.mjs` | 5 |
| Scoring (bounded similarity, components) | `matching/score-name-match.test.mjs` | 7 |
| Ranking (stability, tiebreaks) | `matching/rank-candidates.test.mjs` | 5 |
| Candidate extraction | `matching/extract-candidates.test.mjs` | 7 |
| Matcher — exact/normalized/conflict/near/ambiguity/limits (§19) | `matching/match-entities.test.mjs` | 19 |
| Matching index — shape, determinism, real-data sanity | `build-matching-index.test.mjs` | 5 |
| Duplicate detection | `matching/detect-duplicate-intake.test.mjs` | 8 |
| Privacy detectors | `risk/detect-personal-data.test.mjs` | 7 |
| Adverse-allegation detectors + false positives | `risk/detect-adverse-allegation-language.test.mjs` | 8 |
| Anonymous-source detector + false positives | `risk/detect-anonymous-source-language.test.mjs` | 4 |
| Nonpublic-material/confidentiality detectors | `risk/detect-sensitive-material-claims.test.mjs` | 4 |
| Injection-marker detectors + false positives | `risk/detect-injection-markers.test.mjs` | 9 |
| Risk orchestration, precedence, determinism | `risk/classify-intake-risk.test.mjs` | 12 |
| **Phase 3 total** | 16 files | **122** |
| Phase 2 (updated for the new `buildIntakeManifest` signature + a negative-authorization refinement) | — | 122 |
| **Combined `npm run test:intake`** | 27 files | **244** |

## Commands run

```text
npm run intake:fixture       → OK
npm run intake:match-fixture → OK
npm run intake:index         → OK (448 entities)
npm run test:intake          → 244/244 pass
npm run build                → OK
git diff --check             → clean
git diff -- AGENTS.md data/authorizations.toml .github/workflows → empty
```

Manual real-data verification (not a permanent test, but recorded here
as it surfaced a genuine data-quality finding): querying the matcher
with subject `"Andrej Babiš"` against the real dataset returns
`resolution_status: "ambiguous"` — two distinct entities
(`andrej-babis`, the dossier subject, and `babis`, a separate shared
registry entity) share the exact canonical name `"Andrej Babiš"`. This
is exactly the kind of finding candidate matching exists to surface;
Phase 3 does not and must not fix it (§1.5 — no production data
changes), it is left here as a note for whoever next touches entity
deduplication in this dataset.

## Security guarantees

- **Offline**: no network access anywhere in `scripts/intake/matching/`
  or `scripts/intake/risk/` — covered by the existing
  `network-guard.test.mjs` (which walks the whole `scripts/intake/` tree
  recursively, so Phase 3's subdirectories were covered without
  modification) plus a dedicated timing assertion in
  `matching/score-name-match.test.mjs`.
- **No production writes**: `negative-authorization.test.mjs` was
  extended with a precise test pinning `data/dossiers` references to
  exactly one file (`build-matching-index.mjs`, read-only) — everything
  else in `scripts/intake/` is asserted to never mention that path at
  all, and that one file is asserted to never pair the path with a write
  primitive.
- **No new authorization/publication surface**: `workflow.intake_status`'s
  two new enum values (`possible_duplicate`, `security_review_required`)
  are still fully disjoint from `authorized`/`publishable`/`published`,
  which remain structurally absent from the schema.
- **Risk flags never assert truth**: every detector's `explanation` was
  checked (`classify-intake-risk.test.mjs`) to never claim something is
  confirmed, true, or that guilt has been established.

## Files changed

Created: `scripts/intake/build-matching-index.mjs` (+test),
`scripts/intake/matching/*.mjs` (11 modules + 11 test files),
`scripts/intake/risk/*.mjs` (7 modules + 6 test files),
`docs/intake/entity-matching.md`, `docs/intake/risk-classification.md`,
`reports/intake/phase-03-matching-inventory.md`, this report.

Modified: `schemas/intake/intake-manifest.schema.json` (Phase 3
sections), `scripts/intake/constants.mjs` (schema version bump),
`scripts/intake/build-intake-manifest.mjs` (new params, enriched
`subject_candidates`), `scripts/intake/process-issue.mjs` (matching +
duplicate + risk wiring, two new CLI flags),
`scripts/intake/render-intake-report.mjs` (three new §17 sections),
`scripts/intake/build-intake-manifest.test.mjs` /
`render-intake-report.test.mjs` (updated for the new
`buildIntakeManifest` signature), `scripts/intake/negative-authorization.test.mjs`
(refined `data/dossiers` check), `docs/intake/intake-manifest.md` /
`local-processor.md` (Phase 3 updates), `package.json` (4 new scripts,
2 new test globs), `docs/adr/ADR-public-dossier-intake.md` (decision-log
entry, status stays PROPOSED).

No change to `AGENTS.md`, `data/authorizations.toml`,
`.github/workflows/`, `scripts/data/validate.mjs`, `scripts/dossier/*`,
or any file under `data/dossiers/**`/`content/**`.

## Deviations from Phase 1/2

See the ADR's 2026-08-02 Phase 3 decision-log entry for the three
documented deviations (binary `duplicate_status` vs. §11.2's six-value
taxonomy at the top level; `conflicting_identifier` matches always score
0 with no components; diacritic-folded bucket keys for near-name
retrieval).

## Known limitations

- Alias/identifier matching has no real signal against today's dataset
  (0/503 entities have `alternateNames`/`externalIds` populated) — code
  works, data doesn't have the fields yet.
- Near-name matching is single-metric (bounded Levenshtein); no
  phonetic/transliteration matching.
- Risk-classification phrase lists are substring matches, not
  morphologically aware — see `docs/intake/risk-classification.md`.
- `token_equivalent` only handles simple 2-token reversal, per §8.3's
  own scope.
- Duplicate detection has no real prior-manifest store to compare
  against by default (`--prior-manifests-dir` is opt-in) — Phase 1's
  "artifact strategy" question is still open.

## Phase 4 contract

Phase 4 (safe URL preflight, SSRF hardening) receives:

- **Syntactically normalized URLs**: `normalization.normalized_source_urls[]`
  from Phase 2, untouched by Phase 3 — `{raw, normalized,
  syntax_observations}`. Phase 4 is the first phase allowed to actually
  resolve DNS or open a connection to these.
- **Risk flags from Phase 3**: in particular, any URL-adjacent
  `syntax_observations` (`possible_localhost`, `possible_ip_literal`,
  `contains_credentials`, `unsupported_protocol`) that Phase 2 already
  recorded — Phase 4's SSRF hardening should treat these as a
  pre-filter, not re-derive them.
- **A manifest that is still fully blocked**: `workflow.publication_status
  === "blocked"` always; Phase 4 must not change this.
- **An offline manifest** — Phase 4 is the one phase in this whole
  mission actually permitted to make network requests, and must define
  its own DNS-rebinding-safe pinned-IP verification, redirect policy
  (whether to follow at all, and how many hops), timeout, response-size
  limit, and content-type allowlist before doing so; none of that exists
  yet. Needs its own explicit threat model addendum, not an assumption
  carried over from Phase 3.
- **No credentials, no raw attachments**: nothing in the manifest ever
  carries a secret or a file upload — Phase 2's URL-credential detection
  already strips nothing but *flags* embedded credentials
  (`contains_credentials`); Phase 4 should treat a URL bearing that flag
  as a hint to never pass the credentials through to any outbound
  request it makes.
