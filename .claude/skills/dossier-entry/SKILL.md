---
name: dossier-entry
description: Guided, validator-checked workflow for adding a source (SRC), claim (CLM), case (CASE), gap (GAP), or relation to a vomaste.cz dossier — enforces the authorization-scope gate, edits the canonical JSON dataset (data/dossiers/**), and regenerates the content adapters before anything is considered done.
argument-hint: <source|claim|case|gap|relation> for <dossier-slug>
---

## Before anything else: the scope gate

Run this skill's step 0 for every single record, no exceptions:

**0. Authorization check.** Open `AGENTS.md`, section "Content about real
parties". The default is to cover no one. Find the specific, dated
subsection that authorizes the exact person **and** the exact
controversy/topic the new record is about. If you can't point to that
subsection, or it covers a related-but-different topic, **stop and ask
the site owner** — do not write the content on the theory that it's
"obviously in scope" or "publicly interesting". This gate has no
override; it is not a build-time check, it is a human judgment call the
tooling cannot make for you.

Once scope is confirmed, follow the record-type flow below. All records
are **canonical JSON** under `data/dossiers/<slug>/` — never edit
`content/dossiers/**` or `content/entities/*.md` (generated adapters;
`lint:generated-content` blocks hand edits). All flows end the same way:
validate the dataset, regenerate the adapters, run the build. Detailed
walkthrough with real error messages:
`docs/contributing/add-dossier-data.md`.

## Source (`SRC-##`)

1. Only cite a source you actually opened yourself — never from a search
   snippet.
2. Add `data/dossiers/<slug>/sources/src-NN.json` following an existing
   source in that directory: global `@id`
   (`https://vomaste.cz/id/dossiers/<slug>/sources/SRC-NN`), `outlet`,
   `sourceType`, `url`, `retrieved`, `published`, `claims` (idRefs to
   the `CLM-##` it supports), `subjects`, `order`.
3. Write the mandatory editorial note as the `content` markdown block —
   what it evidences, how independent it is, its limits (rule T7
   enforces ≥ 150 chars).
4. If the outlet already has other sources in this dossier, set
   `sourceFamily` accordingly — same publisher family = one independent
   source for rule S2, not two.

## Claim (`CLM-##`)

1. Add the canonical record `data/dossiers/<slug>/claims/clm-NN.json`
   (`text`, `status`, `statusLabel`, `sources` idRefs, `subjects`,
   `order`, `content`) **and** the matching row in the claims table —
   the markdown "Registr tvrzení" block in that dossier's
   `dossier.json`: anchor `<a id="clm-NN"></a>`, a link to the detail
   page (`@/dossiers/<slug>/claims/clm-NN.md`), the claim text, the
   status badge, and links to the cited sources. Rules T1–T8
   (`npm run data:validate`) enforce byte-exact parity between row and
   record — that is the two-representations rule, now mechanically
   checked at the data layer.
2. Pick the status honestly, not optimistically:
   - `status-corroborated` — needs **≥ 2 sources from ≥ 2 independent
     source families** (rule S2); two articles from one publisher family
     don't count.
   - `status-single` (`1 ZDROJ`) — exactly one cited source (rule S1).
     The correct status for most new claims; upgrading later requires a
     genuinely new independent source, never a relabel.
   - `status-quote` (`CITACE`) — a direct quote from the subject.
     Verifies the quote was said, not that its content is true.
   - `status-disputed` (`SPORNÉ`) — open, unconfirmed, or contested.
   - `status-opinion` (`NÁZOR`) — authored commentary, kept structurally
     separate from reporting.
3. There is nothing to regenerate by hand and no migrate script — the
   detail page is a generated adapter; `npm run data:build` rebuilds it
   from the canonical record.
4. If the claim describes a procedural outcome (case dropped, statute of
   limitations, non-final ruling), state explicitly — every time it's
   mentioned, not once in a footnote — that this is **not** a finding on
   guilt or truth. This is a hard editorial rule, not a style preference.

## Case (`CASE-##`)

1. Add `data/dossiers/<slug>/cases/case-NN.json`: `title`, `summary`,
   `period`, `status`, `statusLabel`, `anchor`, `claims`, `sources`,
   `subjects`, `content`, `order`.
2. The narrative itself lives as a markdown content block (a section
   with an `{#anchor}`) in `dossier.json`; the case record points at it
   via `anchor` rather than duplicating the prose — keep it that way,
   especially for anything reputationally sensitive.

## Gap (`GAP-##`)

1. Add `data/dossiers/<slug>/gaps/gap-NN.json`: `title`, `description`,
   `priority` (`vysoká`/`nízká`), `checked` (last-verified date),
   related `claims`.
2. Word it as a neutral, open question — "what the cited sources don't
   yet establish" — never as an insinuation or a claim in disguise.

## Relation (graph edge)

1. Add `data/dossiers/<slug>/relations/edge-*.json` (`relationId`,
   `sourceEntity`/`targetEntity` idRefs to global entities,
   `relationType`, `label`, `status`, `claims`, `sources`, `subjects`).
2. Add/extend the matching node(s) and the edge id in the `graph` field
   of `dossier.json` (nodes carry local `claims`/`sources`; `edges` is
   the editorially ordered list of relation ids).
3. An edge with no supporting claim and source fails validation (rule
   S3), endpoints must be graph nodes and `graph.edges` must match the
   relations 1:1 (rule R7) — that's intentional, not a bug to work
   around. Graph depth is computed (BFS), never written.

## Finishing: validate before claiming done

```bash
npm run data:validate -- --file <the-file-you-edited>   # fast shape loop
npm run data:validate    # whole dataset: shape → R1–R7 → S1–S8 → T1–T8 → JSON-LD
npm run data:build       # regenerate view models + content adapters
npm run build            # the actual bar (same sequence as CI)
```

A green `npm run build` is the actual bar — not the pre-commit hook's
fast subset, and not "it looks right in the editor". Common failure:
T3 "text řádky se neshoduje byte-verně s claim.text" — the claims table
in `dossier.json` and the canonical claim record drifted apart; make
them identical and re-validate. Commit the canonical JSON **together
with** the regenerated adapters/exports from `data:build`.

If you're working inside the multi-instance co-op protocol
(`docs/coop/PROTOCOL.md` — see the `bootstrap` skill first if you
haven't already), a green `npm run build` in your worktree is also the
precondition for sending `review-request` on the co-op bus.

## When NOT to use this skill

- **For a subject outside the authorized scope.** Recording that a
  registry relation exists is a context entity and needs no
  authorization; writing a claim about a person does. If you are unsure
  which one you are doing, you are writing a claim — stop.
- **To edit a page under `content/`.** Those are generated adapters.
  The canonical fix is always the JSON record plus `npm run data:build`.
- **To add a new FIELD to a record type.** That touches the schema, the
  view-model builder and the consuming template together — a different
  and larger change than adding a record.
