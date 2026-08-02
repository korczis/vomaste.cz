# Phase 2 — Implementation report

**Datum**: 2026-08-02 · **Stav**: VERIFIED
**Mise**: [docs/missions/intake/PHASE_002.md](../../docs/missions/intake/PHASE_002.md) · **ADR**: [docs/adr/ADR-public-dossier-intake.md](../../docs/adr/ADR-public-dossier-intake.md)
**Base commit**: `9de64a1ff28d95d8821a4bde7fb5c55d2a94c29f` (worktree `task/INTAKE`, branched from `master`)

## Phase 1 inputs

Read in full before implementing: `docs/adr/ADR-public-dossier-intake.md`,
`reports/intake/phase-01-{repository-audit,architecture-inventory,threat-model,implementation-plan}.md`,
`docs/missions/intake/{PHASE_001..006,VOMASTE,README}.md`. Phase 1's own
Phase-2 contract (implementation-plan.md, "Fáze 2" section) matched what
was implemented; no PARTIAL/missing-contract branch was needed.

## Chosen schema version

`schema_version: "0.1.0"` (still experimental per ADR §23.1 — the owner
has not accepted the manifest model as stable, so this stays below
`1.0.0`). `form_version: "vomaste-intake-form:v1"`.
`generator_version: "1.0.0"`, `parser_version: "1.0.0"` (the *processor's*
own release numbering, independent of the manifest schema).

## Implemented modules

```text
schemas/intake/
  intake-event.schema.json       — minimal GitHub-issue-event adapter input
  intake-manifest.schema.json    — full intake manifest, workflow enum restricted to Phase-2-producible values

scripts/intake/
  constants.mjs                  — limits, enums, form-v1 heading/label maps, exit codes
  errors.mjs                     — IntakeError + stable error-code list
  canonical-json.mjs             — key-order-independent JSON serialization
  hash.mjs                       — SHA-256 input hash / manifest self-hash-exclusion
  load-event.mjs                 — safe event file load (regular-file/symlink/size/JSON checks)
  detect-form.mjs                — first-line marker recognition, fail-closed on unknown version
  parse-issue-form.mjs           — heading-based section parser for vomaste-intake-form:v1
  validate-submission.mjs        — text limits, submission type, acknowledgements, URL count/length
  normalize-submission.mjs       — text normalization + syntactic URL extraction/classification
  build-intake-manifest.mjs      — ID generation + manifest assembly (hardcoded authorization/publication consts)
  validate-manifest.mjs          — standalone manifest-schema CLI (npm run intake:validate)
  render-intake-report.mjs       — Markdown report, fenced-block escaping
  process-issue.mjs              — CLI orchestrator: arg parsing, pipeline, atomic output writer, exit codes
  run-fixture.mjs                — npm run intake:fixture smoke test
  lib/schema-validators.mjs      — shared Ajv2020 setup for both intake schemas
  *.test.mjs (12 files, 121 tests)

tests/fixtures/intake/           — 27 synthetic GitHub-issue-event fixtures
docs/intake/
  intake-manifest.md             — manifest field reference
  local-processor.md             — CLI/processor reference
```

## Architecture / data flow

```text
fixture event.json
  → load-event.mjs        (file safety, size limit, JSON parse, event-schema shape)
  → detect-form.mjs        (first-line marker → form version, fail-closed)
  → parse-issue-form.mjs   (heading split → raw field values, duplicate/missing-section detection)
  → validate-submission.mjs (text limits, submission type, acknowledgements, URL count/length)
  → normalize-submission.mjs (normalized text field, syntactic URL extraction/classification)
  → build-intake-manifest.mjs (deterministic ID, hardcoded pending_owner/blocked, manifest_sha256)
  → lib/schema-validators.mjs (defensive re-check against intake-manifest.schema.json)
  → render-intake-report.mjs (Markdown, fenced-block escaped)
  → process-issue.mjs's atomic writer (temp dir → validate → rename)
       → manifest.json, report.md, processing-result.json
```

