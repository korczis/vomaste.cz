# Mise: škálovatelný Sigma.js + Graphology graph workbench

**Datum zadání**: 2026-08-01 · **Zadavatel**: vlastník webu (on the record,
v konverzaci s ORCH session) · **Stav**: dekomponováno na coop board
(`docs/coop/TASKS.md`, T-027) · **Baseline audit**:
[`docs/audits/graph-workbench-baseline.md`](../audits/graph-workbench-baseline.md)

Tento soubor uchovává vlastníkův master prompt doslovně, aby na něj mohly
navazovat další worker sessions bez ztráty kontextu. Jde o **technickou
misi nad renderovací a datovou vrstvou globální/lokální grafové mapy** —
žádná změna redakčního významu, žádný nový obsahový scope, autorizační
log v `AGENTS.md` se nemění (§ 2.1 promptu).

Známé odchylky promptu od reality repa (poctivě, měřeno auditem):

- Prompt v § 0.1 formuluje zadání jako rozhodnutí "zachovej Sigma.js 3,
  nepřecházej na GoJS/Cytoscape/Sigma 4 alpha" — repo **už dnes** stojí
  na Sigma.js 3 + Graphology (`docs/adr/duckdb-wasm-and-sigma.md`,
  2026-07-30); žádná migrace z Cytoscape neproběhla ani neprobíhá.
  Rozhodnutí z promptu se tedy potvrzuje, nevynucuje se změna knihovny.
- Baseline audit potvrzuje, že plná registrová vrstva (1 631 uzlů /
  2 112 hran, 22 dossierů) už dnes překračuje vlastní revisit threshold
  `docs/adr/graph-renderer.md` (500 uzlů / 2 000 hran) 3–8×, takže
  rebuild je odůvodněný i podle repa vlastních dřívějších kritérií.
- Renderer/ResizeObserver/cleanup lifecycle, curated/full dvouvrstvý
  model a cross-dossier ID namespacing v `build-global-graph.mjs` už
  existují částečně nebo úplně — viz "již vyřešeno" v baseline auditu;
  fáze na ně navazují, nezačínají od nuly.

---

## Plné znění zadání (verbatim)

# CLAUDE CODE IMPLEMENTATION PROMPT

## Vomasté graph workbench: škálovatelná Sigma.js + Graphology mapa vztahů

Pracuješ v repozitáři:

```text
~/dev/vomaste.cz
```

Tvým úkolem je provést důkladnou optimalizaci a přestavbu globální mapy vztahů a sdílené grafové infrastruktury pro lokální dossierové grafy.

Nejde o kosmetickou úpravu jednoho canvasu. Výsledkem musí být škálovatelný, datově řízený, auditovatelný investigativní graph workbench nad existujícími registry projektu.

---

# 0. Závazné architektonické rozhodnutí

## 0.1 Renderer

Zachovej:

```text
Sigma.js 3.x stable
Graphology
graphology-layout-forceatlas2
```

Nepřecházej na:

```text
GoJS
Cytoscape.js
Sigma.js 4 alpha
Three.js
p5.js
vlastní WebGL renderer
```

Sigma.js 4 je v době realizace pouze alpha. Nepoužívej alpha verzi v produkčním projektu.

GoJS nepřidávej ani experimentálně. Je určen především pro editovatelné diagramy a vyžaduje komerční produkční licenci. Tento projekt potřebuje výkonnou read-only exploraci sítí, nikoli diagramový editor.

## 0.2 Skutečný problém

Neřeš úkol migrací knihovny. Současné problémy jsou:

* neoptimalizovaný datový transport,
* synchronní layout na hlavním vlákně,
* opakované vytváření rendereru,
* chybějící focus a filtering model,
* chybějící detailní inspektor,
* chybějící URL stav,
* chybějící LOD,
* neoddělený globální bundle,
* nedostatečné testy životního cyklu rendereru,
* informačně nečitelná plná vrstva.

---

# 1. Povinný úvodní audit

*(proveden — viz `docs/audits/graph-workbench-baseline.md`)*

# 2. Neporušitelné hranice rozsahu

## 2.1 Obsah a autorizace

Tento úkol nesmí:

* přidávat nový dossier,
* přidávat nové osoby,
* rozšiřovat autorizovaný rozsah,
* měnit tvrzení, zdroje, kauzy nebo mezery,
* upravovat nebo mazat autorizační záznamy v `AGENTS.md`,
* vytvářet nové vztahy odvozené pouze algoritmem,
* interpretovat komunitu, centralitu nebo cestu jako faktický vztah.

Algoritmické výsledky mohou sloužit pouze k:

* layoutu,
* navigaci,
* filtrování,
* technickému seskupení,
* zobrazení již existujících deklarovaných vazeb.

