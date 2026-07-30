# Mise: přestavba vomaste.cz na hustý, data-driven investigativní workbench

**Datum zadání**: 2026-07-30 · **Zadavatel**: vlastník webu (on the record,
v konverzaci s ORCH session) · **Stav**: dekomponováno na coop board
(`docs/coop/TASKS.md`, T-011…T-015 revidované + nové tasky) ·
**Baseline audit**: [`docs/audits/information-architecture-baseline.md`](../audits/information-architecture-baseline.md)

Tento soubor uchovává vlastníkův master prompt doslovně, aby na něj mohly
navazovat další worker sessions bez ztráty kontextu. Jde o **technickou
misi nad prezentační a datovou vrstvou** — žádná změna redakčního
významu, žádný nový obsahový scope, autorizační log v `AGENTS.md` se
nemění (viz § 1.2 promptu).

Známé odchylky promptu od reality repa (poctivě, měřeno):

- Prompt v § 1.1 jmenuje **Cytoscape.js**; repo reálně používá
  **Sigma.js + Graphology** (viz `docs/adr/graph-renderer.md`). Zachovává
  se skutečný stack — výměna knihovny bez měřené potřeby by porušila
  vlastní ADR disciplínu repa. Platí duch pravidla: žádný přepis do
  SPA frameworku, žádný backend.
- Část § 5 (dataset, search index, JSON-LD exporty s manifestem a
  checksumy) už existuje díky T-002/T-010 — viz baseline audit; compiler
  fáze na ně navazuje, nezačíná od nuly.

---

## Plné znění zadání (verbatim)

# MISSION: Rebuild vomaste.cz into a dense, data-driven investigative workbench

Pracuješ jako autonomní senior information architect, data-visualization engineer,
frontend architect a maintainer tohoto repozitáře.

Tvým úkolem není web pouze „zkrášlit“, zmenšit několik marginů nebo přeházet
existující karty.

Musíš provést skutečný redesign informační architektury a prezentační vrstvy tak,
aby se vomaste.cz změnilo z řídkého statického katalogu na:

- information-dense analytické rozhraní,
- mobilně použitelné od nejmenšího viewportu,
- rychlé a progresivně rozšířené,
- interaktivní bez závislosti na backendu,
- plně data-driven,
- generované z jednoho zdroje pravdy,
- strojově čitelné přes validní JSON-LD,
- auditovatelné,
- snadno rozšiřitelné,
- zdokumentované,
- a vynucované buildem a testy.

Nezastavuj se u auditu nebo implementačního plánu. Audit proveď, plán stručně
zapiš a následně celý redesign implementuj, otestuj, zdokumentuj a ověř
produkčním buildem.

---

# 0. POVINNÝ REPOSITORY DISCOVERY

Než cokoli změníš:

1. Přečti v plném rozsahu:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `PROJECT_INSTRUCTIONS.md`, pokud existuje
   - `README.md`
   - `package.json`
   - `config.toml`
   - `data/navigation.toml`
   - všechny soubory v `templates/`
   - všechny zdrojové soubory v `assets/js/`
   - `static/css/input.css`
   - všechny validační skripty v `scripts/`
   - relevantní obsah a front matter v `content/`
   - GitHub Actions workflowy

2. Zkontroluj:
   - aktuální branch,
   - `git status`,
   - existující necommitnuté změny,
   - přesnou build sekvenci,
   - všechny generované versus ručně spravované soubory,
   - aktuální datové entity, registry a vztahy,
   - všechny existující typy stránek a šablon.

3. Spusť baseline:
   ```bash
   npm ci
   npm run build
   ```

4. Pokud jsou v pracovním prostoru dostupné referenční screenshoty, prohlédni je.
   Ber je jako vizuální bug report, nikoli jako předlohu, kterou máš jen trochu
   uhladit.

5. Vytvoř krátký audit do:
   `docs/audits/information-architecture-baseline.md`

Audit musí uvést konkrétně:

* kde se zbytečně plýtvá viewportem,
* kde je obsah omezen nevhodným `max-width`,
* kde je nadměrný vertikální whitespace,
* které údaje jsou ručně duplikované,
* které počty nebo stavy mohou zastarat,
* které stránky představují tentýž dataset jinou ručně udržovanou šablonou,
* kde chybí filtering, sorting, search a details-on-demand,
* kde navigace kopíruje strom obsahu místo uživatelských úloh,
* kde desktopový layout selhává jako analytický workbench,
* kde mobilní layout pouze zmenšuje desktop,
* kde se používají karty tam, kde má být tabulka, seznam, matice nebo graf,
* kde je interakční stav neadresovatelný URL,
* kde je informace pouze vizuální a není strojově nebo přístupně dostupná.

Audit nesmí být záminkou k odkladu implementace.

---

# 1. NEPORUŠITELNÉ OMEZENÍ

## 1.1 Zachovej stack

Zachovej současnou architekturu:

* Zola
* Tera
* Markdown a TOML front matter
* Tailwind CSS
* Flowbite
* Alpine.js
* esbuild
* Chart.js
* Cytoscape.js
* statické nasazení na GitHub Pages

Nepřepisuj aplikaci do:

