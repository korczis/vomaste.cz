# Dossier audit — baseline (2026-07-29)

Internal engineering/editorial control document. Not published (lives under
`docs/`, outside Zola's `content/`). Records the verified state of the
repository and production at the start of the 2026-07-29 audit round.

## Repository state

- Branch: `master`, clean, synced with `origin/master` (`3f6438b`).
- One unrelated worktree preserved untouched:
  `/Users/korczis/dev/vomaste-worktrees/legal-osint-acquisition-20260722T154322Z`.
- Build system: npm scripts orchestrating Node validators → Tailwind →
  esbuild → Zola 0.22.1 → anchor verifier. `npm run build` is the full local
  gate and mirrors `.github/workflows/deploy.yml` step-for-step.

## Baseline quality gate

`npm run build` at `3f6438b`: **exits clean**.

- `validate:dossier`, `validate:graph`, `validate:authorization`,
  `validate:dossier-types`, `validate:navigation`: pass.
- Zola: 159 pages, 26 sections, 0 orphans.
- `verify:anchors`: every referenced anchor resolves in built HTML
  (macinka-turek: 84 ids; petr-macinka: 8; filip-turek: 8).

## Canonical record counts (all physically owned by `macinka-turek`)

| Registry  | Count |
|-----------|-------|
| Claims    | 44    |
| Sources   | 52    |
| Cases     | 4     |
| Gaps      | 6     |
| Relations | 30    |
| Entities (global, `content/entities/`) | 23 |

Entity dossiers `petr-macinka` and `filip-turek` own **zero** physical
records, as required by `validate-dossier-types.mjs`. Subject split shown in
production: 13 Macinka / 36 Turek / 5 shared = 44 canonical claims.

## Production state at baseline

- Deployment: GitHub Actions on push to `master` → GitHub Pages.
- `base_url`: `https://korczis.github.io/vomaste.cz` (custom-domain DNS for
  vomaste.cz not live yet; documented in `config.toml`).
- Last 5 CI runs: all green (≈45–65 s each).
- Homepage and `/dossiers/macinka-turek/` fetched 2026-07-29: content and
  metric tiles match repo (44/52/4/6, updated 2026-07-29); aggregate page
  correctly labeled "Generovaný společný pohled"; no visible errors or
  placeholders.

## Known accepted limitations at baseline

- `caniuse-lite` outdated warning from Tailwind build (cosmetic).
- irozhlas.cz excluded from Zola's link checker (bot-blocking 403), see
  `config.toml [link_checker]` — documented, not a dead link.
- og:image is SVG; Facebook/LinkedIn won't render it (documented in
  `config.toml`).
