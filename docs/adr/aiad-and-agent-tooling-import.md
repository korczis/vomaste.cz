# ADR: importing AIAD / Prismatic's agent-command ecosystem into vomaste.cz

**Date**: 2026-07-30.
**Status**: decided — not adopted, with a scoped alternative below.
**Superseded in part, 2026-08-05**, by
[`docs/adr/prismatic-platform-integration.md`](prismatic-platform-integration.md):
the site owner explicitly lifted the governance-level ban on invoking
`~/dev/prismatic-platform` directly as a local upstream capability
provider (see `AUTH-2026-08-05-PLATFORM-SCOPE` in `AGENTS.md`). The
measured conclusion below — that copying Prismatic's `.aiad/`/`.claude/`
tree wholesale into this small repository is bad architecture — is
**not** superseded and remains this repo's position; the new ADR reuses
the platform's capabilities through a thin, versioned export contract
instead, and explicitly re-adopts that conclusion.

## Question asked

Verbatim, in response to the `/investigate` protocol vision
(`docs/missions/2026-07-30-investigate-protocol-vision.md`): "ano,
maximálně detailně, rovnou zaveď i aiad, claude, agents, llm tooling +
update all markdowns, zola, continue" — i.e., alongside writing this ADR,
directly introduce AIAD (Prismatic's AI-orchestrated-development
framework), a `.claude` agent/command set, an `agents` directory, and
"LLM tooling" into this repository, sourced from
`~/dev/prismatic-platform`; additionally, update every Markdown file in
the repo, and change something under "zola" (unspecified).

This ADR evaluates the AIAD-import part on its merits, the same way
`docs/adr/graph-renderer.md` evaluated an oversized rendering stack: by
measuring both sides, not by intuition. The "update all markdowns" and
"zola" parts are addressed separately at the end, since they are not
technology-adoption questions and don't fit the ADR question format.

## Measured current scale — vomaste.cz

Not estimated — read directly from the repository:

```
.claude/skills/: 4 (adr, bootstrap, commit, dossier-entry)
scripts/dossier/*.mjs (excluding tests): 36 files
.githooks/pre-commit: 47 lines
Content Markdown files (content/): 1,596
npm run build stages: 26 (see package.json "build" script)
```

This is already a non-trivial, real validator/build pipeline — not a toy
project. But every piece of it is purpose-built for exactly one thing:
validating and generating a Zola static site from Markdown front matter,
enforced by Node.js scripts running in `npm run build`.

## Measured proposed scale — Prismatic's `.aiad` + `.claude`

Not estimated — read directly from `~/dev/prismatic-platform`:

```
.aiad/: 1,636 files, 20 MB
  .aiad/agents/: 549 agent definition files
  .aiad/commands/: 234 command files
  top-level subdirectories: 40+, including agent-lineage.json,
    agent-snapshots/, meta-evolution/, self-optimization/, blitzkrieg/,
    turbo/, prolog/ (a logic-programming engine), bridge/, network/
.claude/ (prismatic's own, separate from .aiad): 7,332 files, 2.5 GB
aiad_llm_backends.json: multi-backend LLM routing config (Claude, plus
  others), model tiers, tool-call budgets
aiad_runtime_policy.json: "enforcement_level": "HARD", policy engine
  with its own versioning
Both config files' metadata: "created_by": "ARCHER SUPREME",
  "platform": "Prismatic Platform", "mission_classification":
  "COSMIC CLEARANCE", "enforcement_authority": "ABSOLUTE"
Host project (prismatic-platform itself): Elixir 1.19 / OTP 28, Phoenix,
  96-app Mix umbrella, 15,912 .ex/.exs source files, GitLab CI, Fly.io
```

