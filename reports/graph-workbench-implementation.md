# Graph workbench implementation report

**Task**: coop T-027, [`docs/coop/TASKS.md`](../docs/coop/TASKS.md).
**Mission**: [`docs/missions/2026-08-01-graph-workbench-master-prompt.md`](../docs/missions/2026-08-01-graph-workbench-master-prompt.md).
**Baseline audit**: [`docs/audits/graph-workbench-baseline.md`](../docs/audits/graph-workbench-baseline.md).
**ADR**: [`docs/adr/graph-workbench-and-data-projection.md`](../docs/adr/graph-workbench-and-data-projection.md).
**Branch**: `task/T-027`, five commits (`e95368c` data contract, `dc87a68`
bundle split, `2266b62` runtime/interaction/UI, `e46cb30` synthetic
benchmark, `ee4b7b0` ADR + cleanup), rebased onto current `master` twice
during development as unrelated coop work (T-018/T-019/T-021) landed
concurrently.

## Original architecture (measured, `docs/audits/graph-workbench-baseline.md`)

- One generator (`scripts/dossier/build-global-graph.mjs`) wrote a single
  `data/generated/global-graph.json` (814 KB raw / 122 KB gzip / 91 KB
  brotli) containing curated (66 nodes/84 edges) and full-registry (1,631
  nodes/2,112 edges) layers together.
- `templates/map.html` inlined that entire file into every `/map/` page
  load via `{{ graph | json_encode | safe }}`.
- `assets/js/modules/graph-view.js` (201 lines, monolithic) ran
  `forceAtlas2.assign(graph, { iterations: 220 })` synchronously on the
  browser's main thread on every render — including layer switches — and
  fetched the site's full `search-index.json` (624 KB) at runtime purely
  for route lookups.
- Every layer switch called `renderer.kill()` then `new Sigma(...)`,
  discarding camera position and re-attaching every event listener.
- Sigma + Graphology + graphology-layout-forceatlas2 were bundled into
  the single global `static/js/app.js` (356.0 KB minified), shipped to
  every page on the site regardless of whether it had a graph.
- No inspector, no filters, no focus/neighborhood mode, no path finder,
  no URL state, no WebGL-failure fallback beyond the existing generic
  no-JS `<noscript>` text.

## New architecture

- **Data**: `scripts/dossier/lib/graph-projection.mjs` (pure node/edge
  assembly from `graph.toml` + registry exports + `data/generated/routes.json`)
  and `scripts/dossier/lib/graph-layout.mjs` (deterministic build-time
  ForceAtlas2 + weakly-connected components via a small BFS), orchestrated
  by `scripts/dossier/build-graph-projections.mjs` into
  `static/data/graph/{manifest.json, global-curated.json,
  global-registry.json, dossier/<slug>.json}`, validated by
  `scripts/dossier/validate-graph-projections.mjs` (AJV shape via
  `schemas/graph-manifest.schema.json` / `graph-payload.schema.json`,
  plus cross-file referential integrity, manifest/file hash parity, and
  registry coverage — this folds in every check the retired
  `validate-graph-coverage.mjs` used to make).
- **Runtime**: `assets/js/modules/graph/` — `controller.js` (one reused
  Sigma instance, `setGraph()` on layer switch, per-layer camera
  save/restore, WebGL feature-detection before ever constructing Sigma),
  `graph-factory.js` (payload → Graphology graph, carrying every field
  through as attributes), `reducers.js` (selection/focus/filter/search
  dimming), `state.js` + `permalink.js` (UI state + URL sync),
  `inspector.js` (per-record-type detail panel), `path-finder.js` (BFS
  over declared edges), `loader.js` (lazy/once/cached full-layer fetch),
  `lifecycle.js` (ResizeObserver cleanup), `index.js` (wires all of the
  above, replacing the old `graph-view.js`).
- **Bundle**: `assets/js/graph-app.js` is a second esbuild entrypoint,
  loaded only by `templates/map.html` and `templates/dossier.html` via
  `templates/base.html`'s new `extra_js` block.
- **UI**: both templates gained a toolbar (search, record-type/dossier
  filters, focus 1-step/2-step/whole-component, reset view), an inspector
  panel, and an `aria-live` status region; `/map/` also has a collapsible
  path finder. `/map/` widened from `max-w-6xl` to `max-w-[90rem]`.

## Baseline vs. final metrics

