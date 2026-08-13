# vomaste.cz

[![Build & Deploy](https://github.com/korczis/vomaste.cz/actions/workflows/deploy.yml/badge.svg)](https://github.com/korczis/vomaste.cz/actions/workflows/deploy.yml)

Otevřený, Git-native systém pro tvorbu a publikaci dohledatelných
dossierů ve veřejném zájmu. Tvrzení, zdroje, entity, kauzy a vztahy jsou
strukturovaná, verzovaná data; validují se reprodukovatelným toolingem a
materializují do statického webu (Zola), nasazovaného přes GitHub Pages.
Každé podstatné tvrzení má zůstat propojené se svým zdrojem, stavem
ověření a historií revizí.

- **Živý web**: <https://vomaste.cz/> (vlastní doména GitHub Pages;
  `korczis.github.io/vomaste.cz` na ni přesměrovává)
- **Konstituce projektu (závazná)**:
  [`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`](docs/constitution/OPEN_INTELLIGENCE_COMMONS.md)
- **Redakční pravidla a autorizační log**: [`AGENTS.md`](AGENTS.md)
- **Paralelní práce více instancí**: [`docs/coop/PROTOCOL.md`](docs/coop/PROTOCOL.md),
  board [`docs/coop/TASKS.md`](docs/coop/TASKS.md)
- **Interní audity obsahu**: [`docs/dossier-audit/`](docs/dossier-audit/)
- **Licence**: [The Unlicense (public domain)](LICENSE.md) — kód, tooling
  i původní obsah; práva třetích stran viz [Licence](#licence)
- **Jak přispět**: [CONTRIBUTING.md](CONTRIBUTING.md) · **Hlášení
  zranitelností**: [SECURITY.md](SECURITY.md) (soukromě, ne issue)

> ⚠️ **Bezpečnostní hranice**: všechny kanály tohoto repozitáře (issues,
> pull requesty, Git historie) jsou **veřejné a trvalé**. Nikdy
> sem nevkládejte důvěrné dokumenty, identitu zdrojů, osobní kontakty
> ani nepublikovaný citlivý materiál. Git nezapomíná — smazaný commit
> přežívá ve forcích a cache. Projekt **nemá** zavedený důvěrný intake
> kanál a netvrdí opak; anonymitu negarantuje.

## Kudy začít

Podle toho, co chcete. Každý odkaz je vstupní bod, ne rozcestník
rozcestníků.

| Jsem tu poprvé | → [/start/](https://vomaste.cz/start/) — pět minut od „nevím, co to je“ k „umím dossier přečíst“ |
|---|---|
| Chci přispět bez programování | → [/bootcamp/](https://vomaste.cz/bootcamp/) — praktický kurz na vymyšlených datech |
| Chci rozumět metodice | → [/akademie/](https://vomaste.cz/akademie/) — kurikulum v sedmi úrovních |
| Potřebuju rychle dohledat konkrétní věc | → [/prirucka/](https://vomaste.cz/prirucka/) — postupy, reference, řešení chyb, slovníček, FAQ |
| Chci vědět, co který pojem znamená | → [/koncepty/](https://vomaste.cz/koncepty/) — **kanonické** definice |
| Chci projekt vyvíjet | → [/prispet/chci-programovat/](https://vomaste.cz/prispet/chci-programovat/) a [Rychlý start](#rychlý-start) níž |
| Chci pracovat přes Claude Code | → [/prirucka/jak-zacit-s-claude-code/](https://vomaste.cz/prirucka/jak-zacit-s-claude-code/) a [`docs/claude-code/`](docs/claude-code/) |

Vztah těch vrstev je záměrný a hlídá ho validátor: **Koncepty vlastní
definice**, Akademie a Bootcamp je učí používat, Příručka je pomáhá
dohledat. Žádná z nich pojem nedefinuje podruhé.

## Co to je

vomaste.cz je **Open Intelligence Commons** — otevřený, fork-friendly
systém komunitní veřejné inteligence. Kdokoli může převzít tooling,
založit vlastní větev výzkumu, přidat strukturovaná data, doložit vztahy
důkazy, projít automatickými i lidskými kontrolami a vrátit výsledek
upstreamu. Systém přesně rozlišuje fakta, citace, tvrzení, rozpory a
otevřené otázky; „šedá" ani „černá" tu nikdy není verdikt. Ústřední slib:
*prohlédni si zdroj, prohlédni si tvrzení, prohlédni si historii,
zreprodukuj build a zpochybni výsledek.*

**Co to není**: drbárna, černá listina, skládka leaků, platforma pro
nepodložená obvinění, centrální autorita s nárokem na konečnou pravdu,
ani důvěrná schránka provozovaná ve veřejném Gitu.

**Poctivý aktuální stav (k 2026-08-05)**: repozitář hostí dossiery
veřejně činných osob v rozsahu popsaném v `AGENTS.md`, sekce "Standing
scope authorization and publication gates" — od 2026-08-05 nahrazuje
dřívější per-subject autorizační proceduru standing scope (veřejní
činitelé, PEP, subjekty materiálně napojené na veřejnou moc/peníze) plus
devět povinných publikačních bran (zdroj, provenience, procesní rámování,
žádná vina podle grafu, nezávislost zdrojových rodin, minimalizace dat,
proporcionalita třetích stran, revidovatelná změna, deterministický
build); živý seznam na `/dossiers/`. Dossiery a entity jsou čistá,
kanonická JSON/JSON-LD data (`data/dossiers/**`, mise T-028) — Markdown
pod `content/` je generovaný routing adaptér a žádný hardcodovaný subjekt
ve strukturálním kódu není; regresní brána
`npm run lint:historical-coupling` hlídá, aby se historická vazba
nevracela (inventura:
[`docs/migrations/remove-macinka-turek-coupling-audit.md`](docs/migrations/remove-macinka-turek-coupling-audit.md)).
Volitelná lokální integrace `~/dev/prismatic-platform` jako upstream
výzkumný nástroj je autorizována architektonicky
([ADR](docs/adr/prismatic-platform-integration.md)), ale **implementačně
je to zatím jen scaffolding** — čtyři `prismatic-*` skilly a jedenáct
`prismatic:*` npm skriptů existují jako stuby, žádný reálně nefunguje;
veřejný build na tom nezávisí a nikdy záviset nebude. Příspěvkové
balíčky, sémantický diff ani fork starter kit **zatím neexistují** — nic
z toho tento README neinzeruje jako hotové.

## Jak systém funguje

```text
kanonická data (data/dossiers/**/*.json — JSON Schema + JSON-LD context)
→ data:validate (tvar · reference R1–R8 · sémantika S1–S10 · parita tabulky T1–T8 · JSON-LD expanze)
→ jednotný kompilátor (scripts/data/) → compiled model
→ view modely (data/generated/views/**) + generované content adaptéry (content/**)
→ report:evidence-plan (evidenční plán práce) + npm test (regresní testy toolingu)
→ validátory a generátory (autorizace, typy dossierů, navigace, route manifest,
  parita content == staging, linty, katalog zdrojů, exporty, search index, graf)
→ Tailwind + esbuild (assets)
→ zola build (statické HTML; šablony čtou view modely přes load_data)
→ verify:navigation-counts / verify:anchors / verify:jsonld / verify:og / verify:full-pages / verify:export
→ GitHub Actions → GitHub Pages
```

Jediný orchestrační entrypoint je `scripts/build/pipeline.mjs`
(`npm run build` / `dev` / `check`); tentýž řetěz běží lokálně i v CI
(`.github/workflows/deploy.yml`) — zelený lokální build znamená
nasaditelný stav. Generované soubory (`content/dossiers/**`,
`content/entities/*.md`, `data/generated/*`, `static/search-index.json`,
`static/css/main.css`, `static/js/app.js`) se needitují ručně — obsah se
edituje výhradně v kanonickém JSON a adaptéry regeneruje
`npm run data:build`.

## Datový model

Kanonickým zdrojem pravdy je výhradně `data/dossiers/**/*.json` — každý
záznam je validní JSON (JSON Schema, `schemas/canonical/`) i JSON-LD
(lokální context `/context/v1.jsonld`) se stabilním globálním `@id`
(`https://vomaste.cz/id/dossiers/<slug>/claims/CLM-01`). Lokální
identifikátory (`CLM-01`, `SRC-01`, …) jsou číslované po dossierech a
slouží jen UI; globální `@id` dělá kolizi napříč dossiery mechanicky
nemožnou. Plný kontrakt: [`docs/data-contract.md`](docs/data-contract.md),
rozhodnutí: [ADR](docs/adr/json-first-canonical-data-model.md).

- **Dossier** — kurátorovaný vyšetřovací rozsah
  (`data/dossiers/<slug>/dossier.json`; přítomnost souboru JE
  registrace). Typ `entity` (jedna osoba) nebo `aggregate` (generovaný
  souhrn, bez vlastních záznamů). Nese i ručně psanou tabulku tvrzení
  (markdown content block), timeline a kurátorovanou grafovou vrstvu
  (`graph`: popisky uzlů, clustery, pořadí hran, zdrojové rodiny) —
  hloubka grafu se počítá BFS, nikde se neukládá.
- **Tvrzení (CLM-##)** — `claims/clm-NN.json`: atomický, ozdrojovaný
  výrok se stavem ověření. Žije dvakrát: řádek v ručně psané tabulce
  v `dossier.json` a kanonický záznam; parita T1–T8 build shodí, pokud
  se liší byť o bajt. Detailní stránka se generuje.
- **Zdroj (SRC-##)** — `sources/src-NN.json`: outlet, typ, URL, datum
  vydání i stažení, podporovaná tvrzení, `sourceFamily` („zdrojová
  rodina" pojmenovaná podle **původu**, ne podle vydavatele — přetisk
  zprávy ČTK v Blesku patří do rodiny `ctk`) a povinná redakční poznámka
  (≥ 150 znaků). Rodina je volitelná a sama nestačí: pravidlo S10 navíc
  bere dva zdroje se shodným `outlet`em nebo shodnou registrovanou
  doménou jako **jeden** hlas, ať mají rodinu vyplněnou jakkoli.
- **Kauza (CASE-##)** — `cases/case-NN.json`: tematický celek; detailní
  stránka odkazuje na kanonickou prózu kotvou, nikdy ji nekopíruje.
- **Mezera (GAP-##)** — `gaps/gap-NN.json`: otevřená otázka s prioritou,
  datem poslední kontroly a vazbou na tvrzení. Otevřenost není zjištění
  žádným směrem.
- **Entita a vztah** — globální entity
  (`data/dossiers/_shared/entities/*.json`) a hrany grafu
  (`relations/edge-*.json`); každá ne-kontextová hrana musí být krytá
  tvrzeními a zdroji (pravidlo S3), endpointy musí být uzly grafu (R7).
- **Opravy** — append-only historie revizí (`updates/*.json`): co bylo
  kdy skutečně ověřeno a změněno.

## Stavy tvrzení

| Stav | Význam | Vynucení |
|---|---|---|
| `CORROBORATED` | potvrzeno nezávisle více redakcemi | pravidlo S2 vyžaduje dvojici zdrojů lišící se rodinou **i** vydavatelem (S10) **a nesdílející původ důkazu** (S10b) |
| `1 ZDROJ` | doloženo jediným citovaným zdrojem, bez nezávislého potvrzení | pravidlo S1 vyžaduje, aby mezi citovanými zdroji žádná taková nezávislá dvojice nebyla |
| `CITACE` | přímý výrok subjektu — ověřuje, že výrok padl, **ne** že platí jeho obsah | — |
| `SPORNÉ` | neuzavřené, nepotvrzené či rozporované tvrzení | — |
| `NÁZOR` | autorský komentář, strukturálně oddělený od zpravodajství | — |

Trvalá pravidla: procesní výsledek (odložení, promlčení, nepravomocné
rozhodnutí) se **pokaždé** odlišuje od meritorního rozhodnutí o
vině/pravdě; derivativní články jednoho původu nejsou korroborace; **ani
dva články téže redakce nejsou dvě nezávislá doložení** (S10); **ani
veřejný rejstřík a web, který ten rejstřík přetiskuje** (S10b);
povýšení stavu vyžaduje nový důkaz, nikdy jen přeznačení. Ověření, že výrok padl,
není ověřením jeho obsahu.

Evidenční pravidla S1–S4 a S10 se dají grandfatherovat jen výslovným
záznamem v `data/dossiers/_shared/semantics-baseline.json` (konkrétní
`@id` + pravidlo, degradace na warning); autorizační S5/S6 nikdy.
Baseline je dnes prázdná — celá dnešní evidenční vrstva prochází bez
výjimky. Plné znění pravidel: [`docs/data-contract.md`](docs/data-contract.md).

## Sociální a SEO metadata

Metadata pro náhledové karty a vyhledávače nejsou šablonová logika, ale
**konfigurace**. Čtyři vrstvy, každá s jedním vlastníkem:

| Vrstva | Soubor | Co vlastní |
|---|---|---|
| Konfigurace | [`data/seo.toml`](data/seo.toml) | locale, výchozí karta a rozměry, oddělovač/tagline titulku, meze délky, povinná sada značek, mapování typu stránky na `og:type` a výchozí schema.org typ |
| Vykreslení | `templates/macros/meta.html` | `meta_open_graph`, `meta_twitter`, `meta_canonical` + čisté funkce pro titulek, popis, obrázek a alt |
| Vstupy | `templates/base.html` | rozloží front matter stránky/sekce na `meta_*` skaláry a zavolá komponenty |
| Vynucení | `scripts/build/verify-og.mjs` | `npm run verify:og`, součást `npm run build` |

`og:type` a výchozí schema.org typ se **nerozhodují v šabloně**. Klíčem je
`record_type` z front matter (u dossieru zpřesněný o `dossier_type`) a
mapování žije v `[page_types.*]`. Nový typ záznamu bez záznamu v datech
shodí build, stejně jako záznam, který v datech nikdo nepoužívá — tatáž
obousměrná kontrola jako u `data/entity-types.toml`.

**Stránka nesmí tvrdit dvě věci.** `og:title`/`og:description` a
`name`/`description` stránkového uzlu JSON-LD (`@graph[0]`) jsou doslova
tatáž hodnota: `partials/jsonld.html` čte tytéž `meta_*` proměnné, ze
kterých se vykreslily `<meta>` tagy.

`npm run verify:og` běží po `zola build` nad vydaným HTML a shodí build,
když kterákoli routovaná stránka:

- nemá úplnou sadu `og:title`, `og:description`, `og:type`, `og:url`,
  `og:image`, `og:image:alt`, `og:locale`, `og:site_name` a `twitter:card`
  (seznam je v `[enforce]`, ne v kódu);
- má `og:url` jiné než svou kanonickou URL (nebo kanonickou URL nemá,
  aniž by byla v `enforce.without_canonical` — dnes jediná: `/404.html`,
  která kanonickou URL záměrně nemá);
- má relativní `og:image` (sociální sítě ho nezobrazí) nebo `og:image`
  ukazující na soubor, který ve vydaném stromu neexistuje;
- má prázdný nebo přes limit dlouhý titulek či popis (`[limits]`);
- má `og:title`/`og:description` odlišné od stránkového uzlu JSON-LD,
  nebo `twitter:*` odlišné od `og:*`;
- má `og:type` mimo slovník `[page_types.*]` nebo `og:locale` jinak než
  ve tvaru `language_TERRITORY`.

Výjimku mají jen přesměrovací stuby aliasů Zoly — táž výjimka, jakou
používá `verify:jsonld`.

Co brána **nekontroluje**, aby to nikdo nemusel odhadovat: nesahá na
síť, takže neověřuje, jak kartu vykreslí konkrétní platforma, ani
rozměry a formát obrázkového souboru (deklarované `og:image:width/height/
type` se berou z konfigurace, ne z pixelů souboru). Meze délky jsou horní
strop; Facebook i LinkedIn ořezávají dřív.

## Strukturovaná data (JSON-LD)

Kanonické záznamy jsou JSON-LD už na vstupu (`@context`, `@id`, `@type`);
každá stránka navíc vydává při buildu jeden blok `application/ld+json`
(`@graph`), generovaný centrálně v `templates/base.html` z view modelů
compiled kanonického datasetu — žádné jméno, slug ani URL nejsou v
šablonách napevno. Prezentační pole stránkového uzlu (`name`,
`description`, `inLanguage`, typ) jsou **tytéž hodnoty**, ze kterých se
vykreslily `og:*` a `twitter:*` — viz [Sociální a SEO
metadata](#sociální-a-seo-metadata):

- **WebSite / WebPage / ProfilePage** + **BreadcrumbList** a navigace
  (`SiteNavigationElement`) na každé stránce;
- **Person** výhradně na hlavní stránce entity dossieru (agregátní pohled
  osobu nikdy nevydává);
- **Claim** na stránce tvrzení: text tvrzení + `appearance` s citovanými
  zdroji; na stránkách zdrojů citační uzel (vydavatel, URL, datum).

Záměrné omezení: strukturovaná data **nenesou žádné hodnocení
pravdivosti** (`ClaimReview`, `reviewRating` apod.) — stavy popisují
zdrojování, ne rozhodnutí o pravdě. `npm run verify:jsonld` (součást
build gate) po každém buildu parsuje všechny bloky, kontroluje povinná
pole, pokrytí (každé tvrzení na disku = jeden `Claim` uzel, citační uzel
na každé stránce zdroje, právě jedna `Person` na hlavní stránce entity
dossieru) a build shodí, kdyby se hodnoticí typ kdekoli objevil.
Od T-065 navíc vynucuje, že **každá vydaná stránka nese aspoň jeden blok**
`application/ld+json` — jedinou výjimkou jsou přesměrovací stuby aliasů
Zoly.

Co zatím vynucené **není**, aby to nikdo nemusel odhadovat: stránky kauz,
mezer, vztahů a entit nesou jen stránkové scaffolding uzly
(`WebPage`/`CollectionPage` + drobečky + navigace). Jejich záznamové uzly
(`vomaste:Case`, `vomaste:Gap`, `vomaste:Relation`, entita jako `Thing`)
existují v exportech `/data/*.jsonld` níže, ne ve stránce samotné.

Vedle vložených dat existují **samostatné JSON-LD exportní routy**
(`build:jsonld-exports`, návrh v
[`docs/adr/dossier-jsonld-provenance-extension.md`](docs/adr/dossier-jsonld-provenance-extension.md)):

- `/data/dossiers/<slug>.jsonld` — plnohloubkový `@graph` každého
  dossieru: `Dataset` + `Person` (jen autorizované subjekty) + všechna
  tvrzení, zdroje, kauzy, mezery a vztahy, provázané stabilními `@id`;
- `/data/graph.jsonld` — sjednocený graf celého webu, deduplikovaný
  podle `@id`;
- `/data/jsonld-manifest.json` — `{route, sha256, bytes}` každého
  exportu; stažená kopie se dá ověřit offline:
  `node scripts/dossier/verify-export.mjs --dir <stažená-kopie>`;
- každý citovaný zdroj nese `vomaste:citationFingerprint` — SHA-256 nad
  trojicí url + retrieved + outlet, přepočitatelný kýmkoli z viditelných
  polí. Je to otisk citace, ne otisk archivované stránky; úřední registrní
  snapshoty a individuálně revidované dokumenty mají vlastní SHA-256 v
  samostatném [archivu dokumentů](https://vomaste.cz/dokumenty/), běžné
  citované webové stránky se však plošně nearchivují.
  Stejný otisk nesou i citační uzly vložené v HTML a dossier stránky na
  svůj export odkazují `<link rel="alternate" type="application/ld+json">`.

Slovník `vomaste:*` (prefix `https://vomaste.cz/ns#`) je záměrně
minimální a obsahuje jen termy, které se reálně emitují; žádné číselné
skóre důvěry se neemituje nikdy (konstituce § 8) — kategorické stavy
zdrojování vycházejí jako `vomaste:status` doslova.

## Stack a architektura

Build-time: [Zola](https://www.getzola.org/) 0.23.3 (obsah, routing,
šablony Tera), Node.js 24 + npm (validátory a generátory v
`scripts/`), Tailwind CSS (kompilace `static/css/input.css` →
`main.css`), esbuild (bundle `assets/js/` → `static/js/app.js`),
Flowbite (aplikační shell). Runtime v prohlížeči: Alpine.js (filtry,
interakce), Sigma.js + Graphology (graf vztahů a globální mapa, bundlované
esbuildem) a Chart.js (z CDN, jen na stránce dossieru). Volitelně, výhradně
po kliknutí uživatele, DuckDB-Wasm pro SQL konzoli na `/data/` — viz
[`docs/adr/duckdb-wasm-and-sigma.md`](docs/adr/duckdb-wasm-and-sigma.md).
Statický web nemá žádný běhový backend; kritický obsah má no-JS
fallback.

Tabulární data v šablonách renderuje jednotná komponenta
`templates/macros/table.html` (`table_advanced_table`, párové volání, vlastní
implementace podle vzoru Flowbite „Advanced Tables" nad volným
Tailwindem/Flowbite), vynuceno branou `npm run lint:component-reuse`;
obal tabulky nese `data-record-type` provazující řádky s JSON-LD uzly
stránky. Data tabulek pocházejí z téhož compiled kanonického modelu
jako JSON-LD `@graph`; výhledovým **plánem** (neimplementováno)
je DuckDB (`.mjs`) pipeline nad stejnými záznamy.

## Adresář dossierů

`/` i `/dossiers/` vykreslují tentýž adresář ve třech projekcích — tabulka,
kompaktní seznam, dlaždice — nad **jedním** datasetem
(`static/data/dossiers.json`, staví `scripts/dossier/lib/record-tables.mjs`
jako tenkou projekci compiled kanonického modelu + navigačního manifestu).

Projekce se přepíná parametrem `?view=table|list|grid`; stav je sdílitelný
odkazem a tlačítko zpět ho obnoví. Na mobilu je výchozí hustý seznam.
Filtrování a řazení řídí jedna kolekce pro všechny tři pohledy, takže se
nemůžou rozejít. Bez JavaScriptu zůstává výchozí projekce plně použitelná.

Rozhodnutí a jeho důsledky: [ADR](docs/adr/dossier-directory-multi-view.md).

## Archivace ARES, Justice a soudních vývěsek

<!-- DOCUMENT_ARCHIVE_DOCTRINE_V1 -->

Archiv úředních podkladů je na webu pod
[/dokumenty/](https://vomaste.cz/dokumenty/). **Zone A** ve veřejném Gitu
obsahuje hashované základní odpovědi ARES, sanitizované indexy Sbírky listin,
prázdné docket-only odpovědi soudních vývěsek a jednotlivě revidované
bezpečné dokumenty. Každá podporovaná česká právnická osoba s ověřeným IČO
musí mít ARES i Justice záznam; chybějící IČO zůstává v explicitním seznamu a
nikdy se nehádá podle názvu. Každá strojově rozpoznaná spisová značka v
kanonických dossierech musí být v inventuře jako dotaz správné vývěsky nebo
jako odkaz na samostatný oficiální systém NSS/Ústavního soudu. Nulový nález
na vývěsce vypovídá jen o dni kontroly, ne o celé historii.

**Zone B** je vždy mimo Git, PR, CI artifact i web: raw Justice metadata,
originální listiny a neprázdné odpovědi vývěsek. Výchozí kořen je
`~/dev/vomaste-archive`, nebo `VOMASTE_JUSTICE_ARCHIVE_ROOT`. Každý fyzický
soubor má SHA-256 a globální `inventory.sha256`; `.part`, chybějící soubor či
neúplné stažení se hlásí jako chyba. Originál lze zveřejnit jen jednotlivě po
obsahové a osobněprávní kontrole s proveniencí a `reviewNote` — veřejnost
zdrojového registru není souhlas s hromadným vložením PDF do Gitu.

Vynucení je záměrně rozdělené: `npm run archive:check` je offline a běží v
pre-commit hooku i v `build`/`dev`/`check`; kontroluje pokrytí, sanitizaci,
hash parity, spisovou inventuru, hranici Zone A/B a zapojení doktríny.
`npm run archive:refresh-public` dělá živé dotazy a týdenní GitHub workflow z
jeho bezpečných změn pouze otevře review PR. `npm run archive:refresh-private`
smí běžet jen na důvěryhodném stroji s perzistentním úložištěm a vyžaduje
úplný soukromý inventář. Deterministický build sám nikdy nesahá na síť ani do
Zone B.

## Struktura repozitáře

```text
.
├── data/dossiers/          # KANONICKÁ DATA: <slug>/dossier.json + registry záznamů,
│                           # _shared/ (entity, slovníky, JSON-LD context)
├── data/source-catalog/    # KANONICKÁ DATA katalogu zdrojů (1 JSON na registr/nástroj/
│                           # agregátor: proves, doesNotProve, traps, howToSearch)
├── schemas/canonical/      # JSON Schema kontrakt kanonických záznamů (AJV strict)
├── content/                # Zola routing: GENEROVANÉ adaptéry kanonických dat
│                           # (ručně psané: kořenové indexy, koncepty, dokumentace,
│                           #  manifest, mapa, /data/ a per-dossier evidence//entities/ indexy)
├── templates/              # Tera šablony (čtou view modely přes load_data);
│                           # macros/ (sdílené komponenty ui_*, table_*, meta_*),
│                           # components/ (volatelné z markdownu), partials/
├── data/source-catalog/    # ručně psané záznamy zdrojů: co dokládá, co ne, pasti
├── data/                   # navigační skeleton, seo.toml (metadata), government
│                           # roster, generovaná data
├── assets/js/              # zdrojové JS moduly (bundluje esbuild)
├── static/                 # statická aktiva + zkompilované CSS/JS + search index
├── scripts/data/           # kanonický kompilátor, validátory, generátory adaptérů, scaffold,
│                           # evidenční plán práce (report-evidence-plan.mjs)
├── scripts/build/          # pipeline.mjs — jediný orchestrační entrypoint buildu + build lock
├── scripts/dossier/        # build/verify nástroje nad compiled modelem (exporty, navigace,
│                           # katalog zdrojů, autorizace…)
├── scripts/lint/           # linty (generated content, hardcoded records, komponenty…)
├── scripts/osint/          # živé rejstříkové nástroje (ARES, registr smluv, detekce
│                           # zdrojových rodin) — mimo build
├── scripts/intake/         # veřejný intake: parser podnětu, matching, preflight (nikdy nezapisuje do dat)
├── scripts/ci/             # parita workflow ↔ package.json, validace issue formulářů
├── scripts/ui/             # regresní testy prohlížečové logiky (tabulky, hledání, nezávislost zdrojů)
├── scripts/prismatic/      # volitelná integrace s ~/dev/prismatic-platform (zčásti stuby)
├── scripts/migrations/     # archiv jednorázových migrátorů + sdílené čtecí knihovny
├── scripts/og/             # generátor náhledových karet (playwright, mimo build)
├── scripts/coop/           # koordinace více instancí (bus, worktrees)
├── scripts/setup/          # instalace git hooks (postinstall)
├── tests/e2e/              # Playwright scénáře (`npm run test:e2e`, mimo `npm run build`)
├── .githooks/              # pre-commit: rychlá podmnožina validátorů;
                            # post-commit: na masteru auto push+deploy
├── .claude/skills/         # 5 funkčních (bootstrap, dossier-entry, investigate, adr, commit)
                            # + 4 scaffoldované prismatic-*
├── docs/                   # konstituce, datový kontrakt, audity, migrace, koop, ADR, OSINT
├── reports/                # generované interní reporty (nepublikují se)
└── .github/                # workflows/deploy.yml (validace + build + Pages),
                            # workflows/dossier-intake.yml + ISSUE_TEMPLATE/ (veřejný intake)
```

## Rychlý start

Prerekvizity: Git, **Node.js 24** a npm, **Zola 0.23.x**
(<https://www.getzola.org/documentation/getting-started/installation/>).

```bash
git clone git@github.com:korczis/vomaste.cz.git
cd vomaste.cz
npm ci
npm run dev     # validace + generátory + zola serve na http://127.0.0.1:1111
```

**Nespouštěj `zola serve` přímo.** `data/generated/*` je v `.gitignore` —
vzniká buildem, takže ho `git clone` ani `git pull` nikdy nepřinese. Samotná
zola ho neumí vytvořit a skončí hláškou `load_data: … does not exist`
z hloubi `base.html`, ze které není poznat, že chybí krok pipeline.

```bash
npm run preflight   # zkontroluje, co chybí, a vypíše co spustit
npm run serve       # dogeneruje jen co chybí + zola serve (bez plné validace)
```

Po `git pull` na to upozorní hook `.githooks/post-merge`.

Máš-li [`just`](https://github.com/casey/just), totéž jde kratší cestou —
a `just doctor` navíc řekne, jestli ti nechybí prerekvizita, než začneš
hledat chybu v obsahu:

```bash
just doctor     # Node, Zola, node_modules, git hooks — reportuje, nic neinstaluje
just setup      # = npm ci (nastaví i git hooks)
just dev        # = npm run dev
just build      # = npm run build, TA brána kvality
just            # vypíše všechny recepty
```

`just` je **jen pohodlí**: každý recept je obyčejný příkaz, který jde
spustit i přímo, a nic v buildu, v hooku ani v CI na `just` nezávisí.
Kompletní seznam je [níže](#task-runner-just).

`npm ci`/`npm install` mimochodem nastaví `core.hooksPath` na `.githooks/`
(`scripts/setup/install-git-hooks.mjs`, best-effort, nikdy nerozbije
instalaci) — od té chvíle `git commit` sám spustí rychlou podmnožinu
validátorů (`.githooks/pre-commit`); ruční přeinstalace: `npm run
hooks:install`. Je to jen rychlá předběžná brána, ne náhrada za `npm run
build` před review-requestem/mergem/pushem.

**Na branchi `master` navíc commit = push = deploy.** `.githooks/post-commit`
po každém commitu na `master` sám spustí fetch → rebase → **celý**
`npm run build` → `git push origin master` (GitHub Pages CI se spustí
automaticky) — bez ručního "a teď to pushnu". Nikdy nepushne rozbitý
build ani rozpracovaný rebase; na konfliktu se vzdá a nechá commit
lokální. Detaily a únik (`COOP_NO_AUTOPUSH=1`) v
[`docs/coop/PROTOCOL.md`](docs/coop/PROTOCOL.md#automatický-push-po-commitu-post-commit-hook).
Ve worker worktree (`task/T-###`) je hook no-op — to platí jen pro
přímé commity na `master`.

**Přispíváš přes Claude Code (nebo jiného AI agenta)?** Podrobný postup
je v [`CONTRIBUTING.md`, sekce „Přispívání s Claude Code“](CONTRIBUTING.md#přispívání-s-claude-code-nebo-jiným-ai-agentem).
Zkráceně — 5 plně funkčních core skillů v `.claude/skills/`, spouštěj
v tomto pořadí podle toho, co děláš:

| Skill | Kdy ho spustit |
|---|---|
| `bootstrap` | vždy jako první krok nové session — pravidla, co-op stav, prerekvizity, volba role |
| `dossier-entry` | přidáváš CLM/SRC/CASE/GAP/relation (kanonický JSON) — vynucuje autorizační scope-gate jako krok 0 |
| `investigate` | celé autorizované šetření end-to-end (scope check → větev → manifest → zdrojovaný výzkum → PR) |
| `adr` | řešíš netriviální technické rozhodnutí (nová závislost, výměna komponenty) — měřený stav, ne odhad |
| `commit` | commit samotný — formát zprávy, který gate skutečně platí, co nahlásit na co-op sběrnici |

Plus 4 **scaffoldované, zatím nefunkční** `prismatic-*` skilly pro
volitelnou lokální integraci s `~/dev/prismatic-platform`
([ADR](docs/adr/prismatic-platform-integration.md)) — každý sám hlásí,
že pipeline za ním ještě neexistuje, viz jeho `SKILL.md`.

Plná kvalitní brána (stejná jako CI):

```bash
npm run build
```

Úspěch = nulový exit kód a závěrečné `OK` řádky obou post-build kontrol
(kotvy a JSON-LD), poslední je `OK — all JSON-LD parses, carries
required fields, and contains no truth-rating markup.`

## Task runner (`just`)

Repozitář má přes devadesát npm skriptů a je snadné netrefit ten, na kterém
záleží. `justfile` v rootu je tenký obal nad nimi — nic nepřepisuje, nic
nepřidává; když se rozejde s `package.json`, vyhrává `package.json` a
justfile je chyba.

| Recept | Obal nad | Poznámka |
|---|---|---|
| `just` / `just default` | `just --list` | výpis všech receptů |
| `just doctor` | – | Node/Zola/`node_modules`/hooks vs. co README předpokládá; jen reportuje, nikdy neinstaluje |
| `just setup` | `npm ci` | nastaví i `core.hooksPath` (postinstall) |
| `just hooks` | `npm run hooks:install` | přeinstalace hooků samostatně |
| `just dev` | `npm run dev` | dlouho běžící, sám neskončí |
| `just build` | `npm run build` | **ta** brána kvality, stejná sekvence jako CI |
| `just check` | `.githooks/pre-commit` | rychlá podmnožina; spouští přímo hook, takže se od něj nemůže rozejít |
| `just test` | `npm test` | regresní testy tooling skriptů |
| `npm run test:e2e` | [prohlížečové testy](#prohlížečové-testy-playwright) (Playwright, desktop + mobile): přístupnost, překryvy, graf, tabulky, fasety. **Není** součástí `npm run build`, ale běží v CI před nasazením |
| `just clean` | `rm -rf public` | build output není zdroj pravdy |
| `just regen` | `npm run data:build` | přegeneruje view modely a content adaptéry po editaci kanonického JSON |
| `just scaffold <slug> "<Jméno>" <subjekt> <AUTH-id>` | `npm run dossier:scaffold` | založí kanonický balíček; odmítne subjekt bez záznamu v `data/authorizations.toml` |
| `just authorize <entity>` | `npm run authorize:entity` | interaktivní potvrzení vlastníka; agent po jeho explicitním rozhodnutí používá auditovaný `--scope-file` režim |
| `just ares --ico=… \| --name="…"` | `scripts/osint/ares-lookup.mjs` | živý síťový dotaz, **není** součástí buildu |
| `just expand <ičo> [--write]` | `scripts/osint/expand-entity.mjs` | rozbalí rejstříkové okolí firmy na **kontextové** entity (kanonické JSON záznamy); výchozí je dry run, existující záznam nikdy nepřepíše |
| `just coop` / `just inbox` | `scripts/coop/coop.sh` | stav co-op boardu a sběrnice |

Instalace `just`: <https://github.com/casey/just#installation>.

## Referenční příkazy

Tahle tabulka je **výběr toho nejpoužívanějšího**. Úplný katalog — každý npm
skript, každý `just` recept i každá Claude skill na vlastní stránce, s tím, co
příkaz vynucuje, kdy ho spustit a co čte a zapisuje — je v
[`docs/TOOLING.md`](docs/TOOLING.md) a na webu v
[dokumentaci příkazů](https://vomaste.cz/dokumentace/prikazy/). Generuje se
z repozitáře (`npm run build:tooling-catalog`) a brána `verify:tooling-catalog`
shodí build, když se objeví příkaz bez záznamu — proto katalog nemůže zastarat,
zatímco tenhle výběr je ruční a záměrně neúplný.

| Příkaz | K čemu |
|---|---|
| `npm run build` | celá kvalitní brána (`scripts/build/pipeline.mjs build`): kanonická validace → view modely + adaptéry → validátory → generátory → CSS/JS → `zola build` → post-build kontroly |
| `npm run dev` | rychlá podmnožina pipeline + `zola serve` s live reloadem |
| `npm run check` | validace bez generování (`pipeline.mjs check`) |
| `npm run hooks:install` | nastaví `core.hooksPath` na `.githooks/` (jinak se spustí automaticky přes `npm ci`/`npm install`) |
| `npm test` | regresní testy tooling skriptů (Node built-in test runner, žádná nová závislost) — součást `npm run build` |
| `npm run test:update-golden` | přegeneruje `scripts/data/compiled-golden.snapshot.json` (počty záznamů/graf pro golden test) z aktuálního compiled modelu — jediný podporovaný způsob, jak ta čísla měnit; taky jediné, co potřebuješ po konfliktu v tomhle souboru |
| `npm run data:validate` | kanonická brána: tvar (`schemas/canonical/`, AJV strict) → reference R1–R8 → sémantika S1–S10 → parita tabulky T1–T8 → JSON-LD expanze |
| `npm run data:validate -- --file <cesta>` | rychlá tvarová validace jediného kanonického souboru; chybové hlášky nesou cestu |
| `npm run data:build` | kompilace datasetu + view modely + regenerace content adaptérů + parity brána content == staging |
| `npm run dossier:scaffold -- --slug=… --title="…" --subject=… --authorization-record-id=AUTH-…` | založí minimální validní kanonický balíček nového dossieru; **odmítne** subjekt bez odpovídajícího záznamu v `data/authorizations.toml` |
| `npm run validate:authorization` | každý obsah o reálné osobě odpovídá autorizačnímu záznamu |
| `npm run verify:authorization-log` | append-only autorizační log v `AGENTS.md`: žádná existující sekce nesmí být upravena ani smazána, jen přidána nová |
| `npm run validate:dossier-types` | invarianty entity/aggregate dossierů |
| `npm run validate:media` | fotografie a loga: doložená **svobodná** licence, autor, odkaz na stránku zdroje, soubor v repu; nepřipsaný obrázek v repu shodí build (M1–M4) |
| `npm run media:fetch -- <entity-id>` | stáhne portrét/logo jedné entity: identita přes Wikidata (`P31=Q5`, `P18`), licence se čte z metadat **před** stažením, soubor jde do `static/images/…` a licence do kanonického záznamu. Vždy jedna entita na běh. Přehled: `/dokumentace/licence-medii/` |
| `npm run validate:navigation` | navigace odpovídá kanonickému datasetu a existujícím routám |
| `npm run verify:anchors` | po buildu: každá kotva ze zdrojů existuje v HTML |
| `npm run verify:jsonld` | po buildu: validita, pokrytí a poctivost JSON-LD (žádné truth ratingy, citační otisky se přepočítávají) |
| `npm run verify:og` | po buildu: úplnost `og:*`/`twitter:*`, `og:url` == kanonická URL, existující a absolutní `og:image`, meze délky z `data/seo.toml` a shoda titulku/popisu se stránkovým uzlem JSON-LD |
| `npm run build:jsonld-exports` | vygeneruje `/data/dossiers/<slug>.jsonld`, `/data/graph.jsonld`, manifest s checksumy a citační otisky pro šablony — součást `npm run build` |
| `npm run verify:export` | po buildu (i offline nad staženou kopií, `--dir <cesta>`): každý export sedí na manifest hash, parsuje, nenese truth ratingy a otisky se přepočítávají |
| `npm run verify:full-pages` | po buildu: každá stránka tvrzení/zdroje má v hotovém HTML povinné sekce (full-page doktrína), kotvy `clm-##` leží uvnitř tabulky |
| `npm run build:source-catalog` / `verify:source-catalog` | přegeneruje katalog zdrojů (`/zdroje/`, `docs/osint/SOURCE_CATALOG.md`, `data/generated/source-catalog.json`) z `data/source-catalog/*.json` / shodí, když se zacommitovaný výstup rozešel s daty — `verify` je součást pre-commit hooku, ne build pipeline (v pipeline běží hned za generátorem a nikdy by neselhal) |
| `npm run report:evidence-plan` | vygeneruje `reports/evidence-plan.md` + `data/generated/evidence-plan.json`: per dossier počty tvrzení dle stavu a evidenční třídy, potenciál korroborace, mezery, datově odvozená priorita a konkrétní další krok — součást `npm run data:build` i `npm run build`, nikdy se needituje ručně. Viz [evidenční plán práce](#evidenční-plán-práce) |
| `npm run lint:historical-coupling` | de-specializační brána: žádná jména subjektů ve strukturálním kódu |
| `npm run lint:generated-content` | generované content adaptéry zůstávají minimální obálkou — ruční doménová pole neprojdou |
| `npm run lint:component-reuse` | každá top-level šablona (kromě `base.html`/`404.html`) volá aspoň jednu sdílenou komponentu `ui_*`, a každá šablona s `<table>` mimo `macros/table.html` volá `table_advanced_table` — žádný ručně psaný duplicitní markup místo sdílené komponenty |
| `npm run build:government-roster` | z `data/government.toml` vygeneruje kontextové entity členů vlády (veřejná funkce z oficiálního zdroje, `publicationRole = "context"`, **nikdy** dossier); existující záznamy nikdy nepřepisuje; součást `npm run build` |
| `node scripts/osint/ares-lookup.mjs --ico=… \| --name="…"` | dotaz do ARES (jediný spolehlivě funkční primární rejstřík) — **není** součástí `npm run build`, dělá živý síťový dotaz; doloží identitu/sídlo/formu/status, **nedoloží** skutečné majitele ani „od kdy ovládá" |
| `npm run screening:public-money -- --ico=…` | screening toku veřejných prostředků k IČO z registru smluv (ISRS) — **není** součástí `npm run build`, stahuje měsíční otevřená data; výstup je **interní** (`data/generated/public-money-screening.json` + `reports/public-money-screening.md`), nikdy se neroutuje. Doloží zveřejněné smlouvy, objem a objednatele v pokrytém období; **nedoloží** žádné pochybení ani úplnost. Viz [screening veřejných peněz](#screening-toku-veřejných-prostředků) |
| `npm run sources:detect-family` | detekce zdrojové rodiny u zdrojů s prázdným `sourceFamily` — **není** součástí `npm run build`, stahuje živě stránky zdrojů. Výstup je **návrh** (`data/generated/source-family-proposals.json` + `reports/source-family-proposals.md`), do kanonických dat sám nezapisuje; zápis dělá samostatný krok `--apply`, a to jen u verdiktu `ctk` a jen do prázdného pole. Doloží kredit původu v metadatech/podpisu/patičce; **nedoloží** obsahovou totožnost článků ani úplnost. Viz [detekce zdrojových rodin](#detekce-zdrojových-rodin) |
| `npm run build:rules-catalog` | přegeneruje [katalog pravidel](#katalog-pravidel-pravidla): `data/generated/rules-catalog.json` a stránku `/pravidla/`, vytažené z hlaviček validátorů — součást `npm run build` |
| `npm run verify:rules-catalog` | drift gate: nic nezapíše, ale spadne, když by se katalog změnil, když vlastník přišel o hlavičku, nebo když dokumentace odkazuje na pravidlo, které žádný validátor nevlastní |
| `npm run build:source-catalog` | přegeneruje [katalog zdrojů](#katalog-zdrojů-zdroje): `data/generated/source-catalog.json`, stránky pod `content/zdroje/` a `docs/osint/SOURCE_CATALOG.md`. Ručně psané záznamy (`data/source-catalog/*.json`) nesou `proves`/`doesNotProve`/`traps`; kolikrát byl který outlet skutečně použit se **dopočítá** z `data/dossiers/*/sources/`, aby seznam nemohl zastarat proti datům — součást `npm run build` |
| `npm run verify:source-catalog` | tentýž generátor s `--check`: nic nezapíše, ale spadne, kdyby zápis něco změnil — brána proti ručně upravené vygenerované stránce |
| `npm run archive:check` | čistě offline závazná brána archivu: úplné pokrytí entit s IČO v ARES + sanitizované Justice indexy, SHA-256 všech veřejných souborů, úplná inventura rozpoznaných spisových značek, nepřítomnost Zone B v Gitu a bezpečné zapojení plánovaného refresh workflow |
| `npm run archive:refresh-public` | živý refresh veřejné Zone A; ARES + sanitizované Justice indexy + docket-only vývěsky, pak offline brána. Týdenní workflow z výsledku jen otevře review PR |
| `npm run archive:check-private` / `archive:refresh-private` | kontrola checksum inventáře Zone B / úplné stažení všech indexovaných listin na důvěryhodném perzistentním úložišti. Nikdy CI ani veřejný Git; kořen určuje `VOMASTE_JUSTICE_ARCHIVE_ROOT` |
| `node scripts/osint/expand-entity.mjs --ico=… [--write]` | rozbalí rejstříkové okolí firmy (statutární orgány, společníci) na kontextové entity — kanonické JSON záznamy v `data/dossiers/_shared/entities/` (stránky `/entities/…` přegeneruje `npm run data:build`); na rozdíl od základního endpointu čte větev veřejného rejstříku, která u s.r.o. **vrací** zapsané společníky i velikost podílu. Akcionáři a.s. v rejstříku nejsou, takže prázdný seznam znamená „nezapsáno", ne „firma nemá vlastníky". Data narození a adresy bydliště nepřebírá; existující záznam nikdy nepřepíše |

## Screening toku veřejných prostředků

`npm run screening:public-money` spočítá pro zadaná IČO, kolik smluv s nimi
uzavřely veřejné instituce, v jakém objemu a kdo byli objednatelé. Data jdou
z **měsíčních otevřených dat registru smluv** (ISRS,
`data.smlouvy.gov.cz/dump_<RRRR>_<MM>.xml`) — jediného dokumentovaného
strojového rozhraní registru. Lidské rozhraní `smlouvy.gov.cz/vyhledavani`
skript záměrně nescrapuje: jeho HTML není kontrakt.

```bash
npm run screening:public-money -- --ico=04449461
npm run screening:public-money -- --ico=04449461,01529820 --from=2024-01 --to=2024-12
npm run screening:public-money -- --from-external-ids
```

| Volba | Význam |
|---|---|
| `--ico=<IČO>[,<IČO>…]` | ad-hoc screening zadaných IČO |
| `--from-external-ids` | IČO z kanonických entit (`externalIds.ico`, resp. `ares`, jen platný osmičíselný tvar). Kolik jich je, se nikam nepíše — plyne z dat; když je nula, režim to ohlásí a na síť vůbec nesáhne. Pole plní `expand-entity.mjs`, takže dávka roste s expanzí rejstříkového okolí |
| `--from=RRRR-MM`, `--to=RRRR-MM` | období; výchozí je posledních **12 dokončených** měsíců (běžící měsíc má neúplný dump a tiše by objem podhodnotil) |
| `--no-cache` | ignoruje staženou cache v `.tmp/public-money/` |
| `--json` | strojový výstup na stdout |

**Výstupy jsou interní a nikdy se neroutují**: `data/generated/public-money-screening.json`
(gitignored) a `reports/public-money-screening.md`. Zápis mimo
`data/generated/`, `reports/` a `.tmp/` skript odmítá v kódu
(`assertWritablePath`), takže se screening nemůže dostat do `content/`
ani do kanonického modelu `data/dossiers/` — a statická brána v testech to
hlídá.

### Co report dokládá a co ne

- **Dokládá**: že v registru existují zveřejněné smlouvy, kde subjekt
  vystupuje jako smluvní strana, s objednatelem, datem a hodnotou.
- **Nedokládá pochybení.** Zveřejnění je zákonná povinnost (zákon
  č. 340/2015 Sb.) a drtivá většina smluv je běžný chod veřejné správy.
  Objem je objem, ne tvrzení o korupci ani o předražení.
- **Není autorizační rozhodnutí.** Nezakládá dossier a nikoho nepovyšuje
  na předmět šetření — to vyžaduje datovaný zápis v `AGENTS.md`
  (viz [`docs/entity-discovery.md`](docs/entity-discovery.md)).
- **Není úplný.** Registr pokrývá smlouvy nad 50 000 Kč od 1. 7. 2016 se
  zákonnými výjimkami a report navíc jen zvolené období. Nula znamená
  „v pokrytém období nic zveřejněného", nikdy „subjekt nedostal veřejné
  peníze". Smlouvy bez vyplněné hodnoty se počítají do počtu, ale ne do
  objemu — report to u každého subjektu vypisuje, takže celkový objem je
  vždy **spodní odhad**.

Verze téže smlouvy (dodatky, opravy) se **nesčítají** — drží se jen platná,
resp. nejvyšší verze podle `idSmlouvy`, jinak by dodatky objem několikanásobně
nafoukly.

> ⚠️ **Mapování XML elementů zatím nebylo ověřeno živým během.** Vzniklo podle
> dokumentované struktury dumpu ISRS; v prostředí, kde skript vznikl, byl
> registr nedostupný (TLS handshake reset ze všech klientů). Skript je proti
> tiché chybě bráněný konstrukčně — dump, ze kterého nevypadne ani jeden
> `<zaznam>`, je tvrdá chyba, ne prázdný výsledek — ale první běh na
> funkční síti je potřeba zkontrolovat očima. Mapování žije na jednom místě
> (konstanta `ISRS_DUMP` v `scripts/osint/screen-public-money.mjs`).

## Katalog pravidel (`/pravidla/`)

README i koncepty citují pravidla jako `S1`, `T4` nebo `R3`, ale ta pravidla
žijí v hlavičkách validátorů. Text a kód se proto můžou rozejít potichu:
pravidlo se zpřísní a popis zůstane, nebo se popis napíše pro pravidlo, které
nikdy nevzniklo. Konstituce §8 zakazuje inzerovat schopnost, kterou nic
nevynucuje — a tohle je táž past z druhé strany.

Katalog proto **nic neopisuje**. Čte hlavičky těch modulů, které pravidla
vlastní, takže co v kódu není, se na webu neobjeví.

```bash
npm run build:rules-catalog      # přegeneruje /pravidla/ a view model
npm run verify:rules-catalog     # drift gate, nic nezapíše
```

| namespace | vlastník | co hlídá |
|---|---|---|
| `S` | `scripts/data/validate-semantics.mjs` | co smí tvrzení a hrana slíbit o síle doložení |
| `R` | `scripts/data/validate-references.mjs` | že každý odkaz vede na existující cíl |
| `T` | `scripts/data/validate-registry-table.mjs` | parita přehledové tabulky s kanonickými záznamy |
| `J` | `scripts/data/validate-jsonld.mjs` | identita a čistota JSON-LD expanze |

Stránka rozlišuje **`ERROR` (shodí build)** od **`WARNING` (jen hlásí)** a od
**„neuvedeno"** — když hlavička severitu nedeklaruje, katalog ji nedomýšlí.
Dopsat závažnost, kterou nikdo nenapsal, by bylo přesně to tvrzení bez
podkladu, které má katalog odhalovat.

Skutečný přínos je drift gate v `--check`: **odkaz na neexistující pravidlo
je chyba buildu**, ne překlep, který nikdo nenajde. Při prvním běhu odhalil
dvě reálné mezery — `S10` bylo v hlavičce zarovnané jinak a vypadávalo
z výčtu, a `S10b` se citovalo v README, aniž by ho jakýkoli validátor
deklaroval. Obojí je opravené.

## Katalog zdrojů (`/zdroje/`)

Rešerše se opakovaně zdržovala na tomtéž: který registr vůbec odpoví, co
z jeho odpovědi jde citovat a kde jsou pasti, na které už někdo jednou
najel. Ta znalost žila v hlavách a v commit zprávách, takže se platila
znovu při každém dossieru. Katalog ji drží na jednom místě, strojově
čitelně, a web ji publikuje — pro člověka i pro agenta.

Dva vstupy, záměrně oddělené:

| vstup | co v něm je | kdo ho píše |
|---|---|---|
| `data/source-catalog/*.json` | co zdroj **dokládá**, co **nedokládá** a jeho **pasti** (`proves` / `doesNotProve` / `traps`) | člověk — z dat se to odvodit nedá |
| `data/dossiers/*/sources/*.json` | které outlety a rodiny už v datasetu skutečně figurují a kolikrát | nikdo, dopočítá se |

Druhý díl se nepíše ručně schválně: seznam „co už bylo použito" tak nemůže
zastarat proti datům.

```bash
npm run build:source-catalog     # přegeneruje katalog
npm run verify:source-catalog    # nic nezapíše, spadne, kdyby zápis něco změnil
```

Generátor (`scripts/dossier/build-source-catalog.mjs`) vyrábí
`data/generated/source-catalog.json` (view model pro UI i JSON-LD),
stránku pro každý zdroj pod `content/zdroje/`, a `docs/osint/SOURCE_CATALOG.md`
pro čtení v repozitáři bez stavění webu. Zápis je idempotentní — soubor se
přepíše jen při skutečné změně, takže build neinvaliduje celý strom.

Obě fáze pipeline (`build` i `dev`) katalog staví, `--check` varianta hlídá
drift: kdyby někdo upravil vygenerovanou stránku ručně, build spadne.

Na úvodní stránce z toho žije sekce **„Odkud to víme"** — čísla i vyzdvižené
registry se čtou z vygenerovaného katalogu, takže v šabloně není napsaný ani
jeden název zdroje a landing nemůže zastarat proti datům. Ukazuje se
záměrně i to, co zdroj **nedokládá**; bez toho by výčet registrů působil jako
nárok na vševědoucnost, což je přesně opačné sdělení.

## Nezávislost není „jiný provozovatel" (S10b)

`CORROBORATED` znamená, že totéž doložily dva **nezávislé** zdroje.
Pravidla S1/S2 to počítají přes rodinu, S10 navíc přes vydavatele a
registrovanou doménu. Existuje ale dvojice, která projde všemi třemi a
přesto je jedno jediné doložení:

```
ARES (státní registr)  +  Podnikatel.cz (web, který ARES přetiskuje)
```

Jiná rodina, jiný provozovatel, jiná doména — a jeden původ důkazu.
Agregátor svá rejstříková data z registru přebírá, takže mu **nemůže
odporovat**: kdyby byl zápis chybný, přetiskl by tutéž chybu. Nezávislost
znamená, že druhý zdroj mohl dojít k jinému výsledku. Testem není jiný
provozovatel, ale **jiný původ důkazu**.

Pravidlo je proto čtvrtým důvodem kolize v
`scripts/data/lib/source-independence.mjs` — v jediném vlastníkovi
primitiva nezávislosti, ne v samostatném lintu. Tím ho dostanou naráz
brána (S1/S2/S4/S10 ve `validate-semantics.mjs`) i evidenční report
(`report-evidence-plan.mjs`), a nemůžou se rozejít.

Rozsah je záměrně úzký:

- Sleduje se **český** veřejný rejstřík a jeho přetisky (ARES,
  obchodní rejstřík, Hlídač státu, Podnikatel.cz, Kurzy.cz). Rejstříky
  dvou různých států jsou na sobě nezávislé a slévat se nesmějí.
- **Redakce, která o rejstříku píše, sem nepatří** — udělala vlastní práci
  a může se mýlit nezávisle.
- Citovat registr i agregátor společně je v pořádku, je to dobrá
  provenience. Zakázané je počítat je jako **dva hlasy**. Tvrzení citující
  registr, agregátor *a* nezávislou redakci projde: ta redakce je druhý
  hlas a dvojice se veze s ní.

Nalezeno živě 2026-08-05 na dossieru `martin-pavlik`: tři tvrzení a tři
hrany grafu nesly `CORROBORATED` přesně na téhle dvojici, přičemž záznam
zdroje sám o dva odstavce výš popisoval agregátor jako „odvozený přehled"
registru. Opraveno v `16c072ff`, pravidlo zabudováno do brány, aby
příště shodilo build místo aby odjelo na web.

## Detekce zdrojových rodin

Badge `CORROBORATED` slibuje **dvě nezávislá doložení**. Zdroj bez
`sourceFamily` se ale v pravidlech S1/S2/S4 počítá sám za sebe přes
`outlet` — pět vydání téže agenturní zprávy v pěti médiích pak vypadá
jako pět nezávislých redakcí. `npm run sources:detect-family` tuhle
kontrolu dělá strojově a opakovatelně, místo ručního čtení bylines.

```bash
npm run sources:detect-family                          # všechny zdroje s prázdnou rodinou
npm run sources:detect-family -- --dossier=andrej-babis --limit=20
node scripts/osint/detect-source-family.mjs --apply data/generated/source-family-proposals.json
node scripts/osint/detect-source-family.mjs --apply … --dry-run
```

| Volba | Význam |
|---|---|
| `--dossier=<slug>`, `--limit=<n>` | zúžení dávky |
| `--rate=<ms>`, `--timeout=<ms>` | rate limit (výchozí 600 ms) a timeout požadavku |
| `--no-cache` | ignoruje staženou cache v `.tmp/source-family/` |
| `--apply <proposals.json>` | **samostatný, vědomý krok**: zapíše rodinu do kanonických dat |
| `--dry-run` | s `--apply`: vypíše plán, ale nic nezapíše |

### Dva kroky, oddělené záměrně

Detekce **nikdy nezapisuje do `data/dossiers/**` ani do `content/`** —
odmítá to `assertWritablePath` v kódu, ne dobrý úmysl. Píše jen návrhy
do `data/generated/source-family-proposals.json` (gitignored) a report
`reports/source-family-proposals.md`. Chybný detektor tak nemůže tiše
změnit dossier.

Zápis dělá až `--apply`, a to s trojím zámkem: jen verdikt `ctk`, jen do
**prázdného** pole a nikdy přepisem existující hodnoty. Kolize se hlásí,
netiší.

### Jak se rozhoduje

Rozhoduje **doslovný kredit původu** ve třech ankotvených oblastech,
nikdy doména, outlet ani podobnost titulků:

1. strojová metadata — `<meta name="author">`, `article:author`,
   JSON-LD `author`;
2. podpisový element (class/id/rel pojmenované jako autor či podpis) a
   sigla-podpis typu `čtk, tb` v samostatném odstavci;
3. patička `Zdroj: ČTK`, agenturní značka `(čtk)` / `–ČTK/RED–` a odkaz
   na autorský rozcestník `/author/ctk/`.

Agenturní značka **má přednost před jménem redaktora**: byline
„Martin Kézr, ČTK" je převzatá agenturní zpráva, ne vlastní text. Tělo
článku se záměrně neprohledává — zmínka „řekl ČTK" je běžná i ve
vlastním zpravodajství a rodinu vyrobit nesmí.

| Verdikt | Význam | Zapíše `--apply`? |
|---|---|---|
| `ctk` | doložený kredit ČTK | ano, do prázdného pole |
| jiná rodina | doložený jiný původ (přetisk cizí redakce/agentury) — navrhuje se podle **původu**, ne podle vydavatele | ne, rozhoduje člověk |
| `own` | jmenovitý autor bez agenturní značky ⇒ rodina se **nevyplňuje** (fallback na outlet je správný) | ne |
| `unknown` | nezjištěno (paywall, 403, chybějící podpis) ⇒ rodina se **nevyplňuje** | ne |

`unknown` **není** „vlastní zpravodajství" — je to přiznané „nezjištěno".
Každý návrh nese doslovný úryvek, který rozhodl; návrh bez evidence
nevznikne.

### Co detekce nedokládá

- **Obsahovou totožnost článků.** Rodina `ctk` říká „původ je agenturní
  zpráva ČTK", ne „tyhle dva texty jsou identické". To je přesně ta
  vlastnost, kterou S2 potřebuje.
- **Úplnost.** Stránka za paywallem nebo s HTTP 403 končí jako `unknown`
  a rodina zůstává prázdná.
- **Kurátorské rozhodnutí o užší rodině.** Tam, kde člověk pojmenoval
  rodinu podle konkrétní reportáže (`seznam-zpravy-syndication`,
  `denik-n`), detektor vidí jen agenturní kredit stránky. Proto `--apply`
  nikdy nepřepisuje existující hodnotu.

## Evidenční plán práce

`npm run report:evidence-plan` (`scripts/data/report-evidence-plan.mjs`,
běží i v `npm run data:build` a `npm run build`) spočítá z kanonického
modelu, kde je zdrojování nejslabší, a vypíše pro **každý** dossier
konkrétní další krok odvozený z jeho čísel. Výstup:
[`reports/evidence-plan.md`](reports/evidence-plan.md) +
`data/generated/evidence-plan.json`.

Ruční „todo seznam" by zastaral první změnou dat, proto tenhle přehled nic
nepamatuje — je to čistá projekce `data/dossiers/**`. Každé tvrzení spadne
do právě jedné evidenční třídy podle toho, co skutečně cituje: `E0` bez
zdroje, `E1` jediný zdroj, `E1+` ≥ 2 zdroje bez nezávislé dvojice
(= potenciál na korroboraci, stačí jeden nezávislý doklad), `E2` hotovo.
Nezávislost počítá `scripts/data/lib/source-independence.mjs` — tentýž
primitiv, kterým `validate-semantics.mjs` vynucuje S1/S2/S4/S10, takže
plán a brána nemůžou ukazovat na jinou realitu. Skóre je
`3·E0 + 2·E1 + 1·E1+ + 2·otevřené mezery „vysoká" + 1·ostatní otevřené
mezery + 1·mezery bez kontroly > 30 dní`; pásmo priority je Pareto podíl
na celkovém objemu práce, ne pevný práh. Vzorec je v hlavičce skriptu
i v reportu samotném.

Report **neobsahuje čas běhu** — stáří mezer se měří proti nejnovějšímu
datu v datech, takže dva běhy nad stejným stromem dají bajt po bajtu
stejný soubor. **Nehodnotí osoby**: vysoké skóre vypovídá o tom, kolik
zdrojovací práce má nedodělané tenhle web, ne o subjektu dossieru.
Neroutuje se, Zola ho nevidí.

## Přidání obsahu do dossieru

> Rozšíření na nový subjekt nebo novou kauzu vyžaduje **předchozí**
> autorizaci vlastníka zapsanou v `AGENTS.md` (append-only log). Bez ní
> se obsah o reálných osobách nepřidává — v pochybnostech se ptej,
> nerozšiřuj.

Vše se edituje jako kanonický JSON v `data/dossiers/<slug>/…` — detailní
průvodce krok za krokem (včetně běžných chybových hlášek):
[`docs/contributing/add-dossier-data.md`](docs/contributing/add-dossier-data.md).

1. **Zdroj**: `sources/src-NN.json` dle schématu
   (`identifier`, `outlet`, `sourceType`, `url`, `retrieved`,
   `published`, `claims`, `subjects`, povinná redakční poznámka
   v `content` bloku). Zdroj cituj, jen pokud jsi ho skutečně otevřel —
   nikdy ze snippetu vyhledávače.
2. **Tvrzení**: `claims/clm-NN.json` + řádek `CLM-NN` do tabulky tvrzení
   v `dossier.json` (s kotvou `<a id="clm-NN"></a>` a odkazem na detail)
   — parita T1–T8 vynucuje byte-shodu. Jedno tvrzení = jeden ověřitelný
   výrok; stav podle skutečné síly důkazu (viz tabulka výše).
3. **Kauza**: `cases/case-NN.json`; narativ patří do content bloku
   `dossier.json`, kauza na něj odkazuje kotvou.
4. **Mezera**: `gaps/gap-NN.json` (`priority`, `checked`, `claims`) —
   neutrálně formulovaná otázka, ne insinuace.
5. **Vztah**: `relations/edge-*.json` + uzel/hrana v `graph` poli
   `dossier.json`; hrana bez tvrzení a zdroje neprojde validací (S3, R7).
6. `npm run data:validate` → `npm run data:build` → `npm run build` —
   červená znamená chybějící zdroj, kotvu, referenci nebo drift mezi
   tabulkou a kanonickými záznamy. Nikdy neobcházet.

## Příspěvky (pull requesty)

Standardní GitHub flow: fork → větev → změna → zelený `npm run build` →
pull request. Práce na vlastní feature branchi `.githooks/post-commit`
nijak neovlivní — auto-push se týká jen přímých commitů na `master`
(ve tvém forku by to pushlo na tvůj vlastní `origin master`, ne na
tento repo; `COOP_NO_AUTOPUSH=1` to i tak úplně vypne, pokud ho
nechceš). Každý příspěvek prochází lidským review proti redakčním
pravidlům a konstituci; **obsah o reálných osobách navíc vyžaduje
předchozí autorizaci vlastníka v append-only logu `AGENTS.md`** — PR
rozšiřující pokrytí bez ní nebude přijat, jakkoli je téma „veřejně
zajímavé". Automatika kontroluje integritu (zdroje, kotvy, parity,
stavy), **nikoli pravdivost** — tu žádný nástroj nerozhodne, od toho je
review a zdrojová disciplína. Závazný postup: [CONTRIBUTING.md](CONTRIBUTING.md)
+ `AGENTS.md`; sémantický diff zatím neexistuje. Pamatuj: pull requesty
jsou veřejné (viz bezpečnostní hranice nahoře).

## Nový dossier

Nový dossier je datová operace, ne zásah do jádra:

1. autorizace subjektu vlastníkem — nový datovaný záznam v append-only
   logu `AGENTS.md`; buď interaktivně přes `npm run authorize:entity`, nebo
   mechanicky agentem po jasném pokynu vlastníka v aktuální konverzaci
   (`--owner-authorized-in-conversation` + auditovaný `--scope-file`). Pokyn
   „založ/přidej/prozkoumej dossier X“ stačí; agent sepíše pracovní rozsah z
   pokynu a otevřených veřejných zdrojů a nečeká na další potvrzení. CI ani
   plánovaná automatizace nesmějí záměr vlastníka samy dovozovat;
2. `npm run dossier:scaffold -- --slug=<slug> --title="<Jméno>"
   --subject=<subjekt> --authorization-record-id=<AUTH-id>` — založí
   kanonický balíček `data/dossiers/<slug>/` (dossier.json + prázdné
   registry); bez autorizačního záznamu odmítne běžet;
3. obsah: kanonické záznamy `claims/`, `sources/`, … (skill
   `dossier-entry`, průvodce `docs/contributing/add-dossier-data.md`);
4. žádná úprava navigace, šablon ani JS — vše se generuje z datasetu;
   `validate:navigation` vynucuje, že entity dossier v navigaci je a
   odkazuje na existující routy;
5. `npm run data:build` a `npm run build` — `validate:dossier-types`
   a spol. vynucují zbytek.

## Fork a nezávislé nasazení

Fork je deklarovaný cíl (konstituce, invariant 4) a z velké části už
realita: build nepotřebuje žádné tajemství, privátní backend ani službu
mimo repozitář; nasazení jede přes GitHub Actions → Pages (OIDC token
workflow, žádný PAT). Co fork nastavuje: `base_url` v `config.toml`
(+ `static/CNAME` pro vlastní doménu), `title`/`description` a vlastní
kanonická data `data/dossiers/**` (+ ručně psané kořenové indexy a
koncepty v `content/`). Zbytky historické vazby na výchozí dossiery
hlídá regresní brána `npm run lint:historical-coupling` (mimo build
gate; historická inventura:
`docs/migrations/remove-macinka-turek-coupling-audit.md`). Redakční
odpovědnost, právní posouzení a případný intake si každý fork řeší sám;
fork nepřebírá redakční schválení upstreamu.

Pro adoptéra je nejkratší cesta `just doctor` → `just setup` → `just build`
(viz [Task runner](#task-runner-just)); `just build` je zároveň ta brána,
kterou nesmí vypnout, kdo se chce k tomuto datovému modelu hlásit. Veřejné,
čtivé znění téhož je koncept
[Forkovatelnost a adopce](https://vomaste.cz/koncepty/forkovatelnost/).

## Opravy a právo na odpověď

Návrhy oprav a reakce subjektů přijímají **veřejné GitHub issue
formuláře** (`.github/ISSUE_TEMPLATE/`: návrh dossieru/entity, oprava
faktu, reakce subjektu, mrtvý zdroj). Odeslaný podnět zpracuje
deterministický automat (parsování, porovnání s datasetem entit, riziková
klasifikace, technická kontrola URL) a vrátí do issue čitelný report —
**nikdy** dossier, tvrzení ani autorizaci; ta zůstává výhradně ruční
zápis vlastníka do append-only logu v `AGENTS.md`. Podrobně:
[`docs/intake/public-submission.md`](docs/intake/public-submission.md).
Podání je veřejné a trvalé (viz bezpečnostní hranice nahoře) — důvěrný
kanál projekt nemá a netvrdí opak.

Každá věcná změna publikovaného obsahu je dohledatelná:
commit + kanonický záznam v `data/dossiers/<slug>/updates/` (append-only).
Subjekty dossierů mohou žádat opravu, dodat reakci nebo protidůkazy;
nemají redakční veto. Podání samo o sobě dataset nemění — projde
posouzením proti redakčním pravidlům v `AGENTS.md`.

## Prohlížečové testy (Playwright)

Node testy (`npm test`) hlídají tooling a data. To, co uvidí čtenář —
kontrast, ovládání klávesnicí, překryv prvků, chování grafu — se dá změřit
jen ve skutečném prohlížeči, a proto na to je druhá sada.

```bash
npm run test:e2e                # desktop i mobile (Pixel 5, Desktop Chrome)
npm run test:e2e:desktop        # jen desktop
npm run test:e2e:benchmark      # výkonnostní běh grafu (RUN_GRAPH_BENCHMARK=1)
npm run benchmark:graph         # měření grafu bez prohlížeče
```

Čtrnáct sad pod `tests/e2e/` pokrývá přístupnost (`a11y-sweep`,
`accessibility`), hustotu a překryv layoutu (`density-overlap`), grafový
workbench a jeho nástroje, registrové tabulky, fasetové filtry, chování
vyhledávání při selhání, intake CTA, české skloňování a adresář dossierů.

Podstatný detail: **typy stránek se odvozují z `routes.json` a
`navigation.json`** (`tests/e2e/archetypes.mjs`), ne z ručního seznamu.
Nový typ stránky se do plošné kontroly zařadí sám — ruční výčet by se
tvářil jako úplný, přestože by nový typ tiše přeskočil.

Sada **není** součástí `npm run build` (potřebuje nainstalovaný prohlížeč),
ale **běží v CI**: `deploy.yml` po validaci spustí `npx playwright install
--with-deps chrome` a `npm run test:e2e`, a report ukládá jako artefakt
`playwright-report`. Červený e2e běh tedy zastaví nasazení stejně jako
červený build.

## Nasazení

Push do `master` spustí `.github/workflows/deploy.yml`: `npm ci` → celá
validace (stejné příkazy jako lokálně) → `zola check` → `zola build` →
`verify:anchors` → [prohlížečové testy](#prohlížečové-testy-playwright)
(`npm run test:e2e`, report jako artefakt `playwright-report`) → upload
artefaktu → `actions/deploy-pages`. Ruční spuštění: workflow_dispatch. Ověření produkce: porovnat nasazený obsah
s očekávaným commitem (`gh run list`, pak kontrola klíčových rout).

Ten push typicky nespouští nikdo ručně — `.githooks/post-commit` ho
udělá sám po každém commitu na `master` (viz „Rychlý start" a
[`docs/coop/PROTOCOL.md`](docs/coop/PROTOCOL.md#automatický-push-po-commitu-post-commit-hook)),
včetně vlastního `npm run build` běhu předtím, takže commit, který se
tam vůbec nedostane, byl na plné bráně červený.

## Známá omezení (k 2026-08-05)

- Do 2026-07-30 se JSON-LD exportní routy (`/data/*.jsonld`) v produkci
  vůbec negenerovaly, přestože lokální `npm run build` je vytvářel:
  deploy workflow si kroky pipeline vypisoval ručně a nové kroky do něj
  nikdo nedoplnil. Opraveno tím, že CI volá `npm run build`; proti
  opakování hlídá `npm run check:workflow-parity` (součást build gate).
- Citační otisky (`vomaste:citationFingerprint`) jsou otiskem citace
  (url + retrieved + outlet), **ne** archivované stránky. Projekt nyní
  archivuje bezpečné úřední registrní výstupy a jednotlivě revidované
  dokumenty s vlastními SHA-256, nikoli plošně všechny citované webové
  stránky; manifest exportů je hashovaný, ne podepsaný (ADR práh: podpis
  až bude reálná potřeba prokazovat autorství exportu, ne jen integritu).
- **Žádný důvěrný intake kanál.** Veřejný intake (níže) je veřejná
  GitHub issue — okamžitě viditelná, trvale dohledatelná, bez záruky
  anonymity odesílatele. Nic v tomto repozitáři nenabízí chráněné ani
  anonymní podání a nic to tvrdit nesmí.
- Žádný sémantický diff ani fork starter kit — viz roadmapa
  v konstituci, § 11.
- Z intake návrhu jsou hotové fáze 2–6 (procesor, matching, preflight,
  formuláře, workflow); fáze 7+ (draft PR, provozní runbooky)
  implementované nejsou.
- `lint:historical-coupling` zůstává mimo build gate (spouští se ručně);
  zapojení do gate je otevřený úkol.
- Vyhledávací index a `data/generated/*` jsou interní artefakty buildu,
  ne stabilní veřejné API. Stabilní strojová vrstva jsou exporty
  `/data/*.json(ld)` s manifestem.

## Řešení potíží

| Příznak | Příčina a oprava |
|---|---|
| `zola: command not found` / build padá na Zole | Zola není v PATH nebo je jiná řada než **0.23.x** (CI pinuje 0.23.3). Instalace: <https://www.getzola.org/documentation/getting-started/installation/>; ověření `zola --version`. |
| `data:validate` hlásí T3 „řádka tabulky se neshoduje s kanonickým claimem" | Tabulka tvrzení v `dossier.json` a kanonický záznam `claims/clm-NN.json` se rozešly (text/stav/zdroje se porovnávají byte-verně). Uprav jedno či druhé tak, aby se shodovaly, a validaci zopakuj. |
| `data:check-generated:content` hlásí drift | Ručně editovaný generovaný soubor pod `content/dossiers/**` nebo `content/entities/`. Vrať úpravu do kanonického JSON a spusť `npm run data:build`. **Pozor na pořadí**: uvnitř `npm run build` běží `data:sync-content` *před* touhle bránou, takže ruční úpravu těla stránky přepíše a build zůstane zelený — drift se ohlásí jen když bránu spustíš samostatně nad nesynchronizovaným stromem. Podezřelý diff v `content/` se kontroluje takhle: `npm run data:check-generated:content`. |
| `npm run dev` „visí" | Nevisí — `zola serve` je server a sám neskončí. Čekej na řádek `Web server is available`, web běží na <http://127.0.0.1:1111>. |

## Licence

Kód, tooling, šablony, dokumentace i původní redakční text a data tohoto
repozitáře jsou public domain pod **[The Unlicense](LICENSE.md)** —
používej, forkuj a šiř bez omezení, atribuce vítána, ne vyžadována.
Licence se **nevztahuje** na obsah třetích stran (citované články,
titulky a úryvky zůstávají právy původních vydavatelů — repozitář je
cituje, nerelicencuje) a nezbavuje přebírajícího vlastní právní
odpovědnosti (ochrana osobnosti, GDPR, autorské právo jeho jurisdikce).
Podrobné vymezení: [LICENSE.md](LICENSE.md).

## Hlubší dokumentace

Konstituce (`docs/constitution/`), redakční pravidla a datový model
(`AGENTS.md`), koop protokol (`docs/coop/`), audity obsahu
(`docs/dossier-audit/`), migrační inventura (`docs/migrations/`),
architektonická rozhodnutí (`docs/adr/`). Veřejný dossier-intake:
provozně [`docs/intake/`](docs/intake/) (podání, kontrakt formuláře,
matching, riziková klasifikace, bezpečnostní hranice), návrhový ADR
Fáze 1 + stav implementace
[`docs/adr/ADR-public-dossier-intake.md`](docs/adr/ADR-public-dossier-intake.md),
auditní reporty v `reports/intake/`. Volitelná integrace s
`~/dev/prismatic-platform` jako lokální upstream výzkumný nástroj:
[`docs/adr/prismatic-platform-integration.md`](docs/adr/prismatic-platform-integration.md)
(architektura přijata 2026-08-05, pipeline zatím scaffolding — viz
implementation status v ADR) + build plán
[`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md).

Stejné řídicí dokumenty (AGENTS.md, přispívání, konstituce, licence,
bezpečnostní politika, koop protokol) jsou navíc čitelné přímo na webu
pod **[/dokumentace/](https://vomaste.cz/dokumentace/)** — vykreslené
build-time ze stejných zdrojových souborů (žádná druhá kopie, žádný
klientský JavaScript; viz [`docs/adr/markdown-and-mermaid-rendering.md`](docs/adr/markdown-and-mermaid-rendering.md)).
