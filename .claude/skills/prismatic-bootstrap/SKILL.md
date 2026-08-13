---
name: prismatic-bootstrap
description: Checks both vomaste.cz and ~/dev/prismatic-platform, resolves PRISMATIC_PLATFORM_PATH, records commit SHAs, validates the export contract and reports whether a local integration run is safe to start. Run first, before prismatic-enrich-all, whenever a task touches Prismatic-sourced research or enrichment.
argument-hint: (none)
---

## Status (2026-08-06): config + contract real; run/import/promote not

`npm run prismatic:status` and `npm run prismatic:probe` are real —
`scripts/prismatic/lib/config.mjs` resolves the sibling path (env →
`.prismatic-local.toml` → versioned default) and validates it's a real
Git repo; `probe` checks whether the specific files
[`docs/audits/2026-08-05-prismatic-capability-map.md`](../../../docs/audits/2026-08-05-prismatic-capability-map.md)
verified are still where the audit found them (file existence only, no
network). The export contract
(`scripts/prismatic/lib/contract.mjs` +
[`schemas/prismatic/export-contract.schema.json`](../../../schemas/prismatic/export-contract.schema.json))
is real and tested: NDJSON parsing, per-record schema validation, hard
rejection of an unknown major version.

**Still not built**: anything that actually invokes a Prismatic
capability. Prismatic itself has no matching exporter yet — this skill
cannot "start a real run" no matter what config says, because there is
nothing on the other side to call. `prismatic:run`/`import`/`promote`
remain stubs.

Architecture:
[`docs/adr/prismatic-platform-integration.md`](../../../docs/adr/prismatic-platform-integration.md)
(`AUTH-2026-08-05-PLATFORM-SCOPE` in `AGENTS.md`). Build plan and current
status per sub-phase:
[`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](../../../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md)
+ its companion checklist.

## What to do when this skill is invoked

1. Actually run `npm run prismatic:status -- --json` and
   `npm run prismatic:probe -- --json` — don't guess or recall a prior
   result, both are cheap and real.
2. If prismatic-platform isn't available locally, that's a normal,
   correctly-reported state — say so, don't treat it as broken.
3. If the task is "run an actual enrichment", say plainly that no
   capability can be invoked yet (no exporter exists on the Prismatic
   side) and point at `prismatic:plan` (real, but plan-only — see
   `prismatic-enrich-all`) as the closest thing that currently works.
4. If the task is something else entirely and just mentions Prismatic in
   passing, don't pull in this whole mission — do the smaller thing
   actually asked.

## When NOT to use this skill

- **When the sibling repository is absent.** The public build has no
  dependency on Prismatic and must keep working without it. This skill
  reports that absence; it does not work around it.
- **To obtain a citable source.** Prismatic is a research capability
  provider, never a source. A registry record it transports is cited as
  that registry.
- **As a general session bootstrap.** That is the `bootstrap` skill.
  This one only checks the Prismatic integration.
