---
name: dossier-entry
description: Guided, validator-checked workflow for adding a source (SRC), claim (CLM), case (CASE), gap (GAP), or relation to a vomaste.cz dossier — enforces the authorization-scope gate and the "table + generated page must match" invariant before anything is considered done.
argument-hint: <source|claim|case|gap|relation> for <petr-macinka|filip-turek>
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

Once scope is confirmed, follow the record-type flow below. All of them
end the same way: regenerate/check parity, then run the validators.

## Source (`SRC-##`)

1. Only cite a source you actually opened yourself — never from a search
   snippet.
2. Add `content/dossiers/<slug>/sources/src-NN.md` following the schema
   of an existing source in that directory: `src_id`, `outlet`,
   `src_type`, `url`, `retrieved`, `published`, `claims` (which `CLM-##`
   it supports), `subjects`.
3. If the outlet already has other sources in this dossier, check
   whether it's the same "source family" (same publisher) — note that in
   the sources index if it affects independence for any claim citing it.

## Claim (`CLM-##`)

1. Add one row to the claims table in the canonical dossier's
   `_index.md` (the one that physically owns this record per its
   `subjects` tagging — see `AGENTS.md`'s "Where the physical content
   actually lives"): anchor `<a id="clm-NN"></a>`, the claim text, a
   status, and a link to the `SRC-##` it cites.
2. Pick the status honestly, not optimistically:
   - `CORROBORATED` — needs **≥ 2 distinct, independent** sources (not
     two articles from the same publisher family). The validator
     enforces this count.
   - `1 ZDROJ` — exactly one cited source. This is the correct status for
     most new claims; upgrading to `CORROBORATED` later requires a
     genuinely new independent source, never a relabel.
   - `CITACE` — a direct quote from the subject. Verifies the quote was
     said, not that its content is true.
   - `SPORNÉ` — open, unconfirmed, or contested.
   - `NÁZOR` — authored commentary, kept structurally separate from
     reporting.
3. Regenerate the matching detail page — never hand-write it out of sync
   with the table:
   ```bash
   node scripts/dossier/migrate-claims-to-pages.mjs
   ```
4. If the claim describes a procedural outcome (case dropped, statute of
   limitations, non-final ruling), state explicitly — every time it's
   mentioned, not once in a footnote — that this is **not** a finding on
   guilt or truth. This is a hard editorial rule, not a style preference.

## Case (`CASE-##`)

1. Add a `[[extra.cases]]` entry to the canonical dossier's `_index.md`
   front matter: `anchor`, `period`, `title`, `status`, `label`,
   `summary`, `subjects`.
2. Regenerate the detail page:
   ```bash
   node scripts/dossier/migrate-cases-to-pages.mjs
   ```
3. Case detail pages link back to the canonical prose section by anchor
   rather than duplicating the narrative — keep it that way, especially
   for anything reputationally sensitive.

## Gap (`GAP-##`)

1. Add `content/dossiers/<slug>/gaps/gap-NN.md`: `gap_id`, `priority`
   (`vysoká`/`nízká`), `checked` (last-verified date), related `claims`.
2. Word it as a neutral, open question — "what the cited sources don't
   yet establish" — never as an insinuation or a claim in disguise.

## Relation (graph edge)

1. Add the edge to `data/dossiers/<slug>/graph.toml`.
2. Add/update the matching `relations/edge-*.md` page.
3. An edge with no supporting claim and source will fail validation —
   that's intentional, not a bug to work around.

## Finishing: validate before claiming done

```bash
npm run build
```
A green `npm run build` (validators → generators → CSS/JS → `zola
build` → anchor/JSON-LD verification) is the actual bar — not the
pre-commit hook's fast subset, and not "it looks right in the editor".
Common failure: `validate:dossier` complaining the table and the
generated detail page disagree — you skipped the
`migrate-*-to-pages.mjs` regeneration step above; run it and rebuild.

If you're working inside the multi-instance co-op protocol
(`docs/coop/PROTOCOL.md` — see the `bootstrap` skill first if you
haven't already), a green `npm run build` in your worktree is also the
precondition for sending `review-request` on the co-op bus.
