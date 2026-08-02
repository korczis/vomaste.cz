```text
PHASE=06
NAME=GITHUB_ACTIONS_INTAKE_WORKFLOW
STATUS=VERIFIED

REPOSITORY=/Users/korczis/dev/vomaste-worktrees/INTAKE
BRANCH=task/INTAKE
BASE_COMMIT=4872dcaf
FINAL_COMMIT=<set at commit time>
WORKTREE_WAS_CLEAN=true

PHASE_05_BASELINE=PASS
WORKFLOW=.github/workflows/dossier-intake.yml
WORKFLOW_TRIGGER_COUNT=1
WORKFLOW_PERMISSION_COUNT=2
COMMENT_MARKER=<!-- vomaste-intake-report:v1 -->
MANAGED_LABEL_COUNT=8
GITHUB_TEST_COUNT=89 (npm run test:intake:github) + 17 (scripts/ci/validate-intake-workflow.test.mjs)

CONTENTS_WRITE=false
PULL_REQUEST_WRITE=false
DEPLOYMENT_WRITE=false
PAGES_WRITE=false
OIDC_WRITE=false
EXTERNAL_SECRETS_USED=false
PROCESSOR_RECEIVED_GITHUB_TOKEN=false

AUTHORIZATION_CHANGED=false
PRODUCTION_DATA_CHANGED=false
BRANCH_CREATED=false
PULL_REQUEST_CREATED=false
DEPLOY_TRIGGERED=false
COMMIT_CREATED=true
PUSH_PERFORMED=true

WORKFLOW_VALIDATION=PASS
PUBLISH_FIXTURE=PASS
E2E_FIXTURE=PASS
INTAKE_TESTS=PASS
FINAL_BUILD=PASS

RECOMMENDED_NEXT_PHASE=07
NEXT_PHASE_NAME=WEB_CTA_LANDING_AND_CONTRIBUTION_UX
```

## Implemented

The first production GitHub orchestration layer over the Phase 2-5 local
pipeline. Full architecture: `docs/intake/github-actions-workflow.md`.
Summary of new pieces:

1. **`.github/workflows/dossier-intake.yml`** — `issues` trigger only,
   `contents: read`/`issues: write` only, `timeout-minutes: 10`,
   issue-scoped `concurrency` with `cancel-in-progress: true`, checkout
   `persist-credentials: false`. Nine steps, privilege-separated: the
   processing step never has `GITHUB_TOKEN`; only the final publishing
   step does.
2. **`scripts/intake/adapters/github-event.mjs`** — allowlist adapter
   from a real GitHub webhook payload to Phase 2's internal event
   schema; never a passthrough, every field typed and bounded.
3. **`scripts/intake/process-github-event.mjs`** — the workflow's
   token-free processing entrypoint. Always writes a classified
   `_status.json` (`success`/`submission_rejected`/
   `ignored_unsupported_action`/`internal_error`), even on failure, so
   the publishing step has one predictable place to read from.
