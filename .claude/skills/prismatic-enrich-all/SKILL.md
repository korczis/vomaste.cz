---
name: prismatic-enrich-all
description: Builds a deterministic job plan across canonical entities and dossiers, runs only applicable Prismatic capabilities, imports sanitized candidates into staging and generates a review report. Never writes canonical content. Run after prismatic-bootstrap confirms both repos are ready.
argument-hint: [--entity <id> | --dossier <slug> | --all] [--dry-run]
---

## Status: not implemented — read this before running anything

`prismatic:plan`, `prismatic:run`, `prismatic:import` and
`prismatic:review` are stub commands
(`scripts/prismatic/{plan,run,import,review-report}.mjs`) that print a
pointer to the ADR and exit 1. There is no job planner, no identity
resolution, no staging writer, no review-report generator. Nothing in
this skill can actually run yet.

Architecture: [`docs/adr/prismatic-platform-integration.md`](../../../docs/adr/prismatic-platform-integration.md).
Build plan: [`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](../../../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md),
Fáze 2 (architecture) and Fáze 3 (the actual all-entity run) — Fáze 3
explicitly may not start until Fáze 2 is implemented and tested.

## What this skill will do once built (do not simulate this now)

1. Read the compiled canonical dataset and build an explainable plan: for
   every entity/dossier in scope, which Prismatic capability runs and
   why, and which capabilities are skipped and why.
2. Run only the planned capabilities, writing raw output to
   `var/prismatic-runs/<run-id>/` (local, gitignored) and sanitized
   candidates to `data/staging/prismatic/<run-id>/` (Git-tracked,
   reviewable).
3. Produce a review report — new identities, sources, claims, relations,
   gaps, conflicts, identity collisions, and anything that failed or has
   no primary source — for a human to actually read before anything is
   promoted.
4. **Never** write to `data/dossiers/**`, `content/**` or any generated
   export. That is exclusively `prismatic-promote`'s job, and only from
   an explicit, human-reviewed manifest.

## What to do if asked to run this today

Say plainly that it isn't built, point at the two docs above, and if the
actual ask is "build it," start at Fáze 2.1 (config resolution) of the
master prompt rather than skipping ahead to running an "all entities"
job that doesn't exist.
