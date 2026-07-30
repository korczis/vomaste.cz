# Baseline audit informační architektury (workbench mise, 2026-07-30)

**Kontext**: povinný § 0.5 auditu z
[master promptu](../missions/2026-07-30-workbench-master-prompt.md).
Navazuje na Phase-A audit v
[`docs/adr/application-shell-rebuild.md`](../adr/application-shell-rebuild.md)
(co už z cílové IA platí — data-driven navigace, 6 root položek, žádná
osoba na rootu, žádné hardcoded slugy, Flowbite drawer, no-JS fallback,
component-reuse gate) a nedubluje ho. Zde jsou **měřené** nálezy vad,
které mise musí odstranit. Baseline commit: `d482f2e` (po merge T-010).

## 1. Plýtvání viewportem a čtecí max-width na datových stránkách

Měřeno grepem přes `templates/*.html` (počty výskytů):

- `max-w-6xl` (1152 px) ×12, `max-w-5xl` ×8 — hlavní obsahové zástropování
  včetně workbench stránek (registry, dossier overview). Na 1920 px
  monitoru zůstává ≈ 40 % šířky trvale prázdných; na 1440 px ≈ 20 %.
- `max-w-2xl` ×11, `max-w-3xl` ×9, `max-w-xl` ×8 — čtecí sloupce použité
  i pro popisy a metriky uvnitř datových pohledů.
- Vertikální whitespace marketingového měřítka na datových stránkách:
  `py-12` ×26, `mb-12` ×24, `mb-10` ×20, `py-20` ×8, `py-16` ×8,
  `py-24` ×1, `py-28` ×1. První datový řádek registru je tak na
  desktopu typicky až za headerem + hero blokem + intro odstavcem.

## 2. Karty tam, kde má být tabulka

- `ui::registry-card` grid je primární pohled na 10+ šablonách
  (`dossiers-index`, `entities-index`, `dossier-claims-index`,
  `dossier-gaps-index`, `dossier-evidence`, `concepts-index`, …).
- Jednotnou hustou tabulku (`table::advanced_table`, zavedeno
  2026-07-30) používá zatím jen 7 šablon — koexistence dvou modelů bez
  pravidla, kdy který.
- Karty nesou dlouhé texty tvrzení, ale neumožňují srovnání po
  sloupcích (status, počet zdrojů, mezery, reviewed) ani sorting.

## 3. Chybějící workbench interakce (potvrzeno Phase-A auditem, trvá)

- Žádný inspector / master-detail — drill-down = nová stránka, ztráta
  filtru a scroll pozice.
- Žádný jednotný filter model; filtry jsou per-stránka (Alpine
  `advancedTable` search je zatím jediná lokální výjimka).
- Žádný adresovatelný stav: query parametry se nikde nečtou ani
  nezapisují — reload nebo sdílení URL ztrácí pohled.
- Žádný command bar / globální search UI (build-time
  `static/search-index.json` s 207 záznamy existuje, ale žádné UI ho
  nekonzumuje).
- Globální mapa není full-viewport workbench (má hero-styl header a
  zástropovaný canvas).

## 4. Navigace

- Root úroveň je v pořádku (6 položek, generovaná) — viz Phase-A audit.
- Sidebar ale renderuje **všechny** dossiery a všech 28 registry linků
  současně (`navigation.json` má plně rozbalený strom) — chybí
  kontextové rozbalení jen aktivního dossieru.
- Mobile = tentýž strom v draweru; žádná bottom navigation, kontextová
  navigace dossieru vyžaduje scroll dlouhým stromem.

## 5. Datová vrstva — co už je single source of truth a co ne

Už vyřešeno (nezačínat znovu, navázat):

- Jeden front-matter parser pro flat JSON i JSON-LD exporty:
  `scripts/dossier/lib/record-tables.mjs` (T-010).
