# Intake local processor (Phase 2/3/4/5/6)

Since Phase 6, this same local pipeline also runs automatically from a
real GitHub Issue Form submission via
`.github/workflows/dossier-intake.yml` — see
`docs/intake/github-actions-workflow.md`. `process-github-event.mjs` is
the adapter entrypoint the workflow calls; everything below this line
still describes the local, offline, `--event <fixture-path>` CLI this
repository's tests and fixtures use directly.

`scripts/intake/process-issue.mjs` turns one local GitHub-issue-event
fixture into an intake manifest, a Markdown report, and a
machine-readable processing result. Offline by default. Since Phase 3 it
also runs entity-candidate matching, duplicate-intake detection, and risk
classification as part of the same pipeline (see
`docs/intake/entity-matching.md` and `docs/intake/risk-classification.md`);
since Phase 4, passing `--preflight` additionally runs a real,
SSRF-hardened technical check of the submitted source URLs (see
`docs/intake/url-preflight.md` and `docs/intake/security-boundary.md`).
Since Phase 5, the event fixture this CLI reads is a real, verified
rendering of the real public GitHub Issue Form
(`.github/ISSUE_TEMPLATE/navrh-dossieru.yml`) rather than an imagined
shape — see `docs/intake/issue-form-contract.md` for the field/heading
contract and `docs/intake/public-submission.md` for the public-facing
how-to. See `docs/intake/intake-manifest.md` for the manifest's own field
reference, and `docs/adr/ADR-public-dossier-intake.md` for the
architecture this implements. No GitHub Actions, no GitHub API calls, no
issue comments, no labels; see "What this phase does not do" below.

## CLI usage

```bash
node scripts/intake/process-issue.mjs \
  --event <path-to-event.json> \
  --output-dir <dir> \
  [--generated-at <ISO8601>] \
  [--repository-commit <sha>] \
  [--overwrite] \
  [--matching-index <path>] \
  [--prior-manifests-dir <dir>] \
  [--preflight]

node scripts/intake/process-issue.mjs --help
```

`--matching-index` overrides the default (build a fresh index from
`data/dossiers/**` on every run — `scripts/intake/build-matching-index.mjs`,
~70ms for ~450 entities) with a pre-built or synthetic index file; mainly
for tests. `--prior-manifests-dir` points duplicate detection at a
directory of previously-written `manifest.json` files (see
`docs/intake/entity-matching.md`'s "Duplicate intake detection" — no such
directory is configured by default, so duplicate detection is always
`no_duplicate` unless the caller opts in). `--preflight` opts in to real
network access for the submitted source URLs — offline by default
(§23.1); without it, every URL's `source_preflight` result is
`not_attempted`/`not_attempted`.

- `--event` and `--output-dir` are required. `--event` accepts only a
  filesystem path — never issue body content, never a URL.
- `--generated-at` / `--repository-commit` default to the real clock /
  `git rev-parse HEAD` when omitted (fine for a real local run); tests
  always pass them explicitly so results are byte-reproducible.
- `--overwrite` replaces a prior run's output directory for the *same*
  intake ID only; without it, a second run against the same issue fails
  with `output_exists` rather than silently clobbering.
- Unknown flags, missing values, and duplicate flags are all rejected
  (`cli_usage`, exit 2) — see `scripts/intake/process-issue.mjs`'s
  `parseCliArgs`.

Companion commands:

```bash
npm run intake:process -- --event <path> --output-dir <dir>   # same CLI, via npm
npm run intake:validate -- <manifest.json>                    # re-validate an existing manifest
npm run intake:validate-form                                  # structural check of .github/ISSUE_TEMPLATE/*.yml + config.yml (Phase 5)
npm run intake:fixture                                        # smoke-test: one fixed fixture, fixed clock/commit, into .tmp/intake/ (gitignored) — always offline
npm run intake:preflight-fixture                              # same idea, but --preflight through a MOCK DNS transport (never real network) — into .tmp/intake/preflight-fixture-run/
npm run intake:e2e-fixture                                    # every tests/fixtures/intake/e2e-*.json through the FULL pipeline (parse→matching→risk→preflight→manifest→report), offline, into .tmp/intake/e2e-run/ (Phase 5)
npm run intake:index                                          # regenerate the matching index on demand (npm run intake:fixture always builds it fresh anyway)
npm run intake:match-fixture                                  # same fixture through the full Phase 3 pipeline, into .tmp/intake/match-fixture/
npm run test:intake                                            # node --test scripts/intake/*.test.mjs + matching/ + risk/ + preflight/ (447 tests)
npm run test:intake:matching                                   # matching subsystem only
npm run test:intake:risk                                       # risk classifier subsystem only
npm run test:intake:preflight                                  # URL preflight subsystem only
npm run test:intake:form                                       # Issue Form ↔ parser compatibility + YAML structural validity (Phase 5)
npm run test:intake:e2e                                        # golden e2e-*.json fixture scenarios + edit semantics + one genuinely-reachable mocked HTTP round trip (Phase 5)
```

`test:intake`'s tests are also part of the repo's main `npm test`, so
they run as part of `npm run build`'s existing `test` step — Phase 2 adds
no *new* build-pipeline step (`scripts/build/pipeline.mjs` is untouched).

## Exit codes

| Code | Meaning |
|---|---|
| 0 | success |
| 2 | invalid CLI usage |
| 3 | invalid event JSON (missing file, oversized, malformed JSON, fails event schema) |
| 4 | unsupported form (no/unknown marker, duplicate section, missing required section) |
| 5 | submission validation failed (text limits, submission type, acknowledgements, URL count/length) |
| 6 | manifest failed its own schema validation (should be unreachable; a defensive check) |
| 7 | output failure (already exists without `--overwrite`, unsafe path, write error) |
| 8 | internal error |

Every failure prints a single structured JSON object to stderr
(`{status, code, message, details}`) — never a raw stack trace in the
normal path (PHASE_002.md §8.3, §24.5). See
`scripts/intake/cli-exit-codes.test.mjs`.

## Input limits

