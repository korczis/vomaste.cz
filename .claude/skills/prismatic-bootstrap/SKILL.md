---
name: prismatic-bootstrap
description: Checks both vomaste.cz and ~/dev/prismatic-platform, resolves PRISMATIC_PLATFORM_PATH, records commit SHAs, validates the export contract and reports whether a local integration run is safe to start. Run first, before prismatic-enrich-all, whenever a task touches Prismatic-sourced research or enrichment.
argument-hint: (none)
---

## Status: not implemented — read this before running anything

This skill's job — checking both repos, resolving the sibling path,
validating an export contract version — is **not built yet**. There is
no `scripts/prismatic/lib/config.mjs`, no export contract, no schema.
`npm run prismatic:status` and `npm run prismatic:probe` exist as stub
commands that print this same fact and exit 1.

The accepted architecture lives in
[`docs/adr/prismatic-platform-integration.md`](../../../docs/adr/prismatic-platform-integration.md)
(`AUTH-2026-08-05-PLATFORM-SCOPE` in `AGENTS.md`). The unstarted build
plan is
[`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](../../../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md),
Fáze 0–2, plus the companion checklist in the same directory.

## What to do when this skill is invoked

1. **Don't fabricate a run.** Never report commit SHAs, contract
   versions or capability availability you didn't actually check by
   opening real files — there is nothing real to check yet.
2. Tell whoever invoked this that the integration is scaffolding-only:
   governance and docs landed, the CLI pipeline did not.
3. If the task is "actually build the Prismatic integration", start at
   Fáze 0 of the master prompt above (audit both repos for real, from
   source — `mix help`, tests, actual entry points, not old TODO names)
   and work forward from there. That is a large, multi-session build,
   not something this skill can shortcut.
4. If the task is something else entirely and just mentions Prismatic in
   passing, don't pull in this whole mission — do the smaller thing
   actually asked.

## Once the pipeline exists (future state, not current)

This skill will run, in order: verify both repos are real Git repos with
resolvable commit SHAs; resolve `PRISMATIC_PLATFORM_PATH` (env → local
ignored config → `../prismatic-platform` sibling default); check the
export contract's advertised major version against what
`scripts/prismatic/lib/contract.mjs` supports; report readiness without
running any research capability itself. It hands off to
`prismatic-enrich-all` for the actual plan/run steps.
