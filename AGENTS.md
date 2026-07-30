# Working in this repository

A Zola static site whose core feature is a general framework for neutral,
source-cited "dossiers" about publicly reported controversies of public
figures — currently instantiated with two entity dossiers, Petr Macinka
and Filip Turek, plus a generated aggregate view over both. Read this in
full before changing content, templates, the dossier data model, or
scope.

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
  targeted dependency here, used the same way as Chart.js/Cytoscape.js:
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