- Event file: regular file only (no directories, devices, or symlinks —
  §8.2's "refuse" policy), ≤ 1 MiB.
- `subject_text` ≤ 500 chars, `description_text` ≤ 20 000,
  `public_interest_text` ≤ 10 000, `identifiers_text` ≤ 2 000,
  `known_unknowns_text` / `existing_references_text` ≤ 5 000 each.
- Source URLs: ≤ 100 lines, ≤ 2 048 chars per line.

All in `scripts/intake/constants.mjs`'s `LIMITS`.

## Output structure

```text
<output-dir>/
  <intake-id>/
    manifest.json
    report.md
    processing-result.json
```

Written atomically: every file is written into a temporary directory
(`mkdtempSync` under `<output-dir>`) first; only once all writes and
manifest-schema validation succeed is the temp directory renamed into
place. On any failure the temp directory is removed and the final
directory is never created or left partial.

## Fixture workflow

`tests/fixtures/intake/*.json` are synthetic GitHub-issue-event fixtures
(see `docs/intake/intake-manifest.md`'s example pointer). None reference
real, unauthorized people — every fixture uses names like "Jan
Testovací" (PHASE_002.md §19.1). `npm run intake:fixture` runs one of
them (`valid-new-dossier.json`) through the full pipeline with a fixed
clock/commit into `.tmp/intake/fixture-run/` (gitignored, never tracked).

## Offline boundary

Phase 2/3 make zero network requests — URL handling there is
syntax-only (extraction + classification via `new URL()`, never
`fetch`/`http(s)` client/DNS; see `scripts/intake/normalize-submission.mjs`).
Phase 4's `scripts/intake/preflight/` is the one deliberate exception,
and only when `--preflight` is explicitly passed — see
`docs/intake/url-preflight.md` and `docs/intake/security-boundary.md`
for the full SSRF-hardening design. `scripts/intake/network-guard.test.mjs`
enforces the boundary precisely: no network primitive
(`fetch(`, `http.request`, `https.request`, a `node:dns`/`node:http(s)`
import) may appear anywhere under `scripts/intake/` **except** inside
`scripts/intake/preflight/request-once.mjs` and
`scripts/intake/preflight/resolve-hostname.mjs` — the two designated
transport-adapter modules — and a shell-out to `curl`/`wget`/`gh` is
never permitted anywhere, including there.

## Failure modes (by pipeline stage)

1. Event loading — not found / not a regular file (symlink, directory,
   device) / too large / invalid JSON / fails event schema.
2. Form detection — no marker, or an unsupported (older or newer) marker
   version.
3. Section parsing — duplicate heading (including one *injected* inside
   another section's free text — see the Markdown-injection test in
   `scripts/intake/parse-issue-form.test.mjs`), missing required heading.
4. Submission validation — unsupported submission type, a text field over
   its limit, a missing/false required acknowledgement, too many/too-long
   source URL lines. Every problem found is reported at once (not just
   the first).
5. Manifest schema validation — defensive only; should be unreachable if
   the builder is correct.
6. Output — already exists without `--overwrite`, or an unsafe resolved
   path (defense in depth; the intake ID itself is always
   processor-generated from repository+issue-number, never from issue
   content, so this should also be unreachable in practice).

## Security constraints

- **No network unless `--preflight` is explicit** (see "Offline boundary"
  and `docs/intake/security-boundary.md`).
- **Fail-closed**: any unrecognized shape stops the pipeline before a
  manifest is written — never a best-effort guess, never a default that
  widens scope (PHASE_002.md §1.4).
- **Raw text preserved**: nothing strips diacritics, "fixes" wording,
  infers a subject, or reclassifies legal status — see
  `scripts/intake/normalize-submission.mjs`'s header comment.
- **Prompt/shell/Markdown injection is inert**: submitted text is only
  ever data. It cannot alter CLI behavior, file paths, or output
  destination (`invalid-shell-injection-text.json`,
  `invalid-prompt-injection-text.json` fixtures process as ordinary valid
  submissions — the "attack" text just becomes literal manifest content).
  In the rendered report, all submitter text sits inside a
  length-adjusted fenced code block so it cannot break out into a live
  heading, spoof the report's own HTML-comment marker, or trigger a
  GitHub @mention — see `scripts/intake/render-intake-report.mjs` and
  `render-intake-report.test.mjs`.
- **Path safety**: the intake ID (the only thing ever used to build an
  output subdirectory) is derived solely from repository owner/name +
  issue number, slugified to `[a-z0-9-]+` — a hostile
  `owner: "../../etc"` cannot produce a path-traversing ID (tested in
  `build-intake-manifest.test.mjs`).
- **Mechanically un-authorizing**: see
  `scripts/intake/negative-authorization.test.mjs` — static source scans
  plus an end-to-end run over every fixture, asserting no manifest this
  processor can produce ever has `authorization_status` other than
  `"pending_owner"` or `publication_status` other than `"blocked"`.

## What this whole processor does not do

No GitHub API calls, no GitHub Actions workflow, no issue comments, no
label management, no NER or AI-based entity extraction, no
source-family verification, no editorial research, no AI classification,
no Prismatic integration, no authorization, no dossier/entity/claim
creation, no PR, no merge, no deploy. Even with `--preflight`: no source
trust scoring, no article body extraction/archiving, no screenshots, no
PDF parsing/OCR, no browser automation or JavaScript rendering, no
paywall bypass, no `robots.txt` crawling, no recursive link discovery
(see `docs/intake/url-preflight.md`'s "Non-goals"). All of that is later
phases (see `reports/intake/phase-04-implementation-report.md`'s "Phase 5
contract").
