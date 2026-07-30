# Working in this repository

A Zola static site whose core feature is a general framework for neutral,
source-cited "dossiers" about publicly reported controversies of public
figures. Which dossiers exist is **not stated here on purpose**: they live
in `data/dossiers.toml`, and every template, validator and navigation node
is driven from that registry — a count written into prose would be a
constant nobody recalculates. The live list is at `/dossiers/`; the
authorized scope for each subject is the append-only log at the end of this
file. Read this file in full before changing content, templates, the
dossier data model, or scope.

## Dossier framework (general — applies to any current or future dossier)

### Entity dossiers vs. the aggregate view

A dossier's `dossier_type` (declared in `data/dossiers.toml`, and
mirrored in its own `_index.md` front matter for templates that read it
directly) is one of:

- **`entity`** — a real, primary-navigation-worthy dossier about exactly
  one person (`petr-macinka`, `filip-turek`). It owns no physical
  claim/source/case/gap/relation files of its own — every registry it
  shows (`.../claims/`, `.../sources/`, `.../cases/`, `.../gaps/`,
  `.../relations/`, `.../entities/`, `.../evidence/`) is a *generated,
  filtered projection* over the canonical dossier's own already-validated
  records, filtered by that record's `subjects` array (see below). This
  is what makes it possible for Petr Macinka and Filip Turek to each have
  a complete, independently-routable dossier without a single claim,
  source, case, gap, or relation ever being physically duplicated.
- **`aggregate`** — a generated intersection/rollup over two or more
  entity dossiers (currently `macinka-turek`, over `petr-macinka` and
  `filip-turek`). It is **not** a third person and **not** a third equal
  dossier: `show_in_primary_navigation = false` in `data/dossiers.toml`,
  it never appears as a peer of the entity dossiers in
  `data/navigation.toml`, and `scripts/dossier/validate-navigation.mjs`
  fails the build if it ever does. It stays routable at its existing URL
  (`/dossiers/macinka-turek/`) for old links/anchors, and its page header
  explicitly says so — see `templates/dossier.html`'s aggregate-notice
  block.

**Where the physical content actually lives.** Zola gives every content
file exactly one URL. This site's canonical claim/source/case/gap/
relation detail pages predate the entity-dossier split and already have
real, bookmarked, cross-referenced URLs under
`content/dossiers/macinka-turek/...` — moving that physical content to a
third, "neutral" location would satisfy "the aggregate owns no records"
in the abstract, but would break every existing canonical URL and anchor,
which this framework treats as a hard backward-compatibility requirement
(see "Old URLs" below). So the canonical files stay physically where they
already were; `petr-macinka` and `filip-turek` are the dossiers with zero
duplication, not `macinka-turek`. `scripts/dossier/validate-dossier-types.mjs`
enforces the invariant that actually matters given this constraint: an
entity dossier must own **zero** physical per-record files — every one it
shows must resolve to a real detail page under its `canonical_dossier`.

**Subject tagging.** Every claim, source, case, gap, entity, and relation
under the canonical dossier carries a `subjects` array (`["macinka"]`,
`["turek"]`, or both) stamped by `scripts/dossier/tag-subjects.mjs` —
an editorial judgment of who the record is actually about, not something
mechanically derivable from `graph.toml` alone (see that script's own
docstring for the reasoning behind each classification). Global entities
(`content/entities/*.md`) instead extend their existing `dossiers` array
to include the entity-dossier slug(s) they belong to. `[[extra.cases]]`
and `[[extra.timeline]]` entries in the canonical dossier's own
`_index.md` carry the same `subjects` field directly, since those are
TOML arrays in front matter, not separate content pages.

### Routing: one namespace per dossier

Every dossier lives under `content/dossiers/<dossier-slug>/`, routed at
`/dossiers/<dossier-slug>/...`. `content/dossiers/_index.md` is the
registry-of-dossiers landing page (`/dossiers/`) — it lists every
authorized dossier by looping over `content/dossiers/*/`, splitting them
into entity dossiers (primary cards) and aggregate views (their own,
clearly-labeled section) by `dossier_type`. The three dossiers live today
are `content/dossiers/petr-macinka/`, `content/dossiers/filip-turek/`
(entity) and `content/dossiers/macinka-turek/` (aggregate, and the
physical home of the canonical records — see above).

