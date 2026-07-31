# ADR: advanced application shell rebuild — audit and phased plan

**Status**: accepted in principle, phased; implementation sequenced after
T-001 (see "Sequencing" below) — this entry is the audit + plan, not the
rebuild itself.
**Date**: 2026-07-30.

## Question asked

Site owner requested a complete rebuild of vomaste.cz's shell into an
"advanced Flowbite application shell": topbar, collapsible primary
sidebar, secondary explorer sidebar, optional right context panel,
command palette, density modes, advanced registry tables, route-specific
JS bundles, full responsive/accessibility/no-JS contract, Playwright
test suite, and a synthetic 1,000-entity scale test — specified in a
51-section master prompt. Full text of that prompt is preserved in the
conversation that authorized this ADR; this document is the Phase A
(audit) deliverable plus a phased implementation plan, not the
implementation itself — see "Why not implemented now" below.

## Measured current state (Phase A audit)

```
Flowbite:    4.0.2
Tailwind:    3.4.19 top-level, but 4.3.3 pulled in transitively via
             flowbite-datepicker -> @tailwindcss/postcss -> @tailwindcss/node
             -- a real version-mismatch smell, flagged for the dependency-
             hygiene phase below, not fixed in this pass.
Alpine.js:   3.15.12

Global graph scale (data/generated/global-graph.json):
  nodes: 23   edges: 31   dossiers: 3

Templates (31 files, see templates/): no templates/layouts/,
templates/partials/app-shell/, or scripts/navigation/ directories exist
yet -- the master prompt's proposed structure is new, not a rename of
something existing.
```

### What the master prompt asks for that is ALREADY true today

This is the most load-bearing finding of this audit: significant parts
of the target information architecture already landed, incrementally,
through the normal coop-board process (T-001-adjacent navigation work,
"Structural change, 2026-07-30: generated navigation tree, no person at
top level" in `AGENTS.md`) -- not as a rewrite, as a series of small,
reviewed, build-gated changes:

- **Primary navigation is already data-driven and already has exactly 6
  root items** (`data/generated/navigation.json`, built by
  `scripts/dossier/build-navigation.mjs` from `data/navigation.toml` +
  `data/dossiers.toml` + on-disk registries + `data/concept-groups.toml`):
  Domů, Dossiery, Entity, Globální mapa, Koncepty, Dokumentace. This
  already satisfies the master prompt's "≤ 7 root items" and "no person
  at root" hard-failure conditions (§5, §48) -- verified directly, not
  assumed: no dossier slug and no entity name appear anywhere in
  `data/navigation.toml` (a "static SKELETON" by its own file header) or
  in any template.
- **No hardcoded dossier slugs in any template** -- every dossier-scoped
  template reads its own root from front matter and builds sibling paths
  from it (this was already an `AGENTS.md` invariant before this ADR).
- **Aggregate views are already structurally denied a subtree** and
  flagged `isAggregate` by the generator -- the master prompt's §14
  requirement is already enforced by `validate-navigation.mjs`.
- **Real Flowbite drawer markup**, not custom JS: `data-drawer-target`,
  `data-drawer-toggle`, `aria-controls`, `aria-expanded` on the sidebar
  toggle (`templates/base.html`) -- confirmed by direct inspection, not
  assumed.
- **Zero `href="#"` placeholder links and zero inline `onclick=` handlers**
  across all 31 templates (grepped directly) -- the master prompt's §41/§47
  hard-failure conditions on this front are already met.
- **A `<noscript>` fallback nav exists** for the no-JS case (§42).
- **Component-reuse gate already exists and is enforced** (`npm run
  lint:component-reuse`, added this session): every template but two
  documented exceptions already uses the shared `macros/ui.html` library.
- **A second, independently-driven navigation subtree already exists**
  (`koncepty`), proving the "add a dossier/entity without touching a
  shell template" invariant (§5, §50) already holds in practice, not just
  in theory.

### Closed since this audit (2026-07-31)

Two items this audit listed as missing have since been built. They are
recorded here rather than deleted, because an audit that keeps claiming a
capability is absent causes the same waste as one that claims a capability
exists: on 2026-07-31 two sessions independently built a sortable table
component (`dossier-directory.js` and `advancedTable()`), each unaware the
other was doing it. Re-reading a stale gap list is one way that happens.

- **Command palette (§40) — BUILT** (coop T-020). `assets/js/modules/
  global-search.js` + `search-core.js`: `/` and Cmd/Ctrl+K focus the bar,
  diacritics-insensitive matching, ID-first ranking, grouped results.
- **Dossier directory as a dense, switchable catalog — BUILT** (coop
  T-027). `templates/partials/dossier-directory.html`: table / compact
  list / grid, three projections over one normalised dataset, one
  collection state, `?view=` in the URL, list as the mobile default. The
  landing page's full-width card wall (one dossier ≈ one viewport) is
  gone. See `docs/adr/dossier-directory-multi-view.md`.
- **Advanced registry table toolbar (§17–§19) — BUILT** (coop T-019,
  `5a2aba4`, `ea8f3b3`, `5d06502`). `templates/macros/table.html` +
  `assets/js/modules/table-filter.js`: search, chip and select facets,
  column sort, column visibility, CSV/JSON export of the visible slice,
  and filter state reproduced in the URL. Used by the dossier directory
  and the claims/sources/gaps/cases registries. The `registry-card` grid
  this audit described is gone from those five views.
  Pagination is deliberately absent — see the module header for why.

### What is genuinely NOT built yet (the real gap vs. the master prompt)

- **No secondary sidebar / explorer layer.** Today's shell is a single
  primary sidebar; there is no dossier-catalog explorer, entity explorer,
  or registry-tree explorer distinct from the primary tree (master
  prompt §6.2, §10–§13).
  provider abstraction (`data/generated/navigation-secondary.json` etc.)
  does not exist.
- **No right context panel** (§15) -- clicking a record goes straight to
  its canonical detail page; there is no preview-panel pattern.
- **No density modes** (§39).
- **No mobile bottom navigation** distinct from the drawer (§25) -- the
  `<noscript>` fallback and the drawer are the only two mobile paths
  today.
- **No Playwright (or other) browser test suite** exists in this repo at
  all today -- `npm test` (added this session) covers only Node-level
  script regression tests, nothing render/browser-level.
- **No synthetic scale-test dataset or scale-specific validation** (§46)
  -- at 23 nodes / 31 edges, nothing in this repo has ever needed to
  behave differently at scale, so nothing has been built or tested for
  it (same conclusion `docs/adr/graph-renderer.md` already reached about
  the graph specifically).
- **No secondary-provider Tera architecture**
  (`templates/layouts/`, `templates/partials/app-shell/`,
  `scripts/navigation/*`, `scripts/ui/*` per §29–§32) -- these are new
  directories the master prompt proposes, not a refactor of an existing
  one.

## Decision

**Accepted as a phased effort, not a single rewrite.** The master
prompt's vision is coherent and its hard-failure conditions (no person
at root, ≤7 root items, no hardcoded entity in a shell template, no
manually-entered counts) are good invariants -- most are, per the audit
above, already true today. The remaining, genuinely new work (secondary
explorers, context panel, command palette, advanced tables, Playwright
suite, scale testing) is real, substantial, multi-file engineering --
correctly scaled to "phases", not a thing to attempt in one sitting
against a live, actively-changing shared checkout.