Each arrow is one module with one responsibility, matching PHASE_002.md
§4's target structure (adapted: `scripts/intake/lib/` for the one shared
helper, matching this repo's own `scripts/dossier/lib/` convention).

## Schema decisions

- Two schemas (`intake-event`, `intake-manifest`), both draft 2020-12,
  `additionalProperties: false`, explicit `required`, stable `$id`s under
  `https://vomaste.cz/schemas/intake/`.
- No `format` keyword (ajv-formats is not a repo dependency, and the
  repo's own canonical schemas validate dates via `pattern`, not
  `format`) — added local `$defs.isoDateTime` / inline URL patterns
  instead, linear regexes chosen specifically to avoid catastrophic
  backtracking (§5.3).
- `workflow.*` enum restricted to exactly what Phase 2 can produce — see
  the ADR decision-log amendment for the `not_requested` deviation.
- `proposed_authorization_scope.decision_class` / `.authorization_effect`
  are JSON Schema `const` — the schema itself makes any other value
  invalid, not just the processor's own code paths.

## Security guarantees (explicit confirmation)

- **Offline processing**: zero network access. Verified by
  `scripts/intake/network-guard.test.mjs` (static source scan for
  `fetch(`, `http(s).request`, `node:dns`/`node:http(s)` imports, shelling
  out to `curl`/`wget`/`gh`) and by `normalize-submission.test.mjs`'s
  timing assertion on an unreachable-domain URL.
- **No authorization**: `authorization_status` is schema-`const`
  `"pending_owner"`; `scripts/intake/negative-authorization.test.mjs`
  statically confirms no source file assigns any other value to that
  field, and confirms it end-to-end across every fixture.
- **No publication**: same mechanism, `publication_status = "blocked"`.
- **No production dossier writes**: `negative-authorization.test.mjs`
  greps for `data/dossiers`, `content/dossiers`, `AGENTS.md`,
  `data/authorizations.toml`, `authorize-entity` anywhere under
  `scripts/intake/` — none found. `git diff -- AGENTS.md
  data/authorizations.toml .github/workflows` is empty after this phase.
- **No network request**: see above.
- **Fail-closed parsing**: every unrecognized shape (unknown form
  version, duplicate/missing section, unsupported submission type,
  missing acknowledgement, oversized text/URLs) stops the pipeline
  *before* a manifest is written — confirmed by
  `process-issue.test.mjs`'s "writes no output directory" assertion on
  every invalid fixture.

## Test coverage

| Area (PHASE_002.md §20) | File(s) | Count |
|---|---|---|
| canonical JSON / hashing | `hash.test.mjs` | 6 |
| form detection | `detect-form.test.mjs` | 6 |
| section parsing, duplicate/missing sections, injection | `parse-issue-form.test.mjs` | 11 |
| submission validation, text/URL limits, acknowledgements | `validate-submission.test.mjs` | 9 |
| normalization, URL syntax classification | `normalize-submission.test.mjs` | 17 |
| ID generation, manifest assembly, manifest schema | `build-intake-manifest.test.mjs` | 10 |
| CLI args, end-to-end fixtures, determinism, output safety, symlink/size | `process-issue.test.mjs` | 40 |
| real-process CLI exit codes | `cli-exit-codes.test.mjs` | 9 |
| network prohibition (static gate) | `network-guard.test.mjs` | 2 |
| report escaping / Markdown injection | `render-intake-report.test.mjs` | 6 |
| negative authorization (static + end-to-end) | `negative-authorization.test.mjs` | 6 |
| **Total** | 11 files | **121** (wired into `npm test` → `npm run build`) |

Fixture count: 27 (`tests/fixtures/intake/`) — the full §19 minimum list
plus an explicit "older form version" fixture (`invalid-older-form-version.json`)
for the §9.1 older/current/unknown triad.

## Commands run