## 2.2 Zdroj pravdy

Kanonickým zdrojem zůstávají existující registry, front matter, `graph.toml` a jejich validační pipeline.

Nesmí vzniknout druhý ručně udržovaný grafový dataset.

Rozlišuj:

1. **Kanonická sémantická vrstva**

   * registry,
   * obsahové stránky,
   * JSON-LD exporty,
   * validační skripty.

2. **Optimalizovaná transportní projekce**

   * generovaná při buildu,
   * určená pro Sigma.js,
   * obsahuje pouze data potřebná pro render, filtraci a inspektor,
   * vždy dohledatelná zpět ke kanonickému záznamu.

Sigma nemusí přímo konzumovat verbose JSON-LD. Musí však konzumovat deterministickou projekci generovanou ze stejného zdroje pravdy a validovanou proti publikovaným JSON-LD a routám.

---

# 3. Cílová architektura dat

Nahraď monolitický model:

```text
data/generated/global-graph.json
```

vrstveným, verzovaným a lazy-load modelem.

Doporučený výstup:

```text
static/data/graph/
  manifest.json
  global-curated.json
  global-registry.json
  dossier/
    <slug>.json
```

Přesné názvy můžeš upravit, ale architektura musí zachovat:

* jeden lehký manifest,
* samostatný payload kurátorské vrstvy,
* samostatný payload plného registru,
* samostatné payloady lokálních dossierů,
* žádné vložení plné globální vrstvy do HTML.

## 3.1 Manifest

`manifest.json` musí obsahovat nejméně:

```json
{
  "schema_version": 1,
  "generated_at": "...",
  "generator_version": "...",
  "source_hash": "...",
  "layers": {
    "curated": {
      "url": "...",
      "node_count": 0,
      "edge_count": 0,
      "byte_size": 0,
      "sha256": "..."
    },
    "registry": {
      "url": "...",
      "node_count": 0,
      "edge_count": 0,
      "byte_size": 0,
      "sha256": "..."
    }
  },
  "facets": {},
  "dossiers": []
}
```

Nepoužívej timestamp jako jediný cache invalidátor. Obsah musí mít hash odvozený z kanonických vstupů.

## 3.2 Uzel

Každý transportní uzel musí mít explicitní pole:

```text
id
canonical_id
record_type
entity_type, pokud relevantní
label
route
dossier nebo dossiers
subject
status, pokud relevantní
x
y
size_class
layout_partition
component_id
```

Dále může obsahovat lehká metadata pro detailní panel:

```text
claim_count
source_count
relation_count
gap_count
case_count
outlet
priority
summary
title
```

Nevkládej do graph payloadu celé texty článků nebo obsah stránek.

## 3.3 Hrana

Každá hrana musí mít:

```text
id
source
target
kind
label
route, pokud existuje
status, pokud existuje
dossier
```

Pro kurátorské hrany zachovej:

```text
rel_id
relation
claims
sources
```

Plná registrová vrstva dnes používá `kind`, zatímco kurátorská používá mimo jiné `relation` a `status`. Navrhni jednoznačný normalizovaný transportní kontrakt.

Například:

```text
edge_class:
  curated_relation
  claim_cites_source
  gap_questions_claim
  entity_mentions_claim
  relation_backed_by_claim
```

Nepřekládej technický edge class do nového faktického tvrzení.

## 3.4 Routy

Routy doplň při buildu.

Odstraň potřebu načítat celý `search-index.json` před prvním renderem grafu.

Použij již generovaný route manifest nebo kanonická URL z exportů.

Pokud route chybí:

* build musí selhat u routovatelných záznamů,
* nebo musí být explicitně uvedeno, že daný technický uzel nemá samostatnou routu.

Žádné runtime hádání URL ze stringových ID.

---

# 4. Build-time layout místo blokování browseru

## 4.1 Výchozí layout

Výchozí souřadnice všech globálních vrstev vypočítej při buildu.

Browser nesmí při běžném načtení spouštět:

```js
forceAtlas2.assign(graph, { iterations: 220 })
```

na hlavním vlákně.

Použij:

* deterministické pořadí uzlů,
* deterministické seed pozice,
* stabilní ForceAtlas2 konfiguraci,
* pro větší vrstvu `barnesHutOptimize: true`,
* rozumné oddělení komponent,
* normalizaci výsledných souřadnic,
* ověření `Number.isFinite(x)` a `Number.isFinite(y)`.

Ulož do manifestu:

```text
layout_algorithm
layout_version
layout_parameters
layout_input_hash
```

## 4.2 Stabilita

Stejný vstup musí vytvořit prakticky totožný layout.

Přidej test, který:

1. spustí generátor dvakrát,
2. porovná hash nebo souřadnice v definované toleranci,
3. selže při nedeterministickém driftu.