- Generované: navigace, stats.toml, routes.json, search-index.json,
  flat tabulky `/data/*.json`, `/data/dossiers/<slug>.jsonld`,
  `/data/graph.jsonld`, jsonld-manifest s sha256, citační otisky,
  global-graph.json, government roster. Souhrnné počty na stránkách
  čtou generované stats.toml — ručně psané počty nebyly nalezeny.
- Gate: validate:dossier/graph/authorization/dossier-types/navigation,
  verify:anchors/jsonld/full-pages/export, lint:component-reuse.

Skutečné mezery:

- **Žádná JSON Schema vrstva** — front matter kontrakty vynucují ad-hoc
  regex validátory; pole používaná šablonou bez validátoru odhalí až
  runtime šablony (přesně případ, který zachytil „three places" rule).
- **Žádný jednotný view-model** — každá šablona si skládá vlastní
  projekce Tera logikou; client-side (sql-console, graf, budoucí
  filtry) nemá repository/query vrstvu, jen izolované moduly.
- **Source families**: koncept existuje v graph.toml
  (`source_families`), ale registry zdrojů ho nezobrazuje a nikde se
  nerozlišuje „N zdrojů" vs. „N nezávislých rodin".
- **`build-global-graph.mjs` přeskakuje graph.toml self-canonical
  entity dossierů** (podmínka na `dossier_type == "entity"` z doby, kdy
  entity dossiery graph nevlastnily) — grafy Klempíře a Schillerové
  proto chybí v globální mapě (node_count 0 v katalogu). Reálná datová
  vada — opraveno v T-017 (build-global-graph rozhoduje podle fyzické existence graph.toml).
- JSON-LD: exporty + embedded markup existují (T-002/T-010), ale
  neexistuje referenční validace „všechna `@id` resolvují proti
  routám" (verify:export kontroluje hash/parse/zákazy/otisky, ne
  referenční uzavřenost vůči routes.json).

## 6. Mobile

- Mobilní layout je dnes zmenšený desktop: card-grid 1 sloupec,
  drawer s plným stromem; žádná bottom nav, žádné sheet detaily,
  tabulky spoléhají na lokální overflow-x.
- Touch targety v tabulkách a sidebar položkách nejsou auditované
  proti 44×44 px.

## 7. Testy a enforcement prezentační vrstvy

- `npm test` pokrývá jen Node skripty (13+ testů tooling vrstvy).
- Žádný Playwright/axe/responsive/screenshot test — rozbitý mobile
  viewport nebo overflow dnes žádný gate nezachytí.
- Density pravidla neexistují (žádné tokeny, žádný lint na
  `py-20`-styl mezery v workbench šablonách).

## 8. Odchylky master promptu od reality (poctivě)

- Prompt jmenuje **Cytoscape.js**; repo používá **Sigma.js +
  Graphology** (`docs/adr/graph-renderer.md`). Zachováváme Sigma —
  výměna renderer knihovny bez měřené potřeby by porušila ADR
  disciplínu; duch požadavku (graf jako projekce týchž dat, inspector,
  filtry, permalink) je na Sigma implementovatelný.
- Prompt navrhuje `scripts/data/compile-dataset.mjs` a
  `static/data/generated/*` — repo už má `scripts/dossier/` konvenci a
  `/data/*.json(ld)` routy nasazené; compiler fáze je proto
  **konsolidace existujících generátorů nad sdílený view-model**, ne
  nový strom výstupů (žádný druhý dataset, § 1.4).
- DuckDB-Wasm už v repu je (lazy, opt-in SQL konzole,
  `docs/adr/duckdb-wasm-and-sigma.md`) — rozhodnutí „lehká query vrstva
  + dokumentované rozhraní" zůstává platné pro registry filtry; ADR se
  aktualizuje v query-layer fázi.

## Závěr

Hlavní dluh není v datové vrstvě (ta je z velké části hotová a
gate-ovaná), ale v **prezentační a interakční vrstvě**: čtecí layout na
datových stránkách, card-grid místo tabulek, žádný master-detail, žádný
URL stav, žádné UI testy. Dekompozice na board tasky:
`docs/coop/TASKS.md` (T-011…T-015 revidované + T-017…T-021).