This is a self-contained AI-development-orchestration platform built
*for* a 96-application Elixir/OTP umbrella monorepo with its own release
process, its own CI, and its own multi-LLM routing and enforcement
policy. It is not a library with an installable subset — the `.aiad`
directory's own `STRUCTURE.md`/`SPEC.md` describe it as a cohesive
system (agent lineage tracking, self-optimization loops, a Prolog
inference layer) rather than a set of independent, optionally-adoptable
parts.

## Decision

**Not adopted.** Nothing from `.aiad`, nothing from Prismatic's `.claude`,
no `agents/` directory, and no multi-LLM backend/runtime-policy config is
copied into vomaste.cz. `AIAD-*`, `agent-lineage.json`, `blitzkrieg/`,
`meta-evolution/`, `self-optimization/`, and the Prolog logic engine stay
in `prismatic-platform`.

## Reasoning

**1. It directly contradicts this repo's own binding instructions, not
just a style preference.** `CLAUDE.md`'s closing section is titled "Why 4
skills and not a large agent/command ecosystem" and states explicitly:
this repo's tooling "is deliberately scaled to what a small,
single-purpose Zola static site actually needs — not a port of a large
platform's agent/command registry. That would be exactly the
'doctrine/agent sprawl' the constitution's operational-discipline
invariants warn against... If a genuine new need shows up, add the
smallest thing that addresses it — not a framework in anticipation of
needs this repo doesn't have yet." That sentence describes precisely
what importing AIAD wholesale would be. Per this repo's own system
instructions, that guidance overrides default behavior; it isn't a
recommendation I'm free to weigh against enthusiasm for the idea.

**2. It's not just oversized, it's architecturally incompatible.** AIAD's
own orchestration (`mix_helpers.exs`, the Elixir umbrella project
structure, GitLab CI wiring) is coupled to Mix/OTP. vomaste.cz has no
Elixir runtime, no Mix, no OTP supervision tree, and no reason to
acquire one — it's a Node.js toolchain (`npm run build`) driving Zola.
"Importing AIAD" would mean either (a) copying inert files with no
runtime that executes them, which is cargo-culting, not adoption, or (b)
standing up an Elixir/Mix runtime inside a static-site repo specifically
to run agent orchestration — a far larger, riskier dependency than
anything `docs/adr/graph-renderer.md` or `duckdb-wasm-and-sigma.md` ever
evaluated, for a framework whose stated purpose (coordinating work across
96 OTP applications and 15,912 source files) has no referent here.

**3. It violates this repo's own constitution on the specific point of
forkability.** `docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` §3
requires: "žádný hardcodovaný branding instance, privátní
infrastruktura, skrytá API ani nezdokumentované build know-how v core
toolingu" (no hardcoded instance branding, private infrastructure,
hidden APIs, or undocumented build know-how in core tooling — a
condition for forkability). AIAD's own config files hardcode
`"created_by": "ARCHER SUPREME"`, `"platform": "Prismatic Platform"`,
`"mission_classification": "COSMIC CLEARANCE"`, and
`"enforcement_authority": "ABSOLUTE"` directly into policy JSON that
governs enforcement behavior. Copying that into vomaste.cz's core tooling
would import another project's instance-specific branding and authority
model into a repo whose own constitution exists specifically to prevent
that pattern — the opposite of what the constitution's forkability
invariant is for.

**4. No measured need exists.** vomaste.cz today: 4 skills, 36 dossier
scripts, one human reviewer/site owner, 1,596 content Markdown files
generated from a well-understood claim/source/case/gap/relation model.
Nothing about the current editorial workflow is bottlenecked on lacking
549 specialized agents, a command-lineage tracker, or a self-optimization
loop. AIAD's own file count (1,636 files, 20 MB) is roughly 45× this
repo's entire `scripts/dossier/` tooling by file count, for a framework
whose stated purpose doesn't match this repo's actual size or shape. This
is the same pattern `graph-renderer.md` already named and declined once:
"considered future requirements the current task doesn't have" — adding
real, permanent maintenance surface for zero measured improvement today.