Pokud použitý algoritmus obsahuje nedeterministický jitter, dodrž deterministickou inicializaci nebo implementuj seedovaný RNG pouze pro layout.

## 4.3 Komponenty a partitioning

V build pipeline vypočítej:

* weakly connected components,
* velikost komponent,
* technickou partition vrstvy,
* počet sousedů uzlu.

Volitelně použij Louvain pouze jako pomocnou layout partition.

Pokud Louvain použiješ:

* výsledek označ jako `algorithmic_community`,
* nikdy jej nenazývej „kauza", „skupina", „síť vlivu" ani „spojenectví",
* v UI vysvětli, že jde pouze o algoritmické seskupení podle existujících hran,
* nesmí měnit fakta ani generovat nové hrany.

Kurátorské `clusters` zůstávají redakčně odlišné od algoritmických komunit.

## 4.4 Volitelný runtime re-layout

Runtime ForceAtlas2 worker může být použit pouze pro explicitní funkci:

```text
Přepočítat rozložení aktuálního výřezu
```

Nikoli pro výchozí načtení.

Worker musí:

* být lazy-loaded,
* mít Start/Stop/Kill lifecycle,
* být ukončen při zničení komponenty,
* nezablokovat UI,
* po dokončení zachovat selection a panel,
* mít možnost vrátit se k publikovanému layoutu.

---

# 5. Rozdělení JavaScript bundle

Sigma a Graphology nyní nesmí být součástí globálního `app.js` načítaného na každé stránce.

Implementuj jeden z těchto modelů:

## Preferovaný model

```text
assets/js/app.js
assets/js/graph-app.js
```

Build:

```text
static/js/app.js
static/js/graph-app.js
```

`graph-app.js` načítej pouze na stránkách s:

```html
[data-graph-workbench]
```

tedy zejména:

* `/map/`,
* dossierové stránky s lokálním grafem.

Pokud použiješ esbuild code splitting, musí být:

* ESM,
* deterministický,
* kompatibilní s GitHub Pages,
* bez runtime CDN importů.

Sigma, Graphology a layout balíčky musí zůstat self-hosted v bundlu.

Změř před a po:

* globální JS bundle,
* graph-only bundle,
* celkový přenos na běžné stránce,
* přenos na `/map/`.

Běžné stránky musí po změně přenášet méně JavaScriptu než před změnou.

---

# 6. Nová modulární runtime architektura

Rozbij dnešní monolitický `graph-view.js`.

Doporučená struktura:

```text
assets/js/modules/graph/
  index.js
  controller.js
  loader.js
  graph-factory.js
  renderer.js
  state.js
  filters.js
  selection.js
  permalink.js
  detail-panel.js
  accessibility.js
  lifecycle.js
  layout-worker.js
```

Názvy lze přizpůsobit, ale odpovědnosti musí být oddělené.

## 6.1 Controller

Controller vlastní:

* aktivní layer,
* aktivní Graphology instanci,
* jednu Sigma instanci,
* selection,
* hover,
* filtry,
* focus subgraph,
* kameru pro každou vrstvu,
* detail panel,
* cleanup.

## 6.2 Jedna Sigma instance

Nevytvářej novou Sigma instanci při každém přepnutí vrstvy.

Použij jednu instanci a:

```js
renderer.setGraph(nextGraph)
```

nebo rovnocenný bezpečný mechanismus podporovaný aktuální stabilní Sigma API.

Při přepnutí:

1. ulož camera state aktuální vrstvy,
2. nastav nový Graphology graph,
3. obnov camera state cílové vrstvy,
4. obnov selection, pokud uzel existuje,
5. jinak selection korektně vyčisti,
6. aktualizuj URL a panel.

## 6.3 Cleanup

Každá instance musí mít explicitní:

```js
destroy()
```

Cleanup musí odstranit:

* Sigma listeners,
* DOM listeners,
* ResizeObserver,
* media-query listeners,
* fullscreen hook,
* layout worker,
* requestAnimationFrame callbacky,
* reference v `resizeHandlers`.

Po deseti přepnutích vrstvy nesmí přibývat:

* canvas elementy,
* observer callbacky,
* event listenery,
* workers.

## 6.4 Resize

Použij jediný `ResizeObserver` na workbench kontejner.

Resize:

* debouncuj přes `requestAnimationFrame`,
* nesmí resetovat kameru,
* nesmí přepočítávat layout,
* nesmí vytvářet nový renderer,
* musí fungovat při sidebar collapse,
* musí fungovat při orientaci mobilu,
* musí fungovat při fullscreen enter/exit.

---

# 7. Sigma nastavení a level of detail

Použij Sigma settings vědomě, nikoli jako náhodnou sbírku konstant.

