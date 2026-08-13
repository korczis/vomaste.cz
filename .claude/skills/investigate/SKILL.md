---
name: investigate
description: Run one authorized investigation end-to-end — scope check, branch, an investigation manifest, source-gated research (per-record handoff to dossier-entry), and a PR that a human must approve. Never auto-publishes. See docs/adr/aiad-and-agent-tooling-import.md for why this is one skill, not an agent framework.
argument-hint: <subject-entity-id> "<specific topic — must already be authorized, or be a scope extension the owner is explicitly authorizing in this conversation>"
disable-model-invocation: true
---

## What this is, and isn't

This is the `/investigate` protocol from
`docs/missions/2026-07-30-investigate-protocol-vision.md`, scoped down to
what `docs/adr/aiad-and-agent-tooling-import.md` actually justified: one
more skill, not an agent framework. It orchestrates the same steps a
careful human editor already does by hand in this repo — scope check,
sourced research, `dossier-entry` per record, validated build, PR — as a
single repeatable flow, so nothing gets skipped under momentum. It does
**not** introduce a new agent roster, a new data format, an LLM router,
or anything that runs outside Claude Code's existing tools. If a step
below needs research fan-out, use the generic `Agent`/fork tool — this
repo deliberately has no investigation-specific subagents.

Every step ends the same way every other skill here does: a real,
green `npm run build`, and a human merge/push — never this skill acting
alone.

## Step 0 — scope check (hard gate, no override)

This is the same gate `dossier-entry` enforces per record, run once up
front for the whole investigation. Open `AGENTS.md`, section "Content
about real parties," and determine which of two states you're in:

**A. Subject + topic already authorized.** You can point to the exact
dated subsection covering this specific person **and** this specific
controversy/topic. Quote it (record id, e.g. `AUTH-2026-07-30-C`) in the
manifest (step 2) and proceed to step 1.

**B. Not yet authorized** — either a new subject, or a scope extension to
someone already covered. Do not write any dossier content. Instead:

1. Research candidate topics using named, dated, independent sources —
   **open and read each one directly**, never cite from a search
   snippet (same rule as `dossier-entry` step 1 for sources).
2. A clear owner request in the current conversation to create, add,
   investigate, deepen or cover this named subject is the on-the-record
   decision. Do not demand a magic phrase, restate the same question, or
   wait for another "proceed". If the owner has not requested work on the
   named subject, present sourced candidates and ask once.
3. Once explicitly authorized, the write path depends on which kind of
   authorization it is — these are not interchangeable:
   - **Brand-new subject** (no existing authorized entry at all): use
     `npm run authorize:entity <entity-id>` after the owner has made the
     decision. The owner may confirm interactively, or this skill may draft
     a concrete scope from the request and opened public sources, then record
     it with `--owner-authorized-in-conversation` and `--scope-file=<path>`.
     A clear request naming the subject is enough; the skill proceeds without
     a second authorization round. CI and background automation may not use
     this mode without a current owner instruction.
   - **Scope extension to an already-authorized subject**: append a new
     dated subsection to AGENTS.md's log yourself (never edit or remove
     an existing entry), stating exactly who, which specific topic, and
     the sourcing limits — this mirrors how every prior scope-extension
     entry in that file was recorded, immediately after the owner's
     explicit approval in the same conversation.
4. Either way: stop here until the authorization actually exists on
   record. Do not proceed to step 1 on the strength of "they'll probably
   approve it."

## Step 1 — branch

Content changes from an investigation are **never** committed directly
to `master`, regardless of role — this is narrower than `bootstrap`'s
usual ORCH-direct-commit precedent, which already excludes anything
under `content/`.

- Inside the multi-instance co-op protocol (`docs/coop/PROTOCOL.md`):
  get/claim a `T-###` on the board and work in
  `~/dev/vomaste-worktrees/T-###` on `task/T-###`, exactly as
  `bootstrap` describes.
- Solo/direct session: `git checkout -b task/investigate-<subject>-<topic-slug>`.

## Step 2 — investigation manifest

Create `data/investigations/<id>.toml` (new file, new directory on first
use — nothing to scaffold in advance). Keep it an operational record,
not a second copy of the authorization: it references the AGENTS.md
record id rather than restating scope text, so there is exactly one
place scope is defined.

```toml
id = "investigate-<subject>-<topic-slug>"
title = "..."
subject_entity_id = "<matches content/entities/<id>.md>"
auth_record_id = "AUTH-YYYY-MM-DD-X"   # the AGENTS.md subsection from step 0
status = "draft"                        # draft | sourcing | pr-open | merged | abandoned
branch = "task/investigate-<subject>-<topic-slug>"
opened = "YYYY-MM-DD"
allowed_source_classes = ["independent_media", "public_registry", "official_primary_source"]
notes = ""
```