4. **`scripts/intake/github/`** — `production-adapter.mjs` (the one file
   with a real `fetch()` against the GitHub REST API — native `fetch`,
   no new Octokit dependency), `mock-github-adapter.mjs` (in-memory
   fake, identical interface), `find-managed-comment.mjs` +
   `upsert-report-comment.mjs` (create-or-update, trusted-bot-author +
   exact-marker double check, condensed-report fallback),
   `sync-labels.mjs` (label state projection, graceful missing-label
   degradation), `determine-notification.mjs` (owner ping policy derived
   from the issue's own current labels, no new persistence),
   `handle-closed-issue.mjs` (§29), `build-safe-reports.mjs` (safe
   reports for invalid/internal-error/security-review outcomes — never a
   stack trace, never raw submitted text in a security-review report),
   `publish-intake-result.mjs` (orchestrator: stale-event guard → ping
   decision → comment → labels).
5. **`scripts/intake/publish-github-result.mjs`** — the publishing
   step's CLI entrypoint; the only script that reads `GITHUB_TOKEN`.
6. **`scripts/intake/validate-artifact-safety.mjs`** — scans the output
   directory for token/credential/private-key patterns and unexpected
   files before upload.
7. **`scripts/ci/validate-intake-workflow.mjs`** (+ 17 tests including
   15 adversarial mutations of the real workflow YAML) — statically
   checks the full §24 list against the actual, parsed workflow file.
8. **`scripts/intake/run-publish-fixture.mjs`** (`npm run
   intake:publish-fixture`) — demonstrates create → update → label sync →
   notification decision against the mock adapter, zero network, zero
   token.
9. `data/maintainers.toml` — the one canonical place the owner's GitHub
   login is configured.
10. Report wording: `render-intake-report.mjs` gained the §11.5
    next-step sentence per status.

## Workflow architecture

Nine steps: checkout → setup Node → `npm ci` → clean-tree check →
process (token-free) → clean-tree check (`if: always()`) → artifact
safety validation (`if: always()`) → artifact upload (gated on the
safety step's own success, **not** a bare `always()` — see "Deviations"
for the bug this design fixes) → publish (`if: always()`, the only
token-bearing step). Full detail:
`docs/intake/github-actions-workflow.md`.

## Permissions

`contents: read`, `issues: write`. Nothing else — mechanically enforced
by `scripts/ci/validate-intake-workflow.mjs`, part of `npm run build`.

## Token isolation

`GITHUB_TOKEN` exists in exactly one step's `env` block. The processing
step that handles arbitrary untrusted issue content never has it —
verified both by `validate-intake-workflow.mjs` (a mutation test proves
adding the token there is caught) and by `network-guard.test.mjs`
(no network primitive anywhere near that code path except the
already-hardened Phase 4 preflight transport).

## Comment idempotence

`find-managed-comment.mjs` requires both a trusted bot author AND the
exact marker; a spoofed marker in a human comment is never trusted.
Duplicate managed comments: oldest wins, others are left alone and
surfaced as a diagnostic. Oversized reports condense rather than
truncate mid-sentence.

## Label state projection

Labels are recomputed from the current `intake_status` on every run,
never treated as stored state. A missing repository label degrades that
one application to `partial`, never blocks the rest of the run (§14
Varianta A — no automated label-bootstrap script; see
`docs/intake/github-labels.md` for the manual `gh label create`
runbook).

## Owner notification

Previous state is read from the issue's own current labels — no new
persistence layer. Pings only on a genuine transition into `triage` or
`security_review_required`, never on a rerun that stays in the same
state (§12.3 anti-spam, generalized slightly beyond the mission's two
worked examples into one consistent rule — documented in
`scripts/intake/github/determine-notification.mjs`'s own comment).

## Failure behavior

See the table in `docs/intake/github-actions-workflow.md`. Invalid
submissions get a safe explanation (never a stack trace); genuine
internal errors still get a safe "processing failed, run ID: ..."
comment thanks to `if: always()` on the publishing step, while the job
itself still shows as failed in the Actions UI (a maintainer sees both
the red run and the submitter sees a comment).

## Security guarantees

- No `contents`/`pull-requests`/`deployments`/`pages`/`id-token` write
  permission anywhere, statically enforced.
- Issue body/title never interpolated into a shell `run:` block —
  enforced against both the parsed step objects and the raw file text.
- No secret besides `GITHUB_TOKEN` referenced anywhere in the workflow.
- Artifact upload gated specifically on the safety-validation step's own
  success (a real bug in the first draft — see Deviations).
- Every scripts/intake/github/*.mjs module except the one production
  adapter is provably network-free (`network-guard.test.mjs`).

## Test matrix

89 tests in `npm run test:intake:github` (adapter, processing
entrypoint, publishing entrypoint, comment/label/notification/closed-
issue orchestration, artifact safety) + 17 in
`scripts/ci/validate-intake-workflow.test.mjs` (static workflow
validation, including 15 adversarial mutations of the real YAML proving
each invariant is actually checked, not just asserted in prose).

## Commands run

```bash
npm run intake:validate-workflow
npm run intake:publish-fixture
npm run intake:e2e-fixture
npm run intake:validate-form
npm run intake:fixture
npm run intake:preflight-fixture
npm run test:intake
npm run test:intake:github
npm run build
git diff --check
git status --short
git diff --stat
git diff -- AGENTS.md data/authorizations.toml data/dossiers
```

All green; the last diff command is empty as expected.

## Files changed

`.github/workflows/dossier-intake.yml` (new);
`scripts/intake/adapters/github-event.mjs` (+test);
`scripts/intake/process-github-event.mjs` (+test);
`scripts/intake/publish-github-result.mjs` (+test);
`scripts/intake/validate-artifact-safety.mjs` (+test);
`scripts/intake/run-publish-fixture.mjs`;
`scripts/intake/github/{constants,mock-github-adapter,production-adapter,
find-managed-comment,upsert-report-comment,sync-labels,
determine-notification,handle-closed-issue,build-safe-reports,
publish-intake-result}.mjs` (+tests) + `github-orchestration-matrix.test.mjs`;
`scripts/ci/validate-intake-workflow.mjs` (+test);
`scripts/intake/network-guard.test.mjs` (updated: three designated
transport adapters, not two);
`scripts/intake/render-intake-report.mjs` (+test, §11.5 next-step text);
`data/maintainers.toml` (new);
`package.json` (4 new npm scripts, `test:intake` glob extended);
`docs/intake/github-actions-workflow.md`, `github-labels.md`,
`operations.md` (new); `security-boundary.md`, `local-processor.md`
(updated); `docs/adr/ADR-public-dossier-intake.md` (decision-log entry);
`reports/intake/phase-06-workflow-audit.md`,
`phase-06-implementation-report.md` (new).

## Deviations

1. **Real bug found and fixed while writing the workflow YAML itself,
   not by a test**: the first draft's artifact-upload step used
   `if: always()` unconditionally — meaning it would upload an artifact
   even if the immediately-preceding "Validate artifact safety" step
   *failed* (i.e., detected unsafe content). `if: always()` means "run
   even if an earlier step failed," not "run only if the safety check
   passed" — an easy conflation, and exactly the kind of thing that would
   have been a real production security hole. Fixed to
   `if: always() && steps.safety.outcome == 'success'`. The publishing
   step keeps a bare `if: always()` deliberately — §15.3 requires even a
   genuine internal error to get a safe comment, and that report body is
   always synthesized from safe templates, never raw output.
2. No `CODEOWNERS` file (§37) — not created without a separate ADR
   decision, per the mission's own instruction; branch-protection
   recommendations are documented in `docs/intake/operations.md` as
   recommendations only, never claimed as enforced.
3. Production GitHub API adapter uses native `fetch()` (Node 24), not
   Octokit via `actions/github-script` — §19 explicitly permits either;
   this fits the existing "small Node entrypoint with GITHUB_TOKEN"
   pattern from Phase 4 and adds no new dependency.
4. Label bootstrap (§14 Varianta B) is documentation only
   (`docs/intake/github-labels.md`'s `gh label create` commands for a
   maintainer to run by hand) — no automated bootstrap script, matching
   §14's own stated preference.
5. `npm run intake:publish-fixture` demonstrates create → update as two
   sequential calls against one mock adapter instance, rather than two
   independent demonstrations — more accurately proves the actual
   idempotent behavior (§16.1) it exists to show.

## Known limitations

- The workflow has not been exercised against a real GitHub-hosted
  issue (out of scope by mission mandate — no GitHub API use during
  implementation); real-world verification (marker persistence, actual
  bot-author detection, real label-creation errors) happens the first
  time it runs in production, which the operations runbook
  (`docs/intake/operations.md`) is written to support.
- Abuse controls remain minimal by design (§34) — no rate monitoring, no
  reputation scoring; `concurrency`/`timeout-minutes`/URL count caps are
  the only limits, as the mission specifies for this phase.
- The stale-event guard re-fetches `issue.updated_at` once, immediately
  before publishing; a very tight race (another edit landing in the
  narrow window between that fetch and the comment write) is not fully
  eliminated, only made very unlikely — `cancel-in-progress` concurrency
  already handles the overwhelming majority of this class of race.

## Phase 7 contract

Per PHASE_006.md §42, Phase 7 receives: a functional Issue Form, a
production GitHub intake workflow, a canonical template URL
(`https://github.com/korczis/vomaste.cz/issues/new?template=navrh-dossieru.yml`,
per Phase 5's §18 contract), public safety wording, a status model — and
no authorization or dossier-generation capability. Phase 7 must
implement: a landing-page CTA, a dossier-index CTA, a contribution page,
public-intake explanation copy, a warning before navigating to GitHub,
external-link semantics, mobile-first UI, accessibility, a data-driven
URL (never a second hardcoded copy of the template URL), tracking
without personal data, no secure-whistleblower claim anywhere, and E2E
link validation. Not implemented now.