## 7.1 Hrany

Pro kurátorskou vrstvu:

```text
enableEdgeEvents = true
```

protože kurátorské hrany mají vlastní routy a detail.

Pro plnou registrovou vrstvu zvaž:

```text
enableEdgeEvents = false
hideEdgesOnMove = true
```

pokud technické hrany nemají vlastní routovatelný detail.

Při pohybu kamery u plné vrstvy preferuj výkon před vykreslováním všech hran.

## 7.2 Labels

Implementuj LOD:

### Vzdálený zoom

Zobrazuj pouze:

* subjektové entity,
* vybraný uzel,
* hovered uzel,
* případně hlavní uzly aktivního focus výřezu.

### Střední zoom

Přidej:

* entity,
* kauzy,
* nejbližší sousedy selection.

### Blízký zoom

Přidej:

* tvrzení,
* zdroje,
* mezery,
* další relevantní labely.

Nepoužívej `forceLabel` pro stovky záznamů.

Nastav rozumně:

```text
labelDensity
labelGridCellSize
labelRenderedSizeThreshold
```

## 7.3 Reducery

Použij:

```text
nodeReducer
edgeReducer
```

pro:

* selection,
* hover,
* sousedství,
* filtraci,
* dimming nesouvisejících prvků,
* zvýraznění výsledku hledání,
* focus path.

Nemutuj kvůli každému hoveru celou Graphology instanci.

Po změně pouze vizuálních atributů používej:

```text
scheduleRefresh
scheduleRender
partialGraph
skipIndexation
```

tam, kde je to korektní.

## 7.4 Node size

Výchozí velikost nesmí představovat:

* důležitost osoby,
* vinu,
* závažnost,
* důvěryhodnost,
* politický význam.

Výchozí size class odvozuj pouze z explicitní vizuální role:

* subject entity,
* entity,
* case,
* claim,
* source,
* gap.

Technický režim „velikost podle konektivity" může existovat jako volitelný toggle, ale musí být jasně popsán:

```text
Velikost vyjadřuje pouze počet deklarovaných hran v tomto datasetu.
Nevyjadřuje význam, vliv ani pravdivost.
```

Nesmí být výchozí.

---

# 8. Workbench UI

Přestav `/map/` na skutečný responsive application workspace podle existujícího Flowbite application shellu.

Nezaváděj React, Vue ani další framework.

Použij:

* Zola/Tera,
* Tailwind,
* Flowbite,
* vanilla ES modules,
* případně Alpine pouze pro lokální prezentační stav, pokud je to skutečně jednodušší.

## 8.1 Desktop layout

Desktop:

```text
┌───────────────────────────────────────────────────────────────┐
│ kompaktní toolbar                                             │
├───────────────┬─────────────────────────────────┬─────────────┤
│ facets/filter │ Sigma graph                     │ inspector   │
│ sidebar       │                                 │ panel       │
│ collapsible   │                                 │ resizable   │
└───────────────┴─────────────────────────────────┴─────────────┘
```

Graf musí využívat většinu viewportu.

Nesmí být sevřen v běžném `max-w-6xl` článkovém layoutu.

## 8.2 Mobil

Mobil:

* graf přes dostupnou šířku,
* kompaktní top toolbar,
* filtry jako Flowbite drawer,
* detail jako bottom sheet nebo drawer,
* velké touch targety,
* žádné permanentní překrytí poloviny canvasu,
* žádný horizontální scroll celé stránky,
* respektuj safe areas,
* fullscreen nesmí být jediný způsob použití.

## 8.3 Toolbar

Toolbar musí obsahovat:

* přepnutí vrstvy,
* globální hledání,
* otevření filtrů,
* reset pohledu,
* focus selection,
* návrat z focus režimu,
* sdílení/permalink,
* fullscreen,
* nápovědu/legendu.

Akce musí mít:

* textový nebo přístupný název,
* `aria-label`,
* tooltip tam, kde ikona sama nestačí,
* disabled state, když nedává smysl.

---

# 9. Filtry

Implementuj kombinovatelné facety.

## 9.1 Společné

* dossier,
* record type,
* entity type,
* textové hledání,
* pouze subjektové entity,
* pouze prvky napojené na selection,
* connected component.

## 9.2 Kurátorská vrstva

* relation type,
* relation status,
* corroborated,
* disputed,
* quote,
* single,
* contextual.

## 9.3 Registrová vrstva

* claim status,
* source type,
* outlet,
* case status,
* gap priority,
* edge class.

Každý facet musí zobrazovat aktuální počet výsledků.

Počty musí být odvozeny z aktuálního datasetu, nikoli hardcodované.

Filtry nesmí fyzicky mazat uzly z kanonického grafu. Použij:

