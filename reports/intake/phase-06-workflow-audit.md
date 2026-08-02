# Phase 6 — existing workflow audit

Per `docs/missions/intake/PHASE_006.md` §3. Audited 2026-08-02, base commit
`4872dcaf` (post Phase 5 merge/push).

## Inventory

| Workflow | Trigger | Permissions | Secrets | Contents write | PR write | Deploy |
|---|---|---|---|---:|---:|---:|
| `.github/workflows/deploy.yml` | `push: [master]`, `workflow_dispatch` | `contents: read`, `pages: write`, `id-token: write` | none (OIDC token workflow) | No | No | **Yes** (`actions/deploy-pages`) |

Only one existing workflow. `dossier-intake.yml` is the only new file this
phase adds — `deploy.yml` is untouched.

## Conventions to follow (established, not invented for this phase)

- **Node version**: hardcoded `node-version: 24` in the job step — no
  `.nvmrc`/`.node-version`/`package.json` `engines` field exists in this
  repo. Phase 6 matches this exact convention rather than introducing a
  new versioning mechanism for one workflow.
- **Action pinning**: major-version tags (`actions/checkout@v7`,
  `actions/setup-node@v7`), not commit-SHA pinning. No repo policy or
  tooling enforces SHA pinning elsewhere — Phase 6 follows the same
  major-tag convention rather than introducing a stricter, unprecedented
  one unilaterally.
- **`npm ci`**, never `npm install`/`update`/`audit fix` — already the
  sole dependency-install command in `deploy.yml`.
- **`concurrency`**: already used (`group: pages`,
  `cancel-in-progress: false`) — Phase 6 uses issue-scoped concurrency
  with `cancel-in-progress: true` instead, per §4.6's explicit
  requirement (an edit should cancel a stale in-flight run for the same
  issue, unlike a Pages deploy which should finish once started).
- **`timeout-minutes`**: **not present** in `deploy.yml` today (browser
  tests + full build can legitimately run long). Phase 6 adds it anyway
  — §4.5 explicitly requires it, and unlike a deploy, an issue-triggered
  run has no legitimate reason to run long (Phase 4's own preflight has
  its own bounded per-request/per-list timeouts).
- **No reusable-workflow convention** (`workflow_call`) exists — not
  introduced here either; one workflow doesn't justify one.
- **No existing bot-comment helper** — this phase is the first thing in
  the repo that posts issue comments programmatically;
  `scripts/intake/github/` is new, not a duplicate of something that
  already existed.
- **No `CODEOWNERS` file** — per §37, not created without a separate,
  explicit ADR decision; this phase instead documents branch-protection
  recommendations in `docs/intake/operations.md` (§38) without claiming
  they are mechanically enforced.
- **Labels**: no repository-managed label-creation tooling exists.
  Phase 6 takes §14's **Varianta A** (manually-managed labels; a missing
  label degrades gracefully to `partial` status with diagnostics, never
  a hard failure) — see the implementation report's "Deviations" for
  why Varianta B (an automated label-bootstrap script) was not built.

## Decision: workflow file name and scope

`.github/workflows/dossier-intake.yml`, triggered on `issues` only
(`opened`, `edited`, `reopened`, `labeled`, `unlabeled`, `closed` — the
full §4.2 set, not the MVP subset, since `unlabeled`/`closed` are needed
for the closed-issue and label-drift-correction behavior §29/§13.5
require). `deploy.yml` is not modified in any way by this phase.
