*Historický dokument — popisuje stav před JSON-first migrací (T-028).*

# ADR: Graph workbench data projection, build-time layout, and lazy loading

**Status**: accepted.
**Date**: 2026-08-01.
**Refines**: [`duckdb-wasm-and-sigma.md`](duckdb-wasm-and-sigma.md), which
adopted Sigma.js + Graphology as the renderer. This ADR does not revisit
that choice — it stays adopted, for the reasons below — and instead
addresses what that ADR left open: the transport format, the layout
computation, and the JS bundle shape now that the dataset the renderer
serves has grown past that ADR's own numbers.
**Supersession chain**: `graph-renderer.md` (declined Sigma/Cytoscape
alternatives) → superseded on the renderer choice by
`duckdb-wasm-and-sigma.md` (adopted Sigma.js 3 + Graphology) → refined for
scale by this ADR (data contract + build-time layout + lazy loading; the
renderer choice itself is unchanged).

## Context

`duckdb-wasm-and-sigma.md` adopted Sigma.js when the graph was "23 nodes
and 31 edges" and explicitly reasoned about a dataset that size. By
2026-08-01 the site covers 22 dossiers; the baseline audit for this work
(`docs/audits/graph-workbench-baseline.md`) measured the actual current
scale directly rather than assuming it:

- curated (hand-authored) entity graph: **66 nodes / 84 edges**
- full registry layer (every claim/source/case/gap as a node, every
  citation as an edge — generated, not curated): **1,631 nodes / 2,112
  edges**

That full-registry figure is **3–8× past `graph-renderer.md`'s own stated
revisit threshold** (500 nodes / 2,000 edges) for reconsidering the
rendering approach. The renderer itself (Sigma/WebGL) was never the
bottleneck at this scale — the audit found the actual problems were
architectural, not about which library draws pixels:

1. The entire global graph (`data/generated/global-graph.json`, 814 KB
   raw / 122 KB gzip) was inlined into `/map/`'s HTML on every load,
   including the 1,631-node full layer nobody may ever ask to see.
2. `forceAtlas2.assign(graph, { iterations: 220 })` ran synchronously on
   the browser's main thread, on every page load AND on every layer
   switch — for the full layer, that means laying out 1,631 nodes in the
   browser, repeatedly, for a layout that's identical every time.
3. The Sigma instance was killed and recreated (`renderer.kill()` +
   `new Sigma(...)`) on every layer switch, discarding camera position
   and re-attaching every event listener each time.
4. Routes were resolved via a second runtime fetch of the site's full
   `search-index.json` (624 KB), duplicating data already known at build
   time.
5. Sigma/Graphology shipped in the single global `app.js` bundle, so
   every page on the site — including ones with no graph at all — paid
   for a renderer it never used.

None of this is a reason to replace Sigma. It is a reason to stop
treating the graph as "small enough that architecture doesn't matter."

## Decision

Keep Sigma.js 3.x (stable) + Graphology + graphology-layout-forceatlas2.
Do not adopt GoJS (editable-diagram license target, not this project's
read-only exploration need), do not adopt Sigma.js 4 (alpha at time of
writing), do not hand-roll a WebGL renderer.

Instead, fix the five problems above directly:

1. **Layered data contract, not one inlined file.** Replace
   `data/generated/global-graph.json` with
   `static/data/graph/{manifest.json, global-curated.json,
   global-registry.json, dossier/<slug>.json}` — a small manifest with
   counts/hashes, the small curated layer (still cheap to inline), the
   large registry layer (never inlined, fetched only on demand), and one
   small payload per canonical dossier for its own local graph. Schemas:
   `schemas/graph-manifest.schema.json`, `schemas/graph-payload.schema.json`.
   Generator: `scripts/dossier/build-graph-projections.mjs`. Validator:
   `scripts/dossier/validate-graph-projections.mjs` (shape via AJV +
   cross-file referential integrity + manifest/file hash parity +
   registry coverage — folds in what the retired
   `validate-graph-coverage.mjs` checked).
2. **Layout computed once, at build time.** `scripts/dossier/lib/graph-layout.mjs`
   runs the exact same ForceAtlas2 pass server-side, with
   `barnesHutOptimize` for the registry layer, deterministic seed
   positions (node input order, never `Math.random()`), and writes the
   resulting x/y straight into the payload. The browser never runs a
   layout pass on load. Determinism is regression-tested
   (`scripts/dossier/graph-layout.test.mjs`): the same input produces
   bit-identical coordinates on repeated runs.
3. **One Sigma instance, reused.** `assets/js/modules/graph/controller.js`
   calls `renderer.setGraph()` on a layer switch instead of
   `kill()` + `new Sigma()`, and saves/restores each layer's camera state
   via `Camera#getState()`/`setState()`. Event listeners are attached
   once, at first construction.
4. **Routes resolved at build time.** Every node/edge in the transport
   payload already carries its own `route`, resolved from
   `data/generated/routes.json` (the existing route manifest) inside
   `scripts/dossier/lib/graph-projection.mjs`. No client-side
   `search-index.json` fetch for routing.
5. **Separate JS bundle.** `assets/js/graph-app.js` (Sigma + Graphology +
   the `assets/js/modules/graph/` runtime) is a second esbuild
   entrypoint, loaded only by pages with a `[data-graph-workbench]` root
   (`templates/base.html`'s `extra_js` block, overridden only by
   `templates/map.html` and `templates/dossier.html`).

