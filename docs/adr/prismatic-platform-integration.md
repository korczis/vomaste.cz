# ADR: Prismatic Platform as an upstream enrichment provider

**Date**: 2026-08-05
**Status**: governance decision accepted (`AUTH-2026-08-05-PLATFORM-SCOPE`
in `AGENTS.md`). Supersedes the "do not use Prismatic directly" portion of
[`aiad-and-agent-tooling-import.md`](aiad-and-agent-tooling-import.md);
retains that ADR's rejection of a wholesale `.aiad/` and `.claude/` copy.
**Implementation status: scaffolded, not functional.** This ADR records
the accepted architecture and the skill/script skeleton that exists on
disk (`.claude/skills/prismatic-*`, `scripts/prismatic/*`); the CLI
pipeline itself — export contract, identity resolution, promotion,
drift audit — is not yet implemented. Every `prismatic:*` npm script
currently exits non-zero with a pointer back to this document instead of
doing real work. Treat "implemented" claims anywhere else in the repo
about this integration as a bug to report, not a feature to rely on.

## Context

`vomaste.cz` is a public, static, auditable dossier registry. Its build
must remain reproducible from repository data. `prismatic-platform` is a
separate, substantially larger analytical system with entity, evidence,
provenance, OSINT and orchestration capabilities.

The earlier ADR measured Prismatic's agent/tooling tree and rejected
copying it into this small repository. That conclusion remains valid. The
same ADR also effectively blocked direct platform reuse and left
integration as a manual TODO. The owner has now explicitly removed that
broader prohibition.

The current need is concrete: enrich existing dossiers and entities, close
source and identity gaps, detect new public-interest relations and create
a repeatable future workflow without turning the public web build into a
distributed runtime dependency.

## Decision

Use `~/dev/prismatic-platform` directly as a **local upstream capability
provider** behind a thin, versioned, machine-readable export contract.

Keep four separate states:

1. raw local provider output;
2. sanitized staging candidates;
3. explicit review decisions;
4. canonical Vomaste data.

Prismatic is never required by Zola, CI or the public browser runtime.
Canonical promotion is evidence-backed, diff-based and reviewable. Batch
review is allowed. Discovery does not publish.

Do not copy the full Prismatic `.aiad/` or `.claude/` trees into Vomaste.
Add only repository-specific skills and adapter code justified by this
integration.

## Why this shape

### It reuses actual capability without creating a second platform

Vomaste should not reimplement mature identity, registry, extraction or
provenance capabilities merely to avoid a cross-repository call. A narrow
provider contract allows reuse while keeping ownership boundaries clear.

### It preserves deterministic publication

A static public build depending on a sibling checkout, database, token or
live provider would be non-reproducible and hostile to contributors. The
integration therefore runs only in authoring/enrichment workflows.
Accepted results are materialized into canonical repository data before
build.

### It prevents processor output from becoming self-citing evidence

Prismatic can discover and transform evidence. It cannot certify its own
inference as fact. The contract carries the underlying source locator and
provenance so Vomaste can apply its own editorial rules.

### It supports scale and recovery

A run manifest, stable ids, bounded concurrency, idempotent import and
resume support allow all-entity enrichment without a fragile one-shot
script — once built (see implementation status above).

## Contract boundary

The provider emits a versioned JSONL/NDJSON contract. The consumer rejects
an unknown major version. Required record classes include run metadata,
entity, identity, source, claim, relation, case/event, gap, warning and
error records.

The contract records both repository commits and enough provenance to
reproduce or audit a candidate. Raw payloads remain local unless
explicitly sanitized. **Not yet implemented**: no schema file, fixtures or
consumer exist on disk yet; this is the shape the first implementation
pass must produce.

## Source of truth

- Vomaste canonical data remains the publication source of truth.
- Prismatic remains the analytical source of candidates and
  transformations.
- Generated Zola content, exports, navigation, search indexes and JSON-LD
  remain derived artifacts.
- Aggregate dossiers remain derived views, not duplicated owners of
  records.

## Governance change

The owner has replaced per-subject authorization with a standing
public-interest scope and run/batch review gate — see "Standing scope
authorization and publication gates" in `AGENTS.md`. Historical
authorization entries remain append-only records. This ADR does not
weaken evidence, privacy, status-framing or provenance rules. As that
section's own "Implementation status" note says, the mechanical
`validate-authorization.mjs` gate has not yet been rewritten to match —
until it is, a new dossier still needs a corresponding
`data/authorizations.toml` record for `npm run build` to pass.

## Rejected alternatives

### Copy Prismatic tooling wholesale into Vomaste

Rejected. It duplicates a large ecosystem, creates update drift and gives
the static site an unrelated maintenance surface.

### Read Prismatic's database directly

Rejected as the primary integration. Internal database schemas are not a
stable contract, often lack transport-level redaction and couple consumer
releases to provider migrations.

### Call Prismatic during `npm run build`

Rejected. It breaks offline reproducibility and makes public output
depend on credentials, network and local state.

### Let discovery write canonical records directly

Rejected. It collapses candidate generation, evidence assessment and
publication into one irreversible step.

### Reimplement every useful provider in Node inside Vomaste

Rejected by default. A small local fallback may be justified for a
public, stable, low-complexity registry, but duplicating platform
capabilities is not the integration strategy.

## Consequences

Positive:

- all dossiers/entities can eventually be enriched through a common
  workflow, once the pipeline below "Implementation status" is built;
- actual platform capability is reused instead of reimplemented;
- public build remains static and forkable;
- every run will be pinned to provider and consumer commits;
- failures will be resumable and reviewable;
- provider upgrades will be visible through contract drift checks.

Costs:

- two repositories and two commit histories must be coordinated;
- a stable export contract and fixtures require maintenance;
- staging/review/promotion add deliberate process;
- some provider findings will remain unpublished because they lack
  adequate public evidence or proportionate public-interest basis;
- the pipeline is currently a skeleton — scaffolded skills/scripts, no
  working contract, no working promotion. Building it out is real,
  unstarted work, tracked in
  `docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`.

## Compatibility and revisit conditions

Revisit this ADR if:

- Prismatic exposes a stable network API that is demonstrably better than
  the local CLI contract for authoring while preserving reproducibility;
- the two projects are deliberately merged into one monorepo;
- contract maintenance exceeds the cost of a shared library package;
- Vomaste gains a private, server-side editorial backend and the static
  repo is no longer the sole canonical publication store.

None of those conditions permit silent runtime coupling. A new ADR is
required.
