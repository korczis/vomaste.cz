# Working in this repository

A Zola static site whose core feature is a general framework for neutral,
source-cited "dossiers" about publicly reported controversies of public
figures. Which dossiers exist is **not stated here on purpose**: the
canonical dataset is `data/dossiers/**/*.json`, a directory containing a
`dossier.json` *is* the registration (no hand-maintained registry file
exists), and every template, validator and navigation node is driven from
that dataset — a count written into prose would be a constant nobody
recalculates. The live list is at `/dossiers/`; the authorized scope for
each subject is the append-only log at the end of this file. Read this
file in full before changing content, templates, the dossier data model,
or scope.

## Canonical data model: JSON-first (T-028)

Since mission T-028 the **only source of truth** for every dossier domain
record is the canonical JSON dataset:

- `data/dossiers/<slug>/dossier.json` — the dossier itself (identity,
  description, authorization pointers, ordered `contentBlocks` incl. the
  hand-written claims table and timeline, and the curated `graph` layer:
  node labels, clusters, edge order, source families);
- `data/dossiers/<slug>/{claims,sources,cases,gaps,relations,updates}/*.json`
  — one canonical record per file;
- `data/dossiers/_shared/entities/*.json` — the global entity registry;
- `data/dossiers/_shared/vocabularies/*.json` +
  `data/dossiers/_shared/context/vomaste-v1.jsonld` — vocabularies and the
  versioned local JSON-LD context (published as `/context/v1.jsonld`).

Every record is JSON Schema-validated (`schemas/canonical/`, AJV strict)
and simultaneously valid JSON-LD: it carries `@context`, a **global**
`@id` under `https://vomaste.cz/id/…`
(e.g. `https://vomaste.cz/id/dossiers/<slug>/claims/CLM-01`), `@type`,
`recordType` and a local `identifier` (`CLM-01`, `SRC-01`, …) kept for the
UI. Identifiers are dossier-scoped; the global `@id` is what makes
cross-dossier collisions mechanically impossible.

