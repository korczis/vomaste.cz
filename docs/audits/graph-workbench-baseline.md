*Historický dokument — popisuje stav před JSON-first migrací (T-028).*

# Graph workbench — baseline audit (2026-08-01)

Phase A (audit only) of the Sigma.js/Graphology global relationship map
rebuild. No behavioral changes made in this pass — this document is the
factual record the later phases are measured against. All numbers below
were measured directly from a clean `npm ci` + full `npm run build` on
this checkout, not carried over from the implementation prompt's example
figures.

## 0. Prior art already on record

Two ADRs already cover this exact renderer question and must not be
re-litigated from scratch:

- [`docs/adr/graph-renderer.md`](../adr/graph-renderer.md) (2026-07-29):
  originally declined Sigma.js/Graphology in favor of Cytoscape.js at 23
  nodes/30 edges, with a revisit threshold of ~500 nodes/2,000 edges.
- [`docs/adr/duckdb-wasm-and-sigma.md`](../adr/duckdb-wasm-and-sigma.md)
  (2026-07-30, accepted, supersedes the above for Sigma/Graphology):
  **Sigma.js 3 + Graphology is already the adopted and shipped renderer**
  for `/map/` and the per-dossier local graph. Cytoscape.js is gone from
  the runtime. This repo is *not* starting from Cytoscape — the "don't
  migrate to GoJS/Cytoscape/Sigma4-alpha" instruction in the mission
  prompt is satisfied by design; the actual work is optimizing the
  already-adopted Sigma stack.
- The dataset has grown well past both ADRs' revisit thresholds since
  they were written (see §2) — this rebuild is now justified by the ADRs'
  own stated criteria, not just requested speculatively.

There is also a separate, already-tracked, broader mission —
[`docs/missions/2026-07-30-workbench-master-prompt.md`](../missions/2026-07-30-workbench-master-prompt.md)
— covering the directory/registry/table side of the site (open tasks
T-018, T-019, T-021 in `docs/coop/TASKS.md`). None of the currently open
or merged tasks (T-001…T-026) target the Sigma/Graphology graph
specifically; T-017 (merged) touched `build-global-graph.mjs` only to fix
a self-canonical-entity-dossier omission bug, not to restructure the
transport format. **Next free task ID: T-027.** This work has no
existing task and per `docs/coop/PROTOCOL.md` should be registered by
ORCH as one or more new `T-027…` entries and — given its size (25-section
spec) — run in its own worktree (`task/T-027`), not directly on `master`.

## 1. Files read (architecture description)

### `assets/js/modules/graph-view.js` (202 lines) — the entire runtime

One monolithic module shared by both the global map and the per-dossier
local graph via `initGraphView(containerId, dataIslandId, searchIndexUrl)`.

Already implemented (contrary to the mission prompt's assumption of a
mostly-greenfield rebuild):

- Deterministic seed positions on a circle before ForceAtlas2 runs
  (lines 94–105) — addresses part of §4.2's determinism requirement, but
  the layout itself still runs in-browser, not at build time.
- `ResizeObserver` on the container, rAF-batched (`scheduleResize`,
  lines 159–177) — this is the fix already landed per
  `graph-renderer.md`'s "what was actually broken" section; no leak or
  duplicate-observer issue found in this file.
- Fullscreen integration via `resizeHandlers[fsBox.id]` (lines 179–182),
  shared with `fullscreen.js`.
- Two-layer model (`curated` / `full`) switchable via
  `[data-graph-layer]` buttons (lines 81–85, 187–198) — this is the
  "kurátorská vs. plný registr" split the mission's §2/§3 assume exists;
  it does, but as two static payload objects held in memory, not lazy
  fetched per layer.

Confirmed problems, with line numbers:

- **New Sigma instance created on every render, including every layer
  switch** (line 87: `if (renderer) { renderer.kill(); renderer = null; }`
  then `new Sigma(...)` at line 124) — this is exactly the anti-pattern
  mission §6.2 asks to remove (`renderer.setGraph()` instead of
  recreate). Called once at init (line 187) and again on every
  `data-graph-layer` button click (line 196).
- **`forceAtlas2.assign(graph, { iterations: 220, ... })` runs
  synchronously on the main thread** (lines 119–122) on *every* call to
  `render()` — i.e. on initial load AND on every layer switch, including
  switching into the 1,631-node/2,112-edge full layer (see §2 below).
  This is the exact "blocking main-thread layout" problem mission §4.1
  targets; there is no build-time-precomputed layout anywhere in the
  pipeline today.
