```text
PHASE=05
NAME=GITHUB_ISSUE_FORM_AND_LOCAL_END_TO_END_FIXTURE
STATUS=VERIFIED

REPOSITORY=/Users/korczis/dev/vomaste-worktrees/INTAKE
BRANCH=task/INTAKE
BASE_COMMIT=08f7a0ac
FINAL_COMMIT=<set at commit time>
WORKTREE_WAS_CLEAN=true

PHASE_04_BASELINE=PASS
ISSUE_FORM=.github/ISSUE_TEMPLATE/navrh-dossieru.yml
FORM_VERSION=vomaste-intake-form:v1
FORM_MARKER=<!-- vomaste-intake-form:v1 -->
FORM_FIELD_COUNT=9
ACKNOWLEDGEMENT_COUNT=3
E2E_FIXTURE_COUNT=19
TEST_COUNT=447 (npm run test:intake) + 17 (npm run test:intake:form, includes scripts/ci/*.test.mjs) + 6 (npm run test:intake:e2e, subset of the 447)

GITHUB_API_USED=false
GITHUB_WORKFLOW_CREATED=false
PUBLIC_INTERNET_USED_IN_TESTS=false
AUTHORIZATION_CHANGED=false
PRODUCTION_DATA_CHANGED=false
DOSSIER_CREATED=false
COMMIT_CREATED=true
PUSH_PERFORMED=true

FORM_VALIDATION=PASS
E2E_FIXTURE=PASS
INTAKE_TESTS=PASS
FINAL_BUILD=PASS
```

## Implemented

1. **Real, versioned GitHub Issue Form**: `.github/ISSUE_TEMPLATE/navrh-dossieru.yml`
   rebuilt (same filename, same `labels: [navrh-rozsahu]`, same core safety
   wording from the T-042 governance-fix mission) to actually be the
   `vomaste-intake-form:v1` submission channel the Phase 2-4 parser expects
   — marker as the literal first body line, all 9 `FORM_V1` fields with
   byte-exact rendered headings, three individually required, individually
   labeled acknowledgements, `source_urls` deliberately GitHub-optional
   (§6.6). Prior to this phase the form and the parser had never been
   connected — see the audit report.
2. **Parser hardening**, both real gaps found by verifying against real
   GitHub rendering behavior rather than the imagined shape Phase 2 built
   against:
   - `GITHUB_EMPTY_FIELD_PLACEHOLDER` (`"_No response_"`) normalization in
     `parse-issue-form.mjs` — GitHub renders every unanswered
     input/textarea/dropdown field with this literal placeholder, never a
     blank section; unhandled until now, and Phase 2's own fixtures used
     blank bodies so this went undetected. Applied universally to every
     text-valued heading except `acknowledgements` (a checkboxes field,
     where the placeholder never legitimately appears).
   - `detect-form.mjs` now rejects a second marker-shaped line anywhere
     else in the body (`duplicate_form_marker`, §25.1) instead of silently
     ignoring it.
3. **`scripts/intake/render-github-form-body.mjs`** — renders a realistic
   GitHub issue body from the real, checked-in YAML (not a hand-imagined
   string), used by both the compatibility tests and the fixture
   generator so there is exactly one source of truth for "what does this
   form actually produce."
4. **`scripts/intake/issue-form-compatibility.test.mjs`** (9 tests,
   PHASE_005.md §14.1-§14.5) — proves the real form round-trips through
   the real parser: marker match, heading coverage both directions,
   dropdown/acknowledgement mapping both directions, field-id uniqueness,
   `validations.required` shape, and three full round-trip scenarios
   (fully answered, minimally answered, one acknowledgement unchecked).
5. **`scripts/ci/validate-issue-forms.mjs`** (+ `.test.mjs` wrapper folded
   into `npm test`, new `js-yaml` devDependency — the repo had no YAML
   parser at all before this) — structural validation of all 4 issue
   templates + `config.yml`: valid YAML, no tabs, unique field ids, every
   field has the attributes its type needs, checkbox/dropdown option
   shape, `config.yml`'s own shape. Deliberately not a reimplementation of
   GitHub's own schema validator (§15).
6. **`scripts/intake/generate-form-fixture.mjs`** — generates the 19
   golden `tests/fixtures/intake/e2e-*.json` fixtures (18 named scenarios
   from §11 plus one helper for the edit-history pair) from the real form
   via the renderer above; committed as static files, regenerated only on
   a deliberate scenario change (§10 "Varianta A/C").
7. **`scripts/intake/run-e2e-fixture.mjs`** (`npm run intake:e2e-fixture`)
   — processes every golden fixture through the full pipeline (parse →
   validate → normalize → matching → risk → preflight → manifest →
   report) offline, mock DNS resolving every hostname to a private
   address (same proven pattern `intake:preflight-fixture` already uses),
   fixed clock/commit, into `.tmp/intake/e2e-run/` (gitignored — nested
   under the already-ignored `.tmp/intake/` path, no `.gitignore` edit
   needed).