```text
npm run intake:fixture     → OK, writes .tmp/intake/fixture-run/ (gitignored, confirmed untracked)
npm run test:intake        → 121/121 pass
node --test scripts/intake/*.test.mjs  → 121/121 pass (same, direct invocation)
npm run build              → OK (109.3s, 2360 pages) — includes the above via the existing `test` step
git diff --check           → clean
git diff -- AGENTS.md data/authorizations.toml .github/workflows → empty
git status --short         → only the new/modified files listed below
```

## Files created or modified

Created: `schemas/intake/*.schema.json` (2), `scripts/intake/*.mjs` (14
non-test + 1 lib), `scripts/intake/*.test.mjs` (11), `tests/fixtures/intake/*`
(27), `docs/intake/*.md` (2), this report.

Modified: `.gitignore` (+`.tmp/intake/`), `package.json` (+4 `intake:*`/
`test:intake` scripts, `+scripts/intake/*.test.mjs` in the main `test`
glob), `docs/adr/ADR-public-dossier-intake.md` (decision-log entry only —
status stays PROPOSED).

No other file touched. No change to `scripts/data/validate.mjs`,
`scripts/dossier/*`, `data/**`, `.github/workflows/`, `AGENTS.md`,
`data/authorizations.toml`.

## Deviations from Phase 1

See `docs/adr/ADR-public-dossier-intake.md`'s 2026-08-02 Phase 2 decision-log
entry for the three documented deviations (workflow enum vs. the ADR's
`not_requested` state; raw/normalized URL field split;
missing-acknowledgement hard-failure vs. invalid-artifact branch).

## Known limitations

- No entity matching, no fuzzy matching, no source-family verification —
  `subject_candidates[].resolution_status` is always `"unresolved"`
  (Phase 3).
- No URL reachability/SSRF checking — URLs are classified syntactically
  only (Phase 4).
- The heading-based parser can be confused by a submitter pasting text
  that exactly matches a v1 heading inside a textarea field — handled
  fail-closed (`duplicate_section`, content retained, nothing silently
  lost) rather than solved; a real fix would need per-field boundary
  markers GitHub Issue Forms don't currently emit. Documented in
  `docs/intake/local-processor.md` and exercised by
  `parse-issue-form.test.mjs`'s injection test.
- `intake_status: needs_information` vs `triage` is a single mechanical
  rule (any warning present → needs_information) — not a graded severity
  model. Fine for Phase 2; a future phase may want finer-grained warning
  severities.
- No GitHub Issue Form YAML exists yet — Phase 2 defined the v1
  heading/label contract `scripts/intake/constants.mjs`'s `FORM_V1`
  expects; a future phase's Issue Form template must render byte-for-byte
  matching headings and checkbox labels, or update `FORM_V1` (never both
  silently).

## Phase 3 contract

Phase 3 (entity matching, deduplication, risk classification) receives:

- A **valid `intake-manifest.schema.json` object** (Phase 2's only
  output artifact) — specifically
  `proposed_authorization_scope.subject_candidates[]` (each
  `{label_from_submission, entity_id: null, resolution_status:
  "unresolved"}`) as the matching input, and `submission.subject_text` /
  `normalization.subject_text_normalized` as the text to match against
  the existing entity registry (`content/entities/*.md`,
  `data/entities.json`).
- Phase 3 must **not** mutate the Phase 2 manifest's `submission.*` or
  `normalization.*` fields — if it needs to record match results, that is
  new manifest fields (a schema version bump, `schema_version` beyond
  `0.1.0`) or a separate artifact, never an in-place rewrite of
  submitter-controlled raw text.
- Phase 3 inherits every Phase 2 invariant unchanged: still no network
  (entity matching is against already-loaded local repo data, not a
  remote lookup — a network-capable fuzzy-matching service is explicitly
  out of scope per PHASE_002.md's mission list and would need its own
  authorization/threat-model pass), still `authorization_status` can only
  be `pending_owner`-or-narrower, still no production dossier writes.
- Risk classification (PII heuristics, injection-pattern flags) should
  land in `system_observations.warnings` using the same `{code, message,
  field}` shape Phase 2 already established — not a new parallel
  warnings structure.