- **No cleanup/`destroy()` lifecycle.** `renderer.kill()` is called only
  as the first line of the next `render()`, not on page teardown, route
  change, or component unmount. There is no exported destroy function at
  all.
- **No URL/permalink state.** No `history.pushState`/`replaceState`, no
  `URLSearchParams` read/write anywhere in the file. Deep links, the
  active layer, and selection are all lost on reload — none of mission
  §12 exists yet.
- **No `nodeReducer`/`edgeReducer` usage.** Selection/hover/focus
  dimming is not implemented — `clickNode`/`clickEdge` navigate away
  immediately (lines 140–147); there is no inspector panel, no
  selection-preserving click, no neighborhood highlighting.
- **No level-of-detail / zoom-dependent label logic.** `labelDensity`
  and `labelGridCellSize` (lines 129–130) are static Sigma settings, not
  a zoom-tier label strategy per mission §7.2.
- **No focus/neighborhood/path-finder/search integration** — none of
  mission §10 exists.
- **Full `search-index.json` (624 KB, see §2) is fetched in full before
  first render** via `fetchRouteMap()` (lines 60–70), exactly the
  problem mission §3.4 calls out ("Odstraň potřebu načítat celý
  search-index.json před prvním renderem grafu"). Fetch failures are
  silently swallowed (`catch (e) { return {}; }`), so a failed fetch
  degrades to no routes rather than a visible error.
- Only two Sigma event handlers class (`enterNode`/`enterEdge` cursor
  toggle, `clickNode`/`clickEdge` navigate) — `enableEdgeEvents` is not
  configured (defaults apply to both layers equally; mission §7.1 wants
  it differentiated per layer).

### `assets/js/app.js` (51 lines) — single global entrypoint

`initGraphView` is imported unconditionally at module scope (line 24)
and invoked for every `[data-graph-view]` element found on
`DOMContentLoaded` (lines 47–49) — but the *import* itself, not just the
invocation, is what pulls Sigma/Graphology/forceatlas2 into the bundle
graph. There is no second entrypoint; esbuild has exactly one
`assets/js/app.js` → `static/js/app.js` bundle (see `package.json`
`js:build` script), so **every page on the site**, including pages with
no graph at all, ships Sigma+Graphology+ForceAtlas2 in its JS payload.
This is the exact problem mission §5 targets. No code-splitting, dynamic
`import()`, or `[data-graph-workbench]`-gated lazy entrypoint exists
anywhere in the build.

### `assets/js/modules/fullscreen.js` (39 lines)

Generic `.fs-btn`/`data-fs-target` toggle, already resize-aware via the
shared `resizeHandlers` registry `graph-view.js` writes into. No graph
logic here; no changes implied by the mission scope beyond keeping the
resize contract intact.

### `templates/map.html` (101 lines)

- **The entire global graph JSON is inlined into the page HTML**
  (line 13: `{% set graph = load_data(path="data/generated/global-graph.json") %}`;
  line 99: `<script type="application/json" id="global-graph-data">{{ graph | json_encode | safe }}</script>`).
  This is precisely the anti-pattern mission §3 forbids ("žádné vložení
  plné globální vrstvy do HTML") — the full 814 KB (raw) dataset,
  including the 1,631-node/2,112-edge full-registry layer, ships as an
  inline JSON island on every `/map/` page load, whether or not the
  visitor ever switches to that layer.
- Layer-switch buttons carry the legacy `class="cy-chip"` (lines 47, 49)
  — a Cytoscape-era class name still in use despite the renderer having
  moved to Sigma (see §3 below).
- Text-alternative registry (lines 70–91) already exists and lists every
  curated edge — this satisfies part of mission §13's progressive
  enhancement requirement for the *curated* layer, but has no equivalent
  full-layer text alternative (`noscript` at line 67 just tells the
  visitor to use the — curated-only — text list).
- Stat tiles (lines 15–20) already read from the loaded `graph` data
  object rather than a hand-written count, satisfying part of mission
  §3's "no bare count" requirement, but this couples the stat tiles to
  loading the *entire* graph JSON just to report four numbers — a
  lightweight manifest (mission §3.1) would decouple this.

### `templates/dossier.html` (227 lines, graph section only)

Local per-dossier graph markup (lines ~110–120) uses the same
`data-graph-view` contract and the same shared `graph-view.js` module —
no second implementation exists, which already satisfies mission §19.2's
"don't build a second implementation" constraint structurally. It does
not inline a `full` layer (dossier-local graphs are curated-only), so the
inlining problem above is specific to `map.html`.

### `scripts/dossier/build-global-graph.mjs` (248 lines)

Regenerates `data/generated/global-graph.json` from every dossier's own
`data/dossiers/<slug>/graph.toml`, plus a mechanically-derived "full
registry" layer built from `static/data/{claims,sources,cases,gaps,relations}.json`
(written earlier in the pipeline by `build-data-exports.mjs`). Confirmed
already-honest design choices worth preserving in the rebuild:

- Hard-fails (`process.exit(1)`) if `static/data/*.json` exports are
  missing rather than silently emitting an empty full layer (lines
  168–177) — good precedent for mission §16's "build must fail, not
  degrade silently" requirement.
- Dedupes cross-dossier edge-id collisions explicitly, with an inline
  comment explaining a real bug this fixed (`Graph.addNode: ... already
  exist`, lines 187–192, 209–219) — i.e. the "record IDs are only unique
  within a dossier" problem the mission's node/edge contract (§3.2/§3.3)
  needs to solve generally is already understood and partially solved
  here via `"<dossier>::<id>"` keying.
- Does **not** compute layout, components, or partitions at build time —
  confirms mission §4 (build-time layout) is fully greenfield.
- Does **not** write a manifest — confirms mission §3.1 (manifest with
  hashes/counts) is fully greenfield; today's only "manifest" is the
  human-readable console.log line at the end of the script.
- No JSON Schema validation of its own output today; shape is implicitly
  documented by `schemas/graph.schema.json`, but that schema describes
  the **source** `graph.toml` shape (see below), not the generated
  transport JSON — there is a real gap between what's schema-validated
  and what Sigma actually consumes.

### `scripts/dossier/validate-graph.mjs` (420 lines) / `validate-graph-coverage.mjs` (108 lines)

`validate-graph.mjs` validates each dossier's own `graph.toml` (node
types, edge status vocab, allowed relation types, referential integrity
against CLM/SRC ids) — a source-side validator, not a transport-payload
validator. `validate-graph-coverage.mjs` is the closest thing to a
coverage check today: it re-derives the full layer counts and asserts
the full map "covers every record" (see run output in §2). Neither
validates the generated `global-graph.json`'s own internal consistency
(duplicate global edge keys across the whole file, finite coordinates,
manifest-vs-payload count parity) — all of that is genuinely new work
per mission §16.

### `schemas/graph.schema.json`

Validates the **source** `data/dossiers/<slug>/graph.toml` shape only
(`nodes`/`edges` with `id`/`type`/`label`, `source`/`target`/`relation`).
Explicitly scoped by its own `$comment` to "shape only" — referential
integrity is delegated to the two validators above. There is no schema
for the generated transport JSON (`global-graph.json` or a future
manifest/layer-payload split) at all today.

### `package.json` — dependencies and scripts

Relevant dependencies already installed:
```
graphology                     ^0.26.0
graphology-layout-forceatlas2  ^0.10.1
sigma                          ^3.0.3
```
No GoJS, no Cytoscape.js, no Sigma 4 — confirms the "keep Sigma 3 stable,
don't add GoJS/Cytoscape/Sigma4-alpha" constraint is trivially satisfied;
there is nothing to remove or downgrade.

Real script names (the mission prompt's example commands map to these
almost 1:1; all exist):
```
build:data-exports      → node scripts/dossier/build-data-exports.mjs
build:global-graph      → node scripts/dossier/build-global-graph.mjs
validate:graph-coverage → node scripts/dossier/validate-graph-coverage.mjs
js:build                → esbuild assets/js/app.js --bundle --minify --target=es2020 --outfile=static/js/app.js
build                   → full ~40-step pipeline (test, validators, generators, css:build, js:build, zola build, verify:*)
dev                     → validators/generators + css:build + js:build + zola serve
```
`js:build` bundles a single entrypoint (`assets/js/app.js`) — no
per-page/code-splitting config exists in this esbuild invocation.

### `tailwind.config.js`

Not read in detail in this pass beyond confirming it exists; no
graph-specific token/color config found there — graph colors are
currently hardcoded in `graph-view.js` (`STATUS_COLOR`, `RECORD_COLOR`,
`TYPE_COLOR` constants, lines 28–48) and in `static/css/input.css`
(`.cy-ico-*` swatches), not centralized as design tokens. This is a real
gap against mission §20's "unified token mapping" requirement.

### `static/css/input.css` — `cy-*` class inventory (full)

Legacy Cytoscape-era class names still present:

| Class | Line | Actually used in templates/JS today? |
|---|---|---|
| `#cy-box` (id selector) | 266 | **No** — no `id="cy-box"` found anywhere in `templates/` |
| `.cy-canvas` | 271, 276 | **No** — not referenced outside this stylesheet |
| `.cy-wrap` | 275 | **No** — not referenced outside this stylesheet |
| `.cy-controls` (+ `button`, `:hover`) | 280, 284, 290 | **No** |
| `.cy-legend` (+ `span`) | 291, 299 | **No** |
| `.cy-legend-sep` | 300 | **No** |
| `.cy-ico`, `.cy-ico-person`, `.cy-ico-entity`, `.cy-ico-role`, `.cy-ico-case` | 301–305 | **No** |
| `.cy-line` | 306 | **No** |
| `.cy-tooltip` | 307 | **No** |
| `.cy-chip` (+ `[aria-pressed="true"]`, `:hover`) | 353, 359, 360 | **Yes** — `templates/map.html:47,49` (the layer-switch buttons) |

So of the ~19 `cy-*` rule blocks in `input.css`, only `.cy-chip` is live;
the rest (`cy-box`, `cy-canvas`, `cy-wrap`, `cy-controls`, `cy-legend*`,
`cy-ico*`, `cy-line`, `cy-tooltip`) are dead CSS left over from the
Cytoscape-era implementation and can be deleted outright rather than
renamed, once confirmed unused (mission §20 says "don't keep dead
aliases without reason" — this is exactly that situation). Only
`cy-chip` needs an actual rename (→ e.g. `graph-chip`) plus its two call
sites in `map.html`.

## 2. Measured baseline (this checkout, 2026-08-01, commit `88adb2f`)

Full pipeline run: `npm ci` → `build:data-exports` → `build:global-graph`
→ `validate:graph-coverage` → `js:build` → `npm run build` (full ~40-step
gate). All exited 0; full `npm run build` completed clean end to end.

```
npm ci                    : 180 packages, 0 vulnerabilities, ~clean
build:data-exports        : 1.28s  → claims=813, sources=494, cases=72,
                             gaps=186, relations=84, entities=77, dossiers=22
build:global-graph        : 0.43s  → 22 dossier(s), 66 curated node(s),
                             84 curated edge(s); full registry layer:
                             1,631 node(s), 2,112 edge(s)
validate:graph-coverage   : 0.33s  → OK, full map covers every record
                             (1,631 nodes: 77 entities, 813 claims,
                             494 sources, 72 cases, 186 gaps; 2,112 edges).
                             Curated layer attaches 57/813 claims (7%)
                             and 47/494 sources (10%) — confirms the
                             curated view is deliberately partial, per
                             its own in-code comment.
js:build                  : 35ms   → static/js/app.js: 366.2kb (esbuild-reported)
npm run build (full gate) : 77.18s wall (176.97s user, 247% cpu) —
                             zola build itself: 53.3s, 1,755 pages / 191
                             sections. Exit code 0.
```

File sizes (measured directly, not estimated):

| Artifact | Raw | Gzip -9 | Brotli |
|---|---|---|---|
| `data/generated/global-graph.json` | 833,924 B (≈814 KB) | 124,833 B (≈122 KB) | 93,401 B (≈91 KB) |
| `static/js/app.js` | 375,038 B (≈366 KB) | 97,534 B (≈95 KB) | 83,738 B (≈82 KB) |
| `static/search-index.json` (fetched in full by `graph-view.js`'s `fetchRouteMap` before first render) | 624,347 B (≈610 KB) | not measured | not measured |

Sigma/Graphology/ForceAtlas2 bundling: confirmed **not split** —
`grep -c "graphology\|forceAtlas2"` against the built `static/js/app.js`
returns matches (library code present), there is only one esbuild
entrypoint (`assets/js/app.js`) in `package.json`'s `js:build` script,
and no `assets/js/graph-app.js` or similar second entrypoint exists
anywhere under `assets/js/`.

Dossier count: **22** (`data/dossiers.toml`, confirmed both by
`build:data-exports`'s own count and `build:global-graph`'s own count —
they agree).

These numbers are close to, and now exceed, the mission prompt's example
figures (curated 66/84 — exact match; full registry 1,631/2,112 vs. the
prompt's example 1,620/2,085 — the dataset has grown slightly since the
prompt was written, consistent with `docs/coop/TASKS.md`'s archive
showing recently-merged research tasks T-022 through T-026 adding
dossiers/claims). They also now clear both revisit thresholds in
`docs/adr/graph-renderer.md` (500 nodes / 2,000 edges) by roughly 3–8×,
which independently justifies treating this as a real
scale/architecture problem rather than a speculative one.

Not measured in this pass (require browser instrumentation, deferred to
a later phase): long-task count (>50ms) on full-layer load, canvas/
observer/listener counts across ten layer switches, actual client-side
ForceAtlas2 wall-clock time in a real browser. `graph-view.js`'s
synchronous `forceAtlas2.assign(..., { iterations: 220 })` running on
1,631 nodes/2,112 edges on every switch into the full layer is a strong
a priori candidate for a measurable long task, but was not instrumented
here — Phase A intentionally made no runtime/browser changes.

## 3. Co-op task board situation

- `docs/coop/TASKS.md` has two active missions: the broader "workbench
  redesign" (T-018, T-019, T-021 open; T-011–T-017, T-020, T-022–T-026
  already merged/archived) and the older "plné fyzické rozpojení entity
  dossierů" mission (T-001 in-progress, T-003/T-004 todo). **Neither
  covers the Sigma/Graphology graph-workbench rebuild** described in the
  mission prompt this audit is for.
- Highest task ID in use: **T-026**. Next free ID: **T-027**.
- Per `docs/coop/PROTOCOL.md`: only ORCH (main checkout, `master`) may
  edit `TASKS.md`; a task this large should be decomposed into multiple
  `T-027…` sub-tasks (mirroring the mission's own phase breakdown, §22)
  and run in a dedicated worktree (`~/dev/vomaste-worktrees/T-027`,
  branch `task/T-027`) per the one-task/one-branch/one-worktree rule,
  not directly on `master`.
- Several worktrees are already active for other tasks (T-018/T-019/T-001
  in progress per the session-start co-op status) — a new graph-workbench
  worktree would run in parallel with those without conflict, since none
  of them touch `assets/js/modules/graph-view.js`,
  `scripts/dossier/build-global-graph.mjs`, or `templates/map.html`.

## Summary: what's greenfield vs. already partially solved

Already done, don't redo:
- Renderer choice (Sigma 3 + Graphology) — already adopted, ADR'd, and
  shipped.
- Container resize handling (`ResizeObserver`, rAF-batched, fullscreen-
  aware) — already correct.
- Curated-vs-full two-layer data model — already exists as a concept,
  including honest coverage-percentage validation
  (`validate-graph-coverage.mjs`).
- Deterministic seed positions before layout — partially done (circular
  seed), though the layout itself still runs client-side.
- Cross-dossier ID collision handling in the generator — already solved
  via `"<dossier>::<id>"` namespacing.
- Build-gate hard-failure discipline (missing exports, duplicate ids) —
  already the house style; extend rather than invent.

Fully greenfield (confirmed absent, not just under-built):
- Manifest file, content-hash-based cache invalidation, per-layer lazy
  payload split (today: one inlined JSON island per page).
- Build-time layout computation (today: synchronous client-side
  ForceAtlas2 on every render).
- Single persistent Sigma instance across layer switches (today:
  kill+recreate every switch).
- Any cleanup/destroy lifecycle.
- URL/permalink state.
- nodeReducer/edgeReducer-based selection/hover/focus/dimming.
- LOD/zoom-tier label strategy.
- Inspector panel, filters, facets, neighborhood/focus modes, path
  finder, search-integrated graph navigation.
- JS bundle splitting (graph code ships on every page today).
- JSON Schema validation of the generated transport payload (only the
  `graph.toml` source shape is schema-validated today).
- Design-token-based color mapping for graph node/edge colors (currently
  hardcoded JS constants + scattered CSS).

Cosmetic but explicitly in scope: rename the one live legacy class
(`cy-chip` → e.g. `graph-chip`, 2 template call sites + 3 CSS rule
blocks) and delete the ~16 dead `cy-*` rule blocks that reference no
surviving markup.
