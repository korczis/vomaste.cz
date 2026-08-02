# Intake local processor (Phase 2)

`scripts/intake/process-issue.mjs` turns one local GitHub-issue-event
fixture into an intake manifest, a Markdown report, and a
machine-readable processing result — entirely offline. See
`docs/intake/intake-manifest.md` for the manifest's own field reference,
and `docs/adr/ADR-public-dossier-intake.md` for the architecture this
implements. This phase implements only the *local* processor — no
GitHub Actions, no GitHub API calls, no issue comments, no labels; see
"What Phase 2 does not do" below.

## CLI usage

```bash
node scripts/intake/process-issue.mjs \
  --event <path-to-event.json> \
  --output-dir <dir> \
  [--generated-at <ISO8601>] \
  [--repository-commit <sha>] \
  [--overwrite]

node scripts/intake/process-issue.mjs --help
```

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
npm run intake:fixture                                        # smoke-test: one fixed fixture, fixed clock/commit, into .tmp/intake/ (gitignored)
npm run test:intake                                            # node --test scripts/intake/*.test.mjs (121 tests)
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

Phase 2 makes zero network requests. URL handling is syntax-only
(extraction + classification via `new URL()`, never `fetch`/`http(s)`
client/DNS) — see `scripts/intake/normalize-submission.mjs` and the
static gate `scripts/intake/network-guard.test.mjs`, which fails the
build if `fetch(`, `http.request`, `https.request`, a `node:dns`/
`node:http(s)` import, or a shell-out to `curl`/`wget`/`gh` ever appears
anywhere under `scripts/intake/` (excluding test files).

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

- **No network, ever** (see "Offline boundary").
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

## What Phase 2 does not do

No GitHub API calls, no GitHub Actions workflow, no issue comments, no
label management, no HTTP requests of any kind, no URL reachability
checks, no entity matching or fuzzy matching, no source-family
verification, no editorial research, no AI classification, no Prismatic
integration, no authorization, no dossier creation, no PR, no merge, no
deploy. All of that is later phases (see
`reports/intake/phase-02-implementation-report.md`'s "Phase 3 contract").
