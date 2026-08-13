---
name: prismatic-enrich-all
description: Builds a deterministic job plan across canonical entities and dossiers, runs only applicable Prismatic capabilities, imports sanitized candidates into staging and generates a review report. Never writes canonical content. Run after prismatic-bootstrap confirms both repos are ready.
argument-hint: [--entity <id> | --dossier <slug> | --all] [--dry-run]
---

## Status (2026-08-06): `plan` is real, narrowly scoped; `run`/`import`/`review` are not

`npm run prismatic:plan -- [--all | --entity=<id> | --dossier=<slug>] [--max-records=N] [--json]`
is real: it reads vomaste's own compiled canonical model and produces a
deterministic, explainable job list — but it is deliberately scoped to
**one** capability the Fáze 0 audit verified as safe to plan for:
`entity-ares-lookup`, for `company`/`organization` entities missing
`externalIds.ico`. It also surfaces high-priority stale gaps as
informational-only (no capability mapped). It does not plan jobs for
property, sanctions, EU-institutions, or any other capability the audit
found fabricated, broken, or unverified — see
[the capability map](../../../docs/audits/2026-08-05-prismatic-capability-map.md)
before adding a new job type here.

`prismatic:run`, `prismatic:import`, and `prismatic:review` are still
stubs — there is no job executor, no identity resolution, no staging
writer, no review-report generator, because Prismatic itself has no
matching exporter to call yet.

Architecture: [`docs/adr/prismatic-platform-integration.md`](../../../docs/adr/prismatic-platform-integration.md).
Build plan and per-sub-phase status: [`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](../../../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md)
Fáze 2 + companion checklist.

## What this skill does today

1. Run `npm run prismatic:plan -- --dossier=<slug>` (or `--entity=`/`--all`)
   and read its actual output — don't guess what it would say.
2. The plan never executes anything; it's read-only against vomaste's own
   data. Report its job counts and per-job reasoning honestly.
3. If asked to actually run/import/review, say that part isn't built yet
   and point at the docs above.

## What this skill will additionally do once `run`/`import`/`review` exist

4. Run only the planned capabilities, writing raw output to
   `var/prismatic-runs/<run-id>/` (local, gitignored) and sanitized
   candidates to `data/staging/prismatic/<run-id>/` (Git-tracked,
   reviewable).
5. Produce a review report — new identities, sources, claims, relations,
   gaps, conflicts, identity collisions, and anything that failed or has
   no primary source — for a human to actually read before anything is
   promoted.
6. **Never** write to `data/dossiers/**`, `content/**` or any generated
   export. That is exclusively `prismatic-promote`'s job, and only from
   an explicit, human-reviewed manifest.

## When NOT to use this skill

- **Before `prismatic-bootstrap` has confirmed both repositories.**
  Running against an unverified checkout produces candidates whose
  provenance cannot be reconstructed.
- **To write canonical content.** This skill never touches
  `data/dossiers/**`. Promotion is a separate, reviewable step.
- **To answer whether something is true.** It generates candidates and
  gaps. A candidate is not evidence and a confidence value is not a
  source.