8. **`scripts/intake/run-e2e-fixture.test.mjs`** (`npm run test:intake:e2e`,
   6 tests) — the §32 test-matrix assertions (this repo's assertion-based
   convention for "golden snapshots," matching `compiled-golden.test.mjs`,
   rather than opaque diff files), the two `needs_information`/
   `security_review_required` outcome checks, §22 edit-semantics proof
   (same intake ID across an edit, different input hash, a removed
   acknowledgement invalidates the new run), and one genuinely
   network-reachable (mocked, loopback-only) HTTP round trip.
9. **Script-level mock-transport injection**, designed to preserve Phase
   4's security invariant that `process-issue.mjs` (the CLI entrypoint)
   never itself names any preflight test-only bypass parameter: added a
   generic `preflightRunner` override (defaulting to the real
   `preflightUrls`) instead of forwarding `testAllowedPrivateAddresses`/
   `testExtraAllowedPorts` by name — those two now also thread through
   `preflightUrls`'s own signature (previously only `testAllowedSuffixes`
   was forwarded there), used only by `run-e2e-fixture.test.mjs`'s dynamic
   scenario. `preflight-security-gates.test.mjs`'s static assertion that
   `process-issue.mjs` is clean of that vocabulary still passes unchanged.
10. **Report wording** (`render-intake-report.mjs`) — added the §20
    mandatory sentences: "Zdroj podání: veřejná GitHub issue", form
    version restated near the top, "Tento report není potvrzením
    správnosti podnětu.", "Přijaté URL nebyly automaticky uznány jako
    nezávislé ani důvěryhodné zdroje.", "Rozsah nebyl autorizován.",
    "Publikace zůstává blokována." — with matching assertions added to
    `render-intake-report.test.mjs`.
11. **Documentation**: `docs/intake/public-submission.md` (public
    how-to, §27), `docs/intake/issue-form-contract.md` (developer
    contract, §28), `reports/intake/phase-05-issue-form-audit.md` (§3),
    `docs/intake/local-processor.md` updated with the new commands, ADR
    decision-log entry.

## Issue Form contract

Full field/heading/dropdown/acknowledgement mapping table, version-bump
policy, and the empty-placeholder rule: `docs/intake/issue-form-contract.md`.

## Public safety wording