No template hardcodes a dossier slug. Every dossier-scoped template reads
its own dossier root from front matter (`page.extra.dossier` on a detail
page, `section.extra.dossier` on a registry index) and builds sibling
paths from it, e.g. `get_url(path="@/dossiers/" ~ dossier_slug ~
"/sources/_index.md")`. The primary navigation is likewise **generated,
not hand-curated**: `data/navigation.toml` is a dossier-free skeleton
(top-level items, the per-dossier registry template, icons) and
`scripts/dossier/build-navigation.mjs` compiles it together with
`data/dossiers.toml` and the registry sections that actually exist on
disk into `data/generated/navigation.json`, which is what
`templates/base.html` renders. Consequences, enforced by
`scripts/dossier/validate-navigation.mjs` (and cross-checked by
`validate-dossier-types.mjs`):

- **No person is ever a top-level sidebar item.** Every dossier hangs
  under "Dossiery" as its own subtree; entity dossiers get an expandable
  tree of their registries, an aggregate view stays a single, clearly
  labelled link with no subtree of its own.
- The skeleton must stay dossier-free — a slug hand-written into
  `data/navigation.toml` fails the build.
- A third authorized *person* needs **no** navigation edit at all: adding
  the dossier to `data/dossiers.toml` puts it in the tree. Same for
  adding or removing one of its registries.
- Every generated node must have a label, an icon and a route that
  exists on disk.

The same generated tree feeds the `SiteNavigationElement` JSON-LD nodes
in `templates/partials/jsonld.html`, so structured data and sidebar can
never drift apart.

Per-dossier generated/data files live under `data/dossiers/<slug>/`
(`graph.toml`, `updates.toml`, the build-generated `stats.toml`) for the
same reason — nothing dossier-specific sits at a flat top-level path.
Entity dossiers get a real `stats.toml` too, computed by
`scripts/dossier/generate-stats.mjs` as filtered counts over the
canonical dossier's records, not a directory listing of their own (empty)
registry directories.

### Data model: four linked registries, each independently routable