* hidden atributy,
* reducovaný view graph,
* nebo explicitní odvozený subgraph.

Zvolený postup zdokumentuj.

---

# 10. Focus a investigativní navigace

## 10.1 Selection

Kliknutí na uzel:

1. vybere uzel,
2. otevře inspector,
3. zvýrazní jeho přímé sousedy,
4. ztlumí nesouvisející prvky,
5. aktualizuje URL,
6. neprovede okamžitou navigaci mimo mapu.

V inspectoru musí být explicitní odkaz:

```text
Otevřít celý záznam
```

Dvojklik může otevřít kanonickou stránku, pokud je tato interakce:

* zdokumentovaná,
* přístupná i jinou cestou,
* použitelná na dotykovém zařízení.

## 10.2 Neighborhood

Přidej focus režimy:

* 1 krok,
* 2 kroky,
* celá komponenta.

Zobrazený výřez musí obsahovat pouze existující deklarované hrany.

Text v UI musí říkat:

```text
Výřez ukazuje dosažitelnost přes deklarované vazby v tomto datasetu.
Nejde o tvrzení o přímém vztahu mezi krajními uzly.
```

## 10.3 Path finder

Přidej možnost zvolit:

```text
Výchozí uzel
Cílový uzel
```

a zobrazit nejkratší deklarovanou cestu.

Výsledek musí:

* zobrazit každý mezilehlý uzel,
* zobrazit každou hranu,
* uvést typ každé hrany,
* uvést kanonické odkazy,
* nikdy neshrnout cestu jako nový faktický vztah.

Pokud cesta neexistuje, zobraz jasný stav bez spekulace.

## 10.4 Search

Search musí hledat minimálně v:

* label,
* canonical ID,
* record ID,
* dossier,
* outlet,
* entity type,
* relation type.

Výsledky zobraz v přístupném comboboxu nebo seznamu.

Výběr výsledku:

* přepne správnou vrstvu, pokud je třeba,
* vycentruje kameru,
* otevře inspector,
* zvýrazní uzel.

---

# 11. Detailní inspector

Inspector nesmí být jen tooltip.

## 11.1 Entita

Zobraz:

* název,
* typ entity,
* publication role,
* dossier nebo dossiery,
* počet deklarovaných vztahů,
* napojená tvrzení,
* napojené zdroje,
* kanonickou routu.

## 11.2 Tvrzení

Zobraz:

* ID,
* stav,
* stručný text nebo summary,
* dossier,
* citované zdroje,
* související entity,
* kanonickou routu.

## 11.3 Zdroj

Zobraz:

* ID,
* vydavatele,
* typ zdroje,
* datum, pokud je v datech,
* podporovaná tvrzení,
* source family, pokud existuje,
* kanonickou routu.

## 11.4 Kauza a mezera

Zobraz jejich existující metadata bez generování vlastního hodnocení.

U mezery explicitně zachovej význam:

```text
Otevřená otázka není nález žádným směrem.
```

## 11.5 Hrana

Kurátorská hrana musí zobrazit:

* relation type,
* přesný label,
* status,
* source a target,
* podpůrná CLM,
* podpůrná SRC,
* dossier,
* kanonickou stránku vztahu.

Nevytvářej automatickou parafrázi relation labelu.

---

# 12. Permalink a URL state

Stav workbenche musí být sdílitelný.

Použij validované query parametry, například:

```text
layer
node
edge
q
dossier
record_type
entity_type
status
depth
from
to
component
camera_x
camera_y
camera_ratio
```

Nemusíš použít přesně tyto názvy, ale stav musí pokrýt:

* aktivní vrstvu,
* výběr,
* filtry,
* focus depth,
* path finder,
* kameru nebo dostatek dat k obnovení záběru.

Po každé změně nepřidávej nový history entry.

Použij:

* `history.replaceState` pro průběžné změny,
* `history.pushState` pouze pro významné navigační kroky.

Při načtení:

1. validuj parametry proti manifestu,
2. ignoruj neznámé hodnoty,
3. nikdy nespouštěj kód z URL,
4. obnov stav v deterministickém pořadí,
5. zobraz srozumitelné upozornění, pokud odkaz míří na již neexistující záznam.

---

# 13. Progressive enhancement a fallback

Graf je vizualizace, nikoli jediný přístup k datům.

Zachovej nebo zlepši:

* textovou alternativu,
* routovatelné stránky uzlů a vztahů,
* no-JS stav,
* fallback při chybě WebGL,
* fallback při chybě načtení graph payloadu.

Pokud WebGL není dostupné:

* nezobraz prázdnou černou plochu,
* zobraz vysvětlení,
* nabídni filtrovatelný textový registr,
* zachovej odkazy na entity, vztahy a dossiery.

