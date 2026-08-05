---
name: prismatic-drift-audit
description: Compares the currently installed Prismatic commit, available capabilities, contract schemas and fixtures with the last accepted integration baseline. Run whenever prismatic-platform changes materially, the export contract changes, or before a large enrich-all rerun after a long gap.
argument-hint: (none)
---

## Status: not implemented — read this before running anything

`npm run prismatic:drift` (`scripts/prismatic/drift.mjs`) is a stub that
prints a pointer to the ADR and exits 1. There is no accepted baseline to
drift against yet, because nothing has been promoted through this
pipeline.

Architecture: [`docs/adr/prismatic-platform-integration.md`](../../../docs/adr/prismatic-platform-integration.md).
Build plan: Fáze 4, item 9, of
[`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](../../../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md).

## What this skill will do once built (do not simulate this now)

1. Read the last run manifest's recorded `prismatic_commit` and contract
   version, and compare against the sibling repo's current `HEAD` and
   advertised contract version.
2. Report new/removed/changed capabilities relevant to this integration
   (not a full changelog of an unrelated large platform).
3. Flag when a large `enrich-all` rerun is about to run against a
   materially different Prismatic than the one the last accepted batch
   was reviewed under, so a human can decide whether to re-audit
   capabilities (Fáze 0 of the master prompt) before trusting a fresh
   run's output the same way.

## What to do if asked to run this today

Say there's no baseline and no drift detector yet; if genuinely needed,
building it is Fáze 4 work and depends on the export contract (Fáze 2.2)
existing first.
