# Dossier intake — operations runbook (Phase 6)

For maintainers of vomaste.cz. See `docs/intake/github-actions-workflow.md`
for the workflow's own architecture and `docs/intake/security-boundary.md`
for the security model this runbook assumes.

## Workflow failed before a report was posted

Check the Actions run log (`Actions` tab → `Public dossier intake` →
the failing run). Because the "Publish result" step runs with
`if: always()`, most genuine failures still get a comment — if there is
**no** comment at all, the failure happened before or during "Process
intake event" in a way severe enough that even the safe status file
couldn't be produced (e.g. the event payload itself is unreadable). Look
at that step's log directly; it never prints raw secrets, but it does
print the classified `_status.json` content, which is safe to read.

## Report comment is missing even though the run succeeded

1. Find the run in the Actions tab, open the "Upload workflow artifact"
   step's output artifact (`dossier-intake-issue-<N>-run-<run-id>`).
2. `report.md` inside it is exactly what should have been posted.
3. If the artifact itself is missing, the "Validate artifact safety"
   step must have failed — check its log (never uploads on failure, by
   design, see `github-actions-workflow.md`'s upload-gating note).
4. Re-run the workflow (`Actions` → the run → "Re-run all jobs") — safe
   to do; every run is idempotent (same intake ID, comment gets
   updated in place, never duplicated).

## A repository label is missing

`npm run intake:validate-workflow` and the workflow itself never create
labels automatically (§14 Varianta A — see `docs/intake/github-labels.md`).
If a run's Step Summary or artifact `_status.json`/publish output shows
`missingRepoLabels`, create the missing label with the `gh label create`
command from `docs/intake/github-labels.md`, then re-run the workflow (or
wait for the next issue edit) to have it applied.

## Duplicate bot comment on an issue

Should not happen under normal operation (concurrency +
create-or-update), but if it does: the workflow always keeps the
**oldest** trusted managed comment up to date and leaves any newer
duplicate alone (never auto-deletes — see
`scripts/intake/github/find-managed-comment.mjs`). To clean up by hand:
confirm both comments are authored by `github-actions[bot]` and both
start with `<!-- vomaste-intake-report:v1 -->`, then manually delete the
newer one via the GitHub UI. Never delete a comment written by a human.

## An issue needs manual security review

`intake:security-review` label + a reduced comment
(`scripts/intake/github/build-safe-reports.mjs`'s
`buildSecurityReviewReport`) means the risk classifier flagged the
submission — the public comment deliberately does **not** repeat the
submitted text. To review:

1. Download the workflow artifact for that run (private to the
   repository's Actions permissions, not the public comment).
2. Open `manifest.json` inside it — the full, un-redacted risk
   classification (`risk_classification.flags[].evidence.redacted_excerpt`)
   is there for a maintainer to read, still bounded/redacted per Phase
   3's own evidence policy (never the full raw field).
3. Never copy the flagged text back into a public comment or into any
   canonical dossier record without your own independent editorial
   judgment — a risk flag is a pattern observation, never a finding
   (`docs/intake/risk-classification.md`).

## When to rerun vs. when to ask the submitter to edit

- **Rerun** (`Actions` → the run → "Re-run all jobs"): the submission
  itself is fine but the run failed for an infrastructure reason
  (timeout, a transient GitHub API error during publishing, a missing
  label since fixed).
- **Ask the submitter to edit the issue**: the submission itself is
  invalid or incomplete (`intake:invalid`/`intake:needs-information`) —
  editing the issue automatically triggers a fresh, correctly-idempotent
  run; there is nothing for a maintainer to manually rerun.

## Recommended branch protection (not currently enforced by tooling)

Documented as a recommendation only — nothing in this repository
mechanically enforces these; they must be configured by hand in GitHub's
repository settings, and this document must never claim otherwise
(constitution §8):

- Require review for changes to `.github/workflows/dossier-intake.yml`,
  `scripts/intake/github/**`, `scripts/intake/preflight/**`,
  `schemas/intake*.json`, and `.github/ISSUE_TEMPLATE/navrh-dossieru.yml`.
- Protect `master`; require the `npm run build` check before merge.
- Restrict who can approve/merge changes to Actions workflows
  specifically (GitHub's own "Require review from Code Owners" setting,
  if a `CODEOWNERS` file is ever adopted — this repo does not have one
  today, see `reports/intake/phase-06-workflow-audit.md`).
- Ensure repository Actions permissions stay at their default
  (read-only `GITHUB_TOKEN`, no PR creation/approval capability for
  Actions) — GitHub's own repository-level setting, independent of any
  individual workflow's `permissions:` block.