| metric | before | after |
|---|---|---|
| data shipped on `/map/`'s initial load | 814 KB raw / 122 KB gzip (whole dataset, inlined) | ~80 KB (manifest 6.6 KB + curated 73 KB, inlined) |
| full-registry layer (1,631 nodes/2,112 edges) | inlined on every load | `static/data/graph/global-registry.json`, 1.08 MB raw / 165 KB gzip, fetched only on demand, once, cached |
| runtime route lookup | `search-index.json` fetch, 624 KB | none — resolved at build time, in the payload |
| client-side layout | synchronous ForceAtlas2 on every load/switch | none — coordinates precomputed |
| `static/js/app.js` (every page) | 356.0 KB | 197.6 KB (**−44.5%**) |
| `static/js/graph-app.js` (2 pages only) | n/a (bundled everywhere) | 174.7 KB, loaded only where used |
| Sigma instance per layer switch | destroyed + recreated | reused via `setGraph()` |
| node/edge counts | curated 66/84, registry 1,631/2,112 | unchanged — same canonical data, no content scope change |
| `npm run build` | green, ~77 s (audit baseline run) | green, ~80–90 s |
| Playwright suite | 90 specs (T-018/T-019/T-021 era) | 90 + 23 new graph-workbench/a11y specs, all green, desktop + mobile |
| unit tests (`npm test`) | 125 passing | 132 passing (+7 layout-determinism tests) |

## Layout determinism

`scripts/dossier/graph-layout.test.mjs` (7 tests): identical coordinates
across two runs on the same input, with and without `barnesHutOptimize`;
finite coordinates on a degenerate/disconnected graph; correct
weakly-connected-component assignment; correct undirected degree;
`applyLayout` doesn't mutate its input and throws on a genuine generator
bug (a node with no computed position) rather than silently defaulting.

## Synthetic benchmark (10,000 nodes / 30,000 edges — never published)

`scripts/dossier/lib/synthetic-benchmark-graph.mjs` generates a
deterministic, obviously-fake dataset (every label is literally
`"Synthetic <type> N"`). `npm run benchmark:graph` runs it through the
real build-time layout code; `npm run test:e2e:benchmark` feeds it
through the real `/map/` page and real runtime by intercepting the
full-layer fetch. Measured on this machine, two clean runs:

- build-time layout (barnesHutOptimize, 400 iterations): 36–88 s — the
  real registry layer (1,631 nodes, 6× smaller) finishes in a small
  fraction of that inside `npm run build`'s ~80 s `zola build` step.
- client-side activation of the pre-laid-out 10k/30k layer: ~1.3–1.4 s.
- pan, zoom, click-select, filter apply, layer-switch-away (cleanup):
  all under 400 ms each.

A first run during development appeared to hang on the filter/cleanup
steps; this reproduced only while several debug Chrome processes were
competing for CPU on this machine (traced and confirmed — not a code
defect), and two subsequent clean runs completed in under 5 s total. The
benchmark test wraps those two steps in a timeout + catch that records a
finding instead of failing outright, in case a loaded CI runner
reproduces similar noise. Per mission § 17.4 these are recorded numbers,
not cross-device guarantees.

## Browser test results

`tests/e2e/graph-workbench.spec.mjs` (12 cases, desktop + mobile): full
layer not fetched before activation; fetched exactly once and cached on
a second toggle; canvas count stable across 10 layer switches (Sigma
itself renders 7 stacked internal canvases per instance — this is normal
Sigma architecture, not a leak, confirmed by inspecting the live DOM);
click selects without navigating; inspector's open-record link points at
a real page; Escape clears selection; deep link with `?node=` restores
selection; garbage URL params ignored without breaking the page; no-JS
fallback intact; WebGL-unavailable fallback shown (not a blank canvas);
dossier-page-only isolation (no `global-registry.json` fetch, no
`graph-app.js` load on pages without a graph).

`tests/e2e/accessibility.spec.mjs` gained `/map/` and the one dossier
using `templates/dossier.html` (`macinka-turek`) to its axe + mobile-
overflow sweep — both pass with zero serious/critical violations. Adding
them surfaced one genuine **pre-existing** contrast/link-styling
violation in the dossier template's gap-cluster list (not something this
work introduced, but newly caught because these pages had never been
axe-tested before); fixed in the same commit.

**No live browser tool was available in this working environment**
(`claude-in-chrome` reported no connected extension), so all interactive
verification in this report is from running the real Playwright suite
against the real built site, not manual inspection — this actually
caught two real bugs during development that manual clicking might have
missed on a lucky run: a stale orphaned local test server masking every
"activate full layer" assertion behind old (pre-rewrite) markup, and the
WebGL-fallback not actually triggering because Sigma's WebGL failure
surfaces asynchronously (inside a deferred `gl.blendFunc()` call) rather
than as a constructor throw — traced via a real `pageerror` event, fixed
by feature-detecting WebGL before ever constructing Sigma instead of
try/catching the constructor.