`publication.mode` and `require_human_approval` are deliberately **not**
fields here — they're not per-investigation choices, they're this repo's
standing invariant (single-writer merge, `docs/coop/PROTOCOL.md`), so
making them configurable would just invite an investigation that opts
out. There isn't one.

## Step 3 — sourced research, one record at a time

For every claim/source/case/gap/relation the research turns up, run the
**existing** `dossier-entry` skill in full — it already enforces:
opened-not-snippeted sources, honest status (`CORROBORATED` needs 2+
independent, distinct-family sources; default to `1 ZDROJ`), canonical
JSON records (`data/dossiers/**`) with regenerated content adapters
(`npm run data:build`), and procedural-outcome framing every time it's
mentioned. This skill doesn't re-implement any of that.

Manual OSINT tooling (e.g. `~/dev/prismatic-platform`'s
`mix investigate.person` / `mix prismatic.osint.*` tasks, see
`docs/dossier-audit/PRISMATIC_SOURCING_TODO.md`) may inform *where to
look* for another independent source on an already-authorized topic. It
is never a citable source itself, never runs automatically as part of
this skill, and never expands scope on its own findings — a tool
surfacing something outside step 0's authorized topic goes back to step
0, part B, as a new candidate, not into a claim.

## Step 4 — gate checklist before opening the PR

The mission doc's "must fail if" list, mapped honestly to what actually
enforces each one today — some are real build-time gates, some are
still human judgment this repo doesn't automate (say so; don't claim
tooling coverage that doesn't exist, per
`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` §10):

| Condition | Enforced by |
|---|---|
| Scope not authorized | `npm run validate:authorization`, `verify:authorization-log`, canonical rule S5 (`npm run data:validate`) — **and** step 0 above, which is the real gate; the validators only catch a record whose authorization pointer doesn't resolve, not "should this exist at all" |
| Claim status doesn't match cited source count | `npm run data:validate` — rules S1 (`1 ZDROJ` = exactly one) and S2 (`CORROBORATED` = ≥ 2 sources from ≥ 2 families) |
| `CORROBORATED` sources are actually the same publisher family | Rule S2 counts **families** (`sourceFamily` > outlet), so two same-family cites fail mechanically (regression test: `scripts/ui/source-independence.test.mjs`) — but the `sourceFamily` labeling is itself an editorial input. Check the labeling yourself, every time; a wrong family label defeats the check. |
| Claims table and canonical record disagree | `npm run data:validate` — parity rules T1–T8 (byte-exact); detail pages are generated from the records, so page drift is impossible by construction |
| Anchors/case references don't resolve in built HTML | `npm run verify:anchors` |
| Generated page missing required sections / JSON-LD node | `npm run verify:full-pages`, `npm run verify:jsonld` |
| Unauthorized dossier subject slipped into navigation/registry | `npm run validate:dossier-types`, `npm run validate:navigation` |
| Un-anonymized third party who should stay unnamed | **Not mechanically enforced.** This is a human editorial read of the cited reporting, every time — no validator can know who the source intentionally left unnamed. |
| Private-submission material in the public output | **N/A by construction**: this repo has no intake channel at all yet (`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` §11 — honestly listed as not implemented). There is nothing non-public for this skill to accidentally publish; keep it that way — don't paste private tips, DMs, or leaked documents into any file this skill touches. |
| Build/integrity gate fails | `npm run build` (full chain — not the pre-commit fast subset, see the `commit` skill) |

Run `npm run build` clean before opening the PR. Set the manifest's
`status` to `pr-open`.

## Step 5 — PR, not publish

Open the PR exactly as `docs/coop/PROTOCOL.md` / the `commit` skill
already describe for this repo: worker sends `review-request` on the
coop bus once green, or a solo session opens a normal PR against
`master`. Merge/push is ORCH's or the site owner's call, same as every
other content change here — this skill's job ends at a reviewable PR,
full stop.

## When NOT to use this skill

- **For a single record.** One source, one claim, one gap — use
  `dossier-entry` directly. This skill is the orchestration around
  many of them and its ceremony is wasted on one.
- **For a subject whose scope you have not checked.** The scope check is
  the first step for a reason; running the rest first produces work that
  cannot be published.
- **To publish.** This skill ends at a pull request, always. If what you
  want is for findings to appear on the site without a human approving
  the diff, that is not this skill and not this repository.
