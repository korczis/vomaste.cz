# vomaste.cz

Static site generated with [Zola](https://www.getzola.org/), built and deployed to GitHub Pages via GitHub Actions.

## Structure

- `content/` — Zola content: homepage (`_index.md`) and the `/dossier/` section, which holds the main dossier page and the `zdroje/` (sources) sub-section with one page per cited source.
- `templates/` — Tera templates (`base.html` is the shared layout all pages extend).
- `assets/js/` — ES module JS source, bundled with esbuild into `static/js/app.js`.
- `static/css/input.css` — Tailwind source, compiled into `static/css/main.css`.
- `scripts/dossier/` — Node scripts that validate the dossier's claim/source registry and anchor links; run as part of the build.

## Stack

- [Zola](https://www.getzola.org/) — content, routing, templating
- [Tailwind CSS](https://tailwindcss.com/) — compiled via the Tailwind CLI (`npm run css:build`), not loaded from a CDN
- [Flowbite](https://flowbite.com/) — vanilla JS components, bundled via esbuild
- [Chart.js](https://www.chartjs.org/) and [Cytoscape.js](https://js.cytoscape.org/) — loaded from CDN on the dossier page only, for the status chart and relationship graph

## Development

```bash
npm ci
npm run dev
```

`npm run dev` builds CSS and JS once, then runs `zola serve`.

## Production build

```bash
npm ci
npm run build
```

Runs the dossier data-integrity checks, builds CSS and JS, builds the Zola site, then verifies internal anchors. This is the same sequence run by `.github/workflows/deploy.yml` on every push to `master`.

## Deployment

GitHub Actions builds the site and deploys it to GitHub Pages via `actions/deploy-pages` (Pages artifact flow, not a `gh-pages` branch). `base_url` in `config.toml` is currently pinned to the `korczis.github.io/vomaste.cz` fallback host — see the comment there — until DNS for the `vomaste.cz` custom domain is configured.
