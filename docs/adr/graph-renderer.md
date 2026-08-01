# ADR: graph renderer for `/map/` and local dossier graphs

**Status**: partially superseded by
[`duckdb-wasm-and-sigma.md`](duckdb-wasm-and-sigma.md) (2026-07-30), which
adopts Sigma.js and DuckDB-Wasm on the site owner's explicit decision — as
a capability choice, not because the measurements below changed. The rest
of this ADR (every other technology it declines, and its revisit
threshold) still stands. The renderer choice itself was refined for scale
— data contract, build-time layout, lazy loading, not a library change —
by [`graph-workbench-and-data-projection.md`](graph-workbench-and-data-projection.md)
(2026-08-01), once the dataset actually crossed this ADR's own revisit
threshold (see that ADR's Context section for the measured numbers).
**Date**: 2026-07-29.

**Addendum, same date**: a follow-up request proposed an even larger stack
on top of this one — Graphology/Sigma as before, plus `@cosmos.gl/graph`,
MapLibre, Apache ECharts, Observable Plot, Tabulator, Pagefind,
DuckDB-Wasm, Three.js, and p5.js, each benchmarked against synthetic
datasets up to 20,000 nodes / 100,000 edges. The decision below is
unchanged, for the same reason stated below, now with a larger gap
between proposal and measured reality: this repository has no dataset
within three orders of magnitude of the benchmark sizes proposed, in any
dimension (graph size, table row count, search corpus size, or geographic
data volume — there is no geocoded data in this project at all). Running
the proposed benchmark suite would measure synthetic data that doesn't
represent this project rather than this project. The revisit threshold
below still applies, per-technology: e.g. Pagefind or Tabulator would be
judged on the site's actual page/row counts if and when adopted, not
adopted as part of a bundle because a larger dataset might someday exist.

**Second addendum, same date**: a further follow-up proposed DuckDB-Wasm
(native + browser), Apache Parquet, Apache Arrow IPC, Kuzu-Wasm, and
Oxigraph-Wasm as an analytical layer underneath the above, benchmarked at
1,000 / 25,000 / 250,000 / 1,000,000 rows. Measured, current, full record
count across every table this would cover:

```
dossiers: 1
entities: 23
claims: 44
sources: 52
cases: 4
gaps: 6
relations: 30
total Zola content pages: 170
```

DuckDB-Wasm's own stated purpose is browser-side analytical SQL over
datasets large enough that a plain array scan in JavaScript would be
slow — that threshold is nowhere near 170 rows. The proposed row counts
are 6 to 6,000 times this project's actual total record count, not just
its graph size. The decision stands: no build-time DuckDB, no Parquet/
Arrow export pipeline, no DuckDB-Wasm runtime, no Kuzu-Wasm or
Oxigraph-Wasm. `data/authorizations.toml`, the Markdown-front-matter
records, and the generated JSON/JSONL files already in this repo remain
the only data layer, and they already satisfy "one canonical source per
record, build-validated, no manual duplication" without a second
(relational) or third (RDF) parallel format to keep in sync. If total
record count ever approaches the low thousands, this is worth revisiting
with real numbers at that time — not before.

## Measured current scale

Not estimated — read directly from the built data:

```
Global graph (data/generated/global-graph.json): 23 nodes, 30 edges
Dossiers: 1
Cytoscape.js (CDN, cytoscape@3.30.2, minified): 373,304 bytes (≈364 KB)
Local app.js bundle (Alpine + Flowbite + all site JS incl. graph-view.js): 180.7 KB
```

There is no dataset in this repository anywhere near the sizes this
question is normally asked about (thousands to tens of thousands of
nodes). The entire evidence graph — every entity and relation across the
one authorized dossier — is 53 objects.

## Question asked

Whether to replace the current Cytoscape.js-based `/map/` and local graph
views with a Graphology (runtime graph model) + Sigma.js (WebGL renderer)
stack, backed by a JSON-LD canonical data layer with SHACL validation,
precomputed ForceAtlas2 layout, Louvain community detection, and chunked
progressive loading — and whether to additionally benchmark MSAGL.js.

## Decision

**Not adopted at this time.** Cytoscape.js stays the renderer for both the
global map and local dossier graphs. No JSON-LD/SHACL layer is introduced
to replace the current Markdown-front-matter canonical model. No MSAGL.js
benchmark was run.

## Reasoning

Sigma.js's own value proposition — and the reason Cytoscape's docs warn
about degrading performance — is specifically about node/edge counts in
the thousands-to-tens-of-thousands range, WebGL batching of draw calls
that only pays off once canvas 2D rendering starts dropping frames, and
label-culling/community-aggregation techniques that only matter once
"show everything" stops being readable. At 23 nodes and 30 edges,
Cytoscape's `cose` layout completes in a single frame, every label fits
on screen, and there was no dropped-frame or long-task problem to
measure — I looked for one specifically (see below) and found none.

Adopting the proposed stack now would mean:

- two new runtime dependencies (`graphology`, `sigma`) plus their
  algorithm packages (community detection, ForceAtlas2, noverlap),
- a parallel canonical-data system (JSON-LD context + shapes + SHACL
  validation) alongside the Markdown-front-matter model that every other
  registry on this site already uses and that four separate validator
  scripts already enforce end-to-end,
- a chunked, level-of-detail progressive-loading pipeline for a dataset
  that fits in single-digit kilobytes of JSON and loads instantly,
- a Web Worker layout pipeline for a layout that already computes in
  under a frame,
- a new build-time algorithm stage (community detection, deterministic
  seeded layout) whose output — clusters and coordinates — has nothing
  real to cluster or lay out yet at this scale,
- a Playwright resize/fullscreen test suite for a UI surface this small.

None of that is wrong engineering in the abstract — it is the right
architecture *for a graph that is actually large*. Building it now, for
53 objects, is exactly the "considered future requirements the current
task doesn't have" pattern this project's own conventions warn against:
it adds real, ongoing maintenance surface (more dependencies, more
generators, more validators, more test infrastructure) for zero
measurable improvement today, and — concretely — for a codebase that
already treats "one canonical source of truth, enforced at build time" as
a hard invariant, introducing a second, parallel canonical format
(JSON-LD) that would need to stay in lockstep with the Markdown one is
itself a new duplication risk, not a reduction of one.

## What was actually broken, and was fixed

The real, measured bug behind the reported symptoms wasn't renderer
choice — it was that `assets/js/modules/graph-view.js` never called
`cy.resize()` on any resize or fullscreen event, and had no
`ResizeObserver` at all. Cytoscape caches its canvas's pixel dimensions
at init time and does not observe container size changes on its own; every
resize (sidebar toggle, fullscreen enter/exit, orientation change) left
the canvas at its stale initial size. This is now fixed: a
`ResizeObserver` on the graph container calls `cy.resize()` (rAF-batched),
and the existing `fullscreen.js` per-box resize-callback mechanism is
wired to the same call. `cy.resize()` only recomputes the canvas bounding
box — it does not touch pan, zoom, or layout, so this fix cannot itself
cause the "camera/selection reset" or "layout jumps on resize" failure
modes described in the request; there is nothing in the current code that
reruns the `cose` layout on resize or fullscreen change to begin with.

## Revisit threshold

Reconsider this decision when any of the following becomes true, measured
rather than anticipated:

- the global graph (across all authorized dossiers combined) exceeds
  roughly **500 nodes or 2,000 edges** — Cytoscape's own performance
  guidance starts recommending WebGL renderers in that range,
- a real, measured frame-rate or long-task problem is observed in
  production (not hypothesized),
- more than one dossier exists and cross-dossier graph size starts
  compounding meaningfully.

At that point, re-run this ADR with real benchmark numbers for the actual
dataset at hand — including the MSAGL.js comparison — rather than
adopting either stack speculatively.