* Reactu,
* Vue,
* Svelte,
* Next.js,
* Nuxtu,
* Phoenixu,
* ani jiného frameworku.

Nepřidávej serverový backend jen kvůli filtrům nebo vyhledávání.

Používej progressive enhancement a malé interaktivní islands. Základní obsah,
odkazy a registry musí být použitelné i bez JavaScriptu.

## 1.2 Neměň redakční význam

Toto je redesign datové a prezentační vrstvy, nikoli autorizace nového obsahu.

* Nevytvářej nové osoby.
* Nevytvářej nové kauzy.
* Nerozšiřuj obsahový scope.
* Neměň status tvrzení.
* Nezvyšuj nebo nesnižuj epistemickou sílu tvrzení.
* Nevymýšlej skóre důvěryhodnosti.
* Nevymýšlej relevance score vydávané za fakt.
* Neměň citace ani jejich význam.
* Neměň historické autorizační záznamy v `AGENTS.md`.
* Autorizační log je append-only a při tomto úkolu se nemá měnit vůbec.

Procesní výsledek nikdy vizuálně ani textově nezaměň za věcné rozhodnutí.

## 1.3 Zachovej identitu a deep links

Zachovej nebo kompatibilně přesměruj:

* existující URL,
* `CLM-*`,
* `SRC-*`,
* `GAP-*`,
* `CASE-*`,
* entity IDs,
* relationship IDs,
* anchor links,
* canonical URL,
* Open Graph metadata.

Žádný redesign nesmí rozbít auditovatelnost nebo externí odkazy.

## 1.4 Single source of truth

Žádná data se nesmějí ručně udržovat současně:

* v Markdownu,
* v kartě,
* v tabulce,
* v grafu,
* v JSON souboru,
* a v JavaScriptu.

Veškeré seznamy, počty, agregace, navigační kontexty a JSON-LD se musí
odvozovat z kanonických zdrojových dat.

Generované artefakty mohou data obsahovat, ale nesmějí se ručně editovat.

---

# 2. PROBLÉM, KTERÝ MUSÍŠ SKUTEČNĚ ODSTRANIT

Současné rozhraní vykazuje zejména tyto vady:

* hlavní obsah zabírá jen zlomek širokého viewportu,
* desktop má velké prázdné plochy bez informační nebo interakční funkce,
* stránky začínají příliš nízko a data jsou pod zbytečnou hlavičkou,
* obrovské mezery oddělují malé množství obsahu,
* registry jsou někde tabulky, jinde karty, bez jednotného modelu,
* karty obsahují dlouhé texty, ale neposkytují rychlé porovnání,
* sidebar je příliš dlouhý a směšuje globální navigaci s hierarchií každého
  dossieru,
* jednotlivé osoby zabírají root navigation, přestože patří pod Dossiery,
* submenu všech osob současně vytváří navigační šum,
* uživatel nemá master-detail workflow,
* chybí detailní inspector,
* chybí sjednocené filtrování,
* chybí adresovatelný stav filtrů,
* chybí synchronizace tabulky, grafu, timeline a detailu,
* stránky s daty někdy stále zobrazují text typu TODO,
* agregované hodnoty jsou potenciálně ručně počítané,
* overview stránky opakují registry místo jejich účelné syntézy,
* mobilní rozhraní není základ návrhu, pouze vedlejší důsledek CSS,
* vizualizace nejsou integrovány do pracovního toku,
* celé rozhraní působí jako dokumentace obklopená app shellem, nikoli jako
  skutečný data explorer.

Nestačí změnit `max-w-*`, zmenšit padding a prohlásit vítězství.

---

# 3. CÍLOVÝ MODEL: DVA REŽIMY ROZHRANÍ

Implementuj jasné rozlišení mezi dvěma režimy.

## 3.1 Workbench mode

Pro:

* seznam dossierů,
* dossier overview,
* registry tvrzení,
* registry zdrojů,
* registry kauz,
* registry entit,
* vztahy,
* evidence,
* mezery,
* globální mapu.

Vlastnosti:

* téměř plná šířka viewportu,
* vysoká informační hustota,
* sticky contextual toolbar,
* tabulky a matice jako primární nástroj,
* master-detail rozložení,
* filtry a sorting přímo nad daty,
* možnost otevřít detail bez ztráty kontextu,
* URL synchronizovaná s výběrem a filtry,
* rychlé přepínání pohledů,
* pouze smysluplný whitespace.

## 3.2 Reading mode

Pro:

* metodiku,
* vysvětlení datového modelu,
* koncepty,
* redakční pravidla,
* dokumentační stránky.

Vlastnosti:

* čitelný typografický sloupec,
* přibližně 70 až 85 znaků na řádek,
* jasná osnova,
* sticky table of contents na větších obrazovkách,
* plná šířka pouze pro tabulky, diagramy a ukázky.

Nepoužívej čtecí `max-width` na workbench stránkách. To je jedna z hlavních
současných vad.

---

# 4. NOVÁ INFORMAČNÍ ARCHITEKTURA

## 4.1 Globální navigace

Root úroveň musí obsahovat jen skutečné globální oblasti, například:

* Domů
* Dossiery
* Entity
* Globální mapa
* Koncepty / Metodika
* Dokumentace

