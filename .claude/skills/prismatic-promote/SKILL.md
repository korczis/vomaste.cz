---
name: prismatic-promote
description: Consumes an explicit review manifest, validates evidence/provenance and writes canonical changes through existing generators and data contracts. Never commits, pushes or deploys. This is the only step in the Prismatic pipeline allowed to touch data/dossiers/**.
argument-hint: --manifest <data/review/prismatic/run-id.json> [--dry-run]
---

## Status: not implemented — read this before running anything

`npm run prismatic:promote` (`scripts/prismatic/promote.mjs`) is a stub
that prints a pointer to the ADR and exits 1. There is no manifest
format, no promotion writer, no rollback logic. **This skill cannot
write anything to canonical data today.**

Architecture and the nine mandatory publication gates every promoted
record must satisfy: "Standing scope authorization and publication
gates" in `AGENTS.md`, and
[`docs/adr/prismatic-platform-integration.md`](../../../docs/adr/prismatic-platform-integration.md).
Build plan: Fáze 2.8 of
[`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](../../../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md).

## What this skill will do once built (do not simulate this now)

1. Read a review manifest (`data/review/prismatic/<run-id>.json`) — never
   act on raw staging candidates directly.
2. Reject, per candidate: missing source, identity collision, no
   public-interest basis, or procedural framing that doesn't match the
   evidence (a discontinued case reported as a conviction, etc.) — the
   same nine gates as any hand-written claim.
3. Write canonical changes through the **existing** generators and
   contracts (`npm run data:build` and friends) — never a hardcoded
   second writer that bypasses schema validation or the view-model
   pipeline.
4. Produce a diff-before-write mode (`--dry-run`) and an idempotent,
   rollback-safe promotion.
5. Record `reviewed_by`, `reviewed_at`, `run_id`, `prismatic_commit`,
   contract version and evidence hashes on every promoted record.
6. **Never** `git commit`, `git push`, merge, or deploy. That stays a
   human/`commit`-skill action, same as every other change to this repo.

## What to do if asked to run this today

If asked to "promote" or "publish" anything Prismatic-sourced, say the
promotion pipeline doesn't exist and nothing can be written to
`data/dossiers/**` through it. If a specific claim/source genuinely needs
to be added right now, use the existing `dossier-entry` skill instead —
it has always worked independently of this integration.
