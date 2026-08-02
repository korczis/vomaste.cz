# GitHub labels for dossier intake (Phase 6)

The label vocabulary the intake workflow applies, defined in
`scripts/intake/github/constants.mjs`'s `LABELS` — the single source of
truth this document mirrors. Labels are a **projection** of the current
manifest's workflow state (`scripts/intake/github/sync-labels.mjs`), not
the source of truth themselves — the source of truth is always the
manifest a fresh run of the local processor would produce from the
issue's current body.

## Label table

| Label | Meaning | Owner | Mutually exclusive |
|---|---|---|---:|
| `intake:triage` | Valid submission, awaiting the owner's manual triage | workflow | yes |
| `intake:invalid` | Submission doesn't parse or fails validation | workflow | yes |
| `intake:needs-information` | Valid, but missing sources or too vague | workflow | yes |
| `intake:possible-duplicate` | May relate to an existing dossier/entity | workflow | yes |
| `intake:security-review` | Automatic processing was limited; needs manual security review | workflow | yes |
| `intake:preflight-complete` | The URL preflight check ran (informational only) | workflow | no (independent) |
| `authorization:pending-owner` | Always present on every valid, unauthorized intake | workflow | no |
| `publication:blocked` | Always present on every valid, unauthorized intake; also kept through closing | workflow | no |

Exactly one of the five `intake:*` state labels is ever active at a time
(`scripts/intake/github/sync-labels.mjs`'s `desiredLabelsForStatus`
enforces this: applying one state always removes any other state label
that was previously present). `intake:invalid` never appears alongside
`authorization:pending-owner`/`publication:blocked` — an invalid
submission was never valid enough to reach "pending owner decision" in
the first place (§15.2).

## Forbidden labels

This workflow will never create or apply a label containing any of:
`approved`, `verified`, `confirmed`, `authorized`, `publish`,
`corroborated`, `guilty` (`FORBIDDEN_LABEL_SUBSTRINGS` in
`scripts/intake/github/constants.mjs`, checked by
`scripts/intake/github/constants.test.mjs`). A label is a workflow-state
projection, never an authorization mechanism — see
`docs/adr/ADR-public-dossier-intake.md`'s authorization boundary.

## Bootstrap (manual, maintainer-run — never automated)

GitHub's REST API cannot create a label that doesn't already exist in
the repository. This workflow deliberately does **not** create labels
itself (§14 Varianta A) — a missing repository label degrades that one
label application to `partial` with a diagnostic, it never blocks the
rest of a run, and it never gets silently invented by automation.

Bootstrap the label set once, by hand, via `gh`:

```bash
gh label create "intake:triage" --color "fbca04" --description "Valid submission, awaiting owner triage"
gh label create "intake:invalid" --color "e11d21" --description "Submission does not parse or fails validation"
gh label create "intake:needs-information" --color "d4c5f9" --description "Valid, but missing sources or too vague"
gh label create "intake:possible-duplicate" --color "c2e0c6" --description "May relate to an existing dossier or entity"
gh label create "intake:security-review" --color "b60205" --description "Automatic processing was limited; needs manual security review"
gh label create "intake:preflight-complete" --color "bfd4f2" --description "URL preflight check ran (informational)"
gh label create "authorization:pending-owner" --color "5319e7" --description "Always present on a valid, unauthorized intake"
gh label create "publication:blocked" --color "000000" --description "Always present on a valid, unauthorized intake"
```

Colors above are illustrative — pick whatever's consistent with the
repo's existing label palette. **Colors are not meaning; the label text
is.** Do not run these commands against the production repository as
part of any automated test — they are documented here as a maintainer
runbook step, not exercised by CI.