On top of the data/runtime fix, this also delivers the interaction layer
the old implementation never had: selection + a real detail inspector
(mission § 11), neighborhood focus (1-step/2-step/whole component) and a
declared-edges-only path finder via reducers
(`assets/js/modules/graph/reducers.js`, `path-finder.js`), and
permalink-able URL state (`permalink.js`) — all shared, via the same
`assets/js/modules/graph/index.js` entrypoint, between the full `/map/`
workbench and dossier.html's local graph in a smaller "restricted mode"
(no path finder, no filters).

## Why this is a projection, not a second dataset

Every field in `static/data/graph/*` is either copied verbatim from an
already-validated source (`data/dossiers/<slug>/graph.toml`, the flat
registry exports in `static/data/*.json`, `data/generated/routes.json`)
or computed by a pure function of that source (coordinates, component
ids, degree). Nothing is hand-edited in the transport format itself, and
`validate-graph-projections.mjs` fails the build if a canonical record
goes missing from the registry layer, if a hash doesn't match, or if
counts drift from the manifest. Algorithmic outputs (component id,
ForceAtlas2 position) are visual/navigational, never presented as a
factual relationship — no new claim, source, case, gap, or relation is
created by this work, and the authorization log in `AGENTS.md` is
untouched (this is a purely technical/infrastructure mission per its own
§ 2.1).

## Measured, before and after

| | before | after |
|---|---|---|
| global graph data on `/map/`'s initial load | 814 KB raw / 122 KB gzip, all inlined | manifest 6.6 KB + curated layer ~73 KB inlined (~80 KB total); registry layer (1.08 MB raw / 165 KB gzip) fetched only if the visitor switches to it, once, cached |
| client-side layout on load | synchronous ForceAtlas2, every load and every switch | none — coordinates already computed |
| `static/js/app.js` (every page) | 356.0 KB | 197.6 KB (−44.5%) |
| graph-only bundle | n/a (bundled into every page) | `static/js/graph-app.js`, 174.7 KB, loaded only on the 2 pages with a graph |
| Sigma instance across a layer switch | destroyed + recreated | reused (`setGraph`) |
| routing | client fetch of `search-index.json` (624 KB) | resolved at build time, in the payload |

Synthetic benchmark (`npm run test:e2e:benchmark`, 10,000 nodes / 30,000
edges — 6× the current real registry layer; see
`scripts/dossier/lib/synthetic-benchmark-graph.mjs`, never published):
build-time layout 36–88 s (this machine, single run — the real registry
layer at 1,631 nodes finishes in a small fraction of that inside
`npm run build`'s ~80 s `zola build` step); client-side activation of a
pre-laid-out 10k/30k layer ~1.3–1.4 s; pan, zoom, click-select, filter
apply, and layer-switch-away all under 400 ms each, on two clean runs.

## Honest cost / what's simplified

- The workbench toolbar (search, record-type/dossier filters, focus
  controls) is a flex-wrap row that wraps on narrow viewports, not a
  dedicated Flowbite off-canvas drawer — mobile overflow is verified
  clean (Playwright, both projects) but this is a simpler treatment than
  mission § 8.2's full mobile drawer/bottom-sheet description.
- Facets are implemented for `record_type` and `dossier` — the mission's
  broader facet list (relation status, claim status, source type, case
  status, gap priority, outlet, component) is not all wired to the UI;
  the underlying data (component id, status, priority, outlet) is already
  in every node's attributes, so adding more filter controls is additive,
  not a re-architecture.
- Per-dossier local graph payloads are generated for all 20 canonical
  dossiers, but only rendered on `templates/dossier.html` — which today
  is used by exactly **one** dossier (`macinka-turek`, the aggregate).
  The other 19 canonical dossiers (`oto-klempir`, `andrej-babis`, …) use
  `templates/entity-dossier.html`, which has no Sigma graph section at
  all (text-only filtered relations list) and this work does not add
  one — that would be a new UI surface, not an optimization of an
  existing one. Their payload files are generated and validated but
  currently unused; this is deliberate future-proofing, not dead code
  shipped to visitors (the files live under `static/data/graph/dossier/`
  and are only fetched if something links to them).
- No path finder on the local dossier graph (mission § 19.2 explicitly
  allows omitting it in "restricted mode").

## Constraints this must not break

- The graph stays a progressive enhancement: every node and edge already
  has a routable page, listed as text next to the graph
  (`verify-anchors.mjs`, `verify:jsonld`, the no-JS Playwright checks).
- No algorithmic output (ForceAtlas2 position, connected-component id) is
  ever presented as a factual relationship — component grouping is
  navigational, and the UI text says so explicitly wherever it's shown.
- No new claim, source, case, gap, relation, or named third party. The
  authorization log in `AGENTS.md` is unchanged by this work.
- The transport payload stays a projection: `validate-graph-projections.mjs`
  is part of `npm run build`, same as every other referential-integrity
  gate in this repo.

## Revisit threshold

Revisit the layout algorithm or add incremental/worker-based layout if
the real registry layer crosses roughly 5,000 nodes (the synthetic
benchmark's 10k/30k build-time layout run took under 90 s on this
machine — comfortable today, worth re-measuring well before it becomes a
`npm run build` bottleneck). Revisit the toolbar-row-vs-drawer
simplification if a real mobile user reports the filter row as
unusable, not just theoretically less polished than a drawer. Revisit
extending the local Sigma graph to the 19 self-canonical entity dossiers
if there's a stated need for it — the data layer already supports it at
zero additional generation cost.