Reviewed against §16's forbidden framings (no "nahlaste pachatele",
"odhalte korupci", "pošlete důkaz", "anonymně oznamte", "zveřejníme váš
případ", "AI vše vyšetří" anywhere in the form) and required framings
(question-oriented: "Co by mělo být prověřeno?" not "Jakého provinění se
subjekt dopustil?"). Public/non-confidential warning is the form's first
visible content block (verified by the pre-existing
`scripts/ci/issue-templates.test.mjs` test, still passing). `config.yml`
was audited and required no changes — already correct from T-042.

## Parser compatibility

`scripts/intake/issue-form-compatibility.test.mjs`, 9/9 passing — see
"Implemented" #4 above. This is the actual proof the audit's stated goal
(closing the gap between "the parser as imagined" and "the parser that
understands the real rendered form") was met, not a restated assumption.

## End-to-end architecture

`generate-form-fixture.mjs` → 19 golden fixtures → `run-e2e-fixture.mjs`
(full pipeline, offline, mock DNS) → `run-e2e-fixture.test.mjs`
(assertions). See `docs/intake/issue-form-contract.md`'s "Fixture
strategy" section for the full rationale, including why the one
genuinely-reachable HTTP scenario is built dynamically rather than as a
committed fixture (a static file can't embed an ephemeral mock-server
port).

## Security guarantees

- `process-issue.mjs` still contains zero preflight test-only bypass
  vocabulary (`preflight-security-gates.test.mjs` unchanged, still
  passing) — the new `preflightRunner` injection point is a whole-function
  override, not a bypass parameter, and only ever supplied by a
  script-level caller (`run-e2e-fixture.test.mjs`), never a CLI flag.
- `detect-form.mjs` now fails closed on a second marker-shaped line
  anywhere in the body (§25.1), not just an absent/unsupported one.
- `_No response_` normalization prevents a real submission's literal
  GitHub placeholder text from silently becoming manifest content.
- `npm run intake:e2e-fixture` and `npm run build` never touch the public
  internet — every fixture's mock DNS resolves to a private address; the
  one real HTTP round trip in `run-e2e-fixture.test.mjs` only ever talks
  to a `127.0.0.1` server this same test process started and stops.

## Test matrix

See `docs/missions/intake/PHASE_005.md` §32; concrete pass/fail mapping
implemented in `run-e2e-fixture.test.mjs`'s first test. `possible
duplicate` has no dedicated e2e fixture (see Deviations #3).

## Commands run

```bash
npm ci
npm run intake:validate-form
npm run intake:fixture
npm run intake:preflight-fixture
npm run intake:e2e-fixture
npm run test:intake
npm run test:intake:form
npm run test:intake:e2e
npm run build
git diff --check
git status --short
git diff --stat
git diff -- AGENTS.md data/authorizations.toml .github/workflows
```

All green; the last diff command shows only `.github/ISSUE_TEMPLATE/navrh-dossieru.yml`,
exactly as §39 expects.

## Files changed

- `.github/ISSUE_TEMPLATE/navrh-dossieru.yml` (rebuilt)
- `scripts/intake/constants.mjs` (`GITHUB_EMPTY_FIELD_PLACEHOLDER`)
- `scripts/intake/parse-issue-form.mjs` (placeholder normalization)
- `scripts/intake/detect-form.mjs` (+test) (duplicate-marker detection)
- `scripts/intake/errors.mjs`, `process-issue.mjs` (`DUPLICATE_FORM_MARKER`
  error code + exit-code mapping; `preflightRunner` injection point)
- `scripts/intake/preflight/preflight-urls.mjs` (forwards
  `testAllowedPrivateAddresses`/`testExtraAllowedPorts`)
- `scripts/intake/render-github-form-body.mjs` (new)
- `scripts/intake/issue-form-compatibility.test.mjs` (new)
- `scripts/intake/generate-form-fixture.mjs` (new)
- `scripts/intake/run-e2e-fixture.mjs` (new)
- `scripts/intake/run-e2e-fixture.test.mjs` (new)
- `scripts/ci/validate-issue-forms.mjs` + `.test.mjs` (new)
- `scripts/intake/render-intake-report.mjs` (+test) (§20 wording)
- `tests/fixtures/intake/e2e-*.json` (19 new files)
- `package.json` (`js-yaml` devDependency; 6 new/updated npm scripts)
- `docs/intake/public-submission.md`, `issue-form-contract.md` (new);
  `local-processor.md` (updated)
- `docs/adr/ADR-public-dossier-intake.md` (decision-log entry)
- `reports/intake/phase-05-issue-form-audit.md`,
  `phase-05-implementation-report.md` (new)

## Deviations

1. `scripts/intake/forms/{registry,v1}.mjs` (§9's preferred structure)
   not built — `FORM_V1` stays in `constants.mjs`, which already serves
   as the one versioned contract module in spirit
   (`SUPPORTED_FORM_VERSIONS` is already an explicit version registry).
   Building a directory-per-version structure for a single existing
   version would be exactly the speculative structuring this repo's own
   CLAUDE.md and the mission's own §9.1 ("žádný obří univerzální parser")
   argue against; a real v2 gets its own small, isolated refactor when it
   actually exists.
2. `submission.field_provenance` (§21) not added as a new schema field —
   the mission's own text permits this ("Nemusí hashovat každý text
   zvlášť, pokud Phase 2 provenance stačí"): the existing
   `provenance.input_sha256` plus this phase's own documented, versioned
   field↔heading contract (`docs/intake/issue-form-contract.md`) together
   give the same traceability without a schema bump.
   `schema_version` stays `0.3.0`.
3. No dedicated `possible duplicate` e2e fixture — it needs stateful
   `--prior-manifests-dir` setup beyond one static JSON file, and Phase
   3's own `detect-duplicate-intake.test.mjs` already exhaustively covers
   that logic.
4. Golden snapshots (§31) are assertions against a real run (this repo's
   existing convention, see `compiled-golden.test.mjs`), not committed
   opaque diff files — no snapshot-testing library exists in this repo
   and one wasn't introduced for this.

## Known limitations

- The empty-field-placeholder string (`"_No response_"`) is verified
  against GitHub's documented behavior description and a well-known
  third-party parser implementation, not against an actual live GitHub
  submission (Phase 5 explicitly forbids using the GitHub API). If GitHub
  ever changes this literal string, `docs/intake/issue-form-contract.md`
  names the one place to update it.
- `scripts/intake/generate-form-fixture.mjs`'s 9 "invalid" fixtures
  simulate a malformed/tampered raw body one targeted edit away from a
  real rendered submission — they prove the parser fails closed against
  that shape of input regardless of whether it's currently reachable
  through any real code path (Phase 6's future GitHub adapter is what
  would actually receive raw GitHub payloads).
- Real end-to-end verification against an actual GitHub-hosted issue
  (confirming the marker HTML comment truly survives GitHub's own
  storage/rendering byte-for-byte) is out of scope for this phase by
  mission mandate (no GitHub API use) and remains open until Phase 6.

## Phase 6 contract

Per PHASE_005.md §36, Phase 6 receives: a stable Issue Form
(`.github/ISSUE_TEMPLATE/navrh-dossieru.yml`, `vomaste-intake-form:v1`), a
stable, verified form/parser contract (`docs/intake/issue-form-contract.md`),
the local processor with matching/risk/preflight/E2E fixtures all green,
deterministic reports, and zero GitHub API/write implementation. Phase 6
must build: the `issues` event GitHub Actions workflow, minimal
permissions, safe event-payload loading, an idempotent report comment
(bot marker, never re-posted verbatim on every event), label transitions,
owner notification, workflow artifact upload, concurrency/timeout
handling, re-run safety, edited-issue handling (this phase's `input_sha256`
+ stable intake ID design is what makes that tractable), failure
comments — and explicitly no `contents: write`, no authorization, no
deploy.
