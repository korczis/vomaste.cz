# ADR: DuckDB-Wasm SQL console and Sigma.js graph renderer

**Status**: accepted. The Sigma.js half was refined for scale — data
contract, build-time layout, lazy loading; the renderer choice itself is
unchanged — by
[`graph-workbench-and-data-projection.md`](graph-workbench-and-data-projection.md)
(2026-08-01), once the dataset this ADR sized its reasoning around ("23
nodes and 31 edges") grew past that document's own revisit threshold. The
DuckDB-Wasm half is untouched.
**Date**: 2026-07-30.
**Supersedes**: the "not adopted" decision in
[`graph-renderer.md`](graph-renderer.md) for **two** of the technologies it
covered — Sigma.js (with Graphology) and DuckDB-Wasm. Everything else that
ADR declined (`@cosmos.gl/graph`, MapLibre, ECharts, Observable Plot,
Tabulator, Pagefind, Three.js, p5.js, Kuzu-Wasm, Oxigraph-Wasm, a
build-time Parquet/Arrow pipeline, a SHACL layer) stays declined, and its
reasoning stays valid for those.

## Decision

Adopt both, on the site owner's explicit instruction of 2026-07-30
("pridej in browser duckdb js + graphs using sigma"), after being shown
the prior ADR and its measured numbers and choosing to proceed anyway.

1. **Sigma.js + Graphology** replaces Cytoscape.js as the renderer for the
   relationship graph and the global map.
2. **DuckDB-Wasm** powers a new in-browser SQL console over the published
   registries, reachable as its own page and lazy-loaded only when the
   visitor asks for it.

## Why the previous decision does not simply carry over

It was not wrong, and its numbers have not changed much: the graph is 23
nodes and 31 edges, the whole dataset is under 200 records. Judged purely
as a *performance* decision, Cytoscape is still adequate and DuckDB is
still enormously oversized for the data.

What changed is the **goal**, not the measurement. The prior ADR evaluated
both as performance upgrades and correctly found no performance problem to
solve. The owner's decision reframes them as capability and product
choices:

- the SQL console is not there to make 170 rows faster — it is there so a
  reader can *interrogate* the dataset (`SELECT status, count(*) …`)
  instead of accepting the site's own summary tiles, which is the
  project's stated promise ("nevěřte autorovi, zkontrolujte data") turned
  into something you can actually run;
- Sigma's WebGL renderer and Graphology's separation of graph *model* from
  *rendering* also give a cleaner data/view split for a graph that is
  generated from `graph.toml`, independent of frame rate.

That is a legitimate basis for a different answer, and it is recorded here
rather than left implicit.

## Honest cost, stated up front

- **Payload, measured.** `duckdb-eh.wasm` is **6.2 MB over the wire**
  (brotli; 7.0 MB gzip, 34 MB decompressed) plus a 0.73 MB worker and a
  small ESM shim — 3 requests, ~7 MB, versus a dataset of 166 rows whose
  JSON export is a few tens of kilobytes. That ratio is absurd on paper and
  is the whole reason the previous ADR said no. It is acceptable here only
  because it is **strictly opt-in**: measured on the built page, loading
  /data/ issues *zero* requests to jsDelivr; all three arrive only after
  the visitor presses the start button, which states the size first.
- **Runtime dependency on a CDN.** The DuckDB-Wasm bundles are loaded from
  jsDelivr with SRI-pinned versions, the same mechanism the site already
  uses for Chart.js. Self-hosting them would add tens of megabytes of
  binaries to a repository whose entire point is that it stays cheap to
  fork. The console degrades to a plain "not available" message when the
  CDN is blocked; every number it can compute is also visible on a normal
  page, so nothing becomes unreachable.
- **Sigma is bundled, not CDN-loaded** (esbuild, into `static/js/app.js`),
  which removes one third-party runtime dependency rather than adding one.
- **No new data pipeline.** The console queries the JSON the site already
  generates. There is no Parquet, no Arrow, no build-time DuckDB — the
  part of the previous ADR that rejected an analytical *build* layer
  stands.

## Constraints this must not break

- The graph stays a **progressive enhancement**: every node and edge is
  already a routable page and is listed in full as text next to the graph.
  Losing WebGL, JavaScript or the CDN must never hide a record.
- The SQL console must not become a second source of truth. It reads the
  same generated JSON the pages render from; it computes no status, no
  score, and no rating.
- No truth ratings, no severity scoring, no ranking of subjects — a query
  console makes it easy to invent one, and it stays out (see
  `AGENTS.md`, and `verify:jsonld` for the machine-checked half of it).

## Revisit threshold

Drop the SQL console if it is not used, or if keeping the WASM bundles
current becomes a maintenance burden out of proportion to a dataset this
size. Drop Sigma if the graph stops being interactive enough to justify a
WebGL renderer. Both are reversible: the graph data and the registry JSON
are unchanged by either choice.
