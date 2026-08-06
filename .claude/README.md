# Claude tooling for vomaste.cz

This directory contains small, repository-specific skills. It is not a
copy of Prismatic's agent ecosystem — that import was measured and
declined; see
[`docs/adr/aiad-and-agent-tooling-import.md`](../docs/adr/aiad-and-agent-tooling-import.md).

## Skills

### Core (always available, fully working)

- `bootstrap` — new session onboarding: rules, co-op status,
  prerequisites, role.
- `dossier-entry` — add a claim/source/case/gap/relation, scope-gated.
- `investigate` — full authorized investigation, scope check → PR.
- `adr` — write an Architecture Decision Record for a debatable choice.
- `commit` — the commit itself: message format, right gate, coop report.

### Prismatic integration (scaffolded, 2026-08-05 — see status below)

- `prismatic-bootstrap`
- `prismatic-enrich-all`
- `prismatic-promote`
- `prismatic-drift-audit`

Intended flow once built:

```text
bootstrap
  ↓
prismatic-bootstrap
  ↓
prismatic-enrich-all
  ↓
review generated plan, candidates and diff
  ↓
prismatic-promote
  ↓
commit
```

**Current status (2026-08-06): governance/architecture accepted, config +
export contract + status/probe/plan real and tested, run/import/promote
still stubs.** `npm run prismatic:{status,probe,plan}` actually work —
`status`/`probe` report on the local `prismatic-platform` checkout
(file-existence only, no network), `plan` builds a real, deterministic
job list against vomaste's compiled model, narrowly scoped to the one
capability the Fáze 0 audit verified safe (ARES lookups for
company/organization entities). Everything past planning — actually
invoking a capability, staging, reviewing, promoting — is still a stub,
because Prismatic itself has no matching exporter yet. Read each skill's
own `SKILL.md` before invoking it, and point at
[the build plan](../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md) +
its companion checklist for exactly what's done vs. open.

## Portable settings

Versioned `.claude/settings.json` may contain only portable hooks that
work in a fresh clone and fail harmlessly when the sibling repo is
absent.

Never commit `.claude/settings.local.json`. Local permissions and machine
paths belong to local configuration.

## Output expectations (once the pipeline is built)

Every integration run will have a stable `run_id` and record: Vomaste
commit; Prismatic commit; export contract version; invocation arguments;
planned and completed jobs; warnings/errors; candidate counts; review
status; import/promotion receipts.

No generated prose or internal platform score is self-authenticating. The
underlying public evidence remains the basis for publication.