Every dossier (`content/dossiers/<slug>/_index.md`) is built on four
cross-referenced registries. Each registry has an index page
(`.../<registry>/_index.md`) and **one real Zola page per record** — not
just a row in a table. The overview table/cards on the main dossier page
and the per-record pages are two views of the *same* data: the table is
authored by hand (it's what an editor actually edits), the per-record
pages are derived from it, and `scripts/dossier/validate-dossier.mjs`
fails the build if they ever disagree — see "Two representations, one
source of truth" below.

- **Claims registry (`CLM-##`)** — `.../claims/clm-NN.md`, one page per
  claim, plus the overview row on the main dossier page (anchor `<a
  id="clm-NN"></a>`, now itself a link to the claim's detail page).
  Front matter: `clm_id`, `status`, `status_label`, `summary` (must be
  byte-identical to the overview row's claim text), `sources` (the
  `SRC-##` it cites). Statuses:
  - `status-corroborated` ("CORROBORATED") — independently confirmed by
    multiple outlets. `validate-dossier.mjs` enforces ≥2 distinct cited
    sources for this status; sources from one publisher family still
    don't count as independent (see the sources-index independence note).
  - `status-single` ("1 ZDROJ") — a factual claim supported by exactly
    one cited source, honestly labeled as such instead of being
    overstated as corroborated. The validator enforces exactly one cited
    source. Upgrading to CORROBORATED requires adding a second,
    genuinely independent source — never just relabeling.
  - `status-quote` ("CITACE") — a direct quote from the subject, presented
    as a quote, not this site's own assessment
  - `status-disputed` ("SPORNÉ") — open, unconfirmed, or contested claim
  - `status-opinion` ("NÁZOR") — authored commentary, kept structurally
    separate from reporting
- **Sources registry (`SRC-##`)** — one page per source under
  `.../sources/src-NN.md`. Front matter: `src_id`, `outlet`, `src_type`,
  `url`, `retrieved`, `published`, `claims` (the CLM-## it supports). The
  registry index notes which sources share a publisher ("source family" —
  not independent corroboration) versus which are genuinely independent
  outlets.
- **Cases registry (`CASE-##`)** — one page per tracked case under
  `.../cases/case-NN.md`, mirroring the `[[extra.cases]]` array in the
  main dossier page's front matter (`anchor`, `period`, `title`, `status`,
  `label`, `summary`). Detail pages deliberately do **not** duplicate the
  full narrative — they link back to the canonical prose section by
  anchor, so the most sensitive case text (e.g. the domestic-violence
  case) only ever exists in one editable place.
- **Gaps registry (`GAP-##`)** — one page per open question under
  `.../gaps/gap-NN.md`. Front matter: `gap_id`, `priority`
  (`vysoká`/`nízká`), `checked` (last-verified date), `claims`. Being
  listed as open is not a finding either way — it means the cited sources
  don't yet support a conclusion.

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
Vynucení: `validate-dossier.mjs` (povinná pole + min. délka body
zdroje), `verify-full-pages.mjs` (sekce v hotovém HTML) a
`verify-jsonld.mjs` (Claim uzel na každé stránce tvrzení, citační uzel
na každé stránce zdroje) — vše součást `npm run build`. Adoptér, který
tyto kontroly vypne, se nemůže hlásit k tomuto datovému modelu.

#### Two representations, one source of truth

The claims table and case-cards on the main dossier page stay
hand-authored (that's what an editor actually edits); the per-record
pages under `claims/` and `cases/` are a second, generated-and-checked
representation of the same facts. `scripts/dossier/validate-dossier.mjs`
fails the build if a claim/case page's status, text, or source list
differs at all from its counterpart in the overview table/front-matter
array, or if the counts don't match 1:1 in both directions.
`scripts/dossier/generate-stats.mjs` derives the tile counts from the
actual per-record page count on disk (not the table), and separately
throws if that count disagrees with the table/array count — this check
also runs under `npm run dev`, which doesn't run the full validator. If
you ever hand-edit the overview table or `[[extra.cases]]`, re-run
`scripts/dossier/migrate-claims-to-pages.mjs` /
`migrate-cases-to-pages.mjs` to regenerate the matching detail pages
before building.

Every anchor/link is additionally enforced by two more build-time
scripts:

- `scripts/dossier/validate-dossier.mjs` — checks the source Markdown:
  every CLM-##/GAP-## row has a real anchor, every SRC-##/CLM-## reference
  resolves, no duplicate IDs.
- `scripts/dossier/verify-anchors.mjs` — runs after `zola build`; checks
  that every anchor and every `extra.cases`/`extra.timeline` reference in
  the source actually resolves to a real `id` in the built HTML (Zola's
  own link checker doesn't validate hand-written `id="..."` attributes).

Both run as part of `npm run build` (the exact sequence CI runs too).
Never wave past a failure here — a broken anchor or an unsourced claim is
a real defect, not lint noise.

#### Old URLs

The dossier used to live at `/dossier/...` (singular, no slug). Every
migrated page carries an `aliases` front-matter entry pointing at its old
`/dossier/...` URL, so old links and bookmarks redirect rather than 404.
Zola's generated alias page reads `window.location.hash` and appends it
to the redirect target, so old `#clm-NN`-style fragment links still land
on the exact anchor after the redirect, not just at the top of the page.

### Templates

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
- `templates/base.html` — shared layout; all `<meta>` (title, description,
  canonical, Open Graph) is declared once in front matter and rendered
  once here — do not hand-write `<meta>` tags elsewhere. It also carries the
  site-wide footer (licence, "navrhnout opravu"); page-level footers must not
  repeat those links.
- `templates/macros/table.html` — jednotná komponenta pro tabulární data
  (`table::advanced_table` / `table::advanced_table_end`; vlastní
  implementace podle vzoru Flowbite „Advanced Tables" nad volným
  Tailwindem/Flowbite). Každá `<table>` v šablonách jde přes ni — vynucuje
  `npm run lint:component-reuse`; obal nese `data-record-type` provazující
  řádky tabulky s JSON-LD uzly, které stránka už vydává. Data tabulek
  pocházejí ze stejných front-matter/data zdrojů jako JSON-LD `@graph`;
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

## Authorizing a new dossier subject or expanding scope

The default is to cover no one. Adding a new subject, or expanding an
existing subject's scope to a new controversy, requires an explicit,
dated authorization from the site owner, recorded in this file — never
assumed silently, and never inferred just because a topic is "publicly
interesting." An authorization must state exactly: who, which specific
controversies/topics, and that coverage is limited to what named,
reputable, independent sources have already published. It never
automatically extends to further named third parties beyond what the
cited reporting itself discloses.

**Process for the next authorization**: when the site owner authorizes a
new subject or scope extension on the record, append a new dated
subsection to the "Content about real parties" log below — do not edit or
remove prior entries. Each entry is a permanent, auditable record of what
was actually approved and when.

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

Metadata (title, description, canonical, Open Graph) is declared once in
front matter and rendered once in `templates/base.html`. Do not hand-write
`<meta>` tags in other templates.

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