Jednotlivé osoby nesmějí být všechny trvale zobrazeny jako root položky.

Dossiery zobraz jako kontextovou hierarchii:

* sekce Dossiery,
* konkrétní dossier,
* pod ním jeho aktuální registry.

Rozbalený má být:

* aktivní dossier,
* případně naposledy používaný dossier,
* nikoli všechny existující osoby a všechna jejich submenu současně.

Desktop sidebar:

* expanded width přibližně 224 až 256 px,
* collapsed rail přibližně 52 až 64 px,
* přepínatelný,
* stav může být uložen lokálně,
* nesmí zmenšit hlavní plochu na úzký článek.

Mobile:

* nepřenášej celý desktop sidebar,
* použij kompaktní bottom navigation pro globální úlohy,
* contextual navigation dej do draweru nebo sheetu,
* aktuální dossier a jeho sekce musí být dosažitelné jedním až dvěma úkony.

## 4.2 Globální command bar

Implementuj kompaktní globální search/command bar.

Musí umět hledat minimálně podle:

* názvu osoby,
* názvu entity,
* dossieru,
* `CLM-*`,
* `SRC-*`,
* `GAP-*`,
* `CASE-*`,
* názvu kauzy,
* vydavatele,
* textu tvrzení.

Požadavky:

* klávesová zkratka `/` nebo `Cmd/Ctrl+K`,
* klávesová navigace,
* výsledky seskupené podle typu,
* přímý deep link,
* zvýraznění nalezeného ID,
* rozumný empty state,
* žádný serverový požadavek.

Vyhledávací index generuj při buildu z kanonických dat.

## 4.3 Kontextový header stránky

Na workbench stránkách nepoužívej vysoký hero blok.

Použij kompaktní page header obsahující:

* breadcrumb,
* název,
* stručný descriptor,
* reviewed/updated datum,
* případně autorizaci,
* hlavní akce,
* view switcher.

První skutečná data musí být viditelná velmi brzy po načtení stránky.

Orientační limit:

* desktop: první datový řádek nebo metrika do 140 až 180 px pod globální
  hlavičkou,
* mobile: první významná data do 100 až 140 px pod mobilní hlavičkou.

---

# 5. DATOVÁ ARCHITEKTURA A BUILD PIPELINE

## 5.1 Kanonický zdroj

Nejdříve identifikuj skutečný současný zdroj pravdy.

Preferovaný model:

* ručně spravované Markdown/TOML soubory zůstávají kanonickým obsahem,
* build-time compiler je načte a normalizuje,
* všechny odvozené pohledy používají tentýž normalizovaný dataset.

Nevytvářej druhý ručně spravovaný datový strom.

## 5.2 Build-time compiler

Implementuj například:

```text
scripts/data/compile-dataset.mjs
```

Compiler musí:

1. načíst všechny autorizované dossiery a jejich registry,
2. načíst tvrzení, zdroje, mezery, kauzy, entity a vztahy,
3. normalizovat ID a canonical URL,
4. dopočítat pouze legitimní odvozené hodnoty:

   * počet tvrzení,
   * počet zdrojů,
   * počet source families,
   * počet mezer,
   * počet kauz,
   * počet entit,
   * počet vztahů,
   * rozdělení známých statusů,
   * naposledy ověřeno,
5. vytvořit obousměrné reference,
6. detekovat osiřelé položky,
7. detekovat konfliktní nebo duplicitní ID,
8. vytvořit deterministic output,
9. vytvořit dataset manifest s verzí a hashy,
10. vygenerovat data pro Tera i client-side rozhraní.

Navržené výstupy:

```text
data/generated/catalog.json
data/generated/view-models.json
static/data/generated/catalog.json
static/data/generated/search-index.json
static/data/generated/graph.json
static/data/generated/vomaste.jsonld
static/data/generated/dossiers/<slug>.json
static/data/generated/dossiers/<slug>.jsonld
static/data/generated/manifest.json
```

Přesnou strukturu uprav podle reality repozitáře. Nevyráběj více souborů bez
jasného důvodu. U větších dat preferuj shardování po dossieru a lazy loading.

Každý generovaný soubor musí mít jasně uvedeno, že se nesmí ručně upravovat.

## 5.3 JSON Schema

Přidej strojově čitelná schémata například do:

```text
schemas/dossier.schema.json
schemas/claim.schema.json
schemas/source.schema.json
schemas/gap.schema.json
schemas/case.schema.json
schemas/entity.schema.json
schemas/relationship.schema.json
schemas/dataset.schema.json
schemas/view-definition.schema.json
```

Schémata musí odpovídat skutečně používaným polím.

Zakázáno:

* pole bez uživatele,
* pole používané v šabloně, ale nekontrolované validátorem,
* validační pravidlo bez vazby na reálný datový kontrakt.

Použij AJV nebo ekvivalentní build-time validaci.

## 5.4 JSON-LD

Vygeneruj validní JSON-LD jako strojovou reprezentaci téhož datasetu.

Použij:

* `@context`,
* `@graph`,
* stabilní canonical `@id`,
* veřejné slovníky pouze tam, kde jejich význam skutečně odpovídá,
* vlastní vocabulary pod stabilním namespace vomaste.cz pro doménové typy,
  které schema.org přesně nepopisuje.