Textová alternativa nemusí vykreslovat všech 2 085 technických hran přímo v jednom dlouhém seznamu. Může být:

* filtrovatelná,
* stránkovaná,
* rozdělená podle typu záznamu,
* generovaná ze stejného manifestu.

Stále však musí být bez JavaScriptu dostupné všechny kanonické registry.

---

# 14. Přístupnost

Implementuj:

* status oblast s `aria-live`,
* čitelný textový popis aktivního výřezu,
* focus management při otevření/zavření draweru,
* zavření panelu přes Escape,
* viditelný keyboard focus,
* ovládání toolbaru klávesnicí,
* tlačítko pro otevření vybraného záznamu,
* respektování `prefers-reduced-motion`,
* legendu, která nespoléhá pouze na barvy.

Canvas sám o sobě není přístupný strom. Proto musí inspector a seznam výsledků poskytovat textovou reprezentaci výběru a sousedů.

Po výběru uzlu oznam například:

```text
Vybrán uzel Andrej Babiš, osoba, 14 přímých deklarovaných vazeb.
```

Číslo musí být skutečně odvozeno z aktivní vrstvy.

---

# 15. Visual semantics

Zachovej neutrální publicistický charakter projektu.

## 15.1 Barva

Použij stabilní sémantické mapování:

* record type nebo entity type pro uzly,
* status pro kurátorské hrany,
* edge class pro technické hrany.

Barva nesmí znamenat:

* dobrý/špatný člověk,
* vinný/nevinný,
* důležitý/nedůležitý,
* důvěryhodný/nedůvěryhodný.

## 15.2 Shape

Použij omezený počet dobře rozlišitelných node programů:

* osoba,
* instituce/organizace,
* firma,
* tvrzení,
* zdroj,
* kauza,
* mezera.

Nepřidávej komplikované obrázky nebo portréty do tisíců uzlů.

Custom Sigma node programs použij pouze tam, kde mají jasnou sémantickou hodnotu a benchmark prokáže přijatelný výkon.

## 15.3 Selection

Selection musí být viditelná současně pomocí více znaků:

* velikost nebo obrys,
* kontrast,
* inspector,
* případně ring.

Nespoléhej pouze na změnu odstínu.

---

# 16. Datové validace

Přidej JSON Schema pro:

* graph manifest,
* curated graph payload,
* registry graph payload.

Validace musí kontrolovat:

* schema version,
* unikátní node ID,
* unikátní edge ID,
* endpointy všech hran,
* finite coordinates,
* platné routy,
* platné record types,
* platné edge classes,
* počty v manifestu proti payloadu,
* SHA-256 v manifestu proti souboru,
* parity s registry,
* parity s route manifestem,
* parity s JSON-LD `@id`, pokud relevantní.

Rozšiř existující build gate, nikoli paralelní ruční kontrolu.

Doporučené nové skripty:

```text
scripts/dossier/build-graph-projections.mjs
scripts/dossier/build-graph-layout.mjs
scripts/dossier/validate-graph-projections.mjs
scripts/dossier/benchmark-graph.mjs
```

Můžeš zachovat jeden dobře strukturovaný generátor, pokud bude rozdělen do testovatelných knihoven.

---

# 17. Testy

## 17.1 Unit testy

Testuj:

* manifest loader,
* payload loader,
* hash verification,
* graph factory,
* normalizaci uzlů a hran,
* filters,
* facet counts,
* selection state,
* neighborhood depth,
* path finding,
* URL encode/decode,
* neznámé URL parametry,
* cleanup lifecycle,
* deterministický layout.

## 17.2 Build testy

Test musí selhat, pokud:

* manifest uvádí špatný počet,
* chybí graph payload,
* hrana míří na neexistující uzel,
* routovatelný uzel nemá route,
* souřadnice jsou `NaN` nebo `Infinity`,
* hash nesedí,
* graph projection neobsahuje kanonický záznam,
* vznikne duplicitní globální edge key.

## 17.3 Browser testy

Použij Playwright nebo existující browser harness.

Povinné scénáře:

1. `/map/` načte pouze manifest a kurátorskou vrstvu.
2. Plná vrstva není stažena před kliknutím na její přepínač.
3. Aktivace plné vrstvy stáhne payload právě jednou.
4. Druhé přepnutí použije cache.
5. Kliknutí na uzel otevře inspector.
6. Kliknutí neprovede okamžitý redirect.
7. Explicitní odkaz otevře kanonickou stránku.
8. Filtr upraví počty i viditelné prvky.
9. Selection přežije resize.
10. Kamera přežije otevření a zavření sidebaru.
11. Kamera vrstvy se obnoví po návratu.
12. Po deseti přepnutích vrstvy zůstane počet canvasů konstantní.
13. Po deseti přepnutích nevzniknou duplicitní listenery.
14. Fullscreen zachová selection.
15. Deep link obnoví layer, selection a filtry.
16. Escape zavře inspector.
17. Mobilní drawer nepřekryje nevratně ovládání.
18. WebGL failure zobrazí fallback.
19. `prefers-reduced-motion` zakáže zbytečné animace.
20. Edge click funguje v kurátorské vrstvě.

