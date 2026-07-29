# ADR: dossier JSON-LD provenance extension — design for T-010

**Status**: proposed (design only — not implemented in this pass; the
implementation is blocked on `docs/coop/TASKS.md` T-001, see below).
**Date**: 2026-07-30.

## Measured current state

```
Current Claim JSON-LD node (templates/partials/jsonld.html):
  {@type: "Claim", name: CLM-##, text, inLanguage, url,
   appearance: [source nodes]}

Current source citation node (templates/macros/jsonld.html, ld_source_node):
  {@type: NewsArticle|WebPage|Article|OpinionNewsArticle,
   url, name, publisher.name, datePublished}
  -- no dateRetrieved, no content hash, no archival reference,
     despite every source's front matter already tracking `retrieved`.

Relationship graph (data/dossiers/<slug>/graph.toml): typed edges
  already exist, but emit NO JSON-LD today -- only Person/Claim/
  WebPage nodes are generated, no relation/edge nodes at all.

Binding constraints (unchanged by this ADR):
  - npm run verify:jsonld fails the build on any truth-rating markup
    (ClaimReview, reviewRating) -- not up for revision here.
  - docs/constitution/OPEN_INTELLIGENCE_COMMONS.md, invariant/§8:
    "Zadne netransparentni ciselne skore pravdy, nikdy... zadny trust
    skore, zadna gamifikace obvineni."
```

`data/coop/TASKS.md` T-010 ("Veřejné JSON-LD export routes — /data/*.jsonld,
manifest, checksums — dnes JSON-LD jen embedded v HTML") already
anticipates a manifest/checksum concept without a concrete design. This
ADR gives it one.

## Question asked

Site owner asked to extend vomaste.cz's dossier JSON-LD "using the
goodies of prismatic-platform" — a much larger sibling platform with a
formal provenance/chain-of-custody architecture. Researched
prismatic-platform's `docs/architecture/adr/ADR-028-provenance-spine-chain-of-custody.md`
and `ADR-035-reference-topology-core.md` (read-only; different stack —
Elixir/Phoenix — so code doesn't port, only data-model ideas can).

## What was researched

- **ADR-028 "Provenance Spine"**: a `Source → Request → Artifact →
  Extraction → Assertion` chain. Artifacts are content-addressed
  (SHA-256 of raw fetched bytes); Assertions are derived claims
  carrying a numeric `confidence` (0.0–1.0); multi-source corroboration
  combines via `combined_confidence = 1 - Π(1 - confidence_i)`; signed
  manifests (`{claim, artifact_hash}` triples + overall hash, ED25519)
  let a whole evidence chain be independently re-verified end to end.
- **ADR-035 "Reference Topology"**: a general bidirectional graph with
  16 typed, inverse-paired edge relationships (e.g. an edge type and
  its defined inverse), cycle policy, temporal (`valid_from`/`valid_to`)
  edges.
- prismatic's actual JSON-LD generator
  (`apps/prismatic_web/lib/prismatic_web/seo/structured_data.ex`) is
  plain SEO schema.org (Article/Person/Organization/FAQ) — **not**
  wired to the provenance spine at all. So "prismatic's JSON-LD" isn't
  itself the useful part; the provenance and graph *data models* are.

## Decision (proposed)

Three ideas adopted, one explicitly rejected, one noted as already
present.

**Adopt 1 — content-address every cited source.** Add a hash (SHA-256
of the archived snapshot if/when this project starts archiving fetched
pages, or at minimum of the `url` + `retrieved` + `outlet` tuple as an
interim citation fingerprint) to each `SRC-##`'s front matter, surfaced
in `ld_source_node`. Lets a reader verify a citation still points at
*exactly* the evidence a claim was built on — this is provenance, not
adjudication, and doesn't touch the constitution's trust-score ban.

**Adopt 2 — a manifest + offline verify script, giving T-010 an actual
shape.** Concretely: `/data/dossiers/<slug>.jsonld` (a full `@graph`
export per dossier) + `/data/manifest.json` listing `{route, sha256}`
for every exported file + a small `scripts/dossier/verify-export.mjs`
that anyone (a fork, a downloader, a journalist double-checking the
dataset) can run offline against a downloaded copy to confirm nothing
was altered post-export. No signing-keypair infrastructure in v1 (see
Revisit threshold) — a plain SHA-256 manifest already delivers this
site's own promise: "reprodukuj build a zpochybni výsledek."

**Adopt 3 — a small, invertible relationship vocabulary for the
existing relation graph.** `graph.toml` already has typed edges, but
they emit no JSON-LD today. Extend the export with a minimal custom
`@context` term set, inverse-paired the way ADR-035 pairs its edge
types: `vomaste:corroborates` / `vomaste:corroboratedBy`,
`vomaste:supersedes` / `vomaste:supersededBy`. **Explicitly excluded
from v1**: any `contradicts`/`disputes` term — even a purely structural
"these two sources disagree" edge reads too close to adjudication for a
first pass. Revisit only via an explicit `AGENTS.md` editorial-rules
discussion, never bundled into a technical ADR.

**Reject — numeric confidence / combined-confidence scoring.**
prismatic's `combined_confidence = 1 - Π(1 - confidence_i)` is a
reasonable formula for prismatic's own use case, but putting *any*
numeric confidence field on a Claim node directly contradicts this
project's own constitution (§8: no opaque numeric truth score, no trust
score, no gamified accusation). The existing categorical status enum
(`CORROBORATED` / `1 ZDROJ` / `SPORNÉ` / `CITACE` / `NÁZOR`) is this
site's deliberate, non-numeric answer to the same underlying "how
strong is this claim" question. Replacing or augmenting it with a float
would be an editorial-model scope change, not a JSON-LD technical
change — and nothing in `AGENTS.md`'s authorization log authorizes that
regardless of technical merit.

**Already have — the Artifact/Assertion split.** vomaste.cz's existing
Source (raw, cited, dated) vs. Claim (derived, atomic, statused) split
already *is* this pattern, arrived at independently. Noted here only so
a future reader doesn't wonder why it's missing from "adopted."

## Why this isn't implemented yet

Every file this design touches —
`templates/macros/jsonld.html`, `templates/partials/jsonld.html`,
source/relation front matter under `content/dossiers/**`, and any new
`scripts/dossier/*.mjs` — sits inside T-001's active scope-check zone
(the entity-dossier physical-decoupling migration, in progress at the
time of writing; see `docs/coop/TASKS.md`). T-010 is board-blocked on
T-001 for exactly this reason. This ADR exists so that dependency
resolves into a ready, pre-argued design instead of a blank page once
T-001 merges — the actual implementation is T-010's job, not this
commit's.

## Revisit threshold

- Implement content-hash citations + the manifest/verify script as
  T-010's concrete scope, once T-001 is `merged` on the coop board.
- Revisit *signed* (not just hashed) manifests if/when the site needs
  to prove authorship of an export, not just integrity — e.g. once
  forks start redistributing dossier exports and provenance-of-the-
  export-itself becomes a real question, not just provenance-of-the-
  claims-within-it. Not justified by measured need today (zero forks
  redistributing exports exist).
- Revisit a `contradicts`/`disputes` relationship type only via a
  dedicated `AGENTS.md` editorial-rules amendment, never as a
  follow-up to this technical ADR.