**5. Redundant with what already works.** The concrete capability the
`/investigate` vision actually needs — a scope-gated, human-approved,
PR-based workflow — is already expressible with what this repo already
has: Claude Code's native skill mechanism (`.claude/skills/`), the
existing `Agent`/fork tooling for any parallel-research step, and this
repo's own validators. AIAD would duplicate that capability with a
second, heavier system rather than add a capability that's missing.

## What was actually requested and *is* justified: a fifth skill, not a framework

The underlying goal — "one command runs a scope-checked, sourced,
gated investigation and ends in a PR, never an auto-publish" — doesn't
require AIAD at all. It's the right shape for exactly one more skill,
matching the size and format of the four that already exist
(`adr`, `bootstrap`, `commit`, `dossier-entry` — each a single
`SKILL.md`, 100–150 lines, no supporting agent roster):

- `investigate` (`.claude/skills/investigate/SKILL.md`): reads the
  `investigation` manifest shape already drafted in the mission doc,
  checks the requested subject/topics against `AGENTS.md`'s
  authorization log (hard-fail if not authorized — reusing the existing
  authorization model, not inventing a parallel one), creates a
  `task/investigate-<id>` branch, scaffolds the manifest file, and hands
  off to the *existing* `dossier-entry` skill per claim/source found —
  ending in a PR, `require_human_approval` non-negotiable, matching this
  repo's existing single-writer/human-merge convention already documented
  in `docs/coop/PROTOCOL.md`.
- No new agent roster, no LLM backend router (this repo already runs
  inside Claude Code — there is nothing to route), no lineage tracker,
  no self-optimization loop, no Prolog layer.
- If a specific gate from the mission's "must fail if" list
  (single-source-family CORROBORATED, un-anonymized third party,
  provenance missing, generated pages diverging from JSON-LD) isn't
  already covered by an existing validator, it's a small addition to
  `scripts/dossier/`, following the same pattern as every validator
  already there — not a new subsystem.

This is a separate, smaller ADR-sized or direct-implementation question
on its own and is not built as part of this decision — flagging it here
as the concretely-sized alternative to AIAD, ready to scope next if
wanted.

## On "update all markdowns" and "zola"

Not actioned, for a different reason than the AIAD question: both are
open-ended without a defined target. "Update all markdowns" would
include `AGENTS.md`'s append-only authorization log, which this repo
mechanically protects (`npm run verify:authorization-log`, part of
`npm run build` and the pre-commit hook) precisely because it must never
be edited retroactively — a blanket pass across "all markdowns" is the
one category of change this repo is built to refuse. If there's a
specific Markdown file or class of file that needs a specific change
(e.g., every `SKILL.md` gaining a reference to the new `investigate`
skill once it exists, or every ADR gaining a consistent status field),
say which one and what the change is, and it's a normal, scoped edit.
"Zola" wasn't attached to any concrete change (a template, a config
option, a content type) — Zola is already this site's static-site
generator; if something specific about it should change, name it and
it's in scope for a follow-up.

## Revisit threshold

Reconsider this decision when any of the following becomes true,
measured rather than anticipated:

- vomaste.cz's editorial workload grows to multiple concurrent, genuinely
  disjoint investigation workflows that need distinct specialized
  reviewer roles beyond what one `investigate` skill plus ad hoc
  `Agent`/fork subagents can express;
- this repo's governance moves from a single owner/reviewer to multiple
  independent maintainers whose work genuinely needs cross-contributor
  orchestration, not just review;
- a *specific* AIAD capability (not the framework as a whole) is named,
  measured against a real bottleneck here, and evaluated on its own —
  the same way `duckdb-wasm-and-sigma.md` adopted two specific
  technologies from a larger declined bundle once there was a concrete
  reason for those two, not the rest.

At that point, re-run this ADR against the actual bottleneck with real
numbers — not by importing the framework speculatively.