## 17.4 Syntetický benchmark

Přidej oddělený benchmark dataset, který není publikovaným obsahem:

```text
10 000 nodes
20 000 až 40 000 edges
```

Použij jej pouze pro technický benchmark rendereru.

Nesmí být zaměněn za reálná data a nesmí se publikovat jako obsah Vomasté.

Benchmark musí ověřit:

* inicializaci bez runtime layoutu,
* pan/zoom,
* selection,
* reducer filtering,
* cleanup.

Výsledek zaznamenej, ale nevytvářej falešné absolutní garance pro každý telefon a browser.

---

# 18. Výkonové požadavky

Po implementaci musí platit:

1. Na běžných stránkách se Sigma ani Graphology nestahují.
2. `/map/` nestahuje plnou registrovou vrstvu před jejím použitím.
3. Výchozí render nespouští synchronní ForceAtlas2.
4. Přepnutí vrstvy nevytváří nový renderer, pokud to stabilní Sigma API umožňuje.
5. Pohyb kamery plné vrstvy nesmí vykreslovat zbytečné labely.
6. Žádná běžná interakce nesmí opakovaně procházet celý DOM.
7. Hover nesmí mutovat tisíce grafových atributů.
8. Observer a listener count musí být stabilní.
9. Base JS bundle musí být menší než baseline.
10. Graph payloady musí být cacheovatelné a obsahově verzované.

Zaveď měřený budget:

* baseline hodnoty ulož do reportu,
* nový build nesmí bez vysvětlení zvětšit base JS o více než 10 %,
* nový graph bundle nesmí růst bez zaznamenání důvodu,
* graph payload nesmí duplikovat plné texty kanonických registrů.

Nehoň čísla minifikací názvů polí, pokud tím zničíš auditovatelnost. HTTP komprese už opakující se klíče řeší. Optimalizuj hlavně:

* lazy loading,
* oddělení vrstev,
* odstranění duplicity,
* předpočítaný layout,
* selektivní metadata.

---

# 19. Aktualizace šablon

## 19.1 `templates/map.html`

Přestav na workbench shell.

Odstraň:

* inline celý `global-graph.json`,
* pevný článkový `max-w-6xl` pro samotný workbench,
* nutnost načíst registry layer pro zobrazení statistických dlaždic.

Statistiky čti z lehkého manifestu nebo build-time dat.

Přidej:

* root `data-graph-workbench`,
* URL manifestu,
* fallback status,
* toolbar,
* filter drawer,
* inspector,
* textovou alternativu.

## 19.2 `templates/dossier.html`

Lokální graf musí používat stejný graph workbench core v omezeném režimu.

Nedělej druhou implementaci.

Lokální režim může mít:

* pouze jeden dossier,
* menší sadu filtrů,
* menší inspector,
* bez globálního path finderu, pokud nedává smysl.

Musí však sdílet:

* loader,
* renderer,
* state,
* reducers,
* selection,
* lifecycle,
* accessibility.

## 19.3 Makra

Opakované UI přesuň do Tera maker:

* toolbar button,
* facet group,
* inspector row,
* legend item,
* status badge,
* fallback panel.

Dodrž existující component reuse lint.

---

# 20. CSS

Odstraň nebo přejmenuj historické `cy-*` názvy, které odkazují na Cytoscape:

```text
cy-chip
cy-canvas
cy-controls
cy-legend
cy-tooltip
```

Použij technologicky neutrální názvy:

```text
graph-chip
graph-canvas
graph-toolbar
graph-legend
graph-tooltip
```

Přejmenování proveď konzistentně ve:

* šablonách,
* CSS,
* JavaScriptu,
* testech,
* dokumentaci.

Nezachovávej mrtvé aliasy bez důvodu.

Nepoužívej pevné barvy rozeseté v JavaScriptu a CSS. Vytvoř jednotný token mapping kompatibilní s existujícím design systémem.

---

# 21. Dokumentace a ADR

Vytvoř nový ADR, například:

```text
docs/adr/graph-workbench-and-data-projection.md
```

ADR musí obsahovat:

* kontext,
* naměřený baseline,
* porovnání Sigma.js a GoJS,
* rozhodnutí zachovat Sigma.js 3,
* důvod nepoužít GoJS,
* oddělení kanonických dat a transportní projekce,
* build-time layout,
* lazy loading,
* permalink state,
* progressive enhancement,
* bezpečnostní a redakční omezení,
* měřené náklady,
* revisit thresholds.