Vhodně mapuj například:

* dossier,
* person,
* organization,
* source document,
* claim,
* citation,
* gap,
* case,
* relationship,
* provenance,
* published/retrieved/reviewed dates.

Nevydávej tvrzení za `ClaimReview` s ratingem, pokud web žádný pravdivostní
rating neprovádí. JSON-LD nesmí semanticky předstírat rozhodnutí, které web
nedělá.

Každá relevantní stránka musí mít:

* page-specific JSON-LD,
* nebo odkaz na odpovídající canonical JSON-LD resource,
* konzistentní ID s HTML deep links.

Přidej validaci:

* syntaktická validita,
* unikátní `@id`,
* všechny reference resolvují,
* žádné neznámé interní ID,
* canonical URL odpovídají routám.

## 5.5 Query layer

Navrhni malou client-side query vrstvu, nikoli náhodné filtry nalepené na každé
stránce zvlášť.

Například:

```text
assets/js/data/
  repository.js
  query-state.js
  filters.js
  search.js
  graph-adapter.js
```

Požadavky:

* stejný filter model pro tabulku, graf i URL,
* žádná duplikace filtrovací logiky v jednotlivých šablonách,
* dataset se načte jednou a cachuje,
* dossier shardy se načítají lazy,
* základní stránka zůstane funkční bez JavaScriptu.

DuckDB-Wasm:

* zvaž jej pouze pro skutečně užitečné cross-dossier agregace a ad-hoc dotazy,
* musí být lazy-loaded pouze na explorer/workbench stránkách,
* nesmí zatížit každý page load,
* musí být skryt za query adapterem,
* nesmí být přidán jen proto, že existuje a lidstvo potřebuje další 5MB WASM
  soubor,
* pokud současná velikost datasetu neospravedlňuje DuckDB-Wasm, implementuj
  lehkou query vrstvu a připrav dokumentované rozhraní pro pozdější přepnutí.

Rozhodnutí zdokumentuj jako ADR, včetně měřitelných důvodů.

---

# 6. PAGE-BY-PAGE REDESIGN

## 6.1 `/dossiers/`

Zruš řídkou galerii několika velkých karet jako hlavní desktopový pohled.

Desktop:

* kompaktní summary strip,
* search a filtry,
* sortable dossier table nebo dense list,
* jeden řádek na dossier,
* kliknutí na řádek otevře dossier,
* sekundární akce jsou dostupné bez zahlcení.

Relevantní sloupce odvozuj z dat, například:

* subjekt / dossier,
* autorizovaný rozsah,
* tvrzení,
* zdroje,
* source families,
* kauzy,
* mezery,
* entity,
* vztahy,
* naposledy ověřeno.

Nevymýšlej skóre.

Agregované průniky nebo společné pohledy musí být explicitně označeny jako
odvozené pohledy, nikoli jako další samostatný dossier.

Mobile:

* kompaktní stacked rows,
* jedna hlavní informace a několik stručných metrik,
* žádné několikasloupcové desktop karty zmenšené na 360 px.

## 6.2 Dossier overview

Dossier overview musí být skutečná syntéza, nikoli druhá kopie registru tvrzení.

Navrhni:

1. compact dossier header,
2. metric strip,
3. view tabs,
4. coverage/status overview,
5. aktivní nebo zásadní kauzy,
6. poslední aktualizace,
7. otevřené mezery,
8. vztahový náhled,
9. přímé vstupy do registrů.

Tabs nebo segmented navigation:

* Přehled
* Tvrzení
* Zdroje
* Kauzy
* Entity
* Vztahy
* Evidence
* Mezery

Aktivní sekce musí být jasná a URL musí zůstat canonical.

Metric strip nesmí být sada obrovských prázdných karet. Použij kompaktní,
srovnatelné hodnoty v jednom nebo dvou řádcích.

## 6.3 Registr tvrzení

Desktop primárně jako dense data table.

Minimální funkce:

* sticky header,
* sticky nebo dobře viditelné ID,
* full-text search,
* filter statusu,
* filter kauzy,
* filter zdroje nebo source family,
* filter položek s mezerou,
* sorting,
* počet výsledků,
* reset filtrů,
* permalink na aktuální view,
* možnost otevřít detail v inspectoru,
* klávesová navigace,
* zvýraznění deep-linked tvrzení.

Možné sloupce podle dostupných dat:

* ID,
* stav,
* stručné tvrzení,
* kauza,
* zdroje,
* nezávislé rodiny,
* mezery,
* reviewed/updated.

Text tvrzení nesmí být svévolně zkrácen tak, že změní význam. V tabulce může být
vizuálně zkrácen, ale celý text musí být dostupný:

* po rozbalení,
* v inspectoru,
* nebo na detailu.

Mobile:

* jeden claim card-row na položku,
* ID a status nahoře,
* čitelný text,
* stručné provenance metadata,
* detail jako bottom sheet nebo samostatná route,
* bez povinného horizontálního scrollování celé tabulky.

## 6.4 Registr zdrojů

Poskytni:

* publisher/outlet,
* source family,
* typ média,
* datum publikace,
* datum získání,
* počet podpořených tvrzení,
* konkrétní tvrzení,
* přímý externí odkaz,
* lokální detail zdroje.