## Why not implemented now

Two independent, concrete reasons, not caution for its own sake:

1. **Active collision.** In the hours immediately before this audit,
   concurrent sessions pushed: the generated-navigation structural
   change itself, a second sidebar subtree (`koncepty`), a
   "Flowbite doctrine F1-F7" pass removing inline styles from
   `templates/index.html`/`dossier.html`/`map.html`, and a "full-page
   doctrine" touching `templates/dossier-claim.html`/
   `dossier-source.html`. A shell rewrite started now would edit exactly
   the files these sessions are mid-way through.
2. **T-001 is still in-progress.** The entity-dossier physical-decoupling
   migration (`docs/coop/TASKS.md`) is still actively modifying
   `data/dossiers.toml` and `scripts/dossier/lib/dossier-registry.mjs`
   -- the same registry data the navigation generator (and any explorer
   built on top of it) reads. Building an explorer layer against a data
   model still being rewritten underneath it means rework, not progress.

## Sequencing (coop board)

Broken into board tasks mirroring the master prompt's own phases B-G,
each scoped to specific files and each depending on T-001 having merged
first -- see `docs/coop/TASKS.md` T-011 through T-015. Phase A (this
document) required no live file changes and carries no such dependency.

## Revisit threshold

- Start T-011 (information architecture / secondary-provider data model)
  only once T-001 shows `merged` on the coop board.
- Re-run the scale audit (currently 23 nodes / 31 edges / 3 dossiers)
  before deciding *how much* virtualization/lazy-loading effort T-012
  (explorer layer) actually needs -- do not build for 1,000 entities
  against measured needs of 23, per this project's own established
  ADR discipline (`docs/adr/graph-renderer.md`,
  `docs/adr/dossier-jsonld-provenance-extension.md`). The master
  prompt's own synthetic 1,000-entity scale test (§46) is exactly the
  right tool for this -- run it, don't skip it, but run it as part of
  T-012/T-013, not as a reason to over-build now.
- Resolve the Tailwind 3/4 transitive-version mismatch found in this
  audit before or during T-011, since any new shell CSS work should not
  be built against an ambiguous Tailwind version.
