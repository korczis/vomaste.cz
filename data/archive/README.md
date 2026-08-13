# Registry preservation archive (VR detail layer)

Structured public-registry snapshots, preserved because a primary
source can disappear from the internet and this project otherwise
cites it only by URL. See
`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` §4, "Doplnění,
2026-08-08" for the rule this directory implements: **source
publicness and content safety are two different axes.**

This directory is the **VR detail layer**, complementary to the main
document archive under `static/documents/` (built by
`scripts/osint/archive-ares-entities.mjs` /
`archive-justice-entities.mjs` / `archive-court-noticeboards.mjs`,
gate-enforced by their tests and downloadable from the UI):

- `ares-snapshots/<ico>.json` — structured ARES **VR-branch** data
  the basic-endpoint snapshots in `static/documents/registry/ares/`
  do not carry: registered statutory organs and shareholders with
  share sizes. Personal data of natural persons (date of birth, home
  address — both of which the VR branch returns in full) is
  intentionally excluded in code, the same way
  `scripts/osint/expand-entity.mjs` excludes it for context entities.
  Best-effort: the VR branch covers companies, spolky and nadace —
  state institutions and municipalities 404 here and that is not an
  error.
- `ico-resolution.json` — name→IČO resolution outcomes for the whole
  entity registry, including per-entity rejection reasons for
  exactly-one ARES hits that human review found to be lookalike
  mismatches. This file is the audit trail for every
  `externalIds.ico` added by `--enrich`.

Raw Sbírka listin documents are handled by
`archive-justice-entities.mjs` (`--download`): sanitized filing
indexes in `static/documents/registry/justice/`, raw documents in the
local Zone-B archive outside Git, publication only after individual
review as a safe derivative.

Regenerate with:

```
node scripts/osint/archive-registry-snapshots.mjs --from-entities [--enrich] [--skip-existing]
node scripts/osint/archive-registry-snapshots.mjs --ico=<ico>[,<ico>...]
```

Live network calls, never part of `npm run build`.