Umožni:

* filtrovat podle vydavatele,
* source family,
* typu,
* data,
* podporovaných statusů,
* počtu tvrzení.

Jasně rozlišuj:

* počet zdrojů,
* počet nezávislých source families.

Nikdy vizuálně nesugeruj, že dva články jednoho vydavatele jsou dvě nezávislá
potvrzení.

## 6.5 Evidence view

Evidence view má být coverage matrix a provenance explorer, nikoli další
statická tabulka týchž řádků.

Implementuj synchronizované pohledy:

* tvrzení → zdroje,
* zdroj → tvrzení,
* source family coverage,
* claims bez více nezávislých rodin,
* claims s otevřenou mezerou.

Vhodný desktop model:

* vlevo filter/list tvrzení,
* uprostřed coverage matrix nebo tabulka,
* vpravo inspector.

Na mobilu používej sekvenční drill-down, nikoli tři stlačené panely.

## 6.6 Kauzy

Kauza má být první třída datového modelu.

Pohled musí umožnit:

* seznam kauz,
* periodu,
* aktuální stav,
* související tvrzení,
* zdroje,
* entity,
* vztahy,
* mezery,
* procesní výsledek.

Procesní výsledek zobrazuj společně s vysvětlením jeho omezení všude, kde to
vyžadují redakční pravidla.

## 6.7 Entity a vztahy

Entity registry:

* dense searchable list/table,
* typ entity,
* role v dossieru,
* související kauzy,
* počet tvrzení,
* počet vztahů,
* canonical detail.

Vztahy:

* tabulkový pohled jako auditovatelný základ,
* graf jako interaktivní projekce těchže dat,
* žádný graf bez možnosti zjistit přesná data za hranou a uzlem.

## 6.8 Globální mapa

Přestav na skutečný full-viewport graph workbench.

Desktop:

* kompaktní horní toolbar,
* levý filter panel, skrývatelný,
* centrální graph canvas,
* pravý inspector, skrývatelný,
* případně spodní timeline/detail panel, pouze pokud přináší skutečnou hodnotu.

Musí podporovat:

* search,
* filter podle typu entity,
* filter dossieru,
* filter kauzy,
* filter typu vztahu,
* zvýraznění sousedů,
* focus na výběr,
* reset viewportu,
* fit selection,
* permalink vybraného uzlu nebo hrany,
* sync s tabulkovým pohledem,
* přístupný textový seznam stejného výběru.

Nepoužívej fyzikální animace jako dekoraci. Layout musí být stabilní,
reprodukovatelný a čitelný.

## 6.9 Koncepty a metodika

Tyto stránky mají být optimalizované pro čtení, ale stále:

* s automatickým TOC,
* deep links,
* propojením na reálné příklady,
* diagramy generovanými z téhož datového modelu, kde je to vhodné.

Neopakuj dlouhé bloky dokumentace na mnoha stránkách. Používej canonical
vysvětlení a kontextové odkazy.

---

# 7. MASTER-DETAIL A DETAILS ON DEMAND

Implementuj konzistentní inspector component.

Desktop:

* pravý side panel přibližně 320 až 440 px,
* otevře claim, source, gap, case, entity nebo relation,
* neztratí aktuální filtry ani scroll pozici,
* má canonical link na plný detail,
* zavření vrátí přesný předchozí stav.

Mobile:

* bottom sheet nebo full-screen detail,
* history/back button funguje přirozeně,
* žádné drobné klikací ovládací prvky.

Inspector musí obsahovat pouze skutečná data:

* ID,
* typ,
* stav,
* plné znění,
* provenance,
* související položky,
* relevantní datum,
* canonical odkazy.

Nevytvářej dekorativní summary pomocí LLM ani automatické interpretace.

---

# 8. URL JAKO STAV APLIKACE

Filtrování nesmí existovat jen v paměti JavaScriptu.

Synchronizuj přes query parameters nebo hash podle vhodnosti:

* search query,
* status filters,
* dossier,
* case,
* entity type,
* source family,
* sort,
* active view,
* selected item.

Požadavky:

* reload zachová pohled,
* copy/paste URL reprodukuje pohled,
* back/forward funguje,
* neplatný parametr bezpečně spadne na default,
* canonical URL se nezamoří dočasnými UI parametry,
* serverless statické routování zůstane kompatibilní s GitHub Pages.

---

# 9. VISUALIZATION PRINCIPLES

Použij zásady informačně poctivé vizualizace:

* overview first,
* zoom and filter,
* details on demand,
* comparison before decoration,
* direct labeling where possible,
* visible denominators,
* explicit source and date context,
* semantic consistency,
* tabular fallback,
* minimum chart junk,
* no 3D charts,
* no meaningless gradients,
* no ornamental gauges,
* no donut chart merely proto, že Chart.js donut umí.

Preferuj:

* horizontal bar charts pro přesné srovnání,
* stacked bars pro známé statusové složení,
* timelines pro časové vztahy,
* coverage matrix pro claim/source vztahy,
* network graph pouze pro vztahovou strukturu,
* small multiples, pokud přinášejí srovnání.

Každý graf musí odpovědět na konkrétní otázku.

Ke každému grafu:

* titul formulující obsah,
* jasná legenda nebo přímé popisky,
* jednotky,
* dataset scope,
* relevantní datum,
* accessible summary,
* tabulková alternativa.

Barva nesmí být jediný nosič významu.

Statusy musí mít:

* textový label,
* konzistentní icon nebo marker,
* barvu splňující kontrast,
* stejnou reprezentaci na všech stránkách.

Nevytvářej nové statusy jen kvůli vizualizaci.

---

# 10. DESIGN SYSTEM A DENSITY TOKENS

Centralizuj návrhové tokeny.

Definuj alespoň:

* shell dimensions,
* header height,
* sidebar widths,
* inspector widths,
* content paddings,
* compact/comfortable table density,
* row heights,
* card/list gaps,
* border radius,
* border contrast,
* typography scale,
* status tokens,
* focus states,
* z-index layers.

Použij CSS variables nebo odpovídající Tailwind abstractions.

Doporučené cíle, upravitelné podle testů:

* global desktop header: 44 až 52 px,
* mobile header: 44 až 52 px,
* collapsed sidebar: 52 až 64 px,
* expanded sidebar: 224 až 256 px,
* desktop workbench padding: 12 až 20 px,
* mobile padding: 12 až 16 px,
* dense table row: 34 až 42 px,
* touch target na mobilu: minimálně 44 × 44 px,
* běžný gap v workbenchi: 8 až 16 px,
* žádné náhodné `py-20`, `mt-24` a podobné marketingové mezery na datových
  stránkách.

Nedělej UI klaustrofobní. Vysoká hustota znamená:

* silnou hierarchii,
* srovnatelnost,
* méně dekorativních kontejnerů,
* progresivní disclosure,
* ne mikroskopický text.

Základní text nesmí být zmenšen pod rozumnou čitelnost.

---

# 11. RESPONSIVE A MOBILE-FIRST

CSS a komponenty navrhuj od nejmenšího viewportu.

Povinně otestuj minimálně:

* 320 × 568
* 360 × 800
* 390 × 844
* 768 × 1024
* 1024 × 768
* 1280 × 800
* 1440 × 900
* 1920 × 1080

Na mobilu:

* žádné useknuté ID,
* žádné ovládání mimo viewport,
* žádný horizontální scroll celé stránky,
* tabulka se musí transformovat na vhodný seznam nebo použít explicitní
  lokální scroll jen tam, kde je tabulková struktura zásadní,
* filter controls mají být v draweru nebo sheetu,
* sticky prvky se nesmějí překrývat,
* bottom navigation nesmí zakrýt obsah,
* inspector se musí změnit na sheet nebo detail screen,
* graf musí mít touch-friendly ovládání a alternativní seznam.

Na desktopu:

* využij dostupnou šířku,
* nevytvářej centrální úzký článek na datových stránkách,
* u velmi širokých monitorů používej funkční panely nebo rozumný max-width
  workbenche, nikoli kilometr prázdného okraje.

---

# 12. FLOWBITE A KOMPONENTOVÁ ARCHITEKTURA

Používej existující Flowbite a Tailwind stack disciplinovaně.

Před implementací zkontroluj aktuální oficiální dokumentaci Flowbite pro:

* application shells,
* sidebar,
* drawers,
* tabs,
* dropdowns,
* tables,
* badges,
* tooltips,
* modals/sheets,
* navbar,
* breadcrumb,
* forms.

Nepřebírej obří copy-paste bloky bez abstrahování společných částí.

Vytvoř znovupoužitelné Tera partials/macros například pro:

* app shell,
* page header,
* metric strip,
* registry toolbar,
* data table,
* responsive row,
* status badge,
* entity badge,
* filter chip,
* empty state,
* inspector,
* tabs,
* pagination nebo result count,
* source provenance,
* mobile drawer.

Nevytvářej šest mírně odlišných implementací téhož toolbaru.

---

# 13. ACCESSIBILITY

Implementuj a testuj:

* správnou landmark strukturu,
* skip link,
* logické heading levels,
* keyboard navigation,
* viditelné focus states,
* `aria-current`,
* správné názvy icon-only tlačítek,
* dialog/drawer focus trapping,
* návrat focusu po zavření,
* tabulkové hlavičky,
* sortable column state,
* přístupné filter labels,
* announcement počtu výsledků,
* reduced motion,
* dostatečný kontrast,
* grafovou alternativu v textu nebo tabulce.

Nepřidávej ARIA tam, kde stačí správný HTML element.

Přidej automatizovaný axe test pro klíčové stránky.

---

# 14. PERFORMANCE

Stanov a měř performance budget.

Cíle:

* žádný velký JS bundle na dokumentačních stránkách,
* charts, graf a případný DuckDB-Wasm načítat lazy,
* search index nebo dossier shardy načítat podle potřeby,
* nevkládat celý globální dataset do každé HTML stránky,
* minimalizovat layout shift,
* žádné blokující externí skripty,
* respektovat cacheable hashed nebo verzované assets,
* fungovat i na běžném mobilním telefonu.

Orientační web-vitals cíle v produkčním buildu:

* LCP pod 2,5 s na rozumném mobilním profilu,
* CLS pod 0,1,
* INP pod 200 ms, pokud testovací prostředí dovolí smysluplné měření.