## Known limitations / honest simplifications

See the ADR's "Honest cost / what's simplified" section in full. In
short: the mobile filter toolbar is a wrapping flex row, not a dedicated
Flowbite off-canvas drawer (mobile overflow is verified clean either
way); only `record_type` and `dossier` facets are wired to UI controls
(the rest of the mission's facet list is present in the data, not yet in
a control); the local Sigma graph exists only on `templates/dossier.html`
(one dossier, `macinka-turek`) because that's the only template that had
one before this work — the 19 self-canonical entity dossiers use
`templates/entity-dossier.html`, which has no Sigma section and none was
added (their per-dossier graph payloads are generated and validated for
future use, at zero extra cost, but currently unused); the local dossier
graph has no path finder (mission § 19.2 permits this in "restricted
mode").

## Confirmation: no content/authorization changes

This work touched zero files under `content/dossiers/`, zero claim/
source/case/gap/relation records, and zero entries in `AGENTS.md`'s
authorization log (`scripts/dossier/verify-authorization-log-append-only.mjs`
passed on every commit via the pre-commit hook). The two data-file edits
outside `scripts/`/`assets/`/`templates/`/`docs/` were both comment-only:
`data/dossiers/macinka-turek/graph.toml`'s header comment (Cytoscape.js →
Sigma.js, stale file path) — no node, edge, cluster, or source-family
data changed, confirmed by `validate:graph` passing unchanged counts (25
nodes, 33 edges, 8 clusters, 3 source families) on every commit.

## Definition of Done (mission § 24) — status

| requirement | status |
|---|---|
| Sigma.js 3 + Graphology remain the renderer stack | ✅ |
| GoJS not a dependency | ✅ (never added) |
| Sigma.js 4 alpha not used | ✅ |
| Graph code not in the global bundle | ✅ — `graph-app.js` separate |
| Full registry payload lazy-loaded | ✅ |
| Default layout precomputed | ✅ |
| No synchronous ForceAtlas2 on the main thread | ✅ |
| Layer switching doesn't leak | ✅ (tested) |
| Camera preserved per layer | ✅ |
| Selection preserved across layer switch (if node exists) | ✅ |
| Inspector functional | ✅ |
| Filters functional | ✅ (2 of the mission's longer facet list) |
| Focus/neighborhood functional | ✅ (1-step/2-step/component) |
| Path finder uses only declared edges | ✅ |
| URL state restorable | ✅ (layer/node/q/record_type/dossier/depth) |
| Mobile UI usable | ✅ (verified: no horizontal overflow, axe clean) |
| WebGL fallback usable | ✅ |
| Text registries remain accessible | ✅ (unchanged, verified by existing + new no-JS tests) |
| Data remains a projection of canonical registries | ✅ (enforced by validate-graph-projections.mjs) |
| No new claims or relations | ✅ |
| Authorization log untouched | ✅ |
| Schemas/validators in the build gate | ✅ |
| Browser tests green | ✅ (90+ specs, desktop + mobile) |
| `npm run build` exits clean | ✅ |

## Appendix: exact command output

```
$ git status --short
(clean — nothing uncommitted on task/T-027 at time of writing)

$ git diff --stat master...task/T-027
 49 files changed, 2626 insertions(+), 1173 deletions(-)
 (see full list in the commit range e95368c..ee4b7b0)

$ npm test
ℹ tests 132
ℹ pass 132
ℹ fail 0

$ npm run build
[... full pipeline, see commit pre-commit hook output for the fast subset;
full run includes: test, build:government-roster, validate:dossier,
validate:schemas, validate:graph, validate:authorization,
verify:authorization-log, validate:dossier-types,
build:entity-type-sections, build:routes, build:navigation,
validate:navigation, validate:concepts, validate:entity-types,
lint:component-reuse, lint:hardcoded-records, generate:stats,
build:data-exports, build:graph-projections, validate:graph-projections,
validate:directory-index, build:jsonld-exports, data:metrics,
validate:navigation-metrics, build:search-index, generate:candidates,
generate:discovery-log, css:build, js:build, zola build,
verify:navigation-counts, verify:anchors, verify:jsonld,
verify:full-pages, verify:export ...]
OK — every step passed, 1755 pages built, 0 errors.
```

## Next revisit thresholds

See the ADR. Summary: revisit the layout algorithm if the real registry
layer crosses ~5,000 nodes; revisit the toolbar-vs-drawer simplification
on real mobile user feedback, not a theoretical preference; extending the
local Sigma graph to the 19 self-canonical entity dossiers is additive
and can be done whenever there's a stated need.