**`content/dossiers/**` and `content/entities/*.md` are GENERATED
adapters**, not sources: Zola needs a content file to create a route, so
`npm run data:build` regenerates minimal stubs (`generated = true`, a
pointer to the record's view model, the canonical markdown body).
Templates read view models (`data/generated/views/**`, gitignored) via
`load_data("data/" ~ extra.view_model)`. **Hand-editing a generated page is
never the fix** — the canonical one is always: edit `data/dossiers/**`, run
`npm run data:build`. Two gates own that rule, and neither is as absolute as
it sounds (see the ordering note below):

- `npm run data:check-generated:content`
  (`scripts/data/check-generated.mjs --content`) — fails when a synced
  path differs byte-for-byte from the staging tree, or when `content/`
  holds a page in the generated scope with no canonical record;
- `npm run lint:generated-content` — fails when such a page loses
  `generated = true` / `view_model`, or grows a front-matter key outside
  the minimal envelope (domain fields belong in the canonical record).
  Be precise about its reach: it inspects **front matter only** (rules
  L1–L3). A hand edit to a page *body* passes this lint untouched.

Know the ordering, because it decides what a hand edit costs you: inside
`npm run build` the sync step runs *before* the parity gate, so a body
edit is silently **overwritten** rather than reported — the build stays
green and the edit is simply gone. Nor does the pre-commit hook catch it:
`data:check-generated:content` is not in its fast subset. It is reported as
an error only when the parity gate runs on an unsynced tree, i.e. `npm run
data:check-generated:content` on its own — that is how to check a
suspicious `content/` diff.

The generated scope is defined by `isSyncedPath`
(`scripts/data/sync-content.mjs`): `dossiers/<slug>/_index.md`,
`dossiers/<slug>/{claims,sources,cases,gaps,relations}/*.md`,
`entities/*.md`. Everything else under `content/` publishes but is **not**
covered by those gates, and there is no pretending otherwise: the root
indexes (`content/dossiers/_index.md`, `content/entities/_index.md`), the
per-dossier aux indexes `dossiers/<slug>/evidence/_index.md` and
`dossiers/<slug>/entities/_index.md` (thin hand-written routing shells —
their data still comes from view models), `content/koncepty/**`,
`content/dokumentace/**`, `content/map/`, `content/data/` and
`content/_index.md`. `content/entities/typ/**` is generated too, but by
`scripts/dossier/build-entity-type-sections.mjs`, outside the staging
parity gate.

**Every published page carries JSON-LD.** `templates/base.html` includes
`templates/partials/jsonld.html` exactly once per page and
`npm run verify:jsonld` (`scripts/dossier/verify-jsonld.mjs`, post-build)
enforces it: every built page emits at least one parsable
`application/ld+json` block — only Zola's alias redirect stubs are exempt.
The same gate owns the shape: a `Claim` node carrying exactly the sources
that claim declares on every claim page, a citation node on every source
page, exactly one `Person` on an entity dossier main page and none on the
aggregate, recomputable citation fingerprints, and no truth-rating markup
(`ClaimReview`, `reviewRating`, …) anywhere. What it does **not** yet
cover: case, gap, relation and entity pages carry page scaffolding only
(`WebPage`/`CollectionPage` + breadcrumbs + nav). Their record-level nodes
(`vomaste:Case`, `vomaste:Gap`, `vomaste:Relation`, entity `Thing`) exist
in the `/data/*.jsonld` exports (`build:jsonld-exports`, guarded by
`verify:export`), not in the page.

One rule, one owner — the validators that guard the dataset (all run by
`npm run data:validate`, the first step of every pipeline mode):

| Layer | Owner |
|---|---|
| Shape (types, required fields, `@id`/ISO formats, closed enums) | `schemas/canonical/*.schema.json` via `scripts/data/validate-shape.mjs` |
| Referential integrity R1–R8 (unique `@id`s, path ↔ `@id` consistency, same-dossier references, graph layer integrity R7, bidirectional claim ↔ source link R8) | `scripts/data/validate-references.mjs` |
| Editorial semantics S1–S10 (single/corroborated source rules, authorization S5/S6, graph subject nodes S7, connectivity S8, entity provenance refs S9, one-publisher-is-one-voice S10) | `scripts/data/validate-semantics.mjs` |
| Claims-table parity T1–T8 (table row ↔ canonical claim, byte-exact) | `scripts/data/validate-registry-table.mjs` |
| JSON-LD expansion (local context only, no network) | `scripts/data/validate-jsonld.mjs` |
| Export shape gate | schema check inside `build:data-exports` (`scripts/dossier/lib/export-schemas.mjs`) |
| content == generated staging | `npm run data:check-generated:content` + `lint:generated-content` |
| JSON-LD on every published page (+ node shape, no truth ratings) | `scripts/dossier/verify-jsonld.mjs` (post-build, `npm run verify:jsonld`) |
| Evidence work plan per dossier (generated, never hand-written) | `scripts/data/report-evidence-plan.mjs` (`npm run report:evidence-plan`) |
| Source catalogue outputs match `data/source-catalog/**` | `npm run verify:source-catalog` (pre-commit only — inside the pipeline it runs right after the generator and could never fail) |

The build has a single orchestration entrypoint,
`scripts/build/pipeline.mjs` (`npm run build` / `dev` / `check`). Graph
depth is **computed** (BFS from subject nodes,
`scripts/data/lib/graph-depth.mjs`), never stored. Contributor loop:

```
$EDITOR data/dossiers/<slug>/…        # edit canonical JSON
npm run data:validate                 # shape + references + semantics + JSON-LD
npm run data:build                    # compile + view models + regenerate content adapters
npm run build                         # full quality gate (same as CI)
```

`npm run data:validate -- --file <path>` validates a single record's shape
for a fast edit loop. `npm run dossier:scaffold` creates a new, valid,
empty canonical package — and refuses any subject without a matching
record in `data/authorizations.toml` (the audited transcription of this
file's append-only log). Step-by-step contributor guide:
`docs/contributing/add-dossier-data.md`; full contract:
`docs/data-contract.md`; decision record:
`docs/adr/json-first-canonical-data-model.md`.

## Dossier framework (general — applies to any current or future dossier)

### Entity dossiers vs. the aggregate view

A dossier's `dossierType` (declared in its canonical `dossier.json`, and
mirrored into the generated `_index.md` adapter for templates that read
it directly) is one of:

- **`entity`** — a real, primary-navigation-worthy dossier about exactly
  one person (`petr-macinka`, `filip-turek`, and every dossier authorized
  since). A newly scaffolded entity dossier owns its canonical records
  directly (`canonicalDossier` = its own slug — see `petr-pavel`). The
  historical Macinka/Turek pair is the special case below: those two
  entity dossiers own no per-record files of their own — every registry
  they show (`…/claims/`, `…/sources/`, `…/cases/`, `…/gaps/`,
  `…/relations/`, `…/entities/`, `…/evidence/`) is a *generated, filtered
  projection* over the canonical dossier's own already-validated records,
  filtered by each record's `subjects` array (see below). This is what
  makes it possible for Petr Macinka and Filip Turek to each have a
  complete, independently-routable dossier without a single claim,
  source, case, gap, or relation ever being physically duplicated.
- **`aggregate`** — a generated intersection/rollup over two or more
  entity dossiers (currently `macinka-turek`, over `petr-macinka` and
  `filip-turek`, declared via its `aggregates` array). It is **not** a
  third person and **not** a third equal dossier:
  `navigationVisible: false` in its `dossier.json`, it never appears as a
  peer of the entity dossiers in the generated navigation, and
  `scripts/dossier/validate-navigation.mjs` fails the build if it ever
  does. It stays routable at its existing URL
  (`/dossiers/macinka-turek/`) for old links/anchors, and its page header
  explicitly says so — see `templates/dossier.html`'s aggregate-notice
  block.

**Where the canonical records actually live.** Zola gives every content
file exactly one URL. The Macinka/Turek claim/source/case/gap/relation
detail pages predate the entity-dossier split and already have real,
bookmarked, cross-referenced URLs under `/dossiers/macinka-turek/…` —
moving those records to a third, "neutral" location would satisfy "the
aggregate owns no records" in the abstract, but would break every
existing canonical URL and anchor, which this framework treats as a hard
backward-compatibility requirement (see "Old URLs" below). So those
canonical records stay physically in the `data/dossiers/macinka-turek/`
package; `petr-macinka` and `filip-turek` (with
`canonicalDossier: "macinka-turek"`) are the dossiers with zero
duplication, not `macinka-turek`. `scripts/dossier/validate-dossier-types.mjs`
enforces the invariant that actually matters given this constraint: such
an entity dossier owns **zero** physical per-record files — every record
it shows must resolve to a real detail page under its `canonicalDossier`.

**Subject tagging.** Every claim, source, case, gap, and relation record
carries a canonical `subjects` array (`["macinka"]`, `["turek"]`, or
both) — an editorial judgment of who the record is actually about, not
something mechanically derivable from the graph alone. It was stamped
once during the T-028 migration (preserving the earlier
`tag-subjects.mjs` classifications) and is edited directly in the JSON
record since. Global entities (`data/dossiers/_shared/entities/*.json`)
instead carry a `dossiers` array with the dossier slug(s) they belong to.
Timeline entries (the `timeline` content block in `dossier.json`) carry
the same `subjects` field directly.

### Routing: one namespace per dossier

Every dossier is routed at `/dossiers/<dossier-slug>/...` via its
generated content adapters under `content/dossiers/<dossier-slug>/`.
`content/dossiers/_index.md` is the hand-written registry-of-dossiers
landing page (`/dossiers/`) — it lists every authorized dossier from the
compiled dataset, splitting entity dossiers (primary cards) and aggregate
views (their own, clearly-labeled section) by `dossierType`. Which
dossiers exist is decided in exactly one place: the canonical packages
under `data/dossiers/` (a `dossier.json` *is* the registration).

No template hardcodes a dossier slug. Every dossier-scoped template reads
its own dossier root from the adapter's front matter
(`page.extra.dossier` on a detail page, `section.extra.dossier` on a
registry index) and builds sibling paths from it, e.g.
`get_url(path="@/dossiers/" ~ dossier_slug ~ "/sources/_index.md")`. The
primary navigation is likewise **generated, not hand-curated**:
`data/navigation.toml` is a dossier-free skeleton (top-level items, the
per-dossier registry template, icons) and
`scripts/dossier/build-navigation.mjs` compiles it together with the
compiled canonical dataset and the registry sections that actually exist
on disk into `data/generated/navigation.json`, which is what
`templates/base.html` renders. Consequences, enforced by
`scripts/dossier/validate-navigation.mjs` (and cross-checked by
`validate-dossier-types.mjs`):

- **No person is ever a top-level sidebar item.** Every dossier hangs
  under "Dossiery" as its own subtree; entity dossiers get an expandable
  tree of their registries, an aggregate view stays a single, clearly
  labelled link with no subtree of its own.
- The skeleton must stay dossier-free — a slug hand-written into
  `data/navigation.toml` fails the build.
- A third authorized *person* needs **no** navigation edit at all:
  creating the canonical package (`npm run dossier:scaffold`) puts it in
  the tree once its adapters are generated. Same for adding or removing
  one of its registries.
- Every generated node must have a label, an icon and a route that
  exists on disk.

The same generated tree feeds the `SiteNavigationElement` JSON-LD nodes
in `templates/partials/jsonld.html`, so structured data and sidebar can
never drift apart.

Everything dossier-specific lives inside the dossier's canonical package
`data/dossiers/<slug>/` — nothing dossier-specific sits at a flat
top-level path. The curated graph layer is the `graph` field of
`dossier.json`, the update history is the `updates/` registry, and the
record counts shown on tiles are computed from the compiled model (view
models), never hand-written and never stored in a separate stats file.

### Data model: four linked registries, each independently routable

Every dossier is built on four cross-referenced registries. Each registry
is a directory of canonical records (`data/dossiers/<slug>/<registry>/`)
and gets an index page plus **one real Zola page per record** — not just
a row in a table (both generated adapters). The overview table on the
main dossier page and the canonical claim records are two views of the
*same* data: the table (markdown in `dossier.json`'s `contentBlocks`) is
authored by hand — it's what an editor actually edits alongside the
records — and `scripts/data/validate-registry-table.mjs` (rules T1–T8,
part of `npm run data:validate`) fails the build if table and canonical
records ever disagree — see "One canonical source" below.

- **Claims registry (`CLM-##`)** — `…/claims/clm-NN.json`, one canonical
  record per claim, plus the overview row on the main dossier page
  (anchor `<a id="clm-NN"></a>`, itself a link to the claim's detail
  page). Record fields: `identifier`, `status`, `statusLabel`, `text`
  (must be byte-identical to the overview row's claim text), `sources`
  (`@id` refs to the `SRC-##` it cites), `subjects`. Statuses:
  - `status-corroborated` ("CORROBORATED") — independently confirmed by
    multiple outlets. Rule S2 (`validate-semantics.mjs`) enforces at least
    one **independent pair** among the cited sources: two sources that
    differ in source family *and* in publisher (rule S10 compares both
    `outlet` and the registered domain of `url`). Two reprints of one
    agency wire — or two pieces from the same newsroom — are one voice.
  - `status-single` ("1 ZDROJ") — a factual claim whose cited sources do
    not add up to a second independent voice, honestly labeled as such
    instead of being overstated as corroborated. Rule S1 fails when an
    independent pair *does* exist among them. It is **not** "exactly one
    cited source": a claim may legitimately cite three URLs and stay
    `1 ZDROJ` if they are reprints of the same wire or come from one
    publisher. Upgrading to CORROBORATED requires adding a genuinely
    independent source — never just relabeling.
  - `status-quote` ("CITACE") — a direct quote from the subject, presented
    as a quote, not this site's own assessment
  - `status-disputed` ("SPORNÉ") — open, unconfirmed, or contested claim
  - `status-opinion` ("NÁZOR") — authored commentary, kept structurally
    separate from reporting
- **Sources registry (`SRC-##`)** — one canonical record per source under
  `…/sources/src-NN.json`: `outlet`, `sourceType`, `url`, `retrieved`,
  `published`, `claims` (the CLM-## it supports), `sourceFamily` (named
  after the **origin** of the material, not the publisher — a ČTK wire
  reprinted by Blesk belongs to family `ctk`; sources sharing a family are
  one voice, not independent corroboration) and a mandatory editorial
  markdown body (rule T7, ≥ 150 chars). The field is optional and never
  sufficient on its own: rule S10 collapses two sources with the same
  `outlet` or the same registered domain into one voice whatever their
  family says, so a family can only ever *remove* independence, never add
  it. `claims` must agree with the claims' own `sources` in both
  directions (rule R8). A source may additionally carry a locally-hosted
  copy of its primary document (`localDocument` field, or a markdown
  link to `/documents/<slug>/…`) — only after an individual personal-data
  review, never as a bulk harvest; the file must exist under `static/`
  (enforced in `validateCanonicalDataset`, step 3c). Full mechanism and
  policy pointers: `docs/data-contract.md`, "Lokálně hostované
  dokumenty".
- **Cases registry (`CASE-##`)** — one canonical record per tracked case
  under `…/cases/case-NN.json` (`anchor`, `period`, `title`, `status`,
  `label`, `summary`, `subjects`). Detail pages deliberately do **not**
  duplicate the full narrative — they link back to the canonical prose
  section by anchor, so the most sensitive case text (e.g. the
  domestic-violence case) only ever exists in one editable place
  (a markdown content block of `dossier.json`).
- **Gaps registry (`GAP-##`)** — one canonical record per open question
  under `…/gaps/gap-NN.json`: `priority` (`vysoká`/`nízká`), `checked`
  (last-verified date), `claims`. Being listed as open is not a finding
  either way — it means the cited sources don't yet support a conclusion.

Registries are bidirectionally linked (CLM ↔ SRC, GAP → CLM, SRC → CLM),
and the four summary metric tiles on the main dossier page and landing
page are real `<a>` links to each registry index — never a bare count.

#### Full-page doktrína (závazná, včetně forků)

Každé tvrzení a každý zdroj je **plnohodnotná stránka**, nikdy stub:
stránka tvrzení zobrazuje plné texty a metadata citovaných zdrojů,
kontext kauzy se souvisejícími tvrzeními, grafové vztahy o ně opřené,
subjekty a Git provenance; stránka zdroje zobrazuje plná znění
podporovaných tvrzení se stavy, metadata, vydavatelské sourozence a Git
provenance. To vše **renderují šablony z existujících strukturovaných
dat** — full-page nikdy neznamená druhou ručně psanou kopii (pravidlo
dvou reprezentací platí dál). Ručně psaná je u zdroje pouze povinná
redakční poznámka v těle stránky (co dokládá, nezávislost, limity).
Vynucení: `validate-registry-table.mjs` T7 (povinná redakční poznámka
zdroje, min. 150 znaků, v `npm run data:validate`),
`verify-full-pages.mjs` (sekce v hotovém HTML) a
`verify-jsonld.mjs` (Claim uzel na každé stránce tvrzení, citační uzel
na každé stránce zdroje) — vše součást `npm run build`. Adoptér, který
tyto kontroly vypne, se nemůže hlásit k tomuto datovému modelu.

#### One canonical source (the two-representations rule, post-T-028)

The claims table on the main dossier page stays hand-authored — it lives
as a markdown content block in the dossier's canonical `dossier.json`,
and it is what an editor actually edits together with the canonical
claim records. Those are deliberately two representations of the same
facts, and `scripts/data/validate-registry-table.mjs` (T1–T8, part of
`npm run data:validate` and therefore of every build/dev/check run) fails
the build if a table row's text, status, label or source list differs at
all from its canonical claim record, or if the sets don't match 1:1 in
both directions.

Everything else that used to be a second hand-maintained copy is now
**generated from the canonical records**, so drift with it is impossible
by construction: the per-record detail pages, registry indexes, case
cards, timeline rendering, tile counts, navigation, exports and JSON-LD
all come from one compiled model. There are no `migrate-*-to-pages.mjs`
regeneration scripts anymore — after editing canonical JSON, run
`npm run data:build` to regenerate view models and content adapters, and
never edit a generated file by hand. Do not expect a gate to stop you:
`lint:generated-content` only inspects front matter, and inside `npm run
build` the sync step overwrites a body edit before the parity gate ever
sees it (see "Canonical data model: JSON-first" above).

Every anchor/link is additionally enforced by two build-time checks:

- `scripts/data/validate-registry-table.mjs` — every CLM row has a real
  `<a id="clm-##">` anchor and a link to its detail page (T1); internal
  body links to sources/gaps resolve to existing records (T6); duplicate
  or missing IDs fail (T2).
- `scripts/dossier/verify-anchors.mjs` — runs after `zola build`; checks
  that every anchor and every case/timeline reference actually resolves
  to a real `id` in the built HTML (Zola's own link checker doesn't
  validate hand-written `id="..."` attributes).

Both run as part of `npm run build` (the exact sequence CI runs too).
Never wave past a failure here — a broken anchor or an unsourced claim is
a real defect, not lint noise.

#### Old URLs

The dossier used to live at `/dossier/...` (singular, no slug). Aliases
are canonical data: a dossier's `aliases` array in `dossier.json` and an
entity's `routeAliases` are emitted into the generated content adapters
as Zola `aliases`, so old links and bookmarks redirect rather than 404
(this also covers the old per-record `/dossiers/macinka-turek/…` URLs
that moved during the entity-dossier split). Zola's generated alias page
reads `window.location.hash` and appends it to the redirect target, so
old `#clm-NN`-style fragment links still land on the exact anchor after
the redirect, not just at the top of the page.

### Templates

Templates are a pure presentation layer: every dossier-scoped template
reads its data from the record's **view model**
(`load_data("data/" ~ extra.view_model)` → `data/generated/views/**`,
built from the compiled canonical dataset by `npm run data:views`), never
from hand-maintained front matter — the generated content adapters carry
only the routing envelope.

- `templates/index.html` — landing page; loops over every authorized
  dossier under `content/dossiers/` rather than assuming exactly one
- `templates/dossiers-index.html` — `/dossiers/` registry-of-dossiers page
- `templates/dossier.html` — main per-dossier page (claims table,
  relationship graph, timeline)
- `templates/dossier-source.html` / `dossier-sources-index.html` — one
  source page + its index
- `templates/dossier-claim.html` / `dossier-claims-index.html` — one claim
  page + its index
- `templates/dossier-case.html` / `dossier-cases-index.html` — one case
  page + its index
- `templates/dossier-gap.html` / `dossier-gaps-index.html` — one gap page +
  its index
- `templates/dossier-entity.html` / `dossier-entities-index.html`,
  `templates/dossier-relation.html` / `dossier-relations-index.html`,
  `templates/dossier-evidence.html` — per-dossier entity/relation/evidence
  registries, for the canonical (aggregate) dossier only
- `templates/entity-dossier.html` — main page for an ENTITY dossier
  (Petr Macinka, Filip Turek); every section on it is a filtered view over
  the canonical dossier's own already-validated data, never a copy
- `templates/entity-dossier-registry.html` — generic claims/sources/
  cases/gaps registry-index view for an entity dossier, parameterized by
  `section.extra.registry`
- `templates/entity-dossier-relations.html` / `entity-dossier-entities.html`
  / `entity-dossier-evidence.html` — the same filtered-view pattern for an
  entity dossier's relations, entities, and evidence pages
- `templates/concept.html` / `templates/concepts-index.html` — one page per
  concept under `content/koncepty/` (`/koncepty/<slug>/`) plus the grouped
  index. Every tile on the landing page is a link to one of these pages and
  renders from that page's own front matter (`extra.tile_title`,
  `tile_summary`, `bullets`, plus `code` / `badge_*` / `icon` per group), so
  tile and page can't disagree — the same single-source-of-truth rule the
  registries follow. Group order and labels live in
  `data/concept-groups.toml`; `scripts/dossier/validate-concepts.mjs`
  (part of `npm run build`) fails the build on an unknown group, a group
  with no pages, or a concept missing the fields its tile needs.
- `templates/entities-index.html` — globální registr entit (`/entities/`)
  jako průzkumník: hledání, seskupení (typ entity / dossier / role /
  abecedně) a rozbalovací skupiny. Řádky renderuje Tera z view modelů
  téhož kanonického datasetu, ze kterého vzniká `/data/entities.json`
  i JSON-LD `@graph`, a
  každý nese `data-jsonld-id` na svůj uzel v exportu — UI a strojová data
  proto nemůžou ukazovat jiný svět. Skupiny nad těmi řádky staví
  `assets/js/modules/entity-explorer.js` (Alpine, přesouvá existující DOM
  uzly, nic nedogeneruje); otevírání menu „Seskupit podle" řídí Flowbite
  dropdown, hodnotu Alpine — jedna komponenta, jeden vlastník na každou
  věc. Bez JavaScriptu zůstává viditelný plný plochý seznam, takže
  stránka funguje i tak. Stav (`?q=`, `?group=`, `?role=`) je v URL, takže
  konkrétní pohled jde poslat odkazem. Lidské názvy typů entit žijí
  v `data/entity-types.toml`; `scripts/dossier/validate-entity-types.mjs`
  (součást `npm run build`) shodí build, když typ použitý v datech nemá
  popisek nebo když popisek nemá v datech odpovídající entitu.
- `templates/base.html` — shared layout; rozloží front matter na `meta_*`
  hodnoty a předá je makrům. Všechna `<meta>` (title, description,
  canonical, Open Graph, Twitter) se deklarují jednou a vydávají jednou —
  do jiných šablon `<meta>` tagy nepatří. Nese taky site-wide patičku
  (licence, „navrhnout opravu"); patičky stránek ty odkazy neopakují.
- `templates/macros/meta.html` — jednotná komponenta pro sociální a SEO
  metadata (`meta::open_graph`, `meta::twitter`, `meta::canonical`).
  Politiku čte z `data/seo.toml`, výsledek vynucuje
  `npm run verify:og` po každém buildu. Viz sekci [Metadata](#metadata).
- `templates/macros/table.html` — jednotná komponenta pro tabulární data
  (`table::advanced_table` / `table::advanced_table_end`; vlastní
  implementace podle vzoru Flowbite „Advanced Tables" nad volným
  Tailwindem/Flowbite). Každá `<table>` v šablonách jde přes ni — vynucuje
  `npm run lint:component-reuse`; obal nese `data-record-type` provazující
  řádky tabulky s JSON-LD uzly, které stránka už vydává. Data tabulek
  pocházejí z téhož compiled kanonického modelu jako JSON-LD `@graph`;
  DuckDB (`.mjs`) pipeline jako budoucí zdroj je pouze plán,
  neimplementováno (konstituce §8).
- `data/navigation.toml` — data-driven navigation, rendered by `base.html`
  as a Flowbite application shell (fixed navbar + a sidebar that's a real
  Flowbite Drawer, docked on desktop and off-canvas on mobile).
- `assets/js/modules/` — one file per feature. Alpine.js is a permitted
  targeted dependency here, used the same way as Chart.js/Sigma.js:
  for genuinely interactive UI (filter toolbars, the relationship graph's
  chips/detail panel), not as a site-wide framework.

### Editorial rules (binding for any dossier, present or future)

1. Every factual claim must cite a named, reputable, independent, dated
   source with a direct URL. If it can't be sourced, cut it.
2. Direct quotes are marked and attributed as quotes — never restated or
   softened/sharpened in a way that reads as this site's own assessment.
3. Procedural outcomes (case dropped, statute of limitations, non-final
   ruling) are distinguished from a substantive finding of guilt/truth
   **every time they're mentioned**, not once in a footnote.
4. Opinion/commentary is labeled as opinion and kept structurally separate
   from the factual claims table.
5. Unnamed third parties (e.g. an accuser not named in the cited
   reporting) stay unnamed here, always.
6. Gaps in coverage are stated explicitly (a "what this overview did not
   examine" section) rather than implied to be exhaustive.
7. The site does not adjudicate guilt or innocence, and does not treat one
   side's claim as fact merely because it's louder or more convenient to
   report.
8. No speculation or hedged guessing where sources are silent — that
   belongs in the gaps registry, not the claims registry.

### Where to search: the source catalogue

Editorial rule 1 says every claim cites a named source. The catalogue answers
the question that comes before it — **which source, and what can it actually
carry**.

- Canonical records: `data/source-catalog/*.json`, one per registry, tool or
  aggregator. Each carries `proves`, `doesNotProve`, `traps` and
  `howToSearch` — the part that cannot be derived from data and that someone
  had to learn, usually the hard way.
- Generated from them: `docs/osint/SOURCE_CATALOG.md` (read this in the
  repository), `/zdroje/` on the site (one page per source), and
  `data/generated/source-catalog.json` (the view model both render from, and
  the JSON-LD `Dataset` node each page emits).
- `npm run build:source-catalog` regenerates; `npm run verify:source-catalog`
  fails if the committed output has drifted from the data. The latter is a
  pre-commit check, not a pipeline step — inside the pipeline it runs right
  after the generator and could never fail.

Two live research tools sit next to the catalogue. Neither is part of
`npm run build`, both hit the network, and both write **internal** output
that is never routed:

- `npm run sources:detect-family` — reads the pages of sources with an empty
  `sourceFamily` and proposes an origin from the literal credit (machine
  metadata, byline, `Zdroj:` footer). Output is a *proposal*
  (`reports/source-family-proposals.md`); writing back is a separate
  `--apply` step, only for the `ctk` verdict and only into an empty field.
  It proves the origin credit on the page — never that two texts are
  identical, never completeness.
- `npm run screening:public-money -- --ico=…` — published contracts for a
  company from the contracts register (ISRS) open data. It proves that
  published contracts exist with a counterparty, date and value; it proves
  no wrongdoing, no completeness, and it is not an authorization decision.

Two rules follow from it and bind any research pass:

1. **The doclad is always the primary registry.** An aggregator is a
   signpost — it shows where to look, and then you cite what it points at.
   A claim sourced only to an aggregator stays at `1 ZDROJ`.
2. **A source that cannot answer must be refused, not approximated.** Some
   services return data for questions they do not actually support — the VVZ
   search endpoint silently ignores filters it cannot apply and hands back an
   unfiltered page. Presenting that as a finding is worse than saying the
   question cannot be answered from this source.

The "what the dataset actually cites" table is computed from
`data/dossiers/**/sources/**` at every build, never hand-maintained, so it
cannot claim coverage the data does not have. A row without a catalogue entry
is not an error: it is the honest statement that a source is in use and its
limits are not written down yet.

## Povinná archivace úředních podkladů

<!-- DOCUMENT_ARCHIVE_DOCTRINE_V1 -->

Archivace ARES, veřejného rejstříku / Sbírky listin a soudních úředních
desek je součást datového kontraktu, ne volitelný krok rešerše. Platí pro
každý současný i budoucí dossier a každou navázanou entitu:

1. Každá česká právnická osoba podporovaného typu s bezpečně ověřeným
   osmimístným IČO musí mít v **Zone A** jeden hashovaný základní snapshot
   ARES a jeden sanitizovaný index Sbírky listin. Přidání nebo změna takové
   entity bez obou záznamů shodí `npm run archive:check`. Entita bez
   důvěryhodného IČO zůstává ve veřejném seznamu `entitiesWithoutIco`; IČO
   se nikdy nedoplňuje odhadem ani podle pouhé shody jména.
2. Každá strojově rozpoznaná spisová značka v `data/dossiers/**/*.json`
   musí být v `data/court-docket-inventory.json`. Buď má docket-only dotaz
   na správnou soudní vývěsku, nebo výslovný záznam, že jej obsluhuje jiný
   oficiální systém (např. NALUS či vlastní systém NSS). Jméno osoby, datum
   narození ani jiný osobní identifikátor se při kontrole vývěsky nepoužije.
   Negativní odpověď znamená pouze „v den dotazu nebylo aktivní vyvěšení“,
   nikdy „dokument neexistoval“.
3. **Zone A (veřejný Git a UI `/dokumenty/`)** smí nést jen základní
   obchodní identifikační data ARES, sanitizovaný index listin bez adres
   fyzických osob, původních názvů souborů a interních document ID, prázdné
   docket-only odpovědi vývěsek a jednotlivě revidované bezpečné úřední
   dokumenty. Každý publikovaný soubor má původní URL, datum pořízení a
   SHA-256; `data/document-archive.json` a UI jsou generovány z týchž
   zdrojových manifestů.
4. **Zone B (nikdy Git, issue, PR, artifact ani veřejný web)** obsahuje raw
   Justice metadata, originální listiny a neprázdné odpovědi soudních
   vývěsek. Výchozí kořen je `~/dev/vomaste-archive`, přenositelně jej určuje
   `VOMASTE_JUSTICE_ARCHIVE_ROOT`. Soubory se stahují přes `.part`, po
   kontrole typu/velikosti se atomicky přejmenují, každý manifest nese
   SHA-256 a `inventory.sha256` pokrývá všechny fyzické soubory. Přerušení,
   nedostatek místa a neúplné pokrytí se hlásí výslovně — nesmějí se
   přepsat na „hotovo“.
5. Originální listina ze Zone B se do Zone A povyšuje jen po individuální
   obsahové a osobněprávní kontrole. Musí mít redakční důvod, provenienci,
   `reviewNote` a podle potřeby bezpečný derivát. Hromadné publikování PDF,
   raw JSON nebo původních názvů souborů je zakázané i tehdy, když je
   zdrojový registr veřejný.

Vynucení má tři oddělené režimy. `npm run archive:check` je čistě offline,
nic nezapisuje a běží automaticky v pre-commit hooku i ve všech režimech
pipeline (`build`, `dev`, `check`). Ověřuje úplné IČO pokrytí, sanitizaci,
hash parity, docket inventuru, nepřítomnost Zone B v Gitu a zapojení této
doktríny do `AGENTS.md`, `README.md`, `CLAUDE.md` i automatického workflow.
`npm run archive:refresh-public` je síťový zápis Zone A; spouští se ručně a
týdně přes `.github/workflows/archive-refresh.yml`, který smí pouze vytvořit
review PR — nikdy pushnout `master` ani nahrát Zone B. `npm run
archive:refresh-private` patří jen na důvěryhodný stroj s perzistentním
úložištěm; stáhne všechny indexované listiny, obnoví úplný checksum manifest
a selže, pokud plné pokrytí chybí. Deterministický build sám na síť ani do
soukromého archivu nesahá.

## Standing scope authorization and publication gates

As of **2026-08-05** (`AUTH-2026-08-05-PLATFORM-SCOPE`, see the log
below), the site owner has replaced the per-subject, per-topic
authorization procedure that governed every entry above with a standing
scope authorization for public-interest research and publication. The
authorization entries above remain permanent historical records of what
was approved under the earlier governance model — they are not edited or
removed — but a new subject or topic occurring on or after this date no
longer needs its own separate dated owner approval before research or
dossier scaffolding may begin.

The standing scope covers:

- public officials and politically exposed persons acting in or connected
  to their public role;
- candidates for public office and senior officials whose decisions,
  appointments, public funding, regulatory authority or institutional
  responsibilities create a demonstrable public-interest basis;
- companies, foundations, associations, political parties, public bodies
  and other legal entities materially connected to public money, public
  procurement, public power, regulated activity or an already covered
  public-interest case;
- other persons or organizations only where reputable public reporting,
  an official record or a primary public document establishes a concrete
  and proportionate public-interest reason for including them.

This wider scope changes **who may be researched**; it does not lower
**what may be published**. Every one of the editorial rules elsewhere in
this file — sourcing, quote handling, procedural-vs-substantive framing,
unnamed third parties, gap-not-speculation — applies exactly as before,
in full, to every subject covered by the standing scope.

### Mandatory publication gates

A record may enter the public canonical dataset only when all applicable
conditions below are met:

1. **Named evidence.** A factual claim has a directly identifiable,
   retrievable source or a directly referenceable public registry/official
   document, actually opened and read. Search snippets, internal notes and
   model output are not sources.
2. **Provenance.** The repository records where the information came from,
   when it was retrieved, which transformation produced it and which
   canonical record it supports.
3. **Faithful status.** Quotes remain quotes; allegations remain attributed
   allegations; disputed matters remain visibly disputed; procedural
   outcomes are never rewritten as substantive findings.
4. **No guilt by graph.** A relation, common employer, common address,
   company link, event attendance or co-occurrence does not by itself
   establish influence, coordination, responsibility or wrongdoing.
5. **Source-family independence.** Syndicated or commonly owned outlets do
   not count as independent corroboration merely because they have
   different URLs (rule S2).
6. **Data minimization.** Home addresses, personal contact details,
   unnecessary dates of birth, private family details, source-identifying
   information and other disproportionate personal data are not published.
7. **Third-party proportionality.** A third party named by a source may be
   represented as context where necessary to understand the public-interest
   matter, but is not automatically promoted into a dossier subject and is
   not described beyond what the evidence and public-interest basis justify.
8. **Reviewable change.** Every canonical promotion is a reviewable diff.
   Batch review is allowed; silent direct publication from a discovery run
   is not.
9. **Deterministic public build.** The public site must build from
   repository data without requiring an external research platform, private
   database, credentials or live network access.

### Review model

The former per-subject authorization gate is replaced by a run-level or
batch-level review gate: a human reviewer may approve a coherent batch of
candidate records after inspecting its diff, provided each promoted record
still individually satisfies the nine gates above. Automation may discover,
normalize, deduplicate, create gaps and prepare candidate records without a
per-entity approval round. Automation may not silently merge candidates
into canonical public data, commit, push or deploy them.

### Implementation status — mechanical gate not yet rewritten

This section changes editorial **policy**. It does not, by itself, change
the mechanical enforcement in `scripts/dossier/validate-authorization.mjs`
or `npm run dossier:scaffold`, which as of this writing still hard-require
a matching per-dossier record in `data/authorizations.toml` cross-checked
against a specific `agents_md_section` in the log below (see that script's
own header comment for the exact invariants it enforces). Per this repo's
own constitution §8, a policy nothing enforces doesn't count as
implemented — so until that validator is rewritten to recognize the
standing-scope entry as sufficient authorization on its own, **a new
dossier still needs a corresponding record in `data/authorizations.toml`
for the build to pass**, even though it no longer needs a separate,
individually negotiated owner conversation to justify one. Writing that
record for a standing-scope subject is a mechanical/audit step, not a new
approval ceremony. Rewriting the validator itself is tracked as follow-up
work, not done as part of this entry.

### Prismatic Platform as an upstream capability provider

`~/dev/prismatic-platform` is authorized as a local upstream research and
enrichment engine for this repository, for discovery, public-register
lookup, source discovery, extraction, normalization, identity resolution,
relationship discovery, timeline construction, provenance capture,
deduplication and gap analysis across all subjects within the standing
scope. It is never a citable public source: its internal database, agent
output, confidence value, embedding similarity, heuristic score or
inference may generate a candidate or point to evidence, but may not be
published as a factual finding unless the canonical record cites the
underlying public evidence. A direct public-registry record transported by
Prismatic may be cited as that registry record; the citation is to the
registry, not to Prismatic.

The public Zola build must never depend on Prismatic being present — see
`docs/adr/prismatic-platform-integration.md` for the full integration
architecture (data zones, export contract, review flow) and its current
implementation status.

### Context entities are not coverage (2026-07-30)

"Cover no one by default" governs **dossiers and claims**, not the entity
registry. A context entity — `publication_role = "context"`,
`dossier_enabled = false`, `dossier_status = "not_authorized"`,
`dossiers = []`, carrying no claim — records only that a relation exists
in a public register or in reporting this site already cites. Creating one
needs no authorization and no case-by-case approval; it is generated
automatically by `scripts/dossier/build-government-roster.mjs` (public
office) and `scripts/osint/expand-entity.mjs` (ARES registry
neighbourhood).

The line this preserves is the one that matters: **a claim about a person,
or a dossier on them, still needs an explicit dated authorization from the
site owner**. It may be typed directly or recorded verbatim by an agent from
the owner's explicit current-conversation decision. `validate-authorization.mjs`
enforces the split — it accepts context entities freely and fails the build if one acquires
`dossier_enabled` or `dossier_status = "authorized"` without a matching
record in `data/authorizations.toml`.

Two constraints ride along, both enforced in code rather than by
convention: dates of birth and residential addresses are never copied out
of a registry, and an existing entity page is never overwritten by a
generator — a slug collision with a namesake is reported for human review,
never resolved automatically.

**Process for the next authorization**: when the site owner authorizes a
new subject or scope extension on the record, use
`scripts/dossier/authorize-entity.mjs` to append a new dated subsection to
the "Content about real parties" log below — do not edit or remove prior
entries. A human may confirm interactively; an agent may use conversation
mode whenever the owner's current message clearly requests work on a named
subject. The agent drafts the concrete scope from that instruction and the
sources it opens; it does not pause for a second authorization ceremony.
Each entry is a permanent, auditable record of what was actually approved
and when. Non-interactive anchoring accepts only newly
appended entries; modifying or removing an existing entry still requires
direct human review and the stronger override confirmation.

## Content about real parties

The default is self-only unless explicitly extended. It has been
extended. The subsections below are an append-only, chronological
authorization log — do not edit or delete existing entries; add new ones
as new dated subsections at the end.

### Authorized subject: Petr Macinka and Filip Turek (on the record)

Authorized by the site owner (korczis@gmail.com), **explicitly and on the
record, 2026-07-21**: `/dossier/` (source `content/dossier/_index.md`) may carry a
neutral, source-cited overview of the public political controversy
surrounding **Petr Macinka** (chairman of Motoristé sobě, member of
government) and **Filip Turek** (MP, at the time government commissioner for
the Green Deal), specifically the traffic accident involving Turek's car and
an ambulance, the political fallout, and Macinka's public defense of Turek.
Both subjects are public officials acting in their public capacity; the
dossier covers only reporting already published by mainstream Czech media
(ČT24, Blesk, Echo24, Info.cz, ČeskéNoviny.cz, iRozhlas.cz, HlídacíPes.org,
Život v Česku) and cites each claim to its source.

Rules for this dossier:

- Every factual claim must cite a named, reputable, independent public
  source with a direct URL. If a claim cannot be sourced, cut it.
- Direct quotes are marked as quotes and attributed; they are not endorsed
  or restated as this site's own assessment.
- Opinion/commentary pieces (e.g. the HlídacíPes column) are labeled as
  opinion, not fact, and kept visually/structurally separate from the
  factual timeline.
- The outcome of the police investigation into the accident was not
  determined at time of writing. The dossier does not assert guilt or
  wrongdoing — it reports what has been publicly reported, including the
  fact that the matter is unresolved.
- `updated` / `reviewed_at` in `content/dossier/_index.md` front matter should only
  be bumped when the page has actually been re-checked against current
  reporting — this is an active, developing story.

### Scope extension, 2026-07-21: broader political profile

Authorized by the site owner, on the record, in the same session: the
dossier may also cover Turek's and Macinka's public political careers
(electoral history, party role) and two earlier, separately-reported public
controversies — the 2024 photograph/candlestick-collection controversy, and
the October 2025 Deník N investigation alleging deleted, racist/homophobic
Facebook posts attributed to Turek. The same sourcing rules below apply.
The October 2025 posts controversy is treated strictly as a **reported,
disputed allegation**, not a proven fact: authenticity is contested, Turek
denies authorship of the most serious posts, and this must stay visible in
the text rather than be resolved one way or the other by this site.

This authorization does **not** extend to any further named subject beyond
Macinka and Turek in the scope of these specific, cited controversies,
without a new, separate, on-record owner decision.

### Scope extension, 2026-07-22: additional controversies

Authorized by the site owner, on the record, 2026-07-22, after the owner was
explicitly asked and confirmed each item: the dossier may also cover, for
Turek specifically —

- the criminal complaint (rape / years of domestic violence, threats with a
  firearm) filed by a former partner, its 2026-05 closure by police on
  statute-of-limitations grounds, and Turek's denial;
- the 2017 incident in which Turek left a gallows drawing and a rifle
  cartridge on a Saudi embassy employee's car, and its resolution as a minor
  administrative offense;
- the 2026 fines for two unauthorized structures ("černé stavby") on his
  property in Prague-Dubeč;
- his company Zapper Club and its marketing of medically unproven devices,
  and the Ministry of Health's public warning against them;
- the disproportion between his self-presented racing career and the
  documented record of starts/results (sparsely attended events, several
  solo or single-opponent races);
- brief mention of criticism over meetings with diplomats from
  authoritarian-labelled states, sourced to the same roundup piece.

Every item above keeps the same sourcing discipline as the rest of this
dossier — named source, status label, fact separated from allegation. The
rape/domestic-violence item is the most legally and reputationally
consequential thing on this site and must be handled with the most care of
anything here:

- Never state or imply guilt. The statute-of-limitations closure is a
  **procedural** outcome — it made prosecution legally impossible due to
  time elapsed, and explicitly is **not** a finding on whether the
  allegations are true or false. Both facts must appear together, every
  time this is mentioned, not just once in a footnote.
- Never minimize or editorialize the accuser's allegations either — report
  what she alleged and what the record shows, without a thumb on the scale
  in either direction.
- Turek's denial is quoted, not summarized in a way that reads as more or
  less serious than what he actually said.
- If the accuser is unnamed in the source reporting, she stays unnamed here.

This extension does **not** authorize adding the accuser as a named subject,
nor any further named third party (e.g. the Saudi embassy employee) beyond
what the cited reporting itself already discloses. It does not authorize any
topic beyond the six items listed above without a further, separate,
on-record decision.

### Structural change, 2026-07-29: entity dossiers plus a generated aggregate

Authorized by the site owner, explicitly and on the record, 2026-07-29: the
single dossier at `/dossiers/macinka-turek/` is restructured into two
entity-scoped dossiers, `/dossiers/petr-macinka/` and
`/dossiers/filip-turek/`, with `/dossiers/macinka-turek/` kept as a
generated, clearly-labeled aggregate view (not a third dossier, no
canonical content of its own).

This is a **structural** change, not a scope change: it does not authorize
any subject, topic, or controversy beyond what the three authorization
entries above already cover. Every claim, source, case, gap, and relation
in the two entity dossiers must be one of the already-authorized records
above, tagged by which of the two subjects it concerns — never new
content, never a new topic, never a new named third party. If the entity
dossiers and the aggregate view ever show different facts for the same
claim, that is a bug, not a feature; the underlying record is still
exactly one canonical record per AGENTS.md's existing single-source-of-
truth rule.

## Open Intelligence Commons — konstituční invarianty (závazné)

Přijato 2026-07-29 na pokyn vlastníka webu. Plné znění:
`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`. Řídí *platformu*;
nikdy nerozšiřuje rozsah pokrytí konkrétních osob v append-only logu
výše — v otázkách rozsahu vždy vítězí log. Nepodkročitelné jádro pro
každého agenta:

1. Vše veřejné je datově řízené a trackované v Gitu; veřejná data se
   nikdy nemění potichu a narativ se nikdy nestává paralelním úložištěm
   pravdy.
2. Každé podstatné tvrzení zůstává inspektovatelné od začátku do konce
   (výrok, stav, zdroje, data, reakce, historie) a stavy nejistoty
   (tvrzené/sporné/neověřené/procesní/…) se nikdy neslévají do
   generických „faktů".
3. Forkovatelnost je vlastnost: žádný hardcodovaný branding instance,
   privátní infrastruktura, skrytá API ani nezdokumentované build
   know-how v core toolingu.
4. Bezpečnost má přednost před pohodlím. **Materiál zóny B
   (nepublikované podněty, citlivé důkazy, metadata identifikující
   zdroj) nesmí nikdy vstoupit do tohoto veřejného repozitáře ani jeho
   historie** — žádné výjimky, žádné „dočasně". Git nezapomíná.
5. Nikdy nenaznačuj, že veřejný kanál je důvěrný; nikdy nestav falešný
   „bezpečný" intake; nikdy nepoužívej slovník typu „anonymní",
   „nevystopovatelné", „100% bezpečné". Poctivě říkej, co existuje a co
   ne.
6. Výzkumné stopy ≠ otevřené otázky ≠ publikovaná tvrzení; mezi
   úrovněmi se nic nepovyšuje jinak než přezkumem. Žádná trust skóre,
   žádná gamifikace obvinění, žádný doxxing (anti-doxxing výčet v
   konstituci je kategorický).
7. Každý nepříznivý záznam musí projít testem veřejného zájmu (veřejná
   funkce nebo zdroj, přiměřenost, zvážená méně invazivní alternativa).
   „Už to někde na internetu je" není odůvodnění.
8. Politiky musí vynucovat tooling nebo review — politika, kterou nic
   nevynucuje, se nepočítá jako implementovaná, a README/dokumentace
   nikdy neinzeruje schopnosti (bezpečný intake, příspěvkové CLI,
   federace), dokud neexistují.

## Flowbite doktrína (závazná, mandatory pro adoptery)

Přijato 2026-07-30 na pokyn vlastníka. Každá stránka webu — tedy každý
Zola markdown skrze svou šablonu — musí splňovat Flowbite/utility
konvence (vstupní bod: flowbite.com/docs/getting-started/llm/ a jeho
llms.txt), konkrétně: **F1** utility-first, žádné inline `style="…"`
v šablonách (vynucuje `verify-full-pages.mjs` v build gate; výjimka jen
přes odůvodněný allowlist tamtéž); **F2** dark-first barevné tokeny
(base.html + input.css, žádné ad-hoc barvy mimo paletu); **F3** viditelný
focus stav (globální `:focus-visible` v input.css); **F4** responsivita
přes Tailwind breakpointy, širý obsah v `overflow-x-auto`; **F5**
sémantika a ARIA (nav/aria-label, sr-only, role) — přímo, nebo přes
`macros/ui.html`; **F6** interaktivní vzory podle Flowbite komponent
(drawer/navbar data-atributy, žádný vlastní ad-hoc JS shell); **F7**
typografická hierarchie dle Flowbite Typography. Per-article ověření a
plán: `docs/dossier-audit/FLOWBITE_PLAN.md` (regenerovat při přidání
šablony). Nová šablona, která doktrínu porušuje, neprojde buildem —
adoptér, který kontroly vypne, se nemůže hlásit k tomuto UI standardu.

## Metadata

Sociální a SEO metadata jsou **data, ne šablonová logika**:

| Vrstva | Soubor | Co vlastní |
|---|---|---|
| Konfigurace | `data/seo.toml` | locale, výchozí karta a její rozměry, oddělovač a tagline titulku, meze délky, povinná sada značek, mapování `record_type` → `og:type` + výchozí schema.org typ |
| Vykreslení | `templates/macros/meta.html` | `meta::open_graph`, `meta::twitter`, `meta::canonical` + čisté funkce pro titulek, popis, obrázek a jeho alt |
| Vstupy | `templates/base.html` | rozloží front matter stránky/sekce na `meta_*` skaláry a zavolá makra |
| Strojová vrstva | `templates/partials/jsonld.html` | stránkový uzel `@graph[0]` čte **tytéž** `meta_*` proměnné |
| Vynucení | `scripts/build/verify-og.mjs` | po `zola build` ověří výsledek proti `data/seo.toml` |

Pravidla:

- `<meta property="og:*">` ani `<meta name="twitter:*">` se **nepíšou
  ručně** v žádné šabloně — vydává je jedině `macros/meta.html`.
- Rozhodovací logika („jaký `og:type` má stránka tvrzení") patří do
  `data/seo.toml`, ne do `if` v šabloně. Nový `record_type` bez záznamu
  v `[page_types.*]` **shodí build** (a mrtvý záznam bez použití v datech
  taky) — obousměrně, stejně jako `data/entity-types.toml`.
- `og:title`/`og:description` a `name`/`description` stránkového uzlu
  JSON-LD musí být **tatáž hodnota**. Nejsou to dva popisy téže stránky.
- Sociální a SEO klíče nepatří do `config.toml`; ten drží jen to, co
  potřebuje sama Zola (`base_url`, `title`, `description`, `lang`,
  `author`, `keywords`, `index`).

## Multi-instance co-op protocol

Parallel work by multiple Claude Code instances (or people) is
coordinated by the protocol in `docs/coop/PROTOCOL.md`, with the task
board in `docs/coop/TASKS.md` and the helper `scripts/coop/coop.sh`
(message bus: append-only NDJSON under the shared git dir, not
versioned). Binding constraints:

- The protocol is purely **operational**. It never overrides anything
  above — the editorial rules, the authorization log, or the build gate.
  A task touching content about a real person still goes through the
  same scope check and "stop and ask" rule as any other edit.
- One task = one branch (`task/T-###`) = one git worktree
  (`~/dev/vomaste-worktrees/T-###`) = one instance. Only the
  orchestrator (ORCH, main checkout on `master`) edits
  `docs/coop/TASKS.md`, merges, and pushes; workers report over the
  bus, never by editing the board — same single-writer discipline as
  the dossier's single-source-of-truth rule.
- Merge to `master` only with a clean `npm run build` in the worktree
  **and** on `master` after the merge. Pushing `master` is the deploy
  (GitHub Pages CI); deploy continuously after each merged task.
- Since 2026-08-05/06 that push is automatic: `.githooks/post-commit`
  and `.githooks/post-merge` (git fires a different hook pair for merge/
  pull than for commit, so both are needed to cover every path onto
  `master`) share one routine that runs fetch → rebase → the full
  `npm run build` → `git push origin master` after every commit or merge
  made directly on `master`, and reports on the coop bus
  (`type: "deploy"`). It never pushes a red build or a mid-rebase
  state — see `docs/coop/PROTOCOL.md`, "Automatický push po commitu a
  mergi" for the exact conditions and `COOP_NO_AUTOPUSH=1` to opt a
  commit/merge out. Same section also has the resolution recipe for the
  generated-file conflicts (golden test snapshot, discovery log, reports)
  that this
  makes visible sooner when several instances are active on the same
  dossier.

### Structural change, 2026-07-29 (second): full physical decoupling of the entity dossiers

Authorized by the site owner, explicitly and on the record, 2026-07-29
("konečně jednou a provždy decouple macinka–turek, to jsou dva nezávislé
dossiery, data driven, JSON-LD from backend, nic hardcoded"): the
canonical claim/source/case/gap/relation records physically move from
`content/dossiers/macinka-turek/` into the entity dossier that owns them
(`petr-macinka` or `filip-turek`), decided per record by its existing
`subjects` tagging; dual-subject records get exactly one explicit owner
and remain visible in the other dossier only as a generated
cross-reference, never a copy. `/dossiers/macinka-turek/` stays routable
as a clearly-labeled aggregate landing/rollup with **zero** physical
records; every old record URL redirects to the new canonical location
via `aliases` (fragment-preserving), on top of the existing `/dossier/`
aliases. Build scripts, validators, and templates become fully
registry-driven (`data/dossiers.toml`) with no hardcoded dossier slugs,
and JSON-LD structured data is generated at build time from the same
front-matter/data — carrying only already-authorized content, with **no**
truth ratings (`reviewRating` or similar): the site's statuses describe
sourcing, not adjudicated truth, and the structured data must not imply
otherwise.

This is a **structural** change, not a scope change: no new subject,
topic, controversy, or named third party is authorized by it. Claim
texts, statuses, labels, and the procedural-outcome phrasing move
byte-identically; the single-source-of-truth and two-representations
rules continue to apply per entity dossier.

### Rozšíření rozsahu, 2026-07-30: finanční a majetková vrstva

Autorizováno vlastníkem webu, explicitně a on the record, 2026-07-30
(„autorizuji finanční vrstvu, doplň záznam do logu“) — v návaznosti na
nález redakčního auditu z 2026-07-29 (docs/dossier-audit/
OPEN_QUESTIONS.md, bod 12), že tato vrstva nebyla v logu explicitně
vyjmenována. Dossier smí pokrývat, pro oba již autorizované subjekty
(Petr Macinka, Filip Turek), finanční, majetkovou a podnikatelskou
vrstvu v rozsahu, v jakém je již publikována jmenovanými, nezávislými
veřejnými zdroji, konkrétně:

- Macinkův původně nepřiznaný 20% podíl v GMR GAS UA LLC, jeho
  dodatečné přiznání a hrozící pokutu (Investigace.cz, Seznam Zprávy);
- rejstříkové firemní a spolkové vazby obou subjektů (strojově
  agregovaná data Hlídače státu, ověřená proti ARES) — vedené jako fakt
  vazby, nikdy jako implikace pochybení;
- osobní a spolkové dary politickým stranám (vč. Klubu motoristů z.s.);
- povinně zveřejněné dárcovství kampaně PS 2025 (UDHPSH) včetně
  jmenovaných velkých dárců — Boris Šťastný, František Fabičovic,
  Richard Chlad — a u Chlada včetně citovaným zpravodajstvím popsané
  dřívější osobní vazby na Radovana Krejčíře a rozporu mezi oficiálně
  evidovanou a jím veřejně uváděnou částkou podpory;
- nemovitosti Filipa Turka v rozsahu citovaného zpravodajství (pozemek
  v Praze-Dubči, byt na Strahově).

Limity: jmenovaní dárci a další třetí osoby vystupují **výhradně jako
záznam vazby** v rozsahu povinného zveřejnění a citovaného zpravodajství
— nestávají se tím samostatnými subjekty dossieru a žádná jejich vlastní
kauza se bez nové, samostatné autorizace nepřidává. Zmínka Radovana
Krejčíře je pouze charakteristikou převzatou z citovaného zdroje. Platí
stejná zdrojová disciplína jako pro zbytek dossieru (jmenovaný, datovaný
zdroj s URL; stav dle síly důkazu; rozpory zdokumentované, ne zamlčené).

Pro vyloučení pochybností tento záznam zároveň potvrzuje, že vlákno
jmenování ministrem životního prostředí (odmítnutí prezidentem,
zmocněnecká role, ohlášená a nepodaná žaloba, jmenování Igora Červeného)
je součástí již autorizovaného pokrytí veřejné politické kariéry z
2026-07-21 — nejde o nové téma.

### Structural change, 2026-07-30: generated navigation tree, no person at top level

Authorized by the site owner, explicitly and on the record, 2026-07-30
("macinka ani turek nejsou top level v sidebar, musí být generováno
z dat, jsou to stromové cases, dossiers, entities, vše JSON-LD data
driven, tenhle shell je hodně hardcoded"): the primary navigation stops
being a hand-curated list. `data/navigation.toml` is reduced to a
dossier-free skeleton and the sidebar tree is generated at build time
(`scripts/dossier/build-navigation.mjs` →
`data/generated/navigation.json`) from the dossier registry plus the
registry sections that exist on disk. Petr Macinka and Filip Turek are
no longer top-level sidebar items: every dossier hangs under "Dossiery"
as its own subtree, an aggregate view stays a single labelled link
without a subtree, and the same generated tree feeds the
`SiteNavigationElement` JSON-LD.

This reverses the earlier *mechanism* by which entity dossiers were kept
reachable (an ungrouped nav item per dossier, previously enforced by
`validate-navigation.mjs`); the underlying invariant it protected — an
aggregate view must never look like a third person — is unchanged and is
still enforced, now on the generated tree.

This is a **structural** change, not a scope change: it authorizes no new
subject, topic, controversy or named third party, and touches no claim,
source, case, gap or relation.

### Authorized subject: Oto Klempíř (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30,
via conversation confirming Klempíř's public office ("politik, verejne
exponovana osoba... clen vlady, ministr"), then explicit approval of a
research-candidate list ("vse z toho, vse schvalene, o level hloubeji,
detailneji"): a new entity dossier may be created for **Oto Klempíř** —
Czech Minister of Culture since 2025-12 (Andrej Babiš's government),
Member of the Chamber of Deputies for Motoristé sobě since 2025-10 (the
same party as the already-authorized Petr Macinka and Filip Turek).
Public official acting in public capacity; public-interest test
satisfied by his ministerial office.

**Correction made during sourcing, on the record**: an initially
proposed candidate item (a reported street altercation, sourced from a
Reflex.cz URL that read as ordinary reporting in a search snippet) was
dropped after the source was actually opened — it is published in
Reflex's "Divoký kačer" fake-news/satire section, explicitly
self-labeled as fictional. It is excluded from this authorization
entirely and must never be cited as fact. This is recorded here as the
sourcing-discipline process working as intended, not swept aside.

Coverage is limited to the following specific topics, verified by
opening the actual source (not a search snippet) before this entry was
written:

- his appointment as Minister of Culture and entry into politics via
  Motoristé sobě (biographical/political-career fact; vlada.gov.cz,
  psp.cz);
- his public defense of the government's plan to move Czech
  Television/Czech Radio financing under the state budget, and RESPEKT's
  reporting of this as an attempted move toward state control of public
  media (RESPEKT, "Téma" feature, bylined František Trojan / Jan H.
  Vitvar / Kristýna Jelínková / Eva Soukeníková, 2026-07-19; opened and
  read directly, not from a snippet);
- specific reported ministerial actions from the same RESPEKT piece:
  a "campaign against activist culture" reflected in grant decisions;
  support for a construction-law change reported as benefiting
  developers at archaeologists' expense; cancellation of the National
  Gallery Prague director selection process; and the reported public
  reception (booed at a folk festival in his home region, avoided public
  appearances at the Karlovy Vary International Film Festival). Klempíř
  is reported to have declined to comment to RESPEKT — that refusal is
  itself part of the record, stated as such, never as an admission.

Every item above is `1 ZDROJ` (single-source) pending independent
corroboration per this file's existing status rules, since RESPEKT is
currently the only opened, verified source for the ministerial-action
claims — never overstated as `CORROBORATED` without a second, genuinely
independent source.

The owner additionally authorized a deeper research round (financial,
business-registry, and asset disclosures), matching the process already
used for Macinka/Turek — same sourcing discipline applies throughout:
named, dated, independent sources actually opened before citation;
`1 ZDROJ` vs. `CORROBORATED` per the existing validator rules; procedural
outcomes distinguished from substantive findings every time; no
speculation where sources are silent.

This authorization does **not** extend to any further named subject or
third party beyond what the cited reporting itself discloses, and does
not authorize any topic beyond the ones listed above (plus the
authorized deeper financial/registry round) without a further, separate,
on-record decision.

**Implementation note (operational, not a scope limit)**: at the time of
this entry, `data/dossiers.toml` and
`scripts/dossier/lib/dossier-registry.mjs` are under active modification
by the in-progress T-001 migration (`docs/coop/TASKS.md`) — the actual
dossier files and registry entry for Oto Klempíř are created once that
migration lands, to avoid registering a third dossier against a data
model still being rewritten. This authorization stands regardless of
that sequencing.

### Authorized subjects, 2026-07-30: five further members of the government (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30,
naming each subject individually in conversation ("autorizuj …") after
being shown the specific, already-published topic found for each: entity
dossiers may be created for **Alena Schillerová**, **Aleš Juchelka**,
**Lubomír Metnar**, **Ivan Bednárik** and **Boris Šťastný** — all
members of the current government (see `data/government.toml`), public
officials acting in public capacity. `AUTH-2026-07-30-B`.

Coverage is limited, per subject, to the topics below. These were found
by research at search-result level and each cited outlet **must be
opened and read directly before any claim is written from it** — the
authorization defines scope, it does not certify the reporting. This
condition is not boilerplate: an earlier candidate item in the Oto
Klempíř entry above had to be dropped because a URL that read as
ordinary reporting turned out to be a satire/fake-news section once
actually opened.

- **Alena Schillerová** (ministryně financí): the amendment to the
  budget-rules legislation and the criticism that it would permit
  deficits outside parliamentary control ("escape clauses"), and the
  National Budget Council's stated position that the state budget
  proposal conflicts with the fiscal-responsibility law, together with
  her own published defence of both. Outlets found: Hospodářské noviny,
  ČT24, Deník.cz, ČeskéNoviny.cz, Echo24.
- **Aleš Juchelka** (ministr práce a sociálních věcí): the reported
  conflict-of-interest case around a former ministry advisor whose
  private company charged clients for help obtaining grants from a
  programme she oversaw at the ministry; the reported budget shortfall
  the ministry is addressing as a consequence; criminal complaints
  announced by civic organisations; and his own public statements and
  defence, including his reported remarks to a journalist. Outlets
  found: Forum24, Blesk, Seznam Zprávy. **Handle as the most
  consequential item in this entry**: an announced criminal complaint is
  not a charge, a charge is not a conviction, and the procedural stage
  must be stated accurately at every mention. The former advisor and any
  other third party appear **only** as a record of relation, in the
  scope the cited reporting itself discloses — they do not become
  dossier subjects.
- **Lubomír Metnar** (ministr vnitra): the Ministry of the Interior's
  proposal to end the police protection service for the Supreme Audit
  Office (NKÚ), the NKÚ president's public objection to it, and
  Metnar's own stated justification. Outlets found: ČT24, Deník N,
  Blesk, Seznam Zprávy (as originating outlet per the others).
- **Ivan Bednárik** (ministr dopravy): his 2022 resignation as chairman
  and CEO of České dráhy after reported disputes over demanded
  cost-cutting and land payments to Správa železnic, and his published
  positions as minister on railway-market spending. Outlets found:
  iROZHLAS, Ekonomický deník, Novinky.cz, Deník.cz, Hospodářské noviny,
  Zdopravy.cz.
- **Boris Šťastný** (ministr pro sport, prevenci a zdraví): the
  recording device reportedly left in a government meeting room and the
  criticism of it; his proposal to remove the National Sports Agency
  leadership amid reported criticism of grant-distribution transparency;
  and the reported discrepancy in social-media engagement figures on one
  of his posts. Outlets found: CNN Prima News, iROZHLAS, Forum24.
  (Note: Šťastný already appears in the 2026-07-30 financial-layer entry
  above as a **named campaign donor** in the Macinka/Turek dossier; this
  entry authorizes him as a dossier subject in his own right for the
  topics listed here, and does not retroactively widen that earlier
  record-of-relation mention.)

All existing editorial rules apply unchanged and in full: named, dated,
independent sources actually opened before citation; `1 ZDROJ` vs.
`CORROBORATED` per the validator's own source-family rules; procedural
outcomes distinguished from substantive findings at every mention, not
once; direct quotes marked as quotes; no speculation where sources are
silent (that belongs in the gaps registry); no private addresses, health
information, information about minors, or family matters without direct
and serious public relevance.

This authorization covers **only** these five subjects and only the
topics listed above. It does not extend to any other member of the
government (the remaining members exist in this repo solely as
`publication_role = "context"` roster entities — a record of public
office, never dossier coverage), nor to any named third party appearing
in the cited reporting, without a further, separate, on-record decision.

**Implementation note (operational)**: as with the Oto Klempíř entry,
the actual dossier files and `data/dossiers.toml` entries are created
after the in-progress T-001 migration lands — see `docs/coop/TASKS.md`.
This authorization stands regardless of that sequencing.

### Authorized subject: Andrej Babiš (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
("autorizuj nove dossier pro andrej babis"): an entity dossier may be
created for **Andrej Babiš** — Prime Minister of the Czech Republic
(third Babiš government), the most senior office in the executive.
Public-interest test satisfied by that office. `AUTH-2026-07-30-C`.

Coverage limited, per topic, to what these directly-opened sources state:

- **Čapí hnízdo subsidy case**: the Prague High Court's 2025-06-23
  decision annulling the acquittal of Babiš and Nagyová for the second
  time, its binding legal opinion that the established steps meet the
  elements of two offences (subsidy fraud, damage to EU financial
  interests), and the case's return to the Municipal Court (Česká
  justice, 2025-06-23, opened and read directly). **Framing is
  mandatory at every mention, not once**: an annulled acquittal is not a
  conviction; the appellate court itself stated it cannot declare a
  defendant guilty; both defendants deny guilt; nothing in this thread is
  final. The dossier must record a GAP for the case's current procedural
  stage, because the 2026 developments could not be verified from a
  directly-opened source (iROZHLAS returns 403 to automated fetches).
- **Conflict of interest / Agrofert**: the 2026-02 transfer of Agrofert
  shares into the RSVP Trust after regulatory approvals in three EU
  states, his own stated position ("na Agrofert nemám žádný vliv ani z
  něj neprofituji"), the named opposition politicians' published
  rejection of it, and the reported European Commission position that
  the arrangement is not accepted as resolving the matter (ČT24,
  2026-02-20, opened and read directly). His position and his critics'
  positions are both quoted, neither adopted as this site's finding.

### Authorized subject: Tomio Okamura (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
("autorizuj nove dossier pro tomio okamura", "tomio je publicly
exposed"): an entity dossier may be created for **Tomio Okamura** —
President of the Chamber of Deputies and chairman of SPD, a governing
coalition party. He is not a member of the government, so no earlier
authorization in this log covered him; this entry is what authorizes
him, and it is scoped to one verified topic. `AUTH-2026-07-30-D`.

Coverage limited to: the **2026 SPD election-poster criminal case** —
the Prague 1 District Court's 2026-06-03 verdict finding SPD guilty of
inciting hatred and imposing a 3-million-koruna penalty; the content of
the two posters as described in the cited reporting; SPD's and Okamura's
denial and his published criticism of the judge; and the fact that
Okamura is charged individually but **his own prosecution is suspended
because the Chamber of Deputies refused to hand him over**, so his acts
are to be tried separately (Deník.cz, 2026-06-03, opened and read
directly).

Mandatory framing at every mention: the SPD verdict is **not final**
(the court itself said so; SPD announced an appeal), a verdict against
the party is **not** a verdict against Okamura personally, and the
refusal to hand him over is a **parliamentary procedural** outcome — not
a finding that the allegations are true or false. The two Roma boys and
any other person depicted or referenced in the posters are not named and
never will be; they are not subjects and not third parties to be
identified here.

Neither entry authorizes any further named third party beyond what the
cited reporting itself discloses, nor any topic beyond those listed,
without a further separate on-record decision.

### Scope extension, 2026-07-30: Andrej Babiš — full scope of the authorized topics

Authorized by the site owner, explicitly and on the record, 2026-07-30, in
answer to a direct question about how far the Babiš dossier may go ("Čapí
hnízdo v plném rozsahu, Střet zájmů a dotace šířeji, Veřejné funkce a
výroky, nemovitosti ve Francii, setuza, kostelecke uzeniny, vše v grafu"),
followed by "mas absolutni clearance". `AUTH-2026-07-30-E`, extending
`AUTH-2026-07-30-C`.

The dossier for **Andrej Babiš** may cover, in addition to the two topics
already authorized:

- **Čapí hnízdo in full** — the whole documented procedural history,
  including the earlier annulment(s), the co-defendant's position as
  disclosed by the cited reporting, the state of the subsidy itself, and
  developments after 2025-06;
- **conflict of interest and subsidies, broadly** — European Commission
  audits and their published conclusions, suspension and resumption of
  subsidies to Agrofert, the trust arrangements, SynBiol, dividends;
- **public offices and public statements** — political career, government
  posts, and documented public statements (as `CITACE`, verifying that the
  statement was made, never that its content holds);
- **real estate in France**, **Setuza**, and **Kostelecké uzeniny**, in
  each case as reported by named sources;
- **the relationship graph** may carry the entities and edges these topics
  document ("vše v grafu").

"Absolutní clearance" is recorded as what it is: an authorization of
**scope**, not a suspension of method. Everything below still applies
without exception — a claim needs a named, dated, independent source with
a direct URL that was opened and read; a status describes sourcing, never
adjudicated truth; procedural outcomes stay distinguished from findings at
every mention; quotes are verbatim; unnamed third parties stay unnamed; and
what cannot be verified becomes a GAP rather than a hedged sentence. This
entry authorizes no other subject and no topic beyond those listed.
### Authorized subject: Karel Havlíček (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Karel Havlíček** — First
Deputy Prime Minister and Minister of Industry and Trade (ANO).
`AUTH-2026-07-30-M`. Topics found by research at search-result level;
each cited outlet must be opened and read directly before any claim is
written from it.

Coverage limited to: the **toast-bread subsidy case** — reporting that
as minister he knew since at least 2019 of an EU audit deeming a
100-million-crown subsidy to an Agrofert production line unauthorized
and did not pursue recovery (FORUM 24); published criticism of his
**building-law amendment** as rushed (Česká justice; ODS and legal
experts); and his published positions on **EU electromobility targets**
(FORUM 24). Framing: reported inaction is a claim of the cited
reporting, not an adjudicated finding; no proceeding against him
personally is asserted by these sources.

### Authorized subject: Jaromír Zůna (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Jaromír Zůna** — Deputy
Prime Minister and Minister of Defence (SPD). `AUTH-2026-07-30-N`.
Topics found at search-result level; each cited outlet must be opened
and read directly before any claim is written from it.

Coverage limited to: the **21-billion cut from the 2026 defence budget**
and the dispute over meeting NATO's 2 % commitment, including his own
published statements (e15); the **unaired interview with President
Pavel** — the opposition's accusation that the ministry blocked it
(TN.cz) — where "censorship" is the opposition's characterization, never
this site's; the **dispute over the selection of the Chief of the
General Staff**, his refusal to vote for the PM's candidate and
published calls for his resignation (Echo24); and the Prime Minister's
published dissatisfaction with his army concept (Blesk). All of it is
political-conflict reporting: positions attributed to whoever voiced
them, no side's characterization adopted as fact.

### Authorized subject: Jeroným Tejc (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Jeroným Tejc** —
Minister of Justice (nominated by ANO). `AUTH-2026-07-30-O`. Topics
found at search-result level; each cited outlet must be opened and read
directly before any claim is written from it.

Coverage limited to: the **ministry bitcoin case** — his announced
criminal complaint after an internal audit into the acceptance and sale
of donated bitcoins under his predecessor (Echo24, Deník N); his
**disciplinary complaint against the judge in the Viktorka case** and
the related OSPOD referral (Blesk, Česká justice); and his **published
questioning of the Constitutional Court's preliminary measure** in the
president's dispute (Česká justice). Mandatory framing at every
mention: an announced criminal complaint is not a charge and a charge
is not a conviction; the predecessor and any judge appear only as a
record of relation in the scope the cited reporting itself discloses;
the child victim in the Viktorka case is never identified beyond what
the cited reporting states.

### Authorized subject: Zuzana Mrázová (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Zuzana Mrázová** —
Minister for Regional Development (ANO). `AUTH-2026-07-30-P`. Topics
found at search-result level; each cited outlet must be opened and read
directly before any claim is written from it.

Coverage limited to: the **non-final fine for violating the
conflict-of-interest law** — an unreported half-million family loan and
changed explanations of a further 500,000 CZK (Seznam Zprávy as
originating outlet, Deník N, Blesk) — **the fine must be stated as
non-final at every mention**; the **municipal apartment in Bílina** and
the published criticism of it (FORUM 24, ČT24); reported **structures
on her property in conflict with the zoning plan**; and the
opposition's resignation calls plus the justice ministry's referral for
review (ČT24) — a referral is a procedural step, not a finding.

### Authorized subject: Adam Vojtěch (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Adam Vojtěch** —
Minister of Health (ANO). `AUTH-2026-07-30-Q`. Topics found at
search-result level; each cited outlet must be opened and read directly
before any claim is written from it.

Coverage limited to: the **FN Olomouc defibrillator-study case** —
reported manipulation of study documentation, the March 2026 criminal
report, and published criticism of the minister's initial restraint
(Seznam Zprávy) — the criminal report targets the hospital matter, not
the minister personally, and that distinction must be kept explicit;
the **tax-advantaged health-benefits proposal** and the published
conflict-of-interest debate concerning the Prime Minister's clinics
(Reflex, Zdravotnický deník) — commentary labeled as commentary; and
the **coalition SPD's published criticism of his vaccination strategy**
(Echo24).

### Authorized subject: Igor Červený (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Igor Červený** —
Minister of the Environment (Motoristé sobě), already present in this
repository as a context entity in the macinka-turek dossier (his 2026
appointment, CLM-43). `AUTH-2026-07-30-R`. Topics found at
search-result level; each cited outlet must be opened and read directly
before any claim is written from it.

Coverage limited to: the **11.4-million-crown house missing from his
asset declaration** and the potential fine (Blesk) — administrative,
nothing final; the **conflict-of-interest referral** concerning his
role in a podcast company (Blesk); the **3-million-crown office
renovation** and the ministerial office ceded to Filip Turek (Blesk);
and the **ten-day USA trip** with reported refusal to disclose
meetings, delegation and funding (Deník N). Cross-linking to the
existing macinka-turek appointment coverage is in scope; no new topic
about Turek is authorized by this entry.

### Authorized subject: Robert Plaga (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Robert Plaga** —
Minister of Education, Youth and Sports (ANO). `AUTH-2026-07-30-S`.
Topics found at search-result level; each cited outlet must be opened
and read directly before any claim is written from it.

Coverage limited to: the **halted testing of 5th/9th graders** —
technical failures and criticized questions about pupils' personal
lives (Blesk); his **reversal on the school mobile-phone ban** — March
condemnation vs. the July legislative proposal (zdravezpravy.cz); and
the **shortening of the 2025/2026 school year** announced three months
ahead and parents' published reactions (Deník.cz). These are policy
controversies — no allegation of unlawful conduct is made by the cited
reporting and none may be implied.

### Authorized subject: Martin Šebestyán (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(per-subject selection in conversation with the proposed topic scope
shown): an entity dossier may be created for **Martin Šebestyán** —
Minister of Agriculture (nominated by SPD). `AUTH-2026-07-30-T`. Topics
found at search-result level; each cited outlet must be opened and read
directly before any claim is written from it.

Coverage limited to: the reported **slowing/halting of the recovery of
5.1–7 billion CZK in subsidies from the Agrofert group** (HlídacíPes —
attributed commentary, kverulant.org, Deník N, Hospodářské noviny);
published **criticism of his 2013–2022 leadership of SZIF** for paying
subsidies to Agrofert companies amid the then-PM's conflict of interest
(iROZHLAS, HN); and **Transparency International's published warning**
against his nomination. Mandatory framing: no court has found
wrongdoing by him; NGO and commentary assessments are always attributed
to their authors, never adopted as this site's own finding.

### Authorized subject: Tünde Bartha (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30
(owner named the subject and, after an initial framing was withdrawn by
the owner, reaffirmed the subject on the basis that she is a documented,
publicly exposed official): an entity dossier may be created for **Tünde
Bartha** — Head of the Office of the Government of the Czech Republic
(vedoucí Úřadu vlády ČR) since 2025-12-15, previously in the same post
2018-06 to 2021-12, and director of the Minister's Office at the Ministry
of Finance from 2015. `AUTH-2026-07-30-U`. Sources for the topics below
were opened and read directly before this entry was written.

Coverage limited to:

1. **The Prague 3 municipal flat.** On 2026-06-24 the Prague 3 council
   voted to terminate the lease with three months' notice, citing
   "přenechání předmětu nájmu třetím osobám bez předchozího souhlasu
   pronajímatele" (ČTK via Hospodářské noviny, iROZHLAS, Echo24). The
   flat, ~70 m² for ~11 000 CZK/month, was obtained by exchange from a
   Prague 8 municipal flat in 2004; Bartha stated she lives in Průhonice
   in a building belonging to the Prime Minister's company Imoba.
   **Mandatory framing, at every mention:** this is a *municipal
   council's contractual decision*, not a finding of illegality, and no
   unlawful conduct is alleged against her by any cited source. The
   council's **own two legal opinions advised against the termination** —
   the law firm Šenkýř Pánik concluded the existing evidence was
   insufficient to succeed in court, and department head Michal Dobiáš
   wrote that "neexistuje žádný právně relevantní podklad" and warned of
   "vysoké riziko" that a court would find the termination unlawful
   (Echo24). Any record of this topic that omits the adverse legal
   opinions misrepresents the sources and must not be published.

2. **Her documented career path between the Babiš group and the state
   apparatus**, as a sequence of dated employment facts: Ministry of
   Finance (2015) → Office of the Government (2017/2018–2021) → Agrofert
   as business development manager for Eastern Europe, the Balkans and
   the Middle East (HlídacíPes.org 2024-08-14; confirmed by Agrofert
   spokesman Pavel Heřmanský, Aktuálně.cz) → Head of the Office of the
   Government again (2025-12-15). **Mandatory framing:** these are
   employment facts. HlídacíPes.org's assessment that working for
   Agrofert can be considered working for the ANO leader is *attributed
   commentary*, recorded as such, never adopted as this site's own
   finding. No claim that any specific decision was influenced may be
   written from the sequence alone — a career path is not evidence of an
   act.

3. **Her public roles as such**: leading Babiš's 2022–2023 presidential
   campaign, and her security clearance level, where published by named
   outlets.

**Explicitly out of scope**, and not authorized by this entry: any claim
that she acted as an intermediary, conduit or courier for anyone; any
claim of unlawful conduct by her; and any characterization of her
relationship to Jaroslav Faltýnek, for which no cited source has been
found. The relatives who occupied the Prague 3 flat, her daughter, and
her spouse are private individuals and **stay unnamed** even where a
cited outlet named them.

### Authorized subject: Jaroslav Faltýnek (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30,
after the site owner was shown the editorial concern that the Čapí
hnízdo topic concerns a prosecution that ended in 2018 and reaffirmed
coverage on the basis that he is a documented, publicly exposed
politician: an entity dossier may be created for **Jaroslav Faltýnek** —
Member of the Chamber of Deputies since 2013-10, vice-chairman of the
ANO parliamentary club since 2025-10-08, member of the Agriculture
Committee since 2025-11-11, chairman of the ANO parliamentary club
2013–2021, former 1st vice-chairman of the ANO movement.
`AUTH-2026-07-30-V`.

**Correction of record, deliberately preserved here:** Faltýnek has
**never been a member of any government**. "Babiš's right hand" describes
a *party* role (1st vice-chairman of ANO), not a public office. Any
record implying he held a ministerial or cabinet post is false and must
not be written.

Coverage limited to:

1. **The Čapí hnízdo prosecution and its discontinuation.** He was among
   those originally accused in 2015 and the Chamber released him for
   prosecution in 2017; **the prosecution against him was discontinued
   (zastaveno) by the prosecutor in May 2018.** Mandatory framing, at
   every mention and in the record's own summary: the *discontinuation*
   is the fact being reported. He was never convicted and never stood
   trial. A discontinuation is a procedural outcome — it is neither a
   finding of guilt nor a judicial finding of innocence — and the record
   must say so rather than leaving the 2015 accusation as the last thing
   the reader sees.

2. **His court testimony in the Čapí hnízdo trial in support of Andrej
   Babiš**, including the published quotation that the project was below
   Babiš's threshold of attention (Echo24). Recorded at **quote status
   (CITACE)**: what is evidenced is that the statement was made in court,
   never that its content is true.

**Explicitly out of scope**: any claim that he committed a criminal
offence; any claim that he acted as an intermediary or handler for any
person, for which no cited source exists; and any new topic about Andrej
Babiš, who has his own dossier and authorization.

### Authorized subject: Richard Chlad (on the record)

Authorized by the site owner, explicitly and on the record, 2026-07-30:
an entity dossier may be created for **Richard Chlad** — businessman and
documented donor to the political party Motoristé sobě, which is part of
the current government. `AUTH-2026-07-30-W`.

**Basis for the public-interest test (constitution §7):** not his
private life and not who he knows. **Party financing.** Money given to a
party now in government is a public act, recorded in a public register,
and already reported by named outlets — the three sources below were
opened and read on 2026-07-29/30 while building the macinka-turek
dossier, where he is currently a depth-2 context entity (CLM-36, CLM-37;
SRC-41 Hlídač státu, SRC-42 CNN Prima News 2025-10-16, SRC-43
Aktuálně.cz 2026-03-17).

Coverage limited to:

1. **His registered donations to Motoristé sobě** and the **published
   discrepancy** between the officially recorded 638 864 CZK for 2025 and
   his own public statement of support worth "necelé dva miliony" — which
   per CNN Prima News included non-monetary provision (vehicle loans), so
   the two figures do not measure the same thing. That reconciliation
   must be stated wherever the discrepancy is; presenting the gap without
   it would manufacture a contradiction the sources do not support.
2. **The published responses of the party's representatives** — that
   Turek and Macinka publicly denied he played any significant role
   around the party, and that Macinka cited lower figures than Chlad
   himself did.

**Mandatory framing:** donating to a political party is **lawful**. No
cited source alleges unlawful conduct by him, and none may be implied.
The subject of this dossier is the **transparency of party financing**,
not an accusation against a donor.

**Explicitly out of scope**, and not authorized by this entry: his
reported earlier personal association with Radovan Krejčíř as a *topic*
in its own right — it may appear only as it already does in the cited
reporting, as an attributed descriptive detail, never developed into a
line of coverage; his business activities generally; and any new topic
about Petr Macinka or Filip Turek, who have their own dossiers.

### Not authorized: Radovan Krejčíř (on the record)

The site owner proposed **Radovan Krejčíř** as a subject on 2026-07-30.
**No dossier is authorized**, and this entry records the reasoning so the
question is not silently reopened.

He holds **no public function**. His convictions are final and are
therefore publishable facts rather than suspicions, but the
constitution's public-interest test (§7) asks what public office, public
money, or institutional responsibility is at stake — and for a private
convicted individual the answer is none. A dossier about him would be a
true-crime profile, which is a different product from accountability
coverage of public power, and README's "what this is not" rules it out.

He may appear as a **context entity** where named reporting documents a
relationship to an authorized subject — which is how he already appears
in the Chlad material. That is the correct role for him.

If the owner wants him covered as a subject, the only defensible framing
is **institutional**: how state bodies handled his case. That is a
separate, much larger undertaking and would need its own authorization
stating exactly which institutional failures, evidenced by which named
sources — not an extension of this one.

### Authorized subject: Petr Pavel (on the record)

Authorized by the site owner, explicitly and on the record, 2026-08-01,
after review of the candidate report generated by
`scripts/dossier/generate-authorization-candidates.mjs`: an entity
dossier may be created for **Petr Pavel** — prezident České republiky,
hlava státu. `AUTH-2026-08-01-PAVEL`.

Coverage limited to the single already-documented thread this site
already cites, transplanted from its current context-entity appearance
in `macinka-turek`/`filip-turek`: his **January 2026 refusal to appoint
Filip Turek Minister of the Environment**, his stated reasons (repeated
lack of respect for the rule of law, minimizing/glorifying Nazi Germany,
questioning the dignity and equality of women and minority members) —
sourced to Deník.cz (SRC-44) and HN.cz (SRC-45), both already opened and
cited under CLM-38 — and Filip Turek's announced, and ultimately unfiled,
lawsuit threat against him. No new topic beyond this is authorized: this
entry moves an already-sourced thread to its own subject, it does not
open new research into Petr Pavel's presidency.

### Authorized subject: Petr Vencálek (on the record)

Authorized by the site owner, explicitly and on the record, 2026-08-01,
after review of the candidate report: an entity dossier may be created
for **Petr Vencálek** — sole owner (100 % podíl) and jednatel of GMR GAS
s.r.o. (Brno, IČO 28274318) since 2014-12. `AUTH-2026-08-01-VENCALEK`.
Not a public official; the public-interest basis is his role in the
already-authorized Macinka GMR GAS UA LLC undisclosed-stake matter.

Coverage limited to two topics:

1. **His ownership/directorship of GMR GAS s.r.o. and that company's tie
   to GMR GAS UA LLC** (the Kyjev branch in which Petr Macinka held an
   undisclosed 20 % stake) — already documented and sourced under CLM-46,
   CLM-47, CLM-48 (Investigace.cz SRC-17, ARES SRC-55) in the Macinka
   dossier; transplanted here, not newly researched.
2. **Donations to Klub motoristů, z.s.** — authorized as a topic, but
   **no source has been opened or cited for it yet**; per this site's
   standing sourcing discipline, a named, dated, independent source must
   actually be found and opened before any claim under this topic is
   written. If no such source exists, this topic stays an open GAP, not
   a claim.

This authorization does not extend to Vencálek's business activities
generally, nor to any new topic about Petr Macinka, who has his own
dossier and authorization.

### Scope extension, 2026-08-05: James Quick

Authorized by the site owner, explicitly and on the record, 2026-08-05:

Autorizuji Jamese Quicka jako subjekt samostatného dossieru. Rozsah zahrnuje jeho veřejně doložené působení spojené s webem jamesquick.cz, CERD/CERD News, Centrálním registrem dlužníků, Protikorupční linkou, veřejnými politickými a občanskými aktivitami a případnými doloženými kontakty s veřejnými institucemi nebo jednáním vůči novinářům. Agent smí rozsah během rešerše konkretizovat podle přímo otevřených veřejných zdrojů bez dalšího autorizačního kola.

Publikovat lze pouze tvrzení podložená pojmenovaným, datovaným a přímo otevřeným veřejným zdrojem; vlastní weby a autorské profily dokládají jen vlastní výroky nebo sebeprezentaci, nikoli nezávislé potvrzení. Závažná tvrzení o nátlaku, výhrůžkách, protiprávním jednání nebo lobbingu musí být přesně připsána zdroji a nesmějí být přijata jako vlastní závěr webu. Co zdrojově doložit nelze, zůstane rešeršní mezerou, nikoli tvrzením. Soukromé zprávy, neveřejné screenshoty, adresy bydliště, data narození a údaje o soukromých osobách jsou mimo rozsah.

### Scope extension, 2026-08-05: Martin Pavlík

Authorized by the site owner, explicitly and on the record, 2026-08-05:

Samostatný entity dossier pro Martina Pavlíka, jednoznačně vymezeného veřejným rejstříkovým profilem https://www.podnikatel.cz/rejstrik/osoby/martin-pavlik-1902710/ a navázanými záznamy ARES. Rozsah zahrnuje pouze přímo doložené veřejné rejstříkové role a podíly u MEDIA PROJECT CZ s.r.o. (IČO 01529820), Bydlíme v Králově Poli, z.s. (IČO 02922703), HYDROPROGRESS, s.r.o. (IČO 04449461) a Nadačního fondu FIDUCIA (IČO 26228548). Dossier nesmí obsahovat ani odvozovat IT profesní profil, schopnosti, zaměstnání, přibližný věk, datum narození, adresu bydliště ani jiné osoby stejného jména. Každé publikované tvrzení musí být doloženo přímo otevřeným veřejným zdrojem; vlastní či profilové zdroje dokládají jen vlastní sebeprezentaci. Při jakékoli nejasnosti identity se údaj nezveřejní a zůstane jako mezera, nikoli jako domněnka. Samotná rejstříková funkce nebo podíl nesmějí být prezentovány jako podezření či pochybení.

### Governance and scope supersession, 2026-08-05: standing public-interest scope and Prismatic integration

Authorized by the site owner, explicitly and on the record, 2026-08-05:
`AUTH-2026-08-05-PLATFORM-SCOPE`.

The owner decided that the previous requirement for a separate,
name-by-name and topic-by-topic authorization before research or dossier
creation imposed unnecessary operational friction. For work performed on
or after this date, that procedure is superseded by the standing scope
and publication gates recorded in "Standing scope authorization and
publication gates" above.

The repository may research, scaffold, enrich and publish dossiers about
public officials, politically exposed persons, public-interest legal
entities and materially connected context entities without a new
per-subject authorization entry, provided every published record
satisfies the repository's source, provenance, status, proportionality,
privacy and review requirements — the nine mandatory publication gates
above apply without exception.

The owner further authorizes direct local use of
`~/dev/prismatic-platform` as an upstream capability provider for all
existing and future entities and dossiers within that standing scope, for
discovery, registry lookups, extraction, normalization, identity
resolution, relationship discovery, source and provenance capture,
timeline construction, deduplication and gap analysis. This authorization
does not turn Prismatic output into a source, does not authorize
publication of unsupported inference, does not permit private or
disproportionate personal data, and does not permit an automated
discovery run to silently publish, commit, push or deploy canonical
content. Canonical promotion remains evidence-backed, diff-based and
reviewable, with batch-level approval allowed.

All authorization entries preceding this one remain untouched as
permanent historical records. Their subject-specific limits describe the
governance then in force; they do not restrict the standing scope adopted
by this entry for future work.

**Implementation note (operational, not a scope limit)**: as recorded in
"Standing scope authorization and publication gates" above, this entry
changes editorial policy; it does not by itself rewrite
`scripts/dossier/validate-authorization.mjs` or `npm run dossier:scaffold`,
which still mechanically require a per-dossier record in
`data/authorizations.toml`. Until that validator work lands, a concrete
`data/authorizations.toml` record is still the mechanical step that lets
`npm run build` pass for a new dossier — it is no longer gated on a
separate owner negotiation per subject, but it still has to exist. See
`docs/adr/prismatic-platform-integration.md` for the integration
architecture this entry authorizes, and its current implementation
status (governance adopted; CLI pipeline scaffolded, not yet functional).

### Scope extension, 2026-08-06: Martin Kupka

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Standing scope authorization (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Kupka je veřejný funkcionář — poslanec Poslanecké sněmovny PČR zvolený za ODS a od ledna 2026 předseda ODS, opoziční parlamentní strany. Autorizace pokrývá výhradně jeho základní veřejné politicko-kariérní fakty (poslanecký mandát, funkce předsedy strany) doložené přímo otevřenými zdroji (psp.cz, Deník.cz). Nejde o hlubší investigativní rešerši kauz ani o žádné další téma — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Petr Fiala

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Standing scope autorizace (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Fiala je
veřejný funkcionář — poslanec Poslanecké sněmovny PČR za ODS, bývalý
předseda ODS (2014–2026) a bývalý předseda vlády ČR (2021–2025).
Rozsah tohoto dossieru je omezen na jeho základní, přímo doložený
politický profil: aktuální poslanecký mandát a roli řadového poslance po
odchodu z čela ODS (nástupem Martina Kupky v lednu 2026), doloženo
oficiálním profilem na webu Poslanecké sněmovny a nezávislým
zpravodajstvím. Hlubší investigativní rešerše jeho premiérského období
nebo jiných kauz vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Jana Černochová

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Jana Černochová je veřejná funkcionářka — bývalá ministryně obrany ČR a poslankyně Poslanecké sněmovny PČR za ODS, od 6. 3. 2026 předsedkyně sněmovního Výboru pro bezpečnost. Spadá do standing scope autorizace (AUTH-2026-08-05-PLATFORM-SCOPE) jako veřejná osoba působící ve veřejné funkci. Rozsah tohoto dossieru je omezen na základní, nekontroverzní fakta o jejím aktuálním politickém mandátu a funkci (poslanecký mandát, členství v poslaneckém klubu ODS, předsednictví bezpečnostního výboru), doložená přímo otevřenými veřejnými zdroji. Hlubší investigativní rešerše jejího ministerského působení nebo jiných témat vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Martin Baxa

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Martin Baxa je veřejný funkcionář — bývalý ministr kultury ČR (2021–2025) a
současný poslanec Poslanecké sněmovny PČR za ODS, člen sněmovního Výboru pro
mediální záležitosti a předseda Podvýboru pro kulturu, v rámci stínové vlády
ODS působící jako stínový ministr kultury. Spadá do standing scope
autorizace (AUTH-2026-08-05-PLATFORM-SCOPE). Rozsah tohoto dossieru je
záměrně minimální: pouze základní, aktuální politicko-funkční fakta (mandát,
klubová a výborová příslušnost, role stínového ministra), doložená přímo
otevřenými zdroji. Nejde o investigativní rešerši jeho ministerského období
ani jiných témat — hlubší témata vyžadují samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Jan Skopeček

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Skopeček je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR za ODS, místopředseda
Poslanecké sněmovny a stínový ministr financí ODS. Dossier je založen
jako minimální, čistě biografický záznam pokrývající pouze jeho aktuální
poslanecký mandát a tyto funkce, doložený přímo otevřenými zdroji
(oficiální profil na psp.cz, nezávislé zpravodajství). Nejde o hloubkovou
investigativní rešerši jiných témat; rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Eva Decroix

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Eva Decroix je veřejná funkcionářka — bývalá ministryně spravedlnosti (10. 6. 2025 – 15. 12. 2025), nyní poslankyně Poslanecké sněmovny PČR za ODS a místopředsedkyně poslaneckého klubu ODS, v rámci stínové vlády ODS působící jako stínová ministryně spravedlnosti. Spadá do standing scope autorizace (AUTH-2026-08-05-PLATFORM-SCOPE) jako veřejná osoba působící ve veřejné funkci.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně ověřený politický profil (poslanecký mandát, členství a funkce v poslaneckém klubu ODS, role stínové ministryně spravedlnosti), doložený přímo otevřenými zdroji (psp.cz, nezávislé zpravodajství). Nejde o investigativní rešerši jejího ministerského působení ani žádné kauzy — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Marek Benda

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Marek Benda je veřejný funkcionář — dlouholetý poslanec Poslanecké sněmovny PČR za ODS a předseda poslaneckého klubu ODS. Spadá do standing scope autorizace (AUTH-2026-08-05-PLATFORM-SCOPE) jako veřejný funkcionář v souvislosti s výkonem veřejné funkce. Rozsah tohoto dossieru je záměrně minimální: pouze jeho aktuální poslanecký mandát a role předsedy poslaneckého klubu ODS, doložené přímo otevřenými zdroji, bez hlubší investigativní rešerše dalších témat.

### Scope extension, 2026-08-06: Karel Haas

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Karel Haas je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR za ODS (mandát od
4. 10. 2025, Pardubický kraj), místopředseda ODS (od ledna 2026, zvolen
na 32. kongresu ODS) a stínový ministr sportu, prevence a zdraví ve
stínové vládě ODS. Rozsah tohoto dossieru je záměrně minimální: pouze
základní, nekontroverzní tvrzení o jeho aktuálním poslaneckém mandátu
a straně/klubu ODS, funkci místopředsedy ODS a roli stínového ministra
sportu, prevence a zdraví — doloženo přímo otevřenými zdroji
(Poslanecká sněmovna PČR, ČT24, ODS). Nejde o investigativní rešerši
žádné kauzy ani sporu.

### Scope extension, 2026-08-06: Pavel Drobil

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Autorizuji vznik minimálního entity dossieru pro Pavla Drobila v rámci
standing scope (AUTH-2026-08-05-PLATFORM-SCOPE) — je veřejným
funkcionářem: místopředseda ODS (zvolen na 32. kongresu ODS 18. 1. 2026)
a stínový ministr průmyslu a obchodu ve stínové vládě ODS vedené
Martinem Kupkou, dříve poslanec PSP ČR (2010–2013) a ministr životního
prostředí (2010, vláda Petra Nečase).

Rozsah je záměrně minimální: dokládá pouze jeho aktuální stranickou
funkci (místopředseda ODS) a roli ve stínové vládě (stínový ministr
průmyslu a obchodu), doloženo nezávislými zdroji (ČT24, Echo24) a
vlastním profilem ODS. Nejde o investigativní rešerši žádné kauzy ani
o rozšíření na jiná témata jeho veřejného působení — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Martin Červíček

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Červíček je veřejný funkcionář — senátor Parlamentu ČR za ODS (obvod č. 47 – Náchod, mandát 28. 9. 2024 – 28. 9. 2030), od ledna 2026 místopředseda ODS (zvolen na 32. kongresu ODS 18. 1. 2026) a od března 2026 stínový ministr vnitra ve stínové vládě ODS vedené Martinem Kupkou. Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně ověřený politický profil (senátorský mandát, funkce místopředsedy ODS a role stínového ministra vnitra), doložený přímo otevřenými zdroji (senat.cz, ČT24, Novinky.cz). Nejde o investigativní rešerši žádné kauzy ani jiného tématu z jeho dřívějšího policejního nebo krajského působení — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-06: Petr Sokol

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Autorizuji entity dossier pro Petra Sokola v rámci standing scope
(AUTH-2026-08-05-PLATFORM-SCOPE). Petr Sokol je veřejný funkcionář —
poslanec Parlamentu ČR za ODS (mandát od 4. 10. 2025, psp.cz id 7045),
místopředseda poslaneckého klubu ODS (od 4. 2. 2026) a stínový poradce
pro EU ve stínové vládě ODS vedené Martinem Kupkou (od března 2026).
Rozsah je záměrně minimální: jediné tvrzení o jeho aktuálním mandátu a
straně funkcích, doložené přímo otevřenými zdroji (psp.cz, Echo24,
Hospodářské noviny, Forum24.cz) — nejde o investigativní rešerši
žádné kauzy. Ověřena totožnost proti oficiálnímu profilu na psp.cz
(id 7045), aby nedošlo k záměně se jmenovcem — jde o tutéž osobu
(politolog a publicista je stejný Petr Sokol, nikoli jmenovec).

### Scope extension, 2026-08-06: Renáta Zajíčková

Authorized by the site owner, explicitly and on the record, 2026-08-06:

Autorizuji entity dossier pro Renátu Zajíčkovou (ODS) v rámci standing scope
(AUTH-2026-08-05-PLATFORM-SCOPE) — veřejná funkcionářka, poslankyně
Parlamentu ČR za ODS. Rozsah je záměrně minimální: pouze aktuální
poslanecký mandát (od 4. 10. 2025), členství ve Výboru pro zdravotnictví
a role stínové ministryně školství, mládeže a tělovýchovy ve stínové
vládě ODS, doloženo přímo otevřenými zdroji (psp.cz, Zdravotnický deník,
Echo24). Nejde o investigativní rešerši žádné kauzy ani sporného tématu.

### Scope extension, 2026-08-06: Martin Pavlík — plný rozsah v mezích rejstříkové/veřejnoprávní stopy

Authorized by the site owner, explicitly and on the record, 2026-08-06
("rozšiř celý dossier" k `/dossiers/martin-pavlik/`, potvrzeno "full
scope authorized"): ruší se dřívější omezení `AUTH-2026-08-05-MARTIN-PAVLIK`
na výhradně čtyři jmenovitě uvedené subjekty a šest tvrzení. Dossier smí
nadále pokrývat **jakoukoli veřejně doloženou rejstříkovou, spolkovou
a veřejnoprávní/veřejnopeněžní stopu** osoby jednoznačně vymezené stejnou
identitní kotvou jako dosud — veřejným rejstříkovým profilem
`https://www.podnikatel.cz/rejstrik/osoby/martin-pavlik-1902710/`
a navázanými záznamy ARES (větev VR) — včetně:

- doplňkových rejstříkových záznamů/funkcí, pokud se u této konkrétní,
  identitně ověřené osoby objeví (nové i historické/zaniklé zápisy);
- řádně dopočítaného objemu a předmětu smluv v Registru smluv za všechny
  čtyři již uvedené subjekty (HYDROPROGRESS, s.r.o.; MEDIA PROJECT CZ
  s.r.o.; Bydlíme v Králově Poli, z.s.; Nadační fond FIDUCIA), nikoli jen
  citovaného počtu nalezených záznamů;
- veřejně publikovaných výročních zpráv/účetních závěrek ve Sbírce listin
  těchto subjektů, pokud jsou založeny;
- listinného dokladu (zakladatelská listina, smlouva o převodu podílu,
  zápis z valné hromady) jako silnějšího, nezávislejšího zdroje pro
  tvrzení dosud opřená jen o shodná rejstříková data (ARES + Podnikatel.cz
  sdílejí `sourceFamily: cz-verejny-rejstrik`, a proto samy o sobě
  nezakládají korporaci — viz zdůvodnění v SRC-02).

**"Plný rozsah" mění šíři témat, ne standard péče.** Beze změny, protože
to nikdy nebylo prostým tematickým omezením, nýbrž strukturálním
pravidlem projektu (`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`
§6–§7 a samo znění `AUTH-2026-08-05-MARTIN-PAVLIK`), platí i nadále a bez
výjimky:

- žádný IT profesní profil, schopnosti, jiné zaměstnání, přibližný věk,
  datum narození ani adresa bydliště se do dossieru nepřebírají, i kdyby
  se objevily ve stejném zdroji (rejstřík i listiny je běžně obsahují —
  odstraňují se v souladu s dosavadní praxí, ne citují);
- žádná jiná osoba stejného jména se s tímto subjektem neslučuje bez
  listinného nebo jinak jednoznačného ověření identity; při nejasnosti
  zůstává údaj mezerou (GAP), nikdy domněnkou;
- zápis funkce, podílu nebo smluvního vztahu se nadále prezentuje jako
  evidenční fakt, nikdy jako podezření nebo důkaz pochybení.

Tato autorizace nerozšiřuje rozsah na žádný jiný subjekt.

### Scope extension, 2026-08-07: Vít Rakušan

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vít Rakušan je veřejný
funkcionář — bývalý první místopředseda vlády a ministr vnitra ČR, nyní
poslanec Poslanecké sněmovny Parlamentu ČR za hnutí STAN (mandát od
4. 10. 2025, Středočeský kraj) a předseda hnutí STAN, které je
v aktuálním složení Poslanecké sněmovny opoziční stranou. Rozsah tohoto
dossieru je záměrně minimální: pouze základní, aktuálně ověřený politický
profil (poslanecký mandát, funkce místopředsedy poslaneckého klubu STAN,
členství ve Zahraničním výboru a role předsedy hnutí STAN v opozici),
doložený přímo otevřenými veřejnými zdroji (psp.cz, Blesk.cz, Tiscali.cz).
Nejde o investigativní rešerši jeho ministerského působení ani žádné
kauzy — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Michaela Šebelová

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Michaela Šebelová je veřejná
funkcionářka — poslankyně Poslanecké sněmovny Parlamentu ČR za hnutí STAN
(mandát od 4. 10. 2025, volební obvod Moravskoslezský kraj), předsedkyně
poslaneckého klubu STAN (od 10. 10. 2025) a místopředsedkyně hnutí
Starostové a nezávislí. Rozsah tohoto dossieru je záměrně minimální: pouze
základní, aktuálně ověřený politický profil (poslanecký mandát, funkce
předsedkyně poslaneckého klubu STAN, členství ve Výboru pro zdravotnictví
a role místopředsedkyně hnutí STAN), doložený přímo otevřenými zdroji
(psp.cz, Deník.cz, Deník N). Nejde o investigativní rešerši žádné kauzy
ani sporného tématu — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Zdeněk Hřib

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Zdeněk Hřib je veřejný
funkcionář — poslanec Poslanecké sněmovny Parlamentu ČR (mandát od
4. 10. 2025, volební obvod Praha) a předseda České pirátské strany
(zvolen 2024, znovuzvolen 17. 1. 2026 na republikovém fóru v Prachaticích).
Rozsah tohoto dossieru je záměrně minimální: pouze jeho aktuální
poslanecký mandát a strana (Piráti) a funkce předsedy strany, doloženo
přímo otevřenými zdroji (psp.cz, ČeskéNoviny.cz/ČTK, CNN Prima News).
Nejde o investigativní rešerši jeho dřívějšího působení jako primátora
hlavního města Prahy ani žádné jiné téma — to by vyžadovalo samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-07: Olga Richterová

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Olga Richterová je veřejná
funkcionářka — poslankyně Poslanecké sněmovny Parlamentu ČR za Piráty
(mandát od 4. 10. 2025, volební obvod hlavní město Praha), předsedkyně
poslaneckého klubu Pirátů (od 5. 10. 2025) a od 17. 1. 2026 4. místopředsedkyně
České pirátské strany (obhájila tuto pozici na republikovém fóru v
Prachaticích). Rozsah tohoto dossieru je záměrně minimální: pouze základní,
aktuálně ověřený politický profil (poslanecký mandát, vedení poslaneckého
klubu Pirátů, funkce místopředsedkyně strany), doložený přímo otevřenými
zdroji (psp.cz, Deník.cz/ČTK, CNN Prima News). Nejde o investigativní
rešerši žádné kauzy ani jiného tématu — to by vyžadovalo samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-07: Ivan Bartoš

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ivan Bartoš je veřejný
funkcionář — poslanec Poslanecké sněmovny Parlamentu ČR za Piráty
(mandát od 4. 10. 2025, volební obvod Středočeský kraj), první
místopředseda poslaneckého klubu Pirátů (od 5. 10. 2025) a bývalý
místopředseda vlády pro digitalizaci a ministr pro místní rozvoj
(prosinec 2021 – říjen 2024). Rozsah tohoto dossieru je záměrně
minimální: pouze základní, aktuálně ověřený politický profil (poslanecký
mandát, strana/klub Piráti, role prvního místopředsedy poslaneckého
klubu), doložený přímo otevřenými zdroji (psp.cz, ČeskéNoviny.cz/ČTK).
Nejde o investigativní rešerši jeho ministerského působení ani žádné
kauzy — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Kateřina Stojanová

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Kateřina Stojanová je veřejná
funkcionářka — poslankyně Poslanecké sněmovny Parlamentu ČR za Piráty (mandát
od 4. 10. 2025, volební kraj Ústecký), místopředsedkyně poslaneckého klubu
Piráti (od 5. 10. 2025) a místopředsedkyně České pirátské strany (zvolena na
celostátním fóru v Prachaticích 17. 1. 2026). Rozsah tohoto dossieru je
záměrně minimální: pouze základní, aktuálně ověřený politický profil
(poslanecký mandát, klubová funkce, stranická funkce místopředsedkyně),
doložený přímo otevřenými zdroji (psp.cz, Deník.cz/ČTK). Nejde o
investigativní rešerši žádné kauzy ani sporného tématu — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Jan Grolich

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Grolich je veřejný
funkcionář — hejtman Jihomoravského kraje za KDU-ČSL (mandát od
4. 11. 2024, obhájeno) a od 24. 4. 2026 předseda KDU-ČSL (zvolen na
sjezdu strany v Ostravě, podpořen 233 z 266 delegátů). Rozsah tohoto
dossieru je záměrně minimální: pouze základní, nekontroverzní tvrzení
o jeho aktuální krajské funkci (hejtman) a stranické funkci (předseda
KDU-ČSL), doložené přímo otevřenými zdroji (oficiální profil na webu
Jihomoravského kraje kr-jihomoravsky.cz, nezávislé zpravodajství
Deník.cz). Nejde o investigativní rešerši žádné kauzy ani sporu.

### Scope extension, 2026-08-07: Marian Jurečka

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Marian Jurečka je veřejný
funkcionář — bývalý místopředseda vlády a ministr práce a sociálních věcí,
poslanec Poslanecké sněmovny Parlamentu ČR za KDU-ČSL (mandát od 4. 10. 2025,
Olomoucký kraj) a od 6. 5. 2026 předseda poslaneckého klubu KDU-ČSL. Rozsah
tohoto dossieru je záměrně minimální: pouze základní, aktuálně ověřený
politický profil (poslanecký mandát a role předsedy poslaneckého klubu
KDU-ČSL), doložený přímo otevřenými zdroji (psp.cz, ČeskéNoviny.cz).
Nejde o investigativní rešerši jeho ministerského období ani žádné kauzy —
to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Benjamin Činčila

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Benjamin Činčila je veřejný funkcionář — poslanec Poslanecké sněmovny Parlamentu ČR za KDU-ČSL (mandát od 4. 10. 2025, volební kraj Vysočina), od 24. 4. 2026 první místopředseda KDU-ČSL (zvolen na sjezdu strany, podpořen 239 z 264 delegátů) a od 6. 5. 2026 místopředseda poslaneckého klubu KDU-ČSL. Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně ověřený politický profil (poslanecký mandát, stranická funkce prvního místopředsedy KDU-ČSL, klubová funkce místopředsedy poslaneckého klubu), doložený přímo otevřenými zdroji (psp.cz, ČT24/Česká televize). Nejde o investigativní rešerši žádné kauzy ani sporného tématu — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Petr Fiala — premiérské období

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): rozšíření AUTH-2026-08-06-PETR-FIALA. Petr Fiala byl v letech 2021–2025 předsedou vlády ČR — nejvyšší exekutivní funkce, veřejný zájem nesporný. Dřívější autorizace omezovala dossier na jeho poslanecký profil po odchodu z čela ODS a výslovně vylučovala hlubší rešerši premiérského období. Tato autorizace rozšiřuje rozsah na premiérské období samotné, v mezích níže uvedených témat, nalezených na úrovni search-výsledku a u dvou z nich již přímo otevřených a přečtených před sepsáním tohoto záznamu.

Rozsah zahrnuje:

1. Souhrnné veřejné hodnocení jeho čtyřletého mandátu — průzkum CVVM „Hodnocení vlády Petra Fialy" (zveřejněno 2025-08-21, otevřeno a přečteno přímo: nespokojenost převažuje ve všech zkoumaných oblastech, nejlépe hodnocen ohlášený program 30 % a osoba premiéra 28 %, nejhůře komunikace vlády s veřejností 18 %) a anketa RESPEKT „Jaký premiér byl Petr Fiala" (2025-09-12, otevřena a přečtena přímo: 15 jmenovaných přispěvatelů — Jindřich Šídlo, Apolena Rychlíková, Josef Středula, Zuzana Szabó Lenhartová, Petros Michopulos, Michal Stehlík, Petra Hůlová, Ivan Pilný, Ivan Gabal, Johana Nejedlová, Tomáš Halík, Otto Eibl, Jana Matesová, Martin Groman, Šárka Homfray), vedená striktně jako OPINION/NÁZOR, nikdy jako vlastní hodnocení webu.
2. Organizační fakta o personálním složení jeho vlády — přehled ministerských rezignací a jejich oficiálně uváděných důvodů v průběhu mandátu (2021–2025), jako fakta o vládě, kterou vedl, nikoli jako rozvinutí vlastní kauzy jmenovaného ministra bez jeho samostatné autorizace; každý takto zmíněný ministr zůstává záznamem vazby v rozsahu už publikovaného zpravodajství.
3. „Bitcoinová kauza" ministerstva spravedlnosti (přijetí daru v bitcoinech v hodnotě cca 1 miliardy Kč od odsouzeného drogového dealera, rezignace ministra spravedlnosti Pavla Blažka v květnu/červnu 2025, vyšetřování NCOZ) — výhradně z pohledu institucionální odpovědnosti a reakce vlády/premiéra, nikoli jako rozvinutí obvinění vůči Pavlu Blažkovi samotnému, který není a touto autorizací se nestává subjektem vlastního dossieru.
4. Zásadní hospodářsko-politický rekord mandátu, jak je popisován nezávislým zpravodajstvím: energetická krize a snížení závislosti na ruských zdrojích, podpora Ukrajině (rozsah a forma vojenské a jiné pomoci), vývoj inflace a veřejného dluhu, důchodová reforma.

Každý jednotlivý zdroj u bodů 2–4 musí být před napsáním jakéhokoli tvrzení přímo otevřen a přečten (nejde o přebírání z Wikipedie nebo z výtahu vyhledávače) u prvotního, jmenovaného, nezávislého zpravodajského zdroje. Status tvrzení (CORROBORATED/1 ZDROJ/CITACE/SPORNÉ/NÁZOR) se řídí stejnými validátorovými pravidly jako zbytek datasetu. Procesní stav (rezignace, vyšetřování, dosud nepravomocné závěry) musí být uveden při každé zmínce, nikoli jen jednou. Žádný jmenovaný ministr uvedený v bodě 2 ani Pavel Blažek v bodě 3 se touto autorizací nestává subjektem vlastního dossieru — objeví se výhradně jako záznam vazby v rozsahu už citovaného zpravodajství.

### Scope extension, 2026-08-07: Matěj Ondřej Havel

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Matěj Ondřej Havel je veřejný funkcionář — poslanec Poslanecké sněmovny Parlamentu ČR za TOP 09 (mandát od 4. 10. 2025, volební kraj Královéhradecký), od 14. 11. 2025 předseda Výboru pro vědu, vzdělání, kulturu, mládež a tělovýchovu a od 8. 11. 2025 předseda TOP 09 (zvolen na sněmu strany, podpořen 120 ze 171 hlasujících delegátů, nahradil Markétu Pekarovou Adamovou). Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně ověřený politický profil (poslanecký mandát, výborová funkce předsedy školského výboru, stranická funkce předsedy TOP 09), doložený přímo otevřenými zdroji (psp.cz, Aktuálně.cz). Nejde o investigativní rešerši žádné kauzy ani sporného tématu — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Jan Jakob

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Jakob je veřejný
funkcionář — poslanec Poslanecké sněmovny Parlamentu ČR za TOP 09
(mandát od 4. 10. 2025, Středočeský kraj) a předseda poslaneckého klubu
TOP 09 (od 7. 10. 2025, zvolen opakovaně po volbách 2025). Rozsah tohoto
dossieru je záměrně minimální: pouze základní, nekontroverzní tvrzení o
jeho aktuálním poslaneckém mandátu a roli předsedy poslaneckého klubu
TOP 09, doložené přímo otevřenými zdroji (Poslanecká sněmovna Parlamentu
ČR, ČeskéNoviny.cz). Nejde o investigativní rešerši žádné kauzy ani
sporného tématu.

### Scope extension, 2026-08-07: Vlastimil Válek

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vlastimil Válek je veřejný
funkcionář — bývalý místopředseda vlády a ministr zdravotnictví (17. 12.
2021 – 15. 12. 2025, TOP 09), nyní poslanec Poslanecké sněmovny Parlamentu
ČR za TOP 09 (mandát od 4. 10. 2025) a od 20. 1. 2026 místopředseda
sněmovního Výboru pro zdravotnictví. Rozsah tohoto dossieru je záměrně
minimální: pouze základní, aktuálně ověřený politický profil (poslanecký
mandát, klubová příslušnost TOP 09, funkce místopředsedy zdravotnického
výboru, dřívější ministerská funkce s přesnými daty), doložený přímo
otevřenými zdroji (psp.cz, vlada.gov.cz, zdravezpravy.cz). Nejde o
investigativní rešerši jeho ministerského působení ani žádné kauzy — to
by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-07: Jiří Pospíšil

Authorized by the site owner, explicitly and on the record, 2026-08-07:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Pospíšil je veřejný funkcionář — poslanec Poslanecké sněmovny Parlamentu ČR za TOP 09 (mandát od 4. 10. 2025, Praha) a od 8. 11. 2025 první místopředseda TOP 09 (dříve předseda TOP 09 2017–2019, ministr spravedlnosti 2006–2009 a 2010–2012). Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně ověřený politický profil (poslanecký mandát, klubová příslušnost TOP 09, funkce prvního místopředsedy strany), doložený přímo otevřenými zdroji (psp.cz, Deník N, Echo24.cz). Nejde o investigativní rešerši žádné kauzy ani sporného tématu.

### Scope extension, 2026-08-08: Vít Rakušan — ministerské období

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): rozšíření AUTH-2026-08-07-VIT-RAKUSAN. Vít Rakušan byl 2021–2025 prvním místopředsedou vlády a ministrem vnitra ČR. Dřívější autorizace omezovala dossier na jeho aktuální poslanecký a stranický profil a výslovně vylučovala hlubší rešerši ministerského období. Tato autorizace rozšiřuje rozsah na ministerské období samotné, v mezích níže uvedených témat, nalezených na úrovni search-výsledku a oběma přímo otevřených a přečtených před sepsáním tohoto záznamu.

Rozsah zahrnuje:

1. **Kontrolní nález NKÚ k profesionalizaci státní služby** (zveřejněno únor 2026, Ekonomický deník, otevřeno a přečteno přímo): přes 870 milionů Kč vynaložených na profesionalizaci státní služby v letech 2016–2023 „nepřineslo očekávaný efekt" — konkrétně 60+ milionů Kč na standardy řízení (51 z 84 úřadů cíl nesplnilo, ministerstvo vnitra samo mezi třemi nejhoršími), nikdy nespuštěný e-learningový portál, 22+ milionů Kč za aplikaci eZkouška zrušenou v listopadu 2023 (návrat k papírovým testům) a 640 milionů Kč za informační systém státní služby (2015–2024) bez potřebných evaluačních dat. Rakušan vedl ministerstvo od prosince 2021, kontrolované období se s jeho mandátem částečně překrývá. Ministerstvo nálezy zpochybnilo s odkazem na covid a válku na Ukrajině — obě strany musí být v textu zastoupeny.
2. **Kauza šifrovaného telefonu a souvislost s kauzou Dozimetr** (Echo24, 22. 4. 2026, otevřeno a přečteno přímo, plus dobově navazující zpravodajství ČT24/iROZHLAS/CNN Prima News z podzimu 2023): Rakušan přiznal používání telefonu s šifrovací aplikací (CryptoCult) od podzimu 2021 do ledna/února 2022, se zdůvodněním obavy z odposlechu během vyjednávání vlády; podle svých slov jej použil „tak třikrát čtyřikrát" a nikdy s nikým z obviněných v kauze Dozimetr — z obviněných osobně znal jen Petra Hlubučka. **Povinné rámování při každé zmínce**: použití stejné komerčně dostupné aplikace jako obvinění v kauze Dozimetr není samo o sobě spojením s trestnou činností (konstituční pravidlo „no guilt by graph") — Rakušan sám nebyl v kauze Dozimetr obviněn ani stíhán. Opoziční výzvy k rezignaci (Babiš) i Fialova obhajoba ministra jsou obě citovány jako pozice, ne jako zjištění.

Každý jednotlivý zdroj musí být před napsáním jakéhokoli tvrzení přímo otevřen a přečten. Status tvrzení (CORROBORATED/1 ZDROJ/CITACE/SPORNÉ/NÁZOR) se řídí stejnými validátorovými pravidly jako zbytek datasetu. Procesní stav u bodu 2 (nikdy neobviněn, nestíhán) musí být uveden při každé zmínce, nikoli jen jednou. Petr Hlubuček a žádná jiná osoba spojená s kauzou Dozimetr se touto autorizací nestává subjektem vlastního dossieru — objeví se výhradně jako záznam vazby v rozsahu už citovaného zpravodajství.

### Scope extension, 2026-08-08: Vít Rakušan

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vít Rakušan je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR zvolený za hnutí STAN
(mandát od 4. 10. 2025, Středočeský kraj), místopředseda poslaneckého
klubu STAN (od 26. 6. 2026), předseda hnutí STAN (od dubna 2019,
naposledy znovuzvolen na celostátním sněmu 16. 5. 2025 — 282 z 286
hlasů), bývalý 1. místopředseda vlády a ministr vnitra ČR (2021–2025).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele posledních tří volebních období, jednoho po
druhém.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát, funkce v poslaneckém klubu
STAN, předsednictví hnutí STAN), doložený přímo otevřenými zdroji
(oficiální profil na psp.cz, ČT24). Nejde o investigativní rešerši
žádné kauzy — hlubší témata (například politická odpovědnost v kauze
Dozimetr, kde sám obviněn není) vyžadují samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Marian Jurečka

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Marian Jurečka je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR zvolený na kandidátce SPOLU
za KDU-ČSL (mandát od 4. 10. 2025, Olomoucký kraj), člen poslaneckého
klubu KDU-ČSL od 7. 10. 2025 a předseda poslaneckého klubu KDU-ČSL od
6. 5. 2026 (resp. 5. 5. 2026 dle ČT24 — datum zápisu na psp.cz je
6. 5. 2026), člen Výboru pro sociální politiku; bývalý předseda KDU-ČSL
a bývalý místopředseda vlády a ministr práce a sociálních věcí
(2021–2025). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele posledních tří volebních období.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát, předsednictví poslaneckého
klubu KDU-ČSL, dřívější vládní a stranické funkce jako prostý
biografický fakt), doložený přímo otevřenými zdroji (oficiální profil na
psp.cz, ČT24). Nejde o investigativní rešerši žádné kauzy z jeho
ministerského působení — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vlastimil Válek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vlastimil Válek je
veřejný funkcionář — poslanec Poslanecké sněmovny PČR zvolený na
kandidátce SPOLU za TOP 09 (mandát od 4. 10. 2025, Jihomoravský kraj),
člen poslaneckého klubu TOP 09 od 7. 10. 2025, místopředseda Výboru pro
zdravotnictví od 20. 1. 2026 a člen Správní rady VZP; bývalý
místopředseda vlády a ministr zdravotnictví (2021–2025). Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát, funkce ve Výboru pro
zdravotnictví, dřívější vládní funkce jako prostý biografický fakt),
doložený přímo otevřenými zdroji (oficiální profil na psp.cz,
Zdravotnický deník). Nejde o investigativní rešerši žádné kauzy z jeho
ministerského působení — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Zbyněk Stanjura

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Zbyněk Stanjura je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr financí ČR 2021–2025 (vláda Petra Fialy), předtím
ministr dopravy (2012–2013), dlouholetý poslanec (2010–2025), předseda
poslaneckého klubu ODS a 1. místopředseda ODS. Ve sněmovních volbách
v říjnu 2025 jako lídr kandidátky SPOLU v Moravskoslezském kraji mandát
neobhájil (přeskočen preferenčními hlasy) a po volbách odešel i z vedení
ODS (Aktuálně.cz 2025-10-04, iROZHLAS). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí (ministr financí 2021–2025, ministr
dopravy 2012–2013, poslanecký mandát 2010–2025, funkce v ODS) a fakt
neobhájení mandátu v roce 2025, doložený přímo otevřenými zdroji
(Aktuálně.cz; vlada.gov.cz). Neobhájení mandátu je volební výsledek,
nikoli pochybení, a tak musí být podáno. Nejde o investigativní rešerši
žádné kauzy z jeho ministerského působení (vč. zmiňované bitcoinové
kauzy) — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Lipavský

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Lipavský je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR zvolený na kandidátce
SPOLU za ODS (mandát od 4. 10. 2025), člen poslaneckého klubu ODS od
8. 10. 2025, člen Zahraničního výboru a Výboru pro evropské záležitosti
od 16. 1. 2026 a člen Stálé komise pro kontrolu činnosti BIS od
16. 1. 2026; bývalý ministr zahraničních věcí ČR (2021–2025, nominován
za Piráty, od podzimu 2024 nestraník). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát a výborové/komisní funkce,
dřívější ministerská funkce a změna stranické příslušnosti jako prostý,
zdroji doložený biografický fakt), doloženo přímo otevřenými zdroji
(oficiální profil na psp.cz, nezávislé zpravodajství). Nejde o
investigativní rešerši žádné kauzy z jeho ministerského působení — to by
vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Ivan Bartoš

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ivan Bartoš je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR zvolený za Piráty (mandát
od 4. 10. 2025, Středočeský kraj), místopředseda poslaneckého klubu
Pirátů od 5. 10. 2025, člen Výboru pro obranu od 11. 11. 2025 a člen
stálých komisí pro kontrolu činnosti NÚKIB a Vojenského zpravodajství od
14. 11. 2025; bývalý místopředseda vlády pro digitalizaci a ministr pro
místní rozvoj (17. 12. 2021 – 30. 9. 2024) a bývalý dlouholetý předseda
České pirátské strany. Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát, funkce v klubu a výborech,
dřívější vládní a stranické funkce jako prostý biografický fakt),
doložený přímo otevřenými zdroji (oficiální profil na psp.cz,
vlada.gov.cz). Nejde o investigativní rešerši žádné kauzy (například
okolností jeho odvolání z vlády či digitalizace stavebního řízení) — to
by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jozef Síkela

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jozef Síkela je veřejný
funkcionář — evropský komisař pro mezinárodní partnerství (Evropská
komise 2024–2029, jmenování oznámila předsedkyně EK Ursula von der
Leyenová 17. 9. 2024), bývalý ministr průmyslu a obchodu ČR (2021–2024,
nominován za STAN). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený profil veřejných funkcí (evropský komisař, dřívější ministerská
funkce jako prostý biografický fakt), doložený přímo otevřenými zdroji
(oficiální profil na commission.europa.eu, ČT24). Nejde o investigativní
rešerši žádné kauzy z jeho ministerského či komisařského působení — to
by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Petr Hladík

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Hladík je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR zvolený na kandidátce
SPOLU za KDU-ČSL (mandát od 4. 10. 2025, Jihomoravský kraj),
místopředseda poslaneckého klubu KDU-ČSL od 4. 3. 2026, člen Výboru pro
životní prostředí a Výboru pro evropské záležitosti od 16. 1. 2026 a
předseda Stálé komise pro kontrolu činnosti Finančního analytického
úřadu od 25. 3. 2026; bývalý ministr životního prostředí (od 10. 3.
2023, od 6. 11. 2025 do 15. 12. 2025 v demisi). Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát, funkce v klubu, výborech a
komisi, dřívější ministerská funkce jako prostý biografický fakt),
doložený přímo otevřenými zdroji (oficiální profil na psp.cz,
vlada.gov.cz). Nejde o investigativní rešerši žádné kauzy z jeho
ministerského působení — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Marek Výborný

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Marek Výborný je
veřejný funkcionář — poslanec Poslanecké sněmovny PČR zvolený na
kandidátce SPOLU za KDU-ČSL (mandát od 4. 10. 2025, Pardubický kraj),
místopředseda Výboru pro vědu, vzdělávání, mládež a sport od 21. 1. 2026
a člen Zemědělského výboru; bývalý ministr zemědělství (od 29. 6. 2023,
od 6. 11. 2025 do 15. 12. 2025 v demisi), bývalý předseda KDU-ČSL
(2019–2020 a podruhé do 24. 4. 2026, kdy ho na sjezdu v Ostravě po dvou
letech vystřídal Jan Grolich) a bývalý předseda poslaneckého klubu
KDU-ČSL (2021–2023). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát a výborové funkce, dřívější
vládní a stranické funkce jako prostý biografický fakt), doložený přímo
otevřenými zdroji (oficiální profil na psp.cz, vlada.gov.cz,
ČeskéNoviny.cz). Nejde o investigativní rešerši žádné kauzy z jeho
ministerského působení — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Zdeněk Nekula

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Zdeněk Nekula je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zemědělství ČR od 3. 1. 2022 do 28. 6. 2023 (vláda
Petra Fialy, nominován za KDU-ČSL); dříve dlouholetý starosta obce
Těšetice (2007–2014 a 2018–2021), předseda představenstva PGRLF
(2015–2018) a zastupitel Jihomoravského kraje (2012–2016). Svůj konec
v úřadu v červnu 2023 sám zdůvodnil chybějící podporou vedení strany;
nahradil ho Marek Výborný (ČeskéNoviny.cz 2023-06-14). Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí a okolností konce v úřadu tak, jak je
sám veřejně uvedl — konec v úřadu je politická událost, nikoli
pochybení, a tak musí být podán. Doloženo přímo otevřenými zdroji
(oficiální profil na vlada.gov.cz, ČeskéNoviny.cz). Nejde o
investigativní rešerši žádné kauzy z jeho ministerského působení — to by
vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Mikuláš Bek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Mikuláš Bek je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministr školství, mládeže a tělovýchovy (4. 5. 2023 –
15. 12. 2025, od 6. 11. 2025 v demisi), předtím ministr pro evropské
záležitosti (17. 12. 2021 – 4. 5. 2023), senátor (2018–2024) a rektor
Masarykovy univerzity (2011–2019). Podle oficiálního profilu na psp.cz
není v aktuálním volebním období členem žádného orgánu Sněmovny.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele posledních tří volebních období, po pěti
postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřenými zdroji
(vlada.gov.cz, oficiální přehled ministrů na msmt.gov.cz). Nejde o
investigativní rešerši žádné kauzy z jeho ministerského působení — to by
vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Petr Gazdík

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Gazdík je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr školství, mládeže a tělovýchovy (17. 12. 2021 –
29. 6. 2022, vláda Petra Fialy, STAN). V červnu 2022 podal demisi poté,
co média upozornila na jeho kontakty s podnikatelem Michalem Redlem,
obviněným v kauze Dozimetr; sám uvedl, že se necítí ničím vinen a
nechce rozkolísat vládu, a rezignoval i na funkci místopředsedy STAN
(Forum24 2022-06-19). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívější vládní funkce a okolností demise tak, jak je popsaly
citované zdroje. Mandatory framing: Gazdík není v kauze Dozimetr
obviněn; jeho demise je politický krok, jeho zdůvodnění se cituje jeho
vlastními slovy a z kontaktů s obviněným se nevyvozuje žádné pochybení
(gate 4 — no guilt by graph). Doloženo přímo otevřenými zdroji
(oficiální přehled ministrů na msmt.gov.cz, Forum24). Hlubší rešerše
(např. samotné kauzy Dozimetr) vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Vladimír Balaš

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vladimír Balaš je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr školství, mládeže a tělovýchovy (od 1. 7. 2022 dle
vlada.gov.cz, resp. od 29. 6. 2022 dle přehledu MŠMT, do 4. 5. 2023;
vláda Petra Fialy, STAN), poslanec PSP ČR od října 2021 (volební období
2021–2025), profesor mezinárodního práva a bývalý ředitel Ústavu státu
a práva AV ČR. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele posledních tří volebních období,
po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřenými zdroji
(vlada.gov.cz, oficiální přehled ministrů na msmt.gov.cz). Nejde o
investigativní rešerši žádné kauzy z jeho ministerského působení — to
by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Anna Hubáčková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Anna Hubáčková je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministryně životního prostředí (17. 12. 2021 – 31. 10. 2022,
vláda Petra Fialy, nominována KDU-ČSL), senátorka (2016–2022),
starostka Ratíškovic (2014–2018) a vedoucí odboru životního prostředí
Krajského úřadu Jihomoravského kraje (2001–2014). Autorizace navazuje
na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřenými zdroji
(oficiální profil na vlada.gov.cz a nezávislé zpravodajství). Nejde o
investigativní rešerši žádné kauzy z jejího ministerského působení — to
by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Lukáš Vlček

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Lukáš Vlček je veřejný
funkcionář — poslanec Poslanecké sněmovny PČR zvolený za STAN (mandát
od 4. 10. 2025, Vysočina), předseda sněmovního Výboru pro veřejnou
správu a regionální rozvoj od 6. 3. 2026, 1. místopředseda hnutí STAN
(od července 2022, funkci obhájil na celostátním sněmu v květnu 2025);
bývalý ministr průmyslu a obchodu (od 8. 10. 2024, od 6. 11. 2025 do
15. 12. 2025 v demisi) a dlouholetý starosta Pacova (2006–2021).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele posledních tří volebních období, po pěti
postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát, předsednictví výboru,
stranická funkce, dřívější vládní funkce jako prostý biografický fakt),
doložený přímo otevřenými zdroji (oficiální profil na psp.cz,
vlada.gov.cz). Nejde o investigativní rešerši žádné kauzy z jeho
ministerského působení — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petr Kulhánek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Kulhánek je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministr pro místní rozvoj (8. 10. 2024 – 15. 12. 2025, od
6. 11. 2025 v demisi; jmenován prezidentem Pavlem po odvolání Ivana
Bartoše, nominován za STAN), hejtman Karlovarského kraje (2020–2024) a
primátor Karlových Varů (2010–2018). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřenými zdroji
(oficiální profil na vlada.gov.cz, ČeskéNoviny.cz/ČTK). Nejde o
investigativní rešerši žádné kauzy z jeho působení — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Helena Langšádlová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Helena Langšádlová je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministryně pro vědu, výzkum a inovace (17. 12. 2021 –
5. 5. 2024, TOP 09), dlouholetá poslankyně (od 2010) a starostka
Černošic (1998–2006). Její konec v úřadu v květnu 2024 provázela podle
Echo24 nespokojenost vedení TOP 09 s prezentací výsledků resortu; její
i stranická vyjádření se citují atribuovaně. Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí a okolností konce v úřadu tak, jak
je popsaly citované zdroje — konec v úřadu je politická událost, nikoli
pochybení, důvody se připisují tomu, kdo je vyslovil. Doloženo přímo
otevřenými zdroji (oficiální profil na vlada.gov.cz, Echo24). Nejde o
investigativní rešerši žádné kauzy — to by vyžadovalo samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-08: Marek Ženíšek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Marek Ženíšek je
veřejný funkcionář — poslanec Poslanecké sněmovny PČR zvolený na
kandidátce SPOLU za TOP 09 (mandát od 4. 10. 2025), místopředseda
Zahraničního výboru od 22. 1. 2026 a člen Stálé komise pro kontrolu
činnosti ÚZSI od 16. 1. 2026; bývalý ministr pro vědu, výzkum a inovace
(16. 5. 2024 – 15. 12. 2025, od 6. 11. 2025 v demisi), poslanec i
2013–2017 a od 2021, dříve náměstek ministra spravedlnosti a
1. náměstek ministra zdravotnictví. Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (poslanecký mandát a výborové funkce, dřívější
vládní funkce jako prostý biografický fakt), doložený přímo otevřenými
zdroji (oficiální profil na psp.cz, vlada.gov.cz). Nejde o
investigativní rešerši žádné kauzy — to by vyžadovalo samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-08: Michal Šalomoun

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Michal Šalomoun je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr pro legislativu a předseda Legislativní rady vlády
(17. 12. 2021 – 11. 10. 2024, nominován za Piráty, sám nestraník).
Demisi podal 1. 10. 2024 v souvislosti s odchodem Pirátů z vlády po
odvolání Ivana Bartoše; jeho zdůvodnění („nemám tam koho
reprezentovat") se cituje jeho vlastními slovy a post po něm nebyl
obsazen (Aktuálně.cz 2024-10-01). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívější vládní funkce a okolností demise tak, jak je popsaly
citované zdroje — demise je politický krok navazující na rozhodnutí
strany, nikoli pochybení. Doloženo přímo otevřenými zdroji (oficiální
profil na vlada.gov.cz, Aktuálně.cz). Nejde o investigativní rešerši
žádné kauzy — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Martin Dvořák

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Dvořák je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr pro evropské záležitosti (4. 5. 2023 – 15. 12. 2025,
od 6. 11. 2025 v demisi, nominován za STAN); dříve náměstek ministra
zahraničních věcí (2021–2023), diplomat (mj. generální konzul v New
Yorku 2012–2017, velvyslanec v Kuvajtu a Kataru 2017–2021) a první
polistopadový primátor Hradce Králové (do 1998). Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřeným oficiálním
profilem na vlada.gov.cz; dokud není otevřen druhý nezávislý zdroj,
tvrzení nese poctivě stav 1 ZDROJ (iROZHLAS i Deník.cz vracejí
automatizovanému přístupu 403). Nejde o investigativní rešerši žádné
kauzy — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Hamáček

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Hamáček je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — 1. místopředseda vlády a ministr vnitra (27. 6. 2018 –
17. 12. 2021, druhá vláda Andreje Babiše), dvakrát pověřen řízením
ministerstva zahraničních věcí (2018, 2021), předseda ČSSD (2018–2021),
předseda Poslanecké sněmovny (2013–2017). Podle e15 (2024-02-15) po
odchodu z politiky působí jako ředitel pro vnější vztahy skupiny
Czechoslovak Group; podle iROZHLAS v červnu 2024 vystoupil ze SOCDEM.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele posledních tří volebních období, po pěti
postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí a doloženého současného soukromého
působení (jako prostý fakt zaměstnání, bez jakéhokoli hodnocení),
doložený přímo otevřenými zdroji (vlada.gov.cz, e15.cz). Nejde o
investigativní rešerši žádné kauzy z jeho ministerského působení — to
by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Richard Brabec

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Richard Brabec je
veřejný funkcionář — hejtman Ústeckého kraje (zvolen 15. 11. 2024,
koalice ANO, ODS a Lepší Sever), bývalý ministr životního prostředí
(leden 2014 – prosinec 2017 a 27. 6. 2018 – 17. 12. 2021, v demisi od
11. 11. 2021) a bývalý místopředseda vlády (2017–2018), dlouholetý
poslanec za ANO. Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (hejtmanství, dřívější vládní funkce jako
prostý biografický fakt), doložený přímo otevřenými zdroji
(vlada.gov.cz, Forum24). Nejde o investigativní rešerši žádné kauzy
z jeho ministerského působení — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jana Maláčová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jana Maláčová je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministryně práce a sociálních věcí (30. 7. 2018 – 17. 12.
2021, druhá vláda Andreje Babiše, ČSSD) a předsedkyně SOCDEM (zvolena
5. 10. 2024 na sjezdu v Hradci Králové 101 ze 139 hlasů, nahradila
Michala Šmardu; v listopadu 2025 z čela strany i vrcholné politiky
odešla). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných a stranických funkcí — konec v čele strany
je výsledek jejího vlastního rozhodnutí a stranické volby, nikoli
pochybení, a tak musí být podán. Doloženo přímo otevřenými zdroji
(vlada.gov.cz, ČT24). Nejde o investigativní rešerši žádné kauzy — to
by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Klára Dostálová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Klára Dostálová je
veřejná funkcionářka — poslankyně Evropského parlamentu (zvolena
v eurovolbách 2024 jako lídryně kandidátky ANO), bývalá ministryně pro
místní rozvoj (prosinec 2017 – 17. 12. 2021, obě vlády Andreje Babiše,
v demisi od 11. 11. 2021), poslankyně PSP ČR 2017–2024, předtím
náměstkyně na MMR (2014–2017). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele posledních tří
volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní, aktuálně
ověřený politický profil (mandát europoslankyně, dřívější vládní a
poslanecké funkce jako prostý biografický fakt), doložený přímo
otevřenými zdroji (vlada.gov.cz, ČT24). Nejde o investigativní rešerši
žádné kauzy z jejího ministerského působení — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Lubomír Zaorálek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Lubomír Zaorálek je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministr kultury (27. 8. 2019 – 17. 12. 2021, druhá vláda
Andreje Babiše, v demisi od 11. 11. 2021), ministr zahraničních věcí
(2014–2017), předseda Poslanecké sněmovny (2002–2006), dlouholetý
poslanec a místopředseda ČSSD; podle ČT24 byl 5. 10. 2024 zvolen
statutárním místopředsedou SOCDEM (100 ze 135 hlasů). Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných a stranických funkcí, doložený přímo
otevřenými zdroji (vlada.gov.cz, ČT24). Nejde o investigativní rešerši
žádné kauzy z jeho ministerského působení — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Tomáš Petříček

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Tomáš Petříček je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zahraničních věcí (16. 10. 2018 – 12. 4. 2021, druhá
vláda Andreje Babiše, ČSSD). O odvolání se podle Aktuálně.cz dozvěděl
na schůzce s předsedou ČSSD Janem Hamáčkem po neúspěšné kandidatuře na
předsedu strany; odvolání je politický krok, jeho vlastní interpretace
(postoj k tendru na Dukovany, k neschváleným vakcínám) se cituje
atribuovaně. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele posledních tří volebních období,
po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívější vládní funkce a okolností odvolání tak, jak je popsaly
citované zdroje. Doloženo přímo otevřenými zdroji (vlada.gov.cz,
Aktuálně.cz). Nejde o investigativní rešerši žádné kauzy — to by
vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Miroslav Toman

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Miroslav Toman je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministr zemědělství (27. 6. 2018 – 17. 12. 2021, druhá vláda
Andreje Babiše, nominován za ČSSD; v demisi od 11. 11. 2021) a ministr
zemědělství i v letech 2013–2014 (vláda Jiřího Rusnoka); dříve
prezident Potravinářské komory ČR a Agrární komory ČR a náměstek
ministra zemědělství. Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: pouze základní biografický
záznam dřívějších veřejných funkcí. Tvrzení zatím nese stav 1 ZDROJ:
jediný přímo otevřený zdroj je oficiální vládní profil (nezávislé
redakce k tématu vracejí automatizovanému přístupu 403 nebo článek už
není dostupný); povýšení na CORROBORATED vyžaduje otevření druhého,
nezávislého zdroje. Nejde o investigativní rešerši žádné kauzy (vč.
podnikání rodiny Tomanových) — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Roman Prymula

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Roman Prymula je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zdravotnictví (21. 9. – 29. 10. 2020, druhá vláda
Andreje Babiše), předtím náměstek ministra zdravotnictví (2017–2020),
epidemiolog. Konec v úřadu následoval poté, co byl v říjnu 2020
vyfotografován při nočním odchodu z pražské restaurace v době, kdy
restaurace musely být podle protiepidemických opatření zavřené; premiér
Babiš ho poté vyzval k rezignaci a navrhl prezidentovi jeho odvolání
(RESPEKT 2020-10-23). Prymulova vlastní obhajoba („zas tolik jsem toho
neprovedl", tvrzení, že nic neporušil) se cituje jeho slovy. Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností jejího konce tak, jak je
popsaly citované zdroje — odvolání je politický krok premiéra, nikoli
soudní ani správní závěr o porušení pravidel, a Prymulovo popření se
uvádí při každé zmínce. Doloženo přímo otevřenými zdroji (vlada.gov.cz,
RESPEKT). Hlubší rešerše vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Blatný

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Blatný je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zdravotnictví (29. 10. 2020 – 7. 4. 2021, druhá vláda
Andreje Babiše), dětský hematolog FN Brno a docent Masarykovy
univerzity. Jeho odvolání podle Tiscali/Zpráv provázel dříve veřejně
vyslovený požadavek prezidenta Zemana kvůli Blatného postoji k vakcíně
Sputnik V (trval na schválení EMA); Blatný odvolání označil za
politické rozhodnutí a uvedl, že má čisté svědomí — obě strany se
citují atribuovaně. Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností odvolání tak, jak je popsaly
citované zdroje — odvolání je politický krok a žádné pochybení se z něj
nevyvozuje. Doloženo přímo otevřenými zdroji (vlada.gov.cz,
zpravy.tiscali.cz). Hlubší rešerše vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jakub Kulhánek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jakub Kulhánek je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zahraničních věcí (od 21. 4. 2021 do 17. 12. 2021,
druhá vláda Andreje Babiše, ČSSD; v demisi od 11. 11. 2021), předtím
náměstek na ministerstvech vnitra (2018–2021), zahraničí (2014–2016) a
obrany (2014). Jmenován byl v době kauzy Vrbětice a mezi jeho první
kroky patřilo předání protestu ruskému velvyslanci (Blesk 2021-04-21).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele posledních tří volebních období, po pěti
postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřenými zdroji
(vlada.gov.cz, Blesk.cz). Dřívější externí poradenství pro CEFC Europe
je zmíněno pouze jako citovaným zdrojem uvedený fakt s kritikou
připsanou kritikům, nikoli jako vlastní hodnocení webu. Hlubší rešerše
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Taťána Malá

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Taťána Malá je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministryně spravedlnosti (27. 6. – 10. 7. 2018, druhá vláda
Andreje Babiše, ANO), poslankyně od října 2017, dříve místopředsedkyně
hejtmana Jihomoravského kraje. Po 13 dnech ve funkci rezignovala
v souvislosti s mediálně popsaným podezřením z plagiátorství jejích
diplomových prací; sama uvedla, že se ničeho nedopustila, a její
vyjádření se cituje jejími slovy (Blesk 2018-07-09). Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností rezignace tak, jak je popsaly
citované zdroje. **Povinné rámování při každé zmínce:** jde o mediálně
popsané podezření, nikoli o soudní či akademický verdikt doložený
citovaným zdrojem; její popření se uvádí vždy. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Kněžínek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Kněžínek je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr spravedlnosti (10. 7. 2018 – 30. 4. 2019, druhá vláda
Andreje Babiše, nestraník), dlouholetý legislativec Úřadu vlády
(2007–2018, náměstek pro řízení sekce Legislativní rady vlády). Demisi
podal v dubnu 2019 bez bližšího zdůvodnění; opoziční spekulace
o souvislosti s vývojem kauzy Čapí hnízdo jsou v citovaném zdroji
připsány opozici a nic víc z nich neplyne (ČT24 2019-04-18). Nahradila
ho Marie Benešová. Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností demise tak, jak je popsaly
citované zdroje — demise je jeho rozhodnutí, spekulace zůstávají
připsané těm, kdo je vyslovili. Rozšíření rozsahu vyžaduje samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-08: Petr Krčál

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Krčál je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr práce a sociálních věcí (27. 6. – 18. 7. 2018, druhá
vláda Andreje Babiše, ČSSD), dříve radní Kraje Vysočina a náměstek na
Úřadu vlády. Po zhruba třech týdnech rezignoval v souvislosti se
zjištěními Seznam Zpráv o shodách v jeho bakalářské práci; jeho vlastní
vyjádření (připustil možné nedostatky, zmínil i zdravotní důvody) se
cituje jeho slovy (Hospodářské noviny 2018-07-17). Nahradila ho Jana
Maláčová. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele posledních tří volebních období,
po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností rezignace tak, jak je popsaly
citované zdroje. **Povinné rámování:** jde o mediálně popsaná zjištění
a jeho rezignaci, nikoli o soudní či akademický verdikt doložený
citovaným zdrojem. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petr Arenberger

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Arenberger je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zdravotnictví (7. 4. – 25. 5. 2021, druhá vláda
Andreje Babiše), ředitel FN Královské Vinohrady a přednosta
dermatovenerologické kliniky 3. LF UK. Rezignoval poté, co Seznam
Zprávy popsaly nesrovnalosti v jeho majetkových přiznáních (nepřiznané
nemovitosti, příjmy z klinických studií); sám uvedl, že přiznání
vyplnil nesprávně, ale daně platí poctivě, a dění označil za „mediální
lynč" — obojí se cituje jeho slovy (Seznam Zprávy 2021-05-25).
Nahradil ho Adam Vojtěch. Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele posledních tří
volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností rezignace tak, jak je popsaly
citované zdroje. **Povinné rámování při každé zmínce:** popsané
nesrovnalosti jsou zjištění citované redakce a jeho přiznaná chyba ve
vyplnění, nikoli soudní či správní verdikt; jeho obhajoba se uvádí
vždy. Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Antonín Staněk

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Antonín Staněk je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr kultury (27. 6. 2018 – 31. 7. 2019, druhá vláda
Andreje Babiše, ČSSD), dříve primátor Olomouce (od 2014) a poslanec
(od 2017). Jeho odvolání předcházel spor o odvolání ředitele Národní
galerie Praha Jiřího Fajta a ředitele Muzea umění Olomouc, kritika
odborné veřejnosti a žádost ČSSD o jeho konec; prezident Zeman jeho
květnovou rezignaci nejprve nepřijal a odvolal ho k 31. 7. 2019
(Aktuálně.cz 2019-07-29). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele posledních tří
volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností odvolání tak, jak je popsaly
citované zdroje — kritika je připsána kritikům, prezidentova
protichůdná interpretace (poděkování za „odhalení zneužívání veřejných
prostředků") jemu, a web žádnou stranu nepřijímá za svou. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Dan Ťok

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Dan Ťok je politicky
exponovaná osoba v souvislosti s výkonem dřívějších veřejných funkcí —
ministr dopravy nepřetržitě od prosince 2014 do 30. 4. 2019 (vlády
Bohuslava Sobotky a obě vlády Andreje Babiše, nestraník za ANO), dříve
předseda představenstva a generální ředitel Skanska a.s. Konec v úřadu
oznámil v dubnu 2019 v rámci vládních změn, nahradil ho Vladimír
Kremlík (Seznam Zprávy 2019-04-10). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřenými zdroji
(vlada.gov.cz, Seznam Zprávy). Nejde o investigativní rešerši žádné
kauzy (vč. dálničních zakázek) — to by vyžadovalo samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vladimír Kremlík

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vladimír Kremlík je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr dopravy (29. 4. 2019 – 23. 1. 2020, druhá vláda
Andreje Babiše), dříve náměstek Úřadu pro zastupování státu ve věcech
majetkových a advokát. Při ohlášení nominace ho premiér Babiš popsal
jako profesionála s bezpečnostní prověrkou na stupeň „tajné" (Seznam
Zprávy 2019-04-10). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce s daty z oficiálního profilu, doložený
přímo otevřenými zdroji (vlada.gov.cz, Seznam Zprávy). Nejde o
investigativní rešerši žádné kauzy (vč. okolností jeho odvolání kolem
zakázky na e-shop dálničních známek — bez přímo otevřeného zdroje se
zde neuvádí) — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Marta Nováková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Marta Nováková je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministryně průmyslu a obchodu (27. 6. 2018 – 30. 4. 2019,
druhá vláda Andreje Babiše), dříve prezidentka Svazu obchodu a
cestovního ruchu ČR a majitelka U&SLUNO a.s. Její konec v úřadu
premiér Babiš doprovodil slovy, že přechod ze soukromého sektoru do
veřejné správy není snadný, a výslovně odmítl, že by důvodem byl
incident s tchajwanskou zástupkyní (Seznam Zprávy 2019-04-10); nahradil
ji Karel Havlíček. Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele posledních tří volebních
období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a okolností konce v úřadu tak, jak je
popsaly citované zdroje — důvody se připisují tomu, kdo je vyslovil.
Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Martin Stropnický

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Stropnický je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — místopředseda vlády a ministr zahraničních věcí (13. 12. 2017
– 27. 6. 2018, první vláda Andreje Babiše, od 24. 1. 2018 v demisi),
ministr obrany (2014–2017, vláda Bohuslava Sobotky), ministr kultury
(1998, Tošovského vláda), dlouholetý diplomat (velvyslanec
v Portugalsku, Itálii a při Svatém stolci; od listopadu 2018
velvyslanec v Izraeli) a herec. Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele posledních tří
volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí a odchodu z vysoké politiky do
diplomacie (jeho vlastní rozhodnutí dle citovaných zdrojů), doloženo
přímo otevřenými zdroji (vlada.gov.cz — profil i oficiální přehled
členů první vlády, Aktuálně.cz). Nejde o investigativní rešerši žádné
kauzy — to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Robert Pelikán

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Robert Pelikán je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr spravedlnosti (březen 2015 – 27. 6. 2018, vlády
Bohuslava Sobotky a první vláda Andreje Babiše, od 24. 1. 2018
v demisi, ANO), dříve 1. náměstek ministra spravedlnosti a právník.
V dubnu 2018 oznámil odchod z politiky; jeho zdůvodnění (názorové
neshody v ANO mj. ohledně SPD a lidských práv, kontext vydání Jevgenije
Nikulina do USA) se cituje jeho slovy (ČT24 2018-04-07). Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a ohlášeného odchodu z politiky s jeho
vlastním zdůvodněním, doloženo přímo otevřenými zdroji (vlada.gov.cz,
ČT24). Nejde o investigativní rešerši žádné kauzy — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jaroslava Němcová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jaroslava Němcová je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministryně práce a sociálních věcí (13. 12. 2017 – 27. 6.
2018, první vláda Andreje Babiše, od 24. 1. 2018 v demisi, ANO); dříve
ředitelka pobočky VZP, náměstkyně ředitele nemocnice a radní
Středočeského kraje pro zdravotnictví. Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce. Tvrzení nese stav 1 ZDROJ (jediný přímo
otevřený zdroj je oficiální profil na vlada.gov.cz; iROZHLAS vrací
automatizovanému přístupu 403); povýšení na CORROBORATED vyžaduje
otevření druhého, nezávislého zdroje. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Ilja Šmíd

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ilja Šmíd je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr kultury (13. 12. 2017 – 27. 6. 2018, první vláda Andreje
Babiše, od 24. 1. 2018 v demisi); dříve ředitel Pražské komorní
filharmonie (1995–2006) a Symfonického orchestru hl. m. Prahy FOK
(2006–2012), muzikolog a pedagog. Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce. Tvrzení nese stav 1 ZDROJ (jediný přímo
otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Tomáš Hüner

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Tomáš Hüner je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr průmyslu a obchodu (13. 12. 2017 – 27. 6. 2018, první
vláda Andreje Babiše, od 24. 1. 2018 v demisi); dříve náměstek ministra
průmyslu a obchodu (2006–2011), předseda dozorčí rady ČEPS a ředitel
divize Energy Management v Siemens. Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele
posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce. Tvrzení nese stav 1 ZDROJ (jediný přímo
otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jiří Milek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Milek je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zemědělství (13. 12. 2017 – 27. 6. 2018, první vláda
Andreje Babiše, od 24. 1. 2018 v demisi); dříve generální ředitel a
předseda představenstva ÚSOVSKO a.s. a agronom. Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce. Tvrzení nese stav 1 ZDROJ (jediný přímo
otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Karla Šlechtová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Karla Šlechtová je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministryně obrany (13. 12. 2017 – 27. 6. 2018, první vláda
Andreje Babiše, od 24. 1. 2018 v demisi) a ministryně pro místní rozvoj
(září 2014 – 13. 12. 2017, vláda Bohuslava Sobotky); dříve ředitelka
odboru fondů EU na Úřadu vlády a manažerka v Deloitte. Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele posledních tří volebních období, po pěti postupně.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších vládních funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Pavel Blažek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Blažek je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministr spravedlnosti (17. 12. 2021 – 9. 6. 2025, vláda Petra
Fialy, ODS) a ministr spravedlnosti i v letech 2012–2013 (vláda Petra
Nečase), dlouholetý poslanec (od 2013). Demisi oznámil 30. 5. 2025
v souvislosti s bitcoinovou kauzou ministerstva spravedlnosti (dar
bitcoinů od Tomáše Jiříkovského a jejich prodej ministerstvem); sám
uvedl, že si není vědom žádného protiprávního jednání a nechce
poškozovat pověst vlády a koalice — obojí se cituje jeho slovy (ČT24
2025-05-30). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele posledních tří volebních období.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších vládních funkcí a okolností demise tak, jak je
popsaly citované zdroje. **Povinné rámování při každé zmínce:** demise
je politický krok, Blažek podle citovaných zdrojů není obviněn, jeho
vyjádření se uvádí vždy; samotná bitcoinová kauza je v tomto repozitáři
pokryta samostatně (dossier Jeronýma Tejce) a tento dossier ji
nerozšiřuje. Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Bohuslav Sobotka

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Bohuslav Sobotka je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — předseda vlády ČR (29. 1. 2014 – 13. 12. 2017, od 5. 12. 2017
v demisi), ministr financí a místopředseda vlády (2002–2006), předseda
ČSSD (2011–2017), poslanec od 1996. Podle CNN Prima News po odchodu
z politiky působí jako manažer ve firmě z oboru zdravotnické techniky a
z veřejného života se stáhl. Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí a doloženého současného soukromého
působení (prostý fakt, bez hodnocení), doloženo přímo otevřenými zdroji
(vlada.gov.cz, CNN Prima News). Nejde o investigativní rešerši žádné
kauzy z jeho premiérského působení — to by vyžadovalo samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-08: Milan Chovanec

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Milan Chovanec je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr vnitra (29. 1. 2014 – 13. 12. 2017, vláda Bohuslava
Sobotky, ČSSD, od 5. 12. 2017 v demisi), dříve hejtman Plzeňského
kraje (od 2010). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt vládní představitele postupně až do roku 1989,
po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Pavel Bělobrádek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Bělobrádek je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — místopředseda vlády pro vědu, výzkum a inovace (29. 1. 2014 –
13. 12. 2017, vláda Bohuslava Sobotky, od 5. 12. 2017 v demisi),
předseda KDU-ČSL od 2010, poslanec od 2013. Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Věra Jourová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Věra Jourová je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — místopředsedkyně Evropské komise pro hodnoty a transparentnost
(2019 – 30. 11. 2024), eurokomisařka pro spravedlnost, ochranu
spotřebitelů a rovnost žen a mužů (2014–2019), ministryně pro místní
rozvoj ČR (29. 1. – 3. 10. 2014, vláda Bohuslava Sobotky, ANO),
poslankyně od října 2013. Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí, doložený přímo otevřenými zdroji
(vlada.gov.cz, Aktuálně.cz). Nejde o investigativní rešerši žádné kauzy
— to by vyžadovalo samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Michaela Marksová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Michaela Marksová je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministryně práce a sociálních věcí (29. 1. 2014 –
13. 12. 2017, vláda Bohuslava Sobotky, ČSSD, od 5. 12. 2017 v demisi;
v červnu 2015 krátce pověřena i řízením ministerstva školství).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce. Tvrzení nese stav 1 ZDROJ (jediný přímo
otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Marcel Chládek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Marcel Chládek je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr školství, mládeže a tělovýchovy (29. 1. 2014 –
5. 6. 2015, vláda Bohuslava Sobotky, ČSSD), dříve senátor (od 2008) a
náměstek hejtmana Středočeského kraje. Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele postupně
až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Okolnosti
konce v úřadu se zde bez přímo otevřeného zdroje neuvádějí. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Kateřina Valachová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Kateřina Valachová je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministryně školství, mládeže a tělovýchovy (2015 –
21. 6. 2017, vláda Bohuslava Sobotky, ČSSD; oficiální přehled členů
vlády uvádí začátek 5. 6. 2015, její vládní profil byl publikován
17. 6. 2015 — drobný rozpor úředních evidencí se uvádí otevřeně),
dříve náměstkyně pro řízení sekce Legislativní rady vlády a vedoucí
právního odboru Kanceláře veřejného ochránce práv. Autorizace navazuje
na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je vlada.gov.cz); povýšení na CORROBORATED
vyžaduje otevření druhého, nezávislého zdroje. Okolnosti konce v úřadu
se zde bez přímo otevřeného zdroje neuvádějí. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Daniel Herman

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Daniel Herman je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr kultury (29. 1. 2014 – 13. 12. 2017, vláda Bohuslava
Sobotky, KDU-ČSL, od 5. 12. 2017 v demisi), dříve ředitel Ústavu pro
studium totalitních režimů (2010–2013) a mluvčí České biskupské
konference (1996–2005), poslanec od října 2013. Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Mládek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Mládek je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministr průmyslu a obchodu (29. 1. 2014 – 28. 2. 2017, vláda
Bohuslava Sobotky, ČSSD), ministr zemědělství (2005–2006) a 1. náměstek
ministra financí (1999–2001). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Okolnosti
konce v úřadu (únor 2017) se zde bez přímo otevřeného zdroje neuvádějí.
Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Svatopluk Němeček

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Svatopluk Němeček je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zdravotnictví (29. 1. 2014 – 30. 11. 2016, vláda
Bohuslava Sobotky), dříve ředitel Fakultní nemocnice Ostrava
(2005–2014) a Městské nemocnice Bohumín (2002–2005). Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Okolnosti
konce v úřadu (listopad 2016) se zde bez přímo otevřeného zdroje
neuvádějí. Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Miloslav Ludvík

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Miloslav Ludvík je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr zdravotnictví (30. 11. 2016 – 13. 12. 2017, vláda
Bohuslava Sobotky, ČSSD, od 5. 12. 2017 v demisi), dříve dlouholetý
ředitel Fakultní nemocnice v Motole (2000–2016). Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jiří Havlíček

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Havlíček je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr průmyslu a obchodu (4. 4. – 13. 12. 2017, vláda
Bohuslava Sobotky, ČSSD, od 5. 12. 2017 v demisi). Autorizace navazuje
na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED
vyžaduje otevření druhého, nezávislého zdroje. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Stanislav Štech

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Stanislav Štech je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr školství, mládeže a tělovýchovy (21. 6. – 13. 12.
2017, vláda Bohuslava Sobotky, nominován za ČSSD, od 5. 12. 2017
v demisi), dříve náměstek ministra školství (od 2015), profesor
pedagogické psychologie a prorektor Univerzity Karlovy (2003–2015).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jiří Dienstbier ml.

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Dienstbier ml. je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — ministr pro lidská práva, rovné příležitosti a legislativu a
předseda Legislativní rady vlády (29. 1. 2014 – 30. 11. 2016, vláda
Bohuslava Sobotky, ČSSD), senátor a bývalý místopředseda ČSSD
(2011–2013). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších veřejných funkcí. Tvrzení nese stav 1 ZDROJ (jediný
přímo otevřený zdroj je oficiální profil na vlada.gov.cz); povýšení na
CORROBORATED vyžaduje otevření druhého, nezávislého zdroje. Okolnosti
konce v úřadu se zde bez přímo otevřeného zdroje neuvádějí. Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Helena Válková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Helena Válková je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministryně spravedlnosti (29. 1. 2014 – 1. 3. 2015, vláda
Bohuslava Sobotky, ANO), profesorka trestního práva a kriminoložka.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce a akademické dráhy. Tvrzení nese stav
1 ZDROJ (jediný přímo otevřený zdroj je oficiální profil na
vlada.gov.cz); povýšení na CORROBORATED vyžaduje otevření druhého,
nezávislého zdroje. Okolnosti konce v úřadu ani pozdější veřejné funkce
se zde bez přímo otevřeného zdroje neuvádějí. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Ivan Pilný

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ivan Pilný je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr financí (24. 5. – 13. 12. 2017, vláda Bohuslava
Sobotky, ANO, od 5. 12. 2017 v demisi), když ve funkci nahradil Andreje
Babiše. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED
vyžaduje otevření druhého, nezávislého zdroje. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Antonín Prachař

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Antonín Prachař je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr dopravy (29. 1. 2014 – 13. 11. 2014, vláda Bohuslava
Sobotky, ANO), kdy podle oficiálního přehledu podal rezignaci.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz — rezignace je uvedena jako fakt bez důvodů, které
přehled neuvádí. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED
vyžaduje otevření druhého, nezávislého zdroje. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Chvojka

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Chvojka je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — ministr pro lidská práva, rovné příležitosti a legislativu
(30. 11. 2016 – 13. 12. 2017, vláda Bohuslava Sobotky, ČSSD, od
5. 12. 2017 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED
vyžaduje otevření druhého, nezávislého zdroje. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jiří Rusnok

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Rusnok je
politicky exponovaná osoba v souvislosti s výkonem dřívější veřejné
funkce — předseda vlády ČR (25. 6. 2013 – 29. 1. 2014, úřednická
vláda, od 13. 8. 2013 v demisi po neúspěšném hlasování o důvěře).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci
pokrýt vládní představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění pozdějšího působení (guvernér ČNB) vyžaduje otevření dalších
zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Martin Pecina

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Pecina je
politicky exponovaná osoba v souvislosti s výkonem dřívějších veřejných
funkcí — místopředseda vlády a ministr vnitra (10. 7. 2013 –
29. 1. 2014, Rusnokova úřednická vláda, od 13. 8. 2013 v demisi);
ministrem vnitra byl i ve vládě Jana Fischera (2009–2010). Autorizace
navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt vládní
představitele postupně až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívějších vládních funkcí doložený oficiálním přehledem členů
vlády na vlada.gov.cz (Rusnokova vláda) — dřívější Fischerovo období se
uvádí, jen pokud je doloží otevřený zdroj. Tvrzení nese stav 1 ZDROJ;
povýšení na CORROBORATED vyžaduje otevření druhého, nezávislého zdroje.
Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Fischer

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Fischer je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
1. místopředseda vlády a ministr financí; dříve předseda úřednické vlády (2009–2010), což se v dossieru uvede, až to doloží přímo otevřený zdroj (10. 7. 2013 – 29. 1. 2014, Rusnokova úřednická vláda, od
13. 8. 2013 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Jiřího Rusnoka na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dřívějších či pozdějších funkcí vyžaduje
otevření dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jan Kohout

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Kohout je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zahraničních věcí (10. 7. 2013 – 29. 1. 2014, Rusnokova úřednická vláda, od
13. 8. 2013 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Jiřího Rusnoka na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dřívějších či pozdějších funkcí vyžaduje
otevření dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: František Koníček

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): František Koníček je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr práce a sociálních věcí (10. 7. 2013 – 29. 1. 2014, Rusnokova úřednická vláda, od
13. 8. 2013 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Jiřího Rusnoka na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dřívějších či pozdějších funkcí vyžaduje
otevření dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Martin Holcát

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Holcát je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zdravotnictví (10. 7. 2013 – 29. 1. 2014, Rusnokova úřednická vláda, od
13. 8. 2013 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Jiřího Rusnoka na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dřívějších či pozdějších funkcí vyžaduje
otevření dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jiří Balvín

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Balvín je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr kultury (10. 7. 2013 – 29. 1. 2014, Rusnokova úřednická vláda, od
13. 8. 2013 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Jiřího Rusnoka na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dřívějších či pozdějších funkcí vyžaduje
otevření dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Dalibor Štys

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Dalibor Štys je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr školství, mládeže a tělovýchovy (10. 7. 2013 – 29. 1. 2014, Rusnokova úřednická vláda, od
13. 8. 2013 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Jiřího Rusnoka na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED vyžaduje otevření dalších zdrojů. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Zdeněk Žák

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Zdeněk Žák je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr dopravy (10. 7. 2013 – 29. 1. 2014, Rusnokova úřednická vláda, od
13. 8. 2013 v demisi). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Jiřího Rusnoka na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED vyžaduje otevření dalších zdrojů. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Petr Nečas

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Nečas je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
předseda vlády ČR (28. 6. 2010 – 10. 7. 2013, od 17. 6. 2013 v demisi, ODS) (vláda Petra Nečase, 2010–2013). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele postupně
až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dalších dřívějších či pozdějších funkcí
vyžaduje otevření dalších zdrojů. Nejde o investigativní rešerši žádné
kauzy (u P. Nečase vč. okolností demise 2013) — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Karel Schwarzenberg

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Karel Schwarzenberg je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
1. místopředseda vlády a ministr zahraničních věcí (13. 7. 2010 – 10. 7. 2013, TOP 09) (vláda Petra Nečase, 2010–2013). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele postupně
až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dalších dřívějších či pozdějších funkcí
vyžaduje otevření dalších zdrojů. Nejde o investigativní rešerši žádné
kauzy (u P. Nečase vč. okolností demise 2013) — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Miroslav Kalousek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Miroslav Kalousek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr financí (13. 7. 2010 – 10. 7. 2013, TOP 09) (vláda Petra Nečase, 2010–2013). Autorizace navazuje na výslovnou
žádost vlastníka v této konverzaci pokrýt vládní představitele postupně
až do roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění dalších dřívějších či pozdějších funkcí
vyžaduje otevření dalších zdrojů. Nejde o investigativní rešerši žádné
kauzy (u P. Nečase vč. okolností demise 2013) — to by vyžadovalo
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Karolína Peake

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Karolína Peake je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředsedkyně vlády (1. 7. 2011 – 10. 7. 2013, od 17. 6. 2013 v demisi) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Radek John

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Radek John je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády (13. 7. 2010 – 20. 5. 2011) a ministr vnitra (13. 7. 2010 – 21. 4. 2011) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Alexandr Vondra (ministr obrany)

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Alexandr Vondra je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr obrany (13. 7. 2010 – 7. 12. 2012); pro odlišení od případných jmenovců je subjekt vymezen právě touto funkcí v přehledu vlády (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jaromír Drábek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jaromír Drábek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr práce a sociálních věcí (13. 7. 2010 – 31. 10. 2012) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Leoš Heger

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Leoš Heger je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zdravotnictví (13. 7. 2010 – 10. 7. 2013, od 17. 6. 2013 v demisi) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Josef Dobeš

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Josef Dobeš je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr školství (13. 7. 2010 – 31. 3. 2012, Věci veřejné) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jiří Pospíšil

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Pospíšil je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr spravedlnosti (13. 7. 2010 – 27. 6. 2012, ODS) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Kamil Jankovský

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Kamil Jankovský je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr pro místní rozvoj (13. 7. 2010 – 10. 7. 2013, od 17. 6. 2013 v demisi, VV) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Tomáš Chalupa

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Tomáš Chalupa je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr životního prostředí (17. 1. 2011 – 10. 7. 2013, od 17. 6. 2013 v demisi, ODS) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jan Kubice

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Kubice je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr vnitra (22. 4. 2011 – 10. 7. 2013, od 17. 6. 2013 v demisi) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Petr Bendl

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Bendl je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zemědělství (6. 10. 2011 – 10. 7. 2013, od 17. 6. 2013 v demisi, ODS); pro odlišení od jmenovců je subjekt vymezen touto funkcí v přehledu vlády (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Martin Kuba

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Kuba je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr průmyslu a obchodu (16. 11. 2011 – 10. 7. 2013, od 17. 6. 2013 v demisi, ODS) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Ivan Fuksa

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ivan Fuksa je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zemědělství (13. 7. 2010 – 4. 10. 2011, ODS) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Jiří Besser

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Besser je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr kultury (13. 7. 2010 – 16. 12. 2011) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Alena Hanáková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Alena Hanáková je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně kultury (20. 12. 2011 – 10. 7. 2013, od 17. 6. 2013 v demisi) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost
vlastníka v této konverzaci pokrýt vládní představitele postupně až do
roku 1989, po pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
Petra Nečase na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na
CORROBORATED i doplnění okolností konce v úřadu či dalších funkcí
vyžaduje otevření dalších zdrojů. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-08: Pavel Dobeš

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Dobeš je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr dopravy (1. 7. 2011 – 3. 12. 2012) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Ludmila Müllerová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ludmila Müllerová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně práce a sociálních věcí (16. 11. 2012 – 10. 7. 2013, od 17. 6. 2013 v demisi) (vláda Petra Nečase). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vladimír Tošovský

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vladimír Tošovský je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr průmyslu a obchodu (8. 5. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Gustáv Slamečka

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Gustáv Slamečka je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr dopravy (8. 5. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Daniela Kovářová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Daniela Kovářová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně spravedlnosti (2009–2010) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Martin Barták

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Barták je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády a ministr obrany (8. 5. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petr Šimerka

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Šimerka je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr práce a sociálních věcí (8. 5. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jakub Šebesta

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jakub Šebesta je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zemědělství (8. 5. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi; 22. 3. – 15. 4. 2010 pověřen i řízením Ministerstva životního prostředí) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Dana Jurásková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Dana Jurásková je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně zdravotnictví (8. 5. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Miroslava Kopicová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Miroslava Kopicová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně školství, mládeže a tělovýchovy (8. 5. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Ladislav Miko

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ladislav Miko je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr životního prostředí (8. 5. 2009 – 30. 11. 2009; přehled u konce působení uvádí demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jan Dusík

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Dusík je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr životního prostředí (30. 11. 2009 – 19. 3. 2010; přehled u konce působení uvádí demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Rut Bízková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Rut Bízková je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně životního prostředí (15. 4. 2010 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Juraj Chmiel

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Juraj Chmiel je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr pro evropské záležitosti (30. 11. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Štefan Füle

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Štefan Füle je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr pro evropské záležitosti (8. 5. 2009 – 30. 11. 2009; přehled u konce působení uvádí demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Michael Kocáb

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Michael Kocáb je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr vlády ČR pro lidská práva a menšiny (23. 1. 2009 – 8. 5. 2009, od 26. 3. 2009 v demisi; druhá vláda Mirka Topolánka) a ministr vlády ČR pro lidská práva (8. 5. 2009 – 29. 3. 2010, Fischerova úřednická vláda); oba vládní přehledy přímo otevřeny, jde ale o téhož vydavatele, takže tvrzení zůstává 1 ZDROJ. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Pavel Zářecký

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Zářecký je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr a předseda Legislativní rady vlády (30. 11. 2009 – 13. 7. 2010, od 25. 6. 2010 v demisi) (Fischerova úřednická vláda). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Mirek Topolánek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Mirek Topolánek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
předseda vlády České republiky (druhá vláda: 9. 1. 2007 – 26. 3. 2009, poté do 8. 5. 2009 v demisi pověřen řízením vlády). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Martin Bursík

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Bursík je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády a ministr životního prostředí (9. 1. 2007 – 8. 5. 2009, od 26. 3. 2009 v demisi; 4. 10. – 4. 12. 2007 pověřen řízením resortu MŠMT) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Ivan Langer

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ivan Langer je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr vnitra a ministr informatiky (9. 1. 2007 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jiří Čunek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Čunek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
1. místopředseda vlády a ministr pro místní rozvoj (9. 1. 2007 – 13. 11. 2007 a znovu 2. 4. 2008 – 23. 1. 2009; přehled u obou období uvádí demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vlasta Parkanová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vlasta Parkanová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně obrany (9. 1. 2007 – 8. 5. 2009, od 26. 3. 2009 v demisi; od 23. 1. 2009 zároveň místopředsedkyně vlády) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Martin Říman

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Říman je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr průmyslu a obchodu (9. 1. 2007 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Tomáš Julínek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Tomáš Julínek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zdravotnictví (9. 1. 2007 – 23. 1. 2009; přehled u konce působení uvádí odvolání — odvolání je politický krok, nikoli závěr o pochybení) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Daniela Filipiová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Daniela Filipiová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně zdravotnictví (23. 1. 2009 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Dana Kuchtová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Dana Kuchtová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně školství, mládeže a tělovýchovy (9. 1. 2007 – 4. 10. 2007; přehled u konce působení uvádí demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Ondřej Liška

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ondřej Liška je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr školství, mládeže a tělovýchovy (4. 12. 2007 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Aleš Řebíček

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Aleš Řebíček je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr dopravy (9. 1. 2007 – 23. 1. 2009; přehled u konce působení uvádí odvolání — odvolání je politický krok, nikoli závěr o pochybení) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petr Gandalovič

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Gandalovič je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zemědělství (9. 1. 2007 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Václav Jehlička

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Václav Jehlička je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr kultury (26. 1. 2007 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Helena Třeštíková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Helena Třeštíková je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně kultury (9. 1. 2007 – 26. 1. 2007; přehled u konce působení uvádí demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Cyril Svoboda

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Cyril Svoboda je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr vlády ČR a předseda Legislativní rady vlády (9. 1. 2007 – 23. 1. 2009), poté ministr pro místní rozvoj (23. 1. 2009 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Pavel Svoboda

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Svoboda je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr vlády ČR a předseda Legislativní rady vlády (23. 1. 2009 – 8. 5. 2009, od 26. 3. 2009 v demisi) (druhá vláda Mirka Topolánka); pro odlišení od jmenovců je subjekt vymezen touto funkcí v oficiálním přehledu vlády. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Džamila Stehlíková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Džamila Stehlíková je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně vlády ČR pro lidská práva a národnostní menšiny (9. 1. 2007 – 23. 1. 2009; přehled u konce působení uvádí demisi) (druhá vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jiří Šedivý

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Šedivý je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr obrany (4. 9. 2006 – 9. 1. 2007) (první vláda Mirka Topolánka); pro odlišení od jmenovců (mj. bývalého náčelníka Generálního štábu AČR) je subjekt vymezen právě touto funkcí v oficiálním přehledu vlády. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vlastimil Tlustý

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vlastimil Tlustý je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr financí (4. 9. 2006 – 9. 1. 2007) (první vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Milena Vicenová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Milena Vicenová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně zemědělství (4. 9. 2006 – 9. 1. 2007) (první vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petr Kalaš

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Kalaš je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr životního prostředí (4. 9. 2006 – 9. 1. 2007) (první vláda Mirka Topolánka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jiří Paroubek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Paroubek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
předseda vlády České republiky (25. 4. 2005 – 16. 8. 2006; vláda podle oficiálního přehledu podala demisi 16. 8. 2006). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Zdeněk Škromach

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Zdeněk Škromach je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády a ministr práce a sociálních věcí (25. 4. 2005 – 16. 8. 2006; 12. 10. – 4. 11. 2005 pověřen i řízením Ministerstva zdravotnictví) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Pavel Němec

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Němec je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády a ministr spravedlnosti (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Milan Šimonovský

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Milan Šimonovský je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády a ministr dopravy (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Martin Jahn

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Martin Jahn je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády pro ekonomiku (25. 4. 2005 – 31. 12. 2005) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: František Bublan

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): František Bublan je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr vnitra (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Milan Urban

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Milan Urban je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr průmyslu a obchodu (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Karel Kühnl

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Karel Kühnl je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr obrany (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petr Zgarba

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Zgarba je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zemědělství (25. 4. 2005 – 10. 11. 2005) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: David Rath

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): David Rath je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zdravotnictví (4. 11. 2005 – 16. 8. 2006); rozsah je výhradně tato vládní funkce — pozdější trestní kauza z doby hejtmanství není tímto záznamem autorizována a vyžadovala by samostatnou autorizaci (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petra Buzková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petra Buzková je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně školství, mládeže a tělovýchovy (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Libor Ambrozek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Libor Ambrozek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr životního prostředí (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vítězslav Jandák

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vítězslav Jandák je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr kultury (17. 8. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Radko Martínek

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Radko Martínek je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr pro místní rozvoj (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Dana Bérová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Dana Bérová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně informatiky (25. 4. 2005 – 16. 8. 2006) (vláda Jiřího Paroubka). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Milada Emmerová

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Milada Emmerová je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně zdravotnictví (4. 8. 2004 – 25. 4. 2005 ve vládě Stanislava Grosse a 25. 4. 2005 – 12. 10. 2005 ve vládě Jiřího Paroubka); oba vládní přehledy přímo otevřeny, jde ale o téhož vydavatele, takže tvrzení zůstává 1 ZDROJ. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jaroslav Palas

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jaroslav Palas je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zemědělství (4. 8. 2004 – 25. 4. 2005) (vláda Stanislava Grosse). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vladimír Mlynář

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vladimír Mlynář je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr informatiky (15. 7. 2002 – 4. 8. 2004 ve vládě Vladimíra Špidly a 4. 8. 2004 – 25. 4. 2005 ve vládě Stanislava Grosse); oba vládní přehledy přímo otevřeny, jde ale o téhož vydavatele, takže tvrzení zůstává 1 ZDROJ. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jaroslav Bureš

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jaroslav Bureš je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr spravedlnosti (2. 2. 2001 – 12. 7. 2002, vláda Miloše Zemana) a ministr a předseda Legislativní rady vlády (4. 8. 2004 – 25. 4. 2005, vláda Stanislava Grosse); oba vládní přehledy přímo otevřeny, jde ale o téhož vydavatele, takže tvrzení zůstává 1 ZDROJ. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Vladimír Špidla

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vladimír Špidla je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
předseda vlády České republiky (15. 7. 2002 – 4. 8. 2004). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Pavel Rychetský

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Rychetský je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády a předseda Legislativní rady vlády (22. 7. 1998 – 12. 7. 2002, vláda Miloše Zemana), místopředseda vlády (15. 7. 2002 – 4. 8. 2004) a ministr spravedlnosti (15. 7. 2002 – 5. 8. 2003) ve vládě Vladimíra Špidly; oba vládní přehledy přímo otevřeny, jde ale o téhož vydavatele, takže tvrzení zůstává 1 ZDROJ; pozdější působení v čele Ústavního soudu není tímto záznamem pokryto. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Petr Mareš

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Petr Mareš je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
místopředseda vlády pro výzkum a vývoj, lidská práva a lidské zdroje (15. 7. 2002 – 4. 8. 2004) (vláda Vladimíra Špidly). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jaroslav Tvrdík

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jaroslav Tvrdík je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr obrany (15. 7. 2002 – 9. 6. 2003; přehled uvádí demisi 3. 6. 2003) (vláda Vladimíra Špidly). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Miroslav Kostelka

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Miroslav Kostelka je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr obrany (9. 6. 2003 – 4. 8. 2004) (vláda Vladimíra Špidly). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Jozef Kubinyi

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jozef Kubinyi je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministr zdravotnictví (14. 4. 2004 – 4. 8. 2004) (vláda Vladimíra Špidly). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Marie Součková

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Marie Součková je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
ministryně zdravotnictví (15. 7. 2002 – 14. 4. 2004) (vláda Vladimíra Špidly). Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-08: Miloš Zeman

Authorized by the site owner, explicitly and on the record, 2026-08-08:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Miloš Zeman je politicky
exponovaná osoba v souvislosti s výkonem dřívější veřejné funkce —
předseda vlády České republiky (22. 7. 1998 – 12. 7. 2002); rozsah je výhradně tato vládní funkce — pozdější prezidentské období (2013–2023) není tímto záznamem autorizováno a vyžadovalo by samostatnou autorizaci. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt vládní představitele postupně až do roku 1989, po
pěti.

Rozsah tohoto dossieru je záměrně minimální: základní biografický
záznam dřívější vládní funkce doložený oficiálním přehledem členů vlády
na vlada.gov.cz. Tvrzení nese stav 1 ZDROJ; povýšení na CORROBORATED i
doplnění okolností konce v úřadu či dalších funkcí vyžaduje otevření
dalších zdrojů. Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.


### Scope extension, 2026-08-09: Vlastimil Válek — ministerské období (léková krize)

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): rozšíření AUTH-2026-08-07-VLASTIMIL-VALEK a AUTH-2026-08-08-VLASTIMIL-VALEK. Vlastimil Válek byl 2021–2025 místopředsedou vlády a ministrem zdravotnictví. Dřívější autorizace omezovaly dossier na jeho aktuální poslanecký profil a výslovně vylučovaly rešerši ministerského období. Tato autorizace rozšiřuje rozsah na jedno konkrétní, dokumentované téma jeho ministerského období, nalezené na úrovni search-výsledku a doložené dvěma přímo otevřenými a přečtenými zdroji před sepsáním tohoto záznamu.

Rozsah zahrnuje: **krizi s výpadky léků (zejména penicilinových antibiotik) 2022–2023 a její politické a legislativní řešení** — trvající nedostatek antibiotik, antipyretik a onkologických léků; opoziční kritiku jeho postupu včetně publikovaných výzev k rezignaci (Schillerová) a výroků Babiše; jeho vlastní publikovaná vyjádření a sliby (dodávky penicilinu, aplikace pro dostupnost léků); a vládní novelu o léčivech (povinnost výrobců dodávat po nahlášení výpadku, měsíční zásoby distributorů, hlášení lékáren) s publikovanou opoziční kritikou její dostatečnosti (Farhan, Maříková). Přímo otevřené zdroje: Seznam Zprávy (10. 5. 2023) a ČT24 (29. 8. 2023).

Povinné rámování: výpadky léků byly dle citovaného zpravodajství celoevropský jev s příčinami mimo ČR (výpadky výroby v Číně a Indii) — kritika opozice i obhajoba ministra a koalice se citují jako pozice, ne jako zjištění; žádný citovaný zdroj netvrdí protiprávní jednání ministra a nic takového nesmí být naznačeno. Každý další zdroj musí být před napsáním tvrzení přímo otevřen a přečten; status tvrzení dle validátorových pravidel. Tato autorizace nepokrývá žádné jiné téma jeho ministerského období (vč. zmíněného SÚKL či VZP) — to by vyžadovalo samostatnou budoucí autorizaci.


### Scope extension, 2026-08-09: Jiří Pospíšil — ministerské období (odvolání 2012)

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): rozšíření AUTH-2026-08-07-JIRI-POSPISIL. Jiří Pospíšil byl ministrem spravedlnosti 2006–2009 a 2010–2012. Dřívější autorizace omezovala dossier na aktuální politický profil. Tato autorizace rozšiřuje rozsah na jedno konkrétní, dokumentované téma: **jeho odvolání z funkce ministra spravedlnosti 27. 6. 2012** — odvolání prezidentem Klausem na návrh premiéra Nečase, oficiálně uváděné důvody (ztráta důvěry v manažerské a rozpočtové řízení resortu, žádost o navýšení rozpočtu během úsporných opatření), Pospíšilova publikovaná reakce („Respektuji jeho rozhodnutí…“), a dobově reportovaný kontext: odvolání přišlo krátce po návrhu nejvyššího státního zástupce Zemana jmenovat Lenku Bradáčovou vrchní státní zástupkyní v Praze, což část politiků (nejotevřeněji Schwarzenberg) veřejně spojovala se zákulisním sporem o podobu státního zastupitelství. Přímo otevřené zdroje: Deník.cz (27. 6. 2012), Patria.cz (27. 6. 2012), e15.cz (28. 6. 2012 — komentář, cituje se výhradně jako NÁZOR).

Povinné rámování: oficiální důvody a alternativní výklady se citují vedle sebe jako pozice, ne jako zjištění — tento web nerozhoduje, proč byl ministr odvolán. Odvolání člena vlády je ústavní pravomoc, ne pochybení odvolaného; žádný citovaný zdroj netvrdí protiprávní jednání Pospíšila a nic takového nesmí být naznačeno. Lenka Bradáčová, Pavel Zeman ani Vlastimil Rampula se touto autorizací nestávají subjekty — vystupují jen jako záznam vazby v rozsahu citovaného zpravodajství. Jiná témata jeho ministerských období vyžadují samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: František Koudela

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): František Koudela je
veřejný funkcionář — starosta města Znojma (ODS), zvolený zastupitelstvem
5. 8. 2024 po odvolání dosavadní starostky, dříve ředitel organizace
Znojemská Beseda. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah: aktuální mandát a funkce starosty dle oficiálního webu města
(znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo otevřeno); okolnosti
změny vedení radnice v srpnu 2024; jeho citovaná reakce na tvrzení hnutí
ANO o nabídkách úplatků koaličním zastupitelům (červenec 2024) — tvrzení
o úplatcích jsou výhradně atribuovaná tvrzení stran sporu, nikdo nebyl
obviněn a nic z nich se nepřijímá za závěr webu (gate 4). Rozšíření
rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Bohumila Beranová

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Bohumila Beranová je
veřejná funkcionářka — statutární místostarostka města Znojma (Znojmáci).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah: aktuální mandát a funkce dle oficiálního webu města (znojmocity.cz,
přímo otevřeno) a ČT24/ČTK (přímo otevřeno); její role při změně koalice
v srpnu 2024 — přechod od koalice ANO+SPD+Znojmáci k nové koalici — s jejím
vlastním zdůvodněním („koalice nefungovala") vedeným jako atribuovaný výrok.
Žádné pochybení se z přechodu mezi koalicemi nevyvozuje. Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Jiří Kacetl

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Kacetl je veřejný
funkcionář — místostarosta města Znojma (PRO ZNOJMO), zvolený zastupitelstvem
5. 8. 2024. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce místostarosty dle
oficiálního webu města (znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo
otevřeno). Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Jakub Malačka

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jakub Malačka je veřejný
funkcionář — místostarosta města Znojma (Naše Znojmo), zvolený zastupitelstvem
5. 8. 2024. Autorizace navazuje na výslovnou žádost vlastníka v této
konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah: aktuální mandát a funkce místostarosty dle oficiálního webu města
(znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo otevřeno); jeho ČT24
citované hodnocení hospodaření města (ztráta 71 mil. Kč, „nejhorší za
13 let") vedené jako atribuovaný výrok opozičního politika, nikoli jako
vlastní závěr webu. Rozšíření rozsahu vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Ivana Solařová

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Ivana Solařová je veřejná
funkcionářka — zastupitelka města Znojma (ANO 2011), starostka města od
komunálních voleb 2022 do 5. 8. 2024, kdy ji zastupitelstvo odvolalo.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah: aktuální mandát dle oficiálního webu města (znojmocity.cz, přímo
otevřeno); okolnosti jejího odvolání 5. 8. 2024 dle ČT24/ČTK (přímo
otevřeno). Povinné rámování při každé zmínce: odvolání starostky je
politický krok zastupitelstva, nikoli závěr o pochybení; kritika hospodaření
města je atribuovaná kritika tehdejší opozice. Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Bert Bartas

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Bert Bartas je veřejný
funkcionář — zastupitel města Znojma (Znojmáci). Autorizace navazuje na
výslovnou žádost vlastníka v této konverzaci pokrýt celé znojemské
zastupitelstvo a navázané kauzy.

Rozsah: aktuální mandát dle oficiálního webu města (znojmocity.cz, přímo
otevřeno); jeho postoj při změně vedení radnice 5. 8. 2024 dle ČT24/ČTK
(přidal se k odvolání, nepodpořil volbu nového vedení, nepodepsal koaliční
smlouvu); a skutečnost, že podle tvrzení hnutí ANO z července 2024 měl
dostat „v podstatě korupční nabídky", k čemuž se dle ČT24 odmítl vyjádřit.
Povinné rámování: tvrzení o nabídkách je výhradně atribuované tvrzení
jedné strany sporu, nikdo nebyl obviněn, Bartas není z ničeho podezřelý
ani obviněný a z jeho mlčení se nic nevyvozuje (gate 4). Rozšíření rozsahu
vyžaduje samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Jan Šťastník

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Šťastník je veřejný funkcionář — zastupitel města Znojma (dle oficiálního webu města Naše Znojmo) a člen rady města; podle ČT24/ČTK podpořil v srpnu 2024 jako nezařazený zastupitel (zvolený za ANO) vznik nové koalice a byl zvolen radním — vývoj příslušnosti je doložen dvěma zdroji s různými daty a uvádí se bez hodnocení.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo otevřeno, změna
vedení radnice 5. 8. 2024). Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-09: Pavel Jajtner

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Pavel Jajtner je veřejný funkcionář — zastupitel města Znojma (ODS + KDU-ČSL SPOLU, dle ČT24 nominován KDU-ČSL), 5. 8. 2024 zvolen členem rady města.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo otevřeno, změna
vedení radnice 5. 8. 2024). Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-09: Alena Paulenková

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Alena Paulenková je veřejná funkcionářka — zastupitelka města Znojma (PRO ZNOJMO), 5. 8. 2024 zvolena členkou rady města.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo otevřeno, změna
vedení radnice 5. 8. 2024). Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-09: Blanka Dufková

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Blanka Dufková je veřejná funkcionářka — zastupitelka města Znojma (Naše Znojmo), 5. 8. 2024 zvolena členkou rady města.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo otevřeno, změna
vedení radnice 5. 8. 2024). Rozšíření rozsahu vyžaduje samostatnou budoucí
autorizaci.

### Scope extension, 2026-08-09: Vlastimil Tima

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Vlastimil Tima je veřejný funkcionář — zastupitel města Znojma (Naše Znojmo), 5. 8. 2024 zvolen členem rady města.
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno) a ČT24/ČTK (přímo otevřeno, změna vedení radnice 5. 8. 2024). Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Jiří Beroun

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Beroun je veřejný funkcionář — zastupitel města Znojma (Naše Znojmo).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Jan Blaha

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Blaha je veřejný funkcionář — zastupitel města Znojma (ANO 2011).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Karel Blahůšek

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Karel Blahůšek je veřejný funkcionář — zastupitel města Znojma (ANO 2011).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Lukáš David

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Lukáš David je veřejný funkcionář — zastupitel města Znojma (PRO ZNOJMO).
Autorizace navazuje na výslovnou žádost vlastníka v této konverzaci pokrýt
celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát a funkce dle oficiálního webu
města (znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje
samostatnou budoucí autorizaci.

### Scope extension, 2026-08-09: Jiří Jordán

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jiří Jordán je veřejný funkcionář —
zastupitel města Znojma (ANO 2011). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát dle oficiálního webu města
(znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-09: Radomír Kaman

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Radomír Kaman je veřejný funkcionář —
zastupitel města Znojma (ANO 2011). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát dle oficiálního webu města
(znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-09: Jan Kauer

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jan Kauer je veřejný funkcionář —
zastupitel města Znojma (ANO 2011). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát dle oficiálního webu města
(znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-09: Miroslav Kavka

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Miroslav Kavka je veřejný funkcionář —
zastupitel města Znojma (ODS + KDU-ČSL SPOLU). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát dle oficiálního webu města
(znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje samostatnou
budoucí autorizaci.

### Scope extension, 2026-08-09: Jana Kochová

Authorized by the site owner, explicitly and on the record, 2026-08-09:

Standing scope (AUTH-2026-08-05-PLATFORM-SCOPE): Jana Kochová je veřejná funkcionářka —
zastupitelka města Znojma (ANO 2011). Autorizace navazuje na výslovnou žádost vlastníka
v této konverzaci pokrýt celé znojemské zastupitelstvo a navázané kauzy.

Rozsah je záměrně minimální: aktuální mandát dle oficiálního webu města
(znojmocity.cz, přímo otevřeno). Rozšíření rozsahu vyžaduje samostatnou
budoucí autorizaci.