Zaznamenej reálné výsledky a omezení, nevymýšlej úspěšná čísla.

---

# 15. DOKUMENTACE

Vytvoř nebo aktualizuj minimálně:

```text
docs/information-architecture.md
docs/data-contract.md
docs/json-ld.md
docs/ui-density-and-design-system.md
docs/visualization-guidelines.md
docs/responsive-behavior.md
docs/accessibility.md
docs/testing.md
docs/adr/
```

Povinné ADR:

1. canonical data source a generované view modely,
2. JSON-LD vocabulary a identity model,
3. client-side query architecture,
4. rozhodnutí o DuckDB-Wasm,
5. master-detail a URL state,
6. bundling/lazy-loading vizualizačních knihoven.

Aktualizuj:

* `README.md`,
* `CLAUDE.md`,
* obecné technické části `AGENTS.md` pouze tehdy, pokud je změna opravdu
  nutná.

Nesahej na historické autorizační záznamy v `AGENTS.md`.

Dokumentace musí vysvětlit:

* kde se data upravují,
* co je generované,
* jak přidat nový typ dat,
* jak přidat nový sloupec,
* jak přidat nový filter,
* jak přidat novou vizualizaci,
* jak fungují canonical IDs,
* jak se generuje JSON-LD,
* jak se ověřují reference,
* jak se testuje mobile layout,
* jak se vynucují density pravidla,
* jak zabránit návratu ručně zadaných počtů.

---

# 16. BUILD-TIME ENFORCEMENT

Rozšiř build pipeline tak, aby design a data contract nebyly jen přání v Markdownu.

Přidej podle potřeby příkazy například:

```json
{
  "scripts": {
    "compile:data": "...",
    "validate:data": "...",
    "validate:jsonld": "...",
    "test:unit": "...",
    "test:ui": "...",
    "test:a11y": "...",
    "test:responsive": "...",
    "test:links": "...",
    "build": "..."
  }
}
```

Finální produkční build musí obsahovat v logickém pořadí:

1. validaci zdrojového obsahu,
2. kompilaci datasetu,
3. validaci schema a referencí,
4. validaci JSON-LD,
5. CSS build,
6. JS build,
7. Zola check/build,
8. anchor verification,
9. relevantní automatizované UI testy nebo jejich CI fázi.

Přidej kontroly alespoň pro:

* duplicitní ID,
* missing references,
* orphan entities,
* orphan claims,
* source bez claimu tam, kde to model zakazuje,
* claim bez source tam, kde to status vyžaduje,
* neznámý status,
* neznámý typ entity nebo vztahu,
* nesoulad canonical URL,
* ručně zadané odvozené počty, pokud lze spolehlivě detekovat,
* nevalidní JSON-LD,
* neexistující anchor,
* rozbitý mobile viewport,
* zásadní accessibility violations.

---

# 17. VISUAL REGRESSION A SCREENSHOT TESTY

Přidej Playwright, pokud v repozitáři není ekvivalent.

Vytvoř screenshot coverage pro klíčové route:

* landing,
* dossier directory,
* dossier overview,
* claims registry,
* sources registry,
* evidence,
* global map,
* methodology page.

Pro každou relevantní stránku testuj:

* mobile,
* tablet,
* desktop,
* wide desktop.

Screenshoty ukládej jako testovací artefakty, nikoli nahodile do rootu.

Test musí zachytit alespoň:

* horizontal overflow,
* překrytí sidebaru,
* překrytí bottom navigation,
* inspector mimo viewport,
* tabulku bez dostupného obsahu,
* nepřiměřený prázdný horní prostor,
* content area omezenou na nepřiměřeně malou část širokého viewportu.

Nevytvářej křehký pixel-perfect test pro každý odstín. Testuj strukturu,
overflow a klíčové referenční screenshoty.

---

# 18. DENSITY ACCEPTANCE CRITERIA

Redesign není přijatelný, dokud neplatí následující:

## Desktop workbench

* hlavní datová plocha využívá většinu dostupné šířky,
* sidebar není zároveň navigací všech dossierů a všech registrů,
* první datový obsah je viditelný bez dlouhého scrollování,
* claims/source/evidence stránky zobrazí při 1440 × 900 více než několik
  málo obřích karet,
* uživatel dokáže porovnat několik položek bez otevírání každé zvlášť,
* detail se dá otevřít bez ztráty seznamu,
* filtry nezabírají polovinu obrazovky,
* prázdná plocha má funkční důvod.

## Mobile

* všechny primární úlohy jsou proveditelné na 360 px,
* žádný globální horizontální overflow,
* search, filter, detail a návrat jsou ovladatelné jednou rukou,
* text tvrzení zůstává čitelný,
* status není sdělen pouze barvou,
* bottom navigation nic nezakrývá,
* graf má alternativní seznam.

## Data

* všechny viditelné souhrnné počty jsou generované,
* tabulka, graf, search a JSON-LD používají stejný dataset,
* žádný stale TODO není zobrazen vedle reálných dat,
* deep links nadále fungují,
* JSON-LD reference resolvují,
* žádné ručně duplikované registry.

## Documentation and enforcement

