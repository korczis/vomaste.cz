# vomaste.cz

Static site generated with [Zola](https://www.getzola.org/), built and deployed to GitHub Pages via GitHub Actions.

## What this is

vomaste.cz is a general platform for neutral, source-cited "dossiers" about publicly reported controversies of public figures. It currently hosts one dossier (Petr Macinka, Filip Turek) — see `AGENTS.md` for the exact, dated scope of authorization and the editorial rules it's written under. The data model, templates, and rules are designed generically so a future dossier could reuse them, subject to a new explicit owner authorization.

Every dossier is built on three cross-referenced registries:

- **Claims registry (`CLM-##`)** — a table of claims, each with a verification status (`CORROBORATED` / `CITACE` / `SPORNÉ` / `NÁZOR`) and a link to its source(s).
- **Sources registry (`SRC-##`)** — one page per source: outlet, type, URL, dates, which claims it supports.
- **Gaps registry (`GAP-##`)** — open questions, with a priority and a last-checked date.

Registries are bidirectionally linked, and link/anchor integrity is enforced automatically at build time (see `scripts/dossier/`).

## Structure

- `content/` — Zola content: homepage (`_index.md`), `dossiers/_index.md` (registry of dossiers), and `dossiers/<slug>/` per authorized dossier — the main dossier page plus `sources/`, `claims/`, `cases/`, `gaps/` sub-sections, one Zola page per record.
- `templates/` — Tera templates: `base.html` (shared layout), `index.html` (landing page), `dossiers-index.html`, `dossier.html`, `dossier-source.html` / `dossier-sources-index.html`, `dossier-claim.html` / `dossier-claims-index.html`, `dossier-case.html` / `dossier-cases-index.html`, `dossier-gap.html` / `dossier-gaps-index.html`.
- `data/navigation.toml` — data-driven navigation, rendered by `base.html` into a Flowbite application shell: fixed top navbar + a sidebar that's a genuine Flowbite Drawer (docked on desktop via `md:translate-x-0`, off-canvas on mobile behind the navbar's hamburger toggle).
- `assets/js/` — ES module JS source, bundled with esbuild into `static/js/app.js`; `assets/js/modules/` holds one file per feature (filters, relationship graph, charts, fullscreen, etc.).
- `static/css/input.css` — Tailwind source, compiled into `static/css/main.css`.
- `scripts/dossier/` — Node scripts that validate the dossier's claim/source registry and anchor links; run as part of the build.

## Stack

- [Zola](https://www.getzola.org/) — content, routing, templating
- [Tailwind CSS](https://tailwindcss.com/) — compiled via the Tailwind CLI (`npm run css:build`), not loaded from a CDN
- [Flowbite](https://flowbite.com/) — the navbar/drawer application shell (`data-drawer-target`/`data-drawer-toggle`, self-initializing), bundled via esbuild
- [Alpine.js](https://alpinejs.dev/) — used the same way as Chart.js/Cytoscape.js below: a targeted dependency for genuinely interactive UI (filter toolbars, the relationship graph's chips/detail panel), not a site-wide framework. Bundled via esbuild.
- [Chart.js](https://www.chartjs.org/) and [Cytoscape.js](https://js.cytoscape.org/) — loaded from CDN on the dossier page only, for the status chart and relationship graph

## Development

```bash
npm ci
npm run dev
```

`npm run dev` builds CSS and JS once, then runs `zola serve` (live reload at `http://127.0.0.1:1111`).

## Production build

```bash
npm ci
npm run build
```

Runs, in order: `validate:dossier` (claim/source registry integrity) → `css:build` → `js:build` → `zola build` → `verify:anchors` (checks anchors in the built HTML). This is the exact sequence run by `.github/workflows/deploy.yml` on every push to `master`.

## Validating dossier content

- `npm run validate:dossier` — checks that every `CLM-##`/`GAP-##` table row has a working anchor, that every `SRC-##`/`CLM-##` reference resolves, and that there are no duplicate IDs.
- `npm run verify:anchors` — runs after `zola build`; confirms every anchor and link from the Markdown source actually exists in the generated HTML (Zola's own link checker does not validate hand-written `id="..."` attributes).

## Adding content to a dossier

Every dossier lives under `content/dossiers/<slug>/` (e.g.
`content/dossiers/macinka-turek/`), routed at `/dossiers/<slug>/...`. Each
registry has both an overview row/card on the main dossier page *and* a
per-record Zola page — `scripts/dossier/validate-dossier.mjs` fails the
build if the two ever disagree.

1. New source: add `content/dossiers/<slug>/sources/src-NN.md` following the existing front-matter schema (`src_id`, `outlet`, `src_type`, `url`, `retrieved`, `published`, `claims`).
2. New claim: add a `CLM-NN` row to the table in `content/dossiers/<slug>/_index.md`, with a `<a id="clm-NN"></a>` anchor linking to its detail page, then run `node scripts/dossier/migrate-claims-to-pages.mjs` to regenerate `content/dossiers/<slug>/claims/clm-NN.md`.
3. New case: add a `[[extra.cases]]` entry to `content/dossiers/<slug>/_index.md`'s front matter, then run `node scripts/dossier/migrate-cases-to-pages.mjs` to regenerate `content/dossiers/<slug>/cases/case-NN.md`.
4. New gap: add `content/dossiers/<slug>/gaps/gap-NN.md` (`gap_id`, `priority`, `checked`, `claims`).
5. Run `npm run build` — a failure means a missing source, anchor, reference, or a claim/case page that's drifted from the overview table.

Extending scope to a new subject or a new controversy requires a prior authorization recorded in `AGENTS.md` — see that file before adding anything not already covered.

## Deployment

GitHub Actions builds the site and deploys it to GitHub Pages via `actions/deploy-pages` (Pages artifact flow, not a `gh-pages` branch) — using the workflow's built-in OIDC token, no personal access token or other secret required. `base_url` in `config.toml` is currently pinned to the `korczis.github.io/vomaste.cz` fallback host — see the comment there — until DNS for the `vomaste.cz` custom domain is configured.
