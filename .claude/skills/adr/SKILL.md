---
name: adr
description: Write an Architecture Decision Record under docs/adr/ for a significant, debatable technical choice — especially "should we adopt a bigger stack/dependency for this" questions — using this repo's existing measured-not-speculative template (see docs/adr/graph-renderer.md).
argument-hint: <short-topic-slug> "<question being decided>"
---

## When to write one

An ADR earns its place when a decision is **significant** (a new
dependency, a data-model change, a renderer/library swap) **and**
**debatable** (a reasonable person could argue either way, or someone —
including a future session — is likely to propose revisiting it). Small,
obviously-correct changes don't need one. A recurring shape worth
recognizing: a proposal to adopt a bigger/fancier stack
(WebGL renderer, a second canonical data format, an analytical database,
a new framework) than the current, measured scale of this repo actually
needs. `docs/adr/graph-renderer.md` is the reference example — read it
before writing a new one, not just this skill.

## The discipline (non-negotiable, matches the existing ADR)

1. **Measure, don't estimate.** Pull real numbers from this repo before
   arguing anything — record counts (`data/dossiers/*/stats.toml` or
   `data/generated/global-graph.json`), bundle sizes (`static/js/app.js`,
   `static/css/main.css` after `npm run build`), actual page counts. An
   ADR that says "could get slow at scale" without a measured current
   scale is not done.
2. **State what was actually broken, if anything.** Proposals to adopt a
   bigger stack often start from a real symptom (a UI bug, a perceived
   slowness) that turns out to have a much smaller root cause. Find and
   fix the real bug; that's frequently the entire resolution, and it
   belongs in the ADR as its own section so the record doesn't
   misattribute the fix to the (rejected) bigger stack.
3. **Weigh the concrete maintenance cost of adopting**, not just of not
   adopting — new dependencies, new generators/validators to keep in
   sync, new parallel canonical formats (a second source of truth is a
   new duplication risk, not a reduction of one — this repo's
   single-source-of-truth invariant in `AGENTS.md` applies here too),
   new test surface. "Right architecture in the abstract, wrong scale
   right now" is a legitimate and common conclusion — say so plainly
   instead of hedging.
4. **Give a numeric, measured revisit threshold**, not "later" or "if it
   grows." E.g. "reconsider at N nodes/edges/rows" with the actual
   library's own documented performance guidance as the basis for the
   number. This is what makes "not now" different from "no."
5. **Honesty over politeness**: if a proposal (from the owner, from
   another session, from a PR) is measurably unjustified at current
   scale, the ADR says so with numbers, not with a soft non-answer. This
   matches the repo's general evidence-over-vibes stance.

## File and structure

`docs/adr/<topic-slug>.md`:

```markdown
# ADR: <short title>

**Status**: accepted / rejected / superseded by <link>, revisit at the threshold below.
**Date**: YYYY-MM-DD.

## Measured current scale

(real numbers, with the commands/files used to get them)

## Question asked

(the actual proposal, stated fairly — don't strawman it)

## Decision

(one or two sentences, unambiguous)

## Reasoning

(cost of adopting now vs. the measured need; what's right in the
abstract vs. right at this scale)

## What was actually broken, and was fixed

(if applicable — the real bug behind the symptom, and its actual fix)

## Revisit threshold

(numeric, sourced from the adopted-or-rejected technology's own
guidance where possible)
```

Link the new ADR from `docs/adr/` if there's an index; if the topic
touches the dossier data model, editorial rules, or authorization scope,
an ADR never overrides `AGENTS.md` — it documents a technical/
architecture decision, not a scope decision (scope changes only ever
happen via the append-only authorization log, see the `dossier-entry`
skill).