* nový contributor pozná jediný správný postup úpravy dat,
* build selže při porušení datového kontraktu,
* build selže při rozbitých referencích,
* hlavní responsive a accessibility chyby zachytí testy,
* `npm run build` projde od čistého checkoutu.

---

# 19. IMPLEMENTAČNÍ POŘADÍ

Postupuj po vertikálních řezech, ne stylem „nejprve tři dny abstrakce a potom
snad něco uvidíme“.

Doporučené pořadí:

## Phase 1: Baseline a data contract

* audit,
* inventura modelu,
* JSON Schema,
* compiler,
* generated dataset,
* validace.

## Phase 2: Shell a navigation

* nový responsive app shell,
* hierarchická navigace,
* compact header,
* workbench versus reading mode,
* základní responsive tests.

## Phase 3: Shared registry components

* toolbar,
* status badges,
* dense table,
* mobile rows,
* inspector,
* URL state.

## Phase 4: Dossier directory a overview

* generated metrics,
* dense dossier list,
* dossier tabs,
* syntetický overview.

## Phase 5: Claims, sources, evidence, gaps

* jednotná query vrstva,
* filtry,
* master-detail,
* coverage matrix.

## Phase 6: Entities, relations, global map

* synchronizovaná tabulka a graf,
* graph filters,
* inspector,
* deep links.

## Phase 7: JSON-LD a search

* page-specific JSON-LD,
* global command search,
* validation.

## Phase 8: Hardening

* Playwright,
* axe,
* responsive screenshots,
* performance,
* documentation,
* CI,
* final clean build.

Po každé fázi spusť relevantní testy. Nečekej s integrací až na konec.

---

# 20. CO NEDĚLAT

Zakázáno:

* pouze změnit `max-width`,
* pouze zmenšit marginy,
* pouze přidat více karet,
* přepsat vše jako SPA,
* vytvořit druhý ručně udržovaný JSON dataset,
* hardcodovat počty v šablonách,
* vložit celý dataset do každé stránky,
* přidat graf bez konkrétní analytické otázky,
* přidat nové epistemické skóre,
* přidat nový obsahový scope,
* změnit autorizace,
* zamaskovat chybějící data vymyšlenou hodnotou,
* ponechat TODO text tam, kde dataset obsahuje položky,
* označit implementaci za hotovou s failing buildem,
* ignorovat mobile viewport,
* vyřešit desktop pouze zvětšením fontu a card width,
* přidat library bez zdokumentovaného účelu,
* vytvořit obří monolitický `app.js`,
* vynutit JavaScript pro základní čtení obsahu,
* odstranit tabulkovou reprezentaci ve prospěch grafu.

---

# 21. FINÁLNÍ OVĚŘENÍ

Na konci proveď minimálně:

```bash
git diff --check
npm ci
npm run build
npm run test:unit
npm run test:ui
npm run test:a11y
npm run test:responsive
```

Přizpůsob názvy skutečně implementovaným scriptům.

Dále:

* spusť lokální produkční build,
* otevři všechny hlavní route,
* ověř browser console bez chyb,
* ověř network chyby,
* ověř deep links CLM/SRC/GAP/CASE,
* ověř back/forward s filtrem a inspectorem,
* ověř bez JavaScriptu základní obsah,
* ověř mobilní screenshoty,
* ověř wide desktop screenshoty,
* ověř JSON-LD,
* ověř GitHub Pages base path.

Pokud něco selže, oprav to. Neuváděj to pouze jako „known issue“, pokud jde o
součást tohoto zadání.

---

# 22. POVINNÝ FINÁLNÍ REPORT

Finální odpověď musí být konkrétní a obsahovat:

1. stručné shrnutí výsledku,
2. původní architektonické problémy,
3. novou informační architekturu,
4. datový flow od Markdown/TOML po HTML, search a JSON-LD,
5. seznam hlavních vytvořených nebo změněných souborů,
6. popis mobile-first chování,
7. popis master-detail a URL state,
8. popis visualizations a důvod jejich použití,
9. JSON-LD model,
10. build-time enforcement,
11. přesné spuštěné příkazy,
12. přesné výsledky testů,
13. screenshot artefakty,
14. případné skutečně zbývající limity,
15. `git status --short`.

Nepoužívej vágní formulace typu:

* „improved responsiveness“,
* „enhanced UX“,
* „modernized design“.

Uveď měřitelné a ověřitelné změny.

---

# DEFINITION OF DONE

Úkol je hotový pouze tehdy, když:

* vomaste.cz působí jako analytický data workbench, nikoli jako řídký blog,
* rozhraní je skutečně mobile-first,
* desktop efektivně využívá viewport,
* data se upravují na jednom místě,
* registry, grafy, search a JSON-LD vznikají z téhož datasetu,
* drill-down neztrácí kontext,
* filtry a výběr jsou reprodukovatelné URL,
* navigace je hierarchická a nezobrazuje každou osobu na root úrovni,
* všechny odvozené počty jsou generované,
* dokumentace přesně popisuje rozšíření systému,
* validační a UI testy vynucují pravidla,
* všechny existující deep links zůstávají funkční,
* `npm run build` projde bez chyby z čistého checkoutu.

Začni repository discovery, potom implementuj. Nezastavuj se po vytvoření plánu.
