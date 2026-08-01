# Mise: přestavba vomaste.cz na JSON/JSON-LD-first datovou platformu

**Datum zadání**: 2026-08-01 · **Zadavatel**: vlastník webu (on the record,
v konverzaci s ORCH session) · **Stav**: dekomponováno na coop board
(`docs/coop/TASKS.md`, T-028) · **Baseline audit**:
[`docs/migrations/json-first-baseline.md`](../migrations/json-first-baseline.md)
(vytvořen jako Fáze A této mise).

Tento soubor uchovává vlastníkův master prompt doslovně, aby na něj mohly
navazovat další worker sessions bez ztráty kontextu. Toto zadání
**absorbuje T-001** (fyzické rozpojení macinka-turek do petr-macinka/
filip-turek entity dossierů, AGENTS.md „Structural change, 2026-07-29
(second)"): vlastník rozhodl 2026-08-01, po auditu ukazujícím, že staré
T-001 worktree bylo neslučitelnou fosilií, že cíle T-001 (každý záznam
vlastněný právě jedním entity dossierem) se dosáhne přes JSON `dossier`
pole v této migraci, ne přesunem Markdown souborů. T-001 zůstává na
boardu jako `superseded-by-T-028` pro auditní stopu, ne jako smazaný.

Jde o **technickou** migraci datové architektury (§ 23 promptu: žádné
nové subjekty, žádné rozšíření kauz, žádná nová rešerše, žádná změna
tvrzení/statusů/routů bez kompatibilního redirectu). Autorizační log v
`AGENTS.md` se nemění.

---

## Plné znění zadání (verbatim)

# Claude Code Prompt: Přestavba vomaste.cz na JSON/JSON-LD-first datovou platformu

Pracuješ autonomně v repozitáři:

```text
~/dev/vomaste.cz
```

Tvým úkolem je provést zásadní, ale plně zpětně kompatibilní přestavbu datové architektury projektu.

Nejde o kosmetický refactoring. Jde o obrácení současného toku dat:

```text
SOUČASNÝ STAV

content/**/*.md + TOML registry
        ↓
regex parsování front matter
        ↓
odvozené JSON / JSON-LD exporty
        ↓
Zola HTML
```

na:

```text
CÍLOVÝ STAV

data/dossiers/**/*.json
        ↓
JSON Schema + JSON-LD validace
        ↓
jednotný kompilovaný datový model
        ↓
view modely + routy + navigace + graf + statistiky + exporty
        ↓
generované minimální content/**/*.md adaptéry
        ↓
Zola/Tera HTML
```

## 1. Hlavní architektonický invariant

Kanonickým zdrojem pravdy pro všechny dossierové záznamy musí být výhradně:

```text
data/dossiers/**/*.json
```

Týká se to minimálně:

* dossierů,
* entit,
* tvrzení,
* zdrojů,
* kauz,
* mezer,
* vztahů,
* aktualizací,
* navigačních metadat,
* grafových uzlů a hran,
* stavů pokrytí,
* vazeb mezi registry,
* JSON-LD identifikátorů,
* routovacích metadat.

Žádný claim, source, case, gap, relation ani entity record nesmí mít svou kanonickou podobu v Markdown front matter, TOML tabulce, šabloně nebo JavaScriptu.

Platí:

```text
JSON/JSON-LD = autoritativní vstup
Markdown = generovaný Zola routing adapter
Tera = prezentační vrstva
static/data = generovaný veřejný export
```

Jakákoli faktická data v generovaných Markdown souborech jsou pouze odvozenou projekcí JSON zdroje a nesmějí se ručně upravovat.

## 2. Současný stav, který musíš nejprve ověřit

Před první změnou proveď audit skutečného checkoutu.

V aktuálním analyzovaném snapshotu bylo přibližně:

* 22 dossierů,
* 813 tvrzení,
* 483 zdrojů,
* 72 kauz,
* 186 mezer,
* 84 vztahů,
* 66 globálních entit,
* přibližně 1 925 Markdown souborů,
* 0 kanonických JSON souborů v `data/dossiers/`.

Ověř aktuální čísla přímo v pracovním stromu. Snapshot může být novější.

Spusť nejprve:

```bash
git status --short
npm install
npm run build
```

Pokud baseline build neprojde, zdokumentuj přesné existující chyby. Nezaměňuj existující závadu za závadu způsobenou migrací.

Vytvoř strojově čitelný baseline obsahující:

* počet záznamů podle typu,
* seznam dossierů,
* seznam všech veřejných rout,
* seznam všech lokálních identifikátorů,
* seznam všech globálních `@id`,
* vazby CLM ↔ SRC,
* vazby CASE ↔ CLM/SRC,
* vazby GAP ↔ CLM,
* vazby REL ↔ entity/CLM/SRC,
* SHA-256 veřejných datových exportů,
* počet uzlů a hran grafu,
* počty záznamů podle dossieru,
* aktuální výsledky validátorů.

Ulož audit například do:

```text
docs/migrations/json-first-baseline.md
data/generated/migration-baseline.json
```

`data/generated/` je generovaný prostor, nikoli ručně editovaný zdroj.

## 3. Cílová adresářová struktura

Navrhni a implementuj datové balíčky přibližně v tomto tvaru:

```text
data/
└── dossiers/
    ├── _shared/
    │   ├── context/
    │   │   └── vomaste-v1.jsonld
    │   ├── entities/
    │   │   ├── babis.json
    │   │   ├── agrofert.json
    │   │   └── ...
    │   ├── vocabularies/
    │   │   ├── claim-statuses.json
    │   │   ├── entity-types.json
    │   │   ├── relation-types.json
    │   │   ├── source-types.json
    │   │   └── coverage-states.json
    │   └── schemas/
    │       └── případné registry verzí
    │
    ├── andrej-babis/
    │   ├── dossier.json
    │   ├── claims/
    │   │   ├── clm-01.json
    │   │   └── ...
    │   ├── sources/
    │   │   ├── src-01.json
    │   │   └── ...
    │   ├── cases/
    │   │   ├── case-01.json
    │   │   └── ...
    │   ├── gaps/
    │   │   ├── gap-01.json
    │   │   └── ...
    │   ├── relations/
    │   │   ├── edge-babis-agrofert.json
    │   │   └── ...
    │   └── updates/
    │       └── 2026-07-30.json
    │
    ├── petr-macinka/
    │   └── ...
    └── macinka-turek/
        └── dossier.json
```

Přesný tvar můžeš zlepšit, ale dodrž následující pravidla:

1. `data/dossiers/<slug>/dossier.json` identifikuje kořen dossierového balíčku.
2. Kompilátor automaticky objevuje dossierové balíčky. Nesmí existovat druhý ručně udržovaný seznam v `data/dossiers.toml`.
3. Sdílené entity mají jediný kanonický záznam.
4. Dossierové záznamy odkazují na entity pomocí globálního `@id`.
5. Všechny záznamy musí být validní JSON.
6. Všechny doménové záznamy musí současně představovat validní nebo deterministicky rozšiřitelný JSON-LD dokument.
7. Přidání nového autorizovaného dossieru nesmí vyžadovat úpravu šablon, navigace, JavaScriptu ani hardcoded seznamu slugů.

Adresář `_shared` je rezervovaný a kompilátor jej nesmí považovat za dossier.

## 4. Každý JSON soubor musí být samostatný datový záznam

Každý záznam musí obsahovat minimálně:

```json
{
  "$schema": "...",
  "schemaVersion": 1,
  "@context": "https://vomaste.cz/context/v1.jsonld",
  "@id": "https://vomaste.cz/id/dossiers/andrej-babis/claims/CLM-01",
  "@type": "vomaste:Claim",
  "recordType": "claim",
  "identifier": "CLM-01",
  "dossier": {
    "@id": "https://vomaste.cz/id/dossiers/andrej-babis"
  }
}
```

Názvy polí přizpůsob existujícím konvencím projektu, ale zachovej tyto principy:

* explicitní verze schématu,
* explicitní typ záznamu,
* stabilní globální `@id`,
* lidsky čitelný lokální identifikátor,
* explicitní dossierový namespace,
* žádné implicitní vazby založené pouze na názvu souboru,
* žádné odkazy, jejichž význam závisí na aktuálním pracovním adresáři.

### 4.1 Globální a lokální identifikátory

Současné identifikátory jako `CLM-01` nebo `SRC-01` jsou lokální v rámci dossieru.

Nikdy je nepoužívej samostatně jako globální klíč.

Správný globální identifikátor musí obsahovat dossier:

```text
https://vomaste.cz/id/dossiers/andrej-babis/claims/CLM-01
https://vomaste.cz/id/dossiers/andrej-babis/sources/SRC-01
```

Můžeš současně zachovat:

```json
"identifier": "CLM-01"
```

pro zobrazení v UI.

Všechny interní reference musí používat globální `@id`, případně normalizovaný objekt:

```json
{
  "@id": "https://vomaste.cz/id/dossiers/andrej-babis/sources/SRC-01"
}
```

Tím musí být mechanicky znemožněna historická chyba, při níž se stejné `SRC-##` spojovalo napříč různými dossiery.

## 5. Datové typy

### 5.1 Dossier

`dossier.json` musí obsahovat minimálně:

* `@id`,
* `@type`,
* `slug`,
* `title`,
* `description`,
* `dossierType`,
* hlavní subjekt nebo zdrojové dossiery,
* canonical route,
* navigation visibility,
* language,
* stav pokrytí,
* datum poslední aktualizace,
* autorizaci nebo referenci na autorizační záznam,
* SEO metadata,
* volitelné úvodní obsahové bloky,
* případné aliasy rout,
* případnou agregaci jiných dossierů.

Musí podporovat současné typy:

* entity dossier,
* aggregate dossier.

Historický model `macinka-turek` zachovej beze změny významu. Nemigruj jej „hezčím" způsobem, pokud by se změnily routy, vlastnictví záznamů nebo autorizovaný rozsah.

### 5.2 Entity

Entity záznam musí podporovat:

* stabilní `@id`,
* lokální `entityId`,
* titul,
* alternativní názvy,
* typ entity,
* roli,
* stav publikace,
* stav dossierového pokrytí,
* dossierové vazby,
* metadata veřejné funkce,
* datum snapshotu,
* externí identifikátory,
* aliasy rout,
* obrázky nebo vizuální metadata, pokud existují,
* explicitní rozlišení subjektu dossieru a kontextové entity.

Kontextová osoba nesmí být automaticky publikována jako autorizovaný subjekt dossieru.

### 5.3 Claim

Claim musí podporovat:

* `@id`,
* `identifier`,
* dossier,
* text tvrzení,
* stav tvrzení,
* zobrazovaný štítek,
* zdrojové reference,
* subjektové entity,
* související kauzy,
* případné časové období,
* obsahové bloky,
* route slug,
* pořadí,
* vytvoření a poslední kontrolu,
* explicitní procesní poznámky, pokud existují.

Stavy musí zůstat kategoriální. Nevytvářej:

* číselné confidence score,
* pravděpodobnost pravdivosti,
* rating osoby,
* automatické hodnocení viny,
* `ClaimReview`,
* truth score.

### 5.4 Source

Source musí podporovat:

* `@id`,
* `identifier`,
* název,
* vydavatele,
* zdrojovou rodinu,
* typ média,
* původní URL,
* datum publikace,
* datum získání,
* podporované claims,
* subjekty,
* obsahové bloky,
* citační fingerprint,
* případný archivní odkaz,
* případný stav dostupnosti zdroje,
* route slug.

Zdrojová rodina musí být explicitní datové pole. Nelze automaticky považovat dvě URL nebo dva články stejného vydavatele za dvě nezávislá potvrzení.

### 5.5 Case

Case musí podporovat:

* `@id`,
* `identifier`,
* titul,
* shrnutí,
* období,
* procesní stav,
* zobrazovaný štítek,
* claims,
* sources,
* subjects,
* obsahové bloky,
* route slug,
* pořadí.

### 5.6 Gap

Gap musí podporovat:

* `@id`,
* `identifier`,
* název,
* přesný popis toho, co chybí,
* prioritu,
* datum poslední kontroly,
* claims,
* subjects,
* stav,
* případné uzavření,
* obsahové bloky,
* route slug.

Otevřená mezera nesmí být interpretována jako nález viny, neviny ani nepravdivosti.

### 5.7 Relation

Relation musí být jediným kanonickým zdrojem grafových hran.

Musí podporovat:

* `@id`,
* `relationId`,
* zdrojovou entitu,
* cílovou entitu,
* typ vztahu,
* štítek,
* stav,
* claims,
* sources,
* subjects,
* časové metadata,
* směrovost,
* route slug,
* obsahové bloky.

`graph.toml` nesmí po dokončení migrace zůstat druhým zdrojem pravdy.

Graf se musí generovat z:

```text
entities + relations + claims + sources
```

Nikoli obráceně.

## 6. Obsahové bloky místo Markdown souborů jako databáze

Současné detailní Markdown stránky obsahují důležité vysvětlující texty. Ty se nesmějí ztratit.

Každý JSON záznam musí podporovat strukturované obsahové bloky, například:

```json
{
  "content": [
    {
      "type": "markdown",
      "value": "Původní text stránky..."
    },
    {
      "type": "process-note",
      "value": "Zrušení rozsudku není odsouzení."
    },
    {
      "type": "quote",
      "value": "...",
      "attribution": "...",
      "source": {
        "@id": "..."
      }
    }
  ]
}
```

Pro první lossless migraci je přijatelné zabalit celé současné Markdown tělo do jednoho:

```json
{
  "type": "markdown",
  "value": "..."
}
```

Nevymýšlej automaticky jemnější sémantickou strukturu tam, kde ji nelze bezpečně odvodit.

Renderer ale navrhni rozšiřitelně pro bloky typu:

* `markdown`,
* `paragraph`,
* `quote`,
* `process-note`,
* `editorial-note`,
* `warning`,
* `timeline`,
* `list`,
* `table`,
* `references`,
* `related-records`.

Obsahové bloky jsou data. Tera partialy jsou jejich renderer.

## 7. JSON Schema jako vstupní brána

Přepiš současná schémata tak, aby validovala přímo kanonické JSON soubory, nikoli až normalizované řádky získané regexovým parsováním Markdown front matter.

Použij JSON Schema Draft 2020-12 a AJV.

Požadavky:

* `additionalProperties: false`,
* explicitní `required`,
* formáty identifikátorů,
* formáty URL,
* formáty dat,
* uzavřené enumy pouze tam, kde je množina skutečně redakčně uzavřená,
* sdílené `$defs`,
* verzování schémat,
* srozumitelné chybové zprávy obsahující cestu k souboru,
* validace každého souboru samostatně,
* validace celého sloučeného datasetu.

Samostatně odděl:

1. shape validation,
2. referenční integritu,
3. redakční sémantiku,
4. autorizaci,
5. route integritu,
6. JSON-LD integritu,
7. export integritu.

Jedno pravidlo musí mít jednoho vlastníka. Nevytvářej několik validátorů kontrolujících totéž různými způsoby.

## 8. JSON-LD musí být vstupní model, ne dekorace na výstupu

Vytvoř lokální verzovaný context:

```text
data/dossiers/_shared/context/vomaste-v1.jsonld
```

Veřejná route může být:

```text
https://vomaste.cz/context/v1.jsonld
```

Build nesmí během validace stahovat kontext ze sítě. Implementuj lokální document loader nebo mapování veřejné URL na lokální soubor.

Použij standardní JSON-LD knihovnu pro:

* expanzi,
* kompaktování,
* kontrolu `@id`,
* deduplikaci uzlů,
* generování globálního `@graph`,
* případný export do N-Quads.

Veřejné výstupy musí zahrnovat minimálně:

```text
static/data/dossiers/<slug>.json
static/data/dossiers/<slug>.jsonld
static/data/entities.json
static/data/claims.json
static/data/sources.json
static/data/cases.json
static/data/gaps.json
static/data/relations.json
static/data/graph.json
static/data/graph.jsonld
static/data/routes.json
static/data/search-index.json
static/data/manifest.json
```

Manifest musí obsahovat:

* route,
* typ artefaktu,
* počet záznamů,
* počet bajtů,
* SHA-256,
* verzi schématu,
* verzi contextu,
* datum buildu nebo reprodukovatelný source timestamp,
* identifikátor datového snapshotu.

JSON-LD export nesmí přidávat tvrzení, která nejsou ve vstupních datech.

## 9. Jednotný datový kompilátor

Nahraď ad hoc parsování jednotným modulem, například:

```text
scripts/data/
├── discover.mjs
├── load.mjs
├── validate-shape.mjs
├── validate-references.mjs
├── validate-semantics.mjs
├── normalize.mjs
├── compile.mjs
├── build-view-models.mjs
├── build-exports.mjs
└── generate-zola-content.mjs
```

Případně zvol kompaktnější strukturu, ale musí existovat jedna sdílená knihovna, kterou používají všichni konzumenti.

Cílové API může být například:

```javascript
const model = await loadCanonicalDataset(root);
await validateCanonicalDataset(model);
const compiled = compileDataset(model);
```

`compiled` musí být jediný vstup pro:

* Zola view modely,
* routy,
* navigaci,
* počty,
* tabulky,
* graf,
* JSON exporty,
* JSON-LD exporty,
* fulltextový index,
* sitemap metadata,
* entity explorer,
* SQL konzoli,
* DuckDB-Wasm datasety,
* Sigma.js datasety,
* JSON-LD vložené do HTML.

Po migraci nesmí jednotlivé build skripty znovu samostatně procházet Markdown front matter.

`record-tables.mjs` buď:

* odstraň,
* nebo jej změň na tenkou kompatibilní projekci nad kompilovaným JSON modelem.

Nesmí nadále regexem parsovat `content/**/*.md`.

## 10. Zola content jako generovaný routing adapter

Zola neumí vytvořit libovolný počet rout pouze z datových souborů. Proto vytvoř deterministický generátor minimálních content souborů.

Generované soubory mají mít přibližně tento charakter:

```toml
+++
title = "CLM-01"
template = "record.html"
weight = 1

[extra]
generated = true
record_type = "claim"
record_id = "https://vomaste.cz/id/dossiers/andrej-babis/claims/CLM-01"
view_model = "generated/dossiers/andrej-babis/claims/clm-01.json"
+++
```

Tělo souboru má být prázdné.

Případně může obsahovat pouze jednoznačný komentář:

```text
GENERATED FILE. DO NOT EDIT.
```

Generátor musí vytvořit:

```text
content/dossiers/<slug>/_index.md
content/dossiers/<slug>/claims/_index.md
content/dossiers/<slug>/claims/<record>.md
content/dossiers/<slug>/sources/_index.md
content/dossiers/<slug>/sources/<record>.md
content/dossiers/<slug>/cases/_index.md
content/dossiers/<slug>/cases/<record>.md
content/dossiers/<slug>/gaps/_index.md
content/dossiers/<slug>/gaps/<record>.md
content/dossiers/<slug>/relations/_index.md
content/dossiers/<slug>/relations/<record>.md
content/entities/<entity>.md
```

Tyto soubory:

* nesmějí být kanonickým zdrojem obsahu,
* nesmějí obsahovat ručně udržované duplicity,
* mohou obsahovat pouze Zola metadata nezbytná pro route,
* musí se kompletně regenerovat,
* musí být deterministické,
* nesmějí se ručně editovat.

Zvaž jejich odstranění z Git indexu a generování před každým Zola buildem. Pokud je ponecháš verzované, implementuj CI gate, který ověří, že přesně odpovídají aktuálním JSON datům.

Ručně psané stránky typu:

```text
content/dokumentace/**
content/koncepty/**
```

mohou zůstat Markdownem, protože jde o redakční dokumentaci, nikoli registry faktických záznamů.

Dossierové registry a entity stránky však musí být generované.

## 11. View modely pro Tera šablony

Nevystavuj Tera šablony přímo neomezenému kanonickému grafu.

Vytvoř deterministické view modely, například:

```text
data/generated/views/
├── landing.json
├── dossiers-index.json
├── entities-index.json
├── map.json
└── dossiers/
    └── andrej-babis/
        ├── overview.json
        ├── claims-index.json
        ├── claims/
        │   └── clm-01.json
        ├── sources-index.json
        └── ...
```

View model může obsahovat:

* již vyřešené route,
* štítky,
* předpočítané počty,
* breadcrumb položky,
* sousední záznamy,
* related records,
* facet hodnoty,
* tabulkové řádky,
* odkazy na entity,
* JSON-LD fragment,
* SEO metadata.

View model nesmí zavádět nové faktické tvrzení. Je pouze odvozenou projekcí.

Tera templates musí:

* načítat příslušný view model,
* používat společné partialy,
* nemít hardcoded entity, claimy ani dossier slugs,
* nemít hardcoded počty,
* nemít ručně udržované seznamy registrů,
* neprovádět složitou doménovou logiku.

## 12. Navigace, routy a UI musí být plně odvozené

Z datového modelu automaticky generuj:

* hlavní navigaci,
* sekundární navigaci dossieru,
* badge s počty,
* breadcrumbs,
* sitemap,
* aliases,
* route manifest,
* entity index,
* dossier index,
* registr tvrzení,
* registr zdrojů,
* registr kauz,
* registr mezer,
* registr vztahů,
* landing-page statistiky,
* poslední aktualizace,
* graf,
* vyhledávací index,
* tabulkové facety,
* exportní odkazy.

Žádná šablona ani JavaScript modul nesmí obsahovat ručně napsané počty typu:

```text
49 tvrzení
56 zdrojů
25 entit
```

Všechny počty se odvozují z kompilovaného datasetu při každém buildu.

Každý záznam musí být:

* routovatelný,
* bookmarkovatelný,
* adresovatelný stabilním `@id`,
* dohledatelný ve vyhledávání,
* dostupný v JSON exportu,
* dostupný v JSON-LD exportu,
* dostupný v tabulkovém view,
* dostupný v odpovídajících vztazích a drill-down pohledech.

## 13. Odstranění duplicitních grafových dat

Současné `data/dossiers/<slug>/graph.toml` obsahují další reprezentaci entit a vztahů.

Po migraci:

```text
entity JSON + relation JSON
        ↓
compiled graph
        ↓
Sigma.js / Graphology JSON
        ↓
JSON-LD graph
```

`graph.toml` musí být odstraněn jako kanonický vstup.

Uzel grafu se generuje z entity záznamu a dossierového kontextu.

Hrana grafu se generuje z relation záznamu.

Každá faktická hrana musí mít:

* source entity,
* target entity,
* relation type,
* minimálně jeden podporující claim,
* minimálně jeden podporující source, pokud to vyžaduje redakční model,
* status,
* route,
* globální `@id`.

Validátor musí odmítnout:

* neexistující uzel,
* neexistující claim,
* neexistující source,
* hranu bez evidence,
* duplicitní `@id`,
* neplatný typ vztahu,
* nekonzistentní směr vztahu.

## 14. Migrace existujících dat

Napiš jednorázový, ale opakovatelný migrační nástroj:

```text
scripts/migrations/migrate-content-to-json.mjs
```

Musí:

1. načíst současné dossierové Markdown front matter,
2. načíst celé Markdown body,
3. načíst `data/dossiers.toml`,
4. načíst `graph.toml`,
5. načíst `stats.toml`,
6. načíst `updates.toml`,
7. načíst globální entity,
8. vytvořit kanonické JSON/JSON-LD záznamy,
9. vytvořit mapu starý soubor → nový záznam,
10. vytvořit migrační report,
11. odmítnout nejednoznačné nebo kolidující záznamy,
12. zachovat text beze změny významu,
13. zachovat všechny routy a aliasy,
14. zachovat všechny identifikátory,
15. zachovat všechny CLM ↔ SRC vazby,
16. zachovat všechny procesní výhrady,
17. zachovat autorizovaný rozsah.

Nástroj musí být idempotentní.

Druhý běh nad stejným vstupem nesmí vytvářet další změny.

Neměň při migraci:

* formulace tvrzení,
* stav tvrzení,
* zdroje,
* datum získání,
* názvy třetích osob,
* procesní kvalifikace,
* obsah mezer,
* autorizovaný rozsah,
* význam vztahů.

Toto je datová migrace, nikoli další rešeršní kolo.

## 15. Autorizační záznamy a governance

`AGENTS.md` obsahuje append-only autorizační záznamy.

Platí bez výjimky:

* existující záznamy neupravuj,
* existující záznamy nemaž,
* nepřepisuj historii,
* automaticky nerozšiřuj pokrytí,
* nepovažuj kontextovou entitu za autorizovaný subjekt,
* nevytvářej nový dossier pouze proto, že existuje entity JSON.

Kompilátor musí ověřit, že každý publikovaný subjekt dossieru má odpovídající autorizaci.

Můžeš vytvořit strukturovaný odvozený index autorizací, například:

```text
data/generated/authorizations.json
```

Ten ale musí být generovaný z auditního zdroje nebo jinak jednoznačně navázaný na append-only autorizační log.

Nevytvářej druhý ručně udržovaný autorizační registr, který by mohl driftovat proti `AGENTS.md`.

## 16. Contributor workflow

Cílová zkušenost přispěvatele musí být:

```bash
git clone ...
cd vomaste.cz
# přidání nebo úprava JSON souborů
$EDITOR data/dossiers/<slug>/...
npm install
npm run data:validate
npm run data:build
npm run build
```

Po přidání validních a autorizovaných JSON souborů se musí automaticky vytvořit:

* Zola content adaptéry,
* routy,
* detailní stránky,
* indexy,
* navigace,
* badge,
* search index,
* graf,
* JSON exporty,
* JSON-LD exporty,
* statistiky,
* manifesty,
* checksumy.

Přidání nového dossieru nesmí vyžadovat ruční editaci:

* `templates/`,
* `assets/js/`,
* `data/navigation.toml`,
* `data/dossiers.toml`,
* route seznamu,
* stats souboru,
* grafového TOML,
* landing-page počtů.

Přidej uživatelsky srozumitelné příkazy, například:

```json
{
  "scripts": {
    "data:validate": "...",
    "data:compile": "...",
    "data:generate-content": "...",
    "data:build": "...",
    "data:check-generated": "...",
    "dossier:scaffold": "...",
    "dossier:import": "..."
  }
}
```

`dossier:scaffold` musí vytvořit minimální validní JSON balíček, nikoli Markdown stránky.

## 17. Build pipeline

Přestav `npm run build` do zřetelných fází:

```text
1. testy kompilátoru
2. kontrola append-only autorizací
3. shape validace vstupních JSON
4. JSON-LD expanze a kontrola
5. referenční a redakční validace
6. kompilace jednotného modelu
7. generování view modelů
8. generování Zola content adaptérů
9. generování rout a navigace
10. generování statistik
11. generování grafu
12. generování JSON exportů
13. generování JSON-LD exportů
14. generování search indexu
15. CSS build
16. JS build
17. Zola build
18. ověření rout a kotev
19. ověření JSON-LD
20. ověření exportů a checksumů
21. kontrola determinismu
```

Zaveď jeden orchestrace entrypoint, aby `build` a `dev` nepoužívaly dva driftující seznamy kroků.

Například:

```text
scripts/build/pipeline.mjs
```

s režimy:

```bash
node scripts/build/pipeline.mjs build
node scripts/build/pipeline.mjs dev
node scripts/build/pipeline.mjs check
```

Nebo jiný dobře otestovaný ekvivalent.

CI musí volat stejnou pipeline jako lokální build.

## 18. Determinismus a reprodukovatelnost

Stejný Git checkout musí vytvořit stejné generované artefakty.

Zaveď test:

```bash
npm run data:build
sha256sum relevant-output-files
npm run data:build
sha256sum relevant-output-files
```

Výsledky musí být shodné.

Nevkládej aktuální čas do generovaných souborů, pokud není získán z explicitního datového snapshotu nebo `SOURCE_DATE_EPOCH`.

Řazení musí být explicitní:

* podle dossieru,
* podle typu,
* podle numerické části identifikátoru,
* případně podle explicitního `order`.

Nespoléhej na pořadí vracené filesystemem.

## 19. Lint pravidla

Přidej automatické brány:

### 19.1 Žádná kanonická data v dossierovém Markdownu

Build musí spadnout, pokud generovaný dossierový Markdown obsahuje ručně udržované doménové pole nebo obsah mimo povolenou minimální obálku.

### 19.2 Žádné TOML dossierové registry

Po dokončení migrace nesmí být kanonickým vstupem:

```text
data/dossiers.toml
data/dossiers/*/graph.toml
data/dossiers/*/stats.toml
data/dossiers/*/updates.toml
```

Kompatibilní generovaný TOML artefakt je přípustný pouze tehdy, pokud jej Zola skutečně potřebuje a je jednoznačně označen jako generated.

### 19.3 Žádná record-specific data v templates

Rozšiř `lint:hardcoded-records` tak, aby odhalil:

* konkrétní CLM/SRC/CASE/GAP ID v templates,
* konkrétní dossier slug,
* konkrétní jméno subjektu v generické komponentě,
* ručně napsané dataset counts,
* ručně napsané route seznamy,
* hardcoded graph nodes nebo edges.

### 19.4 Žádné osiřelé JSON soubory

Každý JSON record musí být:

* načten kompilátorem,
* validován,
* zahrnut v manifestu,
* dosažitelný z dossieru nebo globálního registru,
* případně explicitně označen jako neveřejný nebo pomocný.

## 20. Testy

Přidej minimálně:

### Unit testy

* discovery dossierových balíčků,
* načtení každého record type,
* validace schémat,
* normalizace `@id`,
* lokální JSON-LD context loader,
* numerické řazení `CLM-2` před `CLM-10`,
* route generation,
* source-family independence,
* deduplikace entit,
* aggregate dossier,
* alias routes,
* obsahové bloky,
* checksum manifest.

### Property/invariant testy

* každá claim source reference existuje ve stejném dossierovém namespace,
* každý claim má minimálně jeden zdroj,
* `CORROBORATED` používá minimálně dvě nezávislé source families,
* každá case reference existuje,
* každá gap reference existuje,
* každá relation endpoint entity existuje,
* každá relation evidence reference existuje,
* každé `@id` je globálně unikátní,
* každá veřejná route je unikátní,
* každý veřejný záznam má route,
* každý route record má JSON a JSON-LD reprezentaci,
* žádná kontextová osoba není vydána jako autorizovaný dossier subject.

### Golden tests

Pro několik reprezentativních dossierů vytvoř snapshoty:

* self-canonical entity dossier,
* aggregate dossier,
* dossier s větším grafem,
* dossier s procesně citlivým claimem,
* dossier s otevřenými gaps,
* dossier s alias routes.

### Migrační parity testy

Před odstraněním původních zdrojů porovnej starý a nový model:

* stejné počty,
* stejné identifikátory,
* stejné texty,
* stejné statusy,
* stejné URL zdrojů,
* stejné published/retrieved hodnoty,
* stejné vazby,
* stejné veřejné routy,
* stejné aliasy,
* stejný autorizovaný rozsah.

## 21. Dokumentace

Aktualizuj minimálně:

```text
README.md
AGENTS.md
CLAUDE.md
PROJECT_INSTRUCTIONS.md
CONTRIBUTING.md
docs/data-contract.md
schemas/README.md
```

Existující autorizační záznamy v `AGENTS.md` se nesmějí měnit. Přidávej pouze nové technické sekce mimo append-only auditní záznamy, pokud to jeho struktura dovoluje.

Vytvoř ADR:

```text
docs/adr/json-first-canonical-data-model.md
```

ADR musí popsat:

* proč Markdown front matter přestává být zdrojem pravdy,
* proč je JSON/JSON-LD kanonické,
* proč Zola stále potřebuje generované content adaptéry,
* globální identifikátory,
* composite-key problém starých `CLM-##` a `SRC-##`,
* autorizační hranice,
* tok dat,
* generované artefakty,
* rozšiřování schémat,
* migrační strategii,
* rollback strategii,
* contributor workflow.

Vytvoř také praktický návod:

```text
docs/contributing/add-dossier-data.md
```

Musí obsahovat přesný příklad:

1. přidání entity,
2. přidání dossieru,
3. přidání source,
4. přidání claimu,
5. přidání case,
6. přidání gap,
7. přidání relation,
8. spuštění validace,
9. vygenerování webu,
10. řešení běžných chyb.

## 22. Migrační strategie a commity

Rozděl práci do logických, samostatně kontrolovatelných etap.

Doporučené fáze:

### Fáze A: Baseline a ADR

* audit,
* datový kontrakt,
* cílová struktura,
* baseline manifest,
* žádná změna produkčního výstupu.

### Fáze B: JSON schemas a JSON-LD context

* nové vstupní schema,
* shared definitions,
* context,
* lokální loader,
* test fixtures.

### Fáze C: Canonical dataset compiler

* discovery,
* loader,
* validace,
* normalizace,
* compiled model,
* testy.

### Fáze D: Lossless migrátor

* Markdown/TOML → JSON,
* report,
* parity kontroly,
* idempotence.

### Fáze E: Generované Zola content adaptéry

* route stubs,
* index pages,
* entity pages,
* aliases,
* determinismus.

### Fáze F: Tera view modely

* přepojení detailů a indexů,
* odstranění čtení doménových dat z front matter,
* zachování současného vzhledu a rout.

### Fáze G: Přepojení všech generátorů

* stats,
* navigation,
* routes,
* search,
* graph,
* exports,
* JSON-LD,
* DuckDB,
* Sigma.

### Fáze H: Odstranění starých zdrojů pravdy

* `dossiers.toml`,
* `graph.toml`,
* record front matter,
* ručně udržované stats/updates,
* regex parser.

### Fáze I: Contributor tooling a dokumentace

* scaffold,
* import,
* validation UX,
* examples,
* docs.

### Fáze J: Full parity, cleanup a final gate

* build,
* route diff,
* export diff,
* visual smoke test,
* determinism,
* dead-code removal.

Po každé fázi:

1. aktualizuj implementační plán,
2. spusť relevantní testy,
3. spusť alespoň odpovídající dílčí build,
4. zaznamenej změny a zjištěné odchylky,
5. vytvoř samostatný commit,
6. nepokračuj přes selhávající gate.

Nečekej na potvrzení mezi fázemi, pokud nenarazíš na skutečný konflikt s autorizačním rozsahem nebo na neřešitelnou ztrátu dat.

## 23. Zákazy

Nedělej následující:

* nepřidávej nové subjekty,
* nerozšiřuj kauzy,
* neprováděj novou webovou rešerši,
* nepřepisuj tvrzení,
* „nevylepšuj" právní formulace,
* neslučuj zdroje bez doloženého pravidla,
* neměň statusy claimů,
* nevytvářej truth score,
* nevytvářej confidence score,
* neměň routy bez kompatibilního redirectu nebo aliasu,
* neponechávej dva rovnocenné zdroje pravdy,
* neudržuj ručně generované soubory,
* neřeš Zola omezení návratem k front matter databázi,
* nevytvářej framework s abstrakcemi, které nemají alespoň dva skutečné konzumenty,
* nepovažuj úspěšné vygenerování JSON za dokončení, pokud jej šablony a UI reálně nekonzumují.

## 24. Definice dokončení

Práce je hotová pouze tehdy, když platí všechno následující:

1. Všechny dossierové doménové záznamy mají kanonickou podobu v JSON.
2. Každý kanonický record je JSON-LD adresovatelný.
3. `content/dossiers/**/*.md` je plně generované.
4. `content/entities/*.md` je plně generované.
5. Ručně psané dossierové front matter již není zdrojem faktů.
6. `graph.toml` není zdrojem grafu.
7. `dossiers.toml` není ručně udržovaný registr dossierů.
8. Stats nejsou ručně udržované.
9. Updates nejsou ručně udržované v TOML.
10. Všechny generátory používají stejný compiled model.
11. Přidání autorizovaného JSON balíčku automaticky vytvoří webové routy.
12. Všechny původní záznamy jsou zachovány.
13. Všechny původní veřejné routy fungují.
14. Všechny původní aliasy fungují.
15. Všechny registry jsou vzájemně provázané.
16. Graf se generuje z entities a relations.
17. Navigace se generuje z datasetu.
18. Počty se generují z datasetu.
19. JSON exporty se generují z datasetu.
20. JSON-LD exporty se generují z datasetu.
21. Search index se generuje z datasetu.
22. Build je deterministický.
23. `npm run test` prochází.
24. `npm run build` prochází bez chyb.
25. CI používá stejnou build pipeline.
26. Neexistuje nevalidovaný nebo osiřelý datový soubor.
27. Neexistuje ručně napsaný record-specific obsah v generických templates.
28. Autorizační log zůstává append-only a beze změny historie.

## 25. Závěrečný report

Po dokončení vypiš:

* architektonické shrnutí,
* původní a nový datový tok,
* seznam nových klíčových modulů,
* seznam odstraněných zdrojů pravdy,
* migrační statistiky,
* počet migrovaných záznamů podle typu,
* počet vygenerovaných rout,
* route parity výsledek,
* export parity výsledek,
* seznam schémat,
* seznam validátorů,
* výsledky testů,
* výsledek `npm run build`,
* zbývající technický dluh,
* přesné commity vytvořené během implementace.

Přilož rovněž příklad kompletního přidání jednoho testovacího dossierového balíčku pomocí JSON souborů, ale nepublikuj nový skutečný subjekt a nerozšiřuj autorizovaný rozsah.

Použij syntetickou test fixture mimo produkční data.

## Výsledný princip

Po dokončení musí být možné provést:

```bash
cp -R valid-authorized-dossier-json data/dossiers/example
npm run build
```

a tooling musí bez dalších ručních zásahů:

* objevit dossier,
* validovat jej,
* ověřit autorizaci,
* přeložit JSON-LD,
* propojit reference,
* vygenerovat entity,
* vygenerovat claims,
* vygenerovat sources,
* vygenerovat cases,
* vygenerovat gaps,
* vygenerovat relations,
* vygenerovat graf,
* vygenerovat routy,
* vygenerovat navigaci,
* vygenerovat tabulky,
* vygenerovat search index,
* vygenerovat JSON export,
* vygenerovat JSON-LD export,
* vygenerovat Zola content adaptéry,
* sestavit celý web,
* ověřit výslednou integritu.

Zola je po této změně pouze deterministický renderer nad kompilovaným datovým modelem.

Data se upravují v JSON.

Tooling z nich generuje celý veřejný, routovatelný, auditovatelný web.