Historické ADR nemaž ani nepřepisuj tak, aby se ztratilo původní rozhodování.

Aktualizuj supersession chain:

```text
graph-renderer.md
  superseded in renderer decision by duckdb-wasm-and-sigma.md

duckdb-wasm-and-sigma.md
  refined for scalable workbench by graph-workbench-and-data-projection.md
```

Oprav zastaralé zmínky o Cytoscape ve:

* komentářích,
* `graph.toml`,
* šablonách,
* dokumentaci,
* JS module comments.

Neměň obsahové významy dat.

---

# 22. Implementační pořadí

Postupuj přesně po fázích.

## Fáze A: audit

*(hotovo — viz `docs/audits/graph-workbench-baseline.md`)*

## Fáze B: datový kontrakt

* schémata,
* normalizovaný graph payload,
* manifest,
* route resolution,
* validátory,
* testy.

## Fáze C: build-time layout

* deterministic seed,
* ForceAtlas2,
* Barnes-Hut pro full layer,
* components,
* koordináty,
* layout tests.

## Fáze D: bundle split

* oddělení graph entrypointu,
* page-specific load,
* bundle measurement.

## Fáze E: runtime core

* loader,
* graph factory,
* jedna Sigma instance,
* layer switching,
* camera state,
* lifecycle,
* cleanup.

## Fáze F: interaction model

* selection,
* hover,
* reducers,
* focus,
* neighbors,
* path finder,
* search,
* URL state.

## Fáze G: UI

* full-width workbench,
* Flowbite drawers,
* inspector,
* toolbar,
* legend,
* responsive mobile layout.

## Fáze H: accessibility a fallback

* no-JS,
* WebGL failure,
* keyboard,
* aria-live,
* reduced motion.

## Fáze I: browser testy a benchmark

* Playwright,
* leak tests,
* lazy-load tests,
* mobile tests,
* synthetic benchmark.

## Fáze J: dokumentace a finální gate

* ADR,
* README,
* architecture docs,
* baseline vs final report,
* celý build.

Po každé fázi:

1. spusť relevantní testy,
2. aktualizuj pracovní plán,
3. zaznamenej změny,
4. neopravuj nesouvisející části projektu,
5. pokračuj až po zeleném výsledku fáze.

---

# 23. Povinný finální report

Na konci vytvoř report:

```text
reports/graph-workbench-implementation.md
```

Musí obsahovat:

* seznam změněných souborů,
* původní architekturu,
* novou architekturu,
* baseline metriky,
* finální metriky,
* bundle diff,
* payload diff,
* počet uzlů a hran,
* layout čas,
* browser test results,
* known omezení,
* rizika,
* další revisit threshold,
* potvrzení, že nebyl změněn autorizovaný obsah.

Přilož přesný výstup:

```bash
git status --short
git diff --stat
npm test
npm run build
```

---

# 24. Definition of Done

Úkol není hotový, dokud neplatí vše:

* Sigma.js 3 + Graphology zůstávají renderer stackem.
* GoJS není závislost.
* Sigma.js 4 alpha není použita.
* Graph code není v globálním bundle všech stránek.
* Full registry payload se načítá lazy.
* Výchozí layout je předpočítaný.
* Hlavní vlákno nespouští výchozí ForceAtlas2.
* Přepínání vrstev nezpůsobuje leak.
* Kamera se zachovává.
* Selection se zachovává.
* Inspector funguje.
* Filtry fungují.
* Focus neighborhood funguje.
* Path finder pracuje pouze s deklarovanými hranami.
* URL state je obnovitelný.
* Mobilní UI je použitelné.
* WebGL fallback je použitelný.
* Textové registry zůstávají dostupné.
* Data zůstávají projekcí kanonických registrů.
* Nevznikla nová tvrzení ani vztahy.
* Autorizační log nebyl změněn.
* Schémata a validátory jsou součástí build gate.
* Browser testy jsou zelené.
* `npm run build` skončí bez chyby.

Pokud `npm run build` neprojde, úkol není hotový.

---

# 25. Pracovní chování

Nezastavuj se u plánu.

Po auditu:

1. vytvoř detailní implementační checklist,
2. implementuj jednotlivé fáze,
3. průběžně spouštěj testy,
4. oprav regresní chyby,
5. dokonči finální build,
6. vytvoř report.

Nevydávej změnu za hotovou pouze proto, že:

* graf něco vykreslí,
* screenshot vypadá lépe,
* Sigma nehodí výjimku,
* desktop funguje v jednom rozlišení.

Výsledkem musí být robustní datová a interakční architektura, ne efektní černý canvas s barevnými tečkami.
