# JSON-first migration — baseline audit (Phase A)

**Measured**: 2026-08-01, against `task/T-028` (== `master` at audit time,
commit see `data/generated/migration-baseline.json`'s `git_commit` field).
**Method**: every number below was produced by actually running the
build/validators and reading their real output — not estimated, not
copied from the mission prompt's example figures. Full machine-readable
version: `data/generated/migration-baseline.json` (gitignored,
regenerable).

## `npm run build`

**PASSED clean.** 1,755 pages built, `zola build` 85.7s. All `verify:*`
steps (navigation-counts, anchors, jsonld, full-pages, export) passed
with zero errors.

## Record counts by type

| type | count |
|---|---|
| claims | 813 |
| sources | 494 |
| cases | 72 |
| gaps | 186 |
| relations | 84 |
| entities (global) | 77 |
| dossiers | 22 |
| **total Markdown files** | **1,947** |

The mission prompt's example snapshot said "483 zdrojů" (sources) —
measured is **494**. Every other prompt figure matches within rounding
(813 claims, 72 cases, 186 gaps, 84 relations, 66 global entities vs. 77
measured — the prompt's "66" matches this repo's **curated graph node
count**, not the global entity registry count; these are two different
things and the mission's own § 2 numbers conflate them slightly). Treat
the numbers in this file as authoritative, not the prompt's.

## Dossier registry (`data/dossiers.toml`)

22 dossiers: 21 `entity` type + 1 `aggregate` (`macinka-turek`). Of the 21
entity dossiers, 19 are self-canonical (`canonical_dossier` == own slug)
and 2 (`petr-macinka`, `filip-turek`) have `canonical_dossier =
"macinka-turek"` — i.e. own zero physical records today, generated
filtered views over the aggregate. Full list with type/canonical_dossier
in the JSON baseline.

## Routes

**1,860 unique public routes** (`data/generated/routes.json`,
`build-route-manifest.mjs` — the script itself hard-fails on any
collision, so uniqueness is enforced, not just observed).

## Identifiers

Every claim/source/case/gap/relation id is **dossier-scoped**, not
global (`CLM-01` exists independently in all 22 dossiers) — the
composite-key problem the migration mission's § 4.1 specifically calls
out. Full lists of every `dossier:ID` pair are in the JSON baseline
(813 + 494 + 72 + 186 + 84 = 1,649 dossier-scoped identifiers). The 77
global entity ids (`content/entities/*.md`) are the one identifier space
that's already global, not dossier-scoped.

## Referential link graph

| link | count |
|---|---|
| claim → source | 1,191 |
| gap → claim | 100 |
| relation → claim | 134 |
| relation → source | 146 |
| case → claim | **0** |
| case → source | **0** |

**Finding**: case records in `static/data/cases.json` carry no
`claims[]`/`sources[]` array in the current export shape — confirmed by
reading an actual record (`CASE-01`, oto-klempir: has `title`, `period`,
`status`, `label`, `subjects`, `url`, no `claims`/`sources` fields).
Case-to-claim/source linkage is **not structured data today** in this
repo — it exists only as prose/anchor references inside the dossier's
hand-written overview page. Mission § 5.5 requires `Case` records to
carry `claims`/`sources` fields; the migration will need to either
derive this linkage (e.g. from anchor cross-references in the dossier
body) or treat it as a genuinely new structured field with no reliable
source to backfill from for every case. This is a real design decision
for Phase C/D, not a migration bug.

## Graph (Sigma/Graphology transport layer, already built T-027)

- Curated layer: 66 nodes / 84 edges.
- Full registry layer: 1,631 nodes / 2,112 edges.
- 20 per-dossier graph payloads generated (the 19 self-canonical
  dossiers + the `macinka-turek` aggregate); `petr-macinka` and
  `filip-turek` have zero (they own no `graph.toml` today).

## Static data exports (`static/data/`)

56 files checksummed (SHA-256), full manifest in the JSON baseline.
Includes the 7 flat registry tables (`claims.json`, `sources.json`,
`cases.json`, `gaps.json`, `relations.json`, `entities.json`,
`dossiers.json`), 23 JSON-LD exports (22 per-dossier + `graph.jsonld`),
`jsonld-manifest.json`, `navigation-metrics.json`, and the graph
workbench payloads (`graph/manifest.json`, `graph/global-curated.json`,
`graph/global-registry.json`, `graph/dossier/*.json`).

## Existing validators (all currently pass — this is the regression floor)

| validator | result |
|---|---|
| `validate:dossier` | OK — referential integrity, 20 dossiers (warnings only: a few duplicate canonical URLs across sources, 2 possibly-dead context-only sources — pre-existing, not migration-blocking) |
| `validate:schemas` | OK — 1,748 rows / 10 schemas |
| `validate:graph` | OK — 20 dossiers |
| `validate:authorization` | OK — 22 dossiers, 77 entities |
| `verify:authorization-log` | OK — 21 append-only entries intact |
| `validate:dossier-types` | OK — 21 entity + 1 aggregate |
| `validate:navigation` | OK — 7 top-level, 21 entity dossiers nested, 147 registry links |
| `validate:concepts` | OK — 19 concept pages / 5 groups |
| `validate:entity-types` | OK — 9 declared types, 77 entity pages |

Any JSON-first rewrite must keep every one of these passing (or their
functional equivalent under the new architecture) — this is the
regression floor the migration's parity tests (mission § 20) must check
against.

## What this means for Phase B onward

1. **Composite-key identifiers are pervasive** (1,649 dossier-scoped
   ids) — the global `@id` scheme (mission § 4.1) must be applied
   uniformly from the first schema, not retrofitted.
2. **Case-to-claim/source linkage is structurally missing today** — flag
   this explicitly to the site owner before Phase D (the lossless
   migrator) invents a mapping that wasn't actually in the source data.
3. **The `petr-macinka`/`filip-turek` ownership question (formerly
   T-001)** is real and current: 0 of their own records exist; JSON
   migration must decide the `dossier` field for every macinka-turek
   record (per its already-complete `subjects` tagging — see
   `scripts/dossier/tag-subjects.mjs`), which is exactly the mechanism
   the mission's own architecture (§ 4.1, "dossier field, not a
   directory") already wants.
4. **Every one of the 9 existing validators has a single, clear owner
   file** — the JSON-first compiler's validate-shape/validate-references/
   validate-semantics split (mission § 7) should map roughly 1:1 onto
   these, not invent a parallel structure.

## Addendum 2026-08-01 (po merge T-034 do task/T-028)

Master se mezi měřením baseline a startem implementace posunul o obsahové
rozšíření dossieru `andrej-babis` (T-034, merge `7f1af61` + fix
`ae5e820`). Nové autoritativní počty v pracovním stromu této větve:

| type | count (bylo → je) |
|---|---|
| claims | 813 → **835** |
| sources | 494 → **514** |
| cases | 72 → **81** |
| gaps | 186 → **187** |
| relations | 84 → **101** |
| entities (global) | 77 → **84** |
| dossiers | 22 → 22 |
| Markdown souborů v content/ | 1 947 → **2 023** |

Delta odpovídá přesně T-034 (22 CLM, 20 SRC, 9 CASE, 1 GAP, 17 hran,
7 entit) — žádný jiný drift.

**Oprava nálezu „case → claim: 0“**: nulová vazba platí pouze pro tvar
`static/data/cases.json` exportu. Ve **zdrojových datech** je vazba
strukturovaná: každý `[[extra.cases]]` blok v `_index.md` nese pole
`claims = [...]` (redakčně kurátorované) a generované case stránky k nim
odvozují `sources` jako sjednocení zdrojů svých claimů
(`migrate-cases-to-pages.mjs`). Fáze D tedy má z čeho migrovat —
mapping se nevymýšlí, jen se přenese z front matter; do exportního tvaru
ho doplní až přepojení generátorů (fáze G).
