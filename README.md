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

**Poctivý aktuální stav (k 2026-08-01)**: repozitář hostí dossiery
autorizovaných veřejně činných osob (přesný, datovaný, append-only rozsah
autorizace viz `AGENTS.md`; živý seznam na `/dossiers/`). Dossiery a
entity jsou čistá, kanonická JSON/JSON-LD data (`data/dossiers/**`,
mise T-028) — Markdown pod `content/` je generovaný routing adaptér a
žádný hardcodovaný subjekt ve strukturálním kódu není; regresní brána
`npm run lint:historical-coupling` hlídá, aby se historická vazba
nevracela (inventura:
[`docs/migrations/remove-macinka-turek-coupling-audit.md`](docs/migrations/remove-macinka-turek-coupling-audit.md)).
Příspěvkové balíčky, sémantický diff ani fork starter kit **zatím
neexistují** — nic z toho tento README neinzeruje jako hotové.

## Jak systém funguje

```text
kanonická data (data/dossiers/**/*.json — JSON Schema + JSON-LD context)
→ data:validate (tvar · reference R1–R7 · sémantika S1–S8 · parita tabulky T1–T8 · JSON-LD expanze)
→ jednotný kompilátor (scripts/data/) → compiled model
→ view modely (data/generated/views/**) + generované content adaptéry (content/**)
→ validátory a generátory (autorizace, navigace, route manifest, exporty, search index, graf)
→ Tailwind + esbuild (assets)
→ zola build (statické HTML; šablony čtou view modely přes load_data)
→ verify:anchors / verify:jsonld / verify:full-pages / verify:export
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
  vydání i stažení, podporovaná tvrzení, `sourceFamily` („vydavatelské
  rodiny" — zdroje téhož vydavatele se nepočítají jako nezávislá
  potvrzení) a povinná redakční poznámka (≥ 150 znaků).
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
| `CORROBORATED` | potvrzeno nezávisle více redakcemi | pravidlo S2 vyžaduje ≥ 2 zdroje z ≥ 2 nezávislých rodin |
| `1 ZDROJ` | doloženo jediným citovaným zdrojem, bez nezávislého potvrzení | pravidlo S1 vyžaduje právě 1 zdroj |
| `CITACE` | přímý výrok subjektu — ověřuje, že výrok padl, **ne** že platí jeho obsah | — |
| `SPORNÉ` | neuzavřené, nepotvrzené či rozporované tvrzení | — |
| `NÁZOR` | autorský komentář, strukturálně oddělený od zpravodajství | — |

Trvalá pravidla: procesní výsledek (odložení, promlčení, nepravomocné
rozhodnutí) se **pokaždé** odlišuje od meritorního rozhodnutí o
vině/pravdě; derivativní články jednoho původu nejsou korroborace;
povýšení stavu vyžaduje nový důkaz, nikdy jen přeznačení. Ověření, že
výrok padl, není ověřením jeho obsahu.

## Strukturovaná data (JSON-LD)

Kanonické záznamy jsou JSON-LD už na vstupu (`@context`, `@id`, `@type`);
každá stránka navíc vydává při buildu jeden blok `application/ld+json`
(`@graph`), generovaný centrálně v `templates/base.html` z view modelů
compiled kanonického datasetu — žádné jméno, slug ani URL nejsou v
šablonách napevno:

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
pole, pokrytí (každé tvrzení na disku = jeden `Claim` uzel) a build
shodí, kdyby se hodnoticí typ kdekoli objevil.

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
  polí (otisk citace, ne archivu stránky — archivace zatím neexistuje).
  Stejný otisk nesou i citační uzly vložené v HTML a dossier stránky na
  svůj export odkazují `<link rel="alternate" type="application/ld+json">`.

Slovník `vomaste:*` (prefix `https://vomaste.cz/ns#`) je záměrně
minimální a obsahuje jen termy, které se reálně emitují; žádné číselné
skóre důvěry se neemituje nikdy (konstituce § 8) — kategorické stavy
zdrojování vycházejí jako `vomaste:status` doslova.

## Stack a architektura

Build-time: [Zola](https://www.getzola.org/) 0.22.1 (obsah, routing,
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
`templates/macros/table.html` (`table::advanced_table`, vlastní
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

## Struktura repozitáře

```text
.
├── data/dossiers/          # KANONICKÁ DATA: <slug>/dossier.json + registry záznamů,
│                           # _shared/ (entity, slovníky, JSON-LD context)
├── schemas/canonical/      # JSON Schema kontrakt kanonických záznamů (AJV strict)
├── content/                # Zola routing: GENEROVANÉ adaptéry kanonických dat
│                           # (ručně psané zůstávají jen kořenové indexy a koncepty)
├── templates/              # Tera šablony (čtou view modely přes load_data)
├── data/                   # navigační skeleton, government roster, generovaná data
├── assets/js/              # zdrojové JS moduly (bundluje esbuild)
├── static/                 # statická aktiva + zkompilované CSS/JS + search index
├── scripts/data/           # kanonický kompilátor, validátory, generátory adaptérů, scaffold
├── scripts/build/          # pipeline.mjs — jediný orchestrační entrypoint buildu
├── scripts/dossier/        # build/verify nástroje nad compiled modelem (exporty, navigace…)
├── scripts/lint/           # linty (generated content, hardcoded records, komponenty…)
├── scripts/osint/          # živé rejstříkové nástroje (ARES, registr smluv) — mimo build
├── scripts/coop/           # koordinace více instancí (bus, worktrees)
├── scripts/setup/          # instalace git hooks (postinstall)
├── .githooks/              # pre-commit: rychlá podmnožina validátorů
├── .claude/skills/         # bootstrap, dossier-entry, investigate, adr, commit
├── docs/                   # konstituce, datový kontrakt, audity, migrace, koop, ADR
├── reports/                # generované interní reporty (nepublikují se)
└── .github/workflows/      # deploy.yml — validace + build + GitHub Pages
```

## Rychlý start

Prerekvizity: Git, **Node.js 24** a npm, **Zola 0.22.x**
(<https://www.getzola.org/documentation/getting-started/installation/>).

```bash
git clone git@github.com:korczis/vomaste.cz.git
cd vomaste.cz
npm ci
npm run dev     # validace + generátory + zola serve na http://127.0.0.1:1111
```

**Nespouštěj `zola serve` přímo.** `data/generated/*` a `data/dossiers/*/stats.toml`
jsou v `.gitignore` — vznikají buildem, takže je `git clone` ani `git pull` nikdy
nepřinese. Samotná zola je neumí vytvořit a skončí hláškou `load_data: … does not
exist` z hloubi `base.html`, ze které není poznat, že chybí krok pipeline.

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

**Přispíváš přes Claude Code (nebo jiného AI agenta)?** Podrobný postup
je v [`CONTRIBUTING.md`, sekce „Přispívání s Claude Code“](CONTRIBUTING.md#přispívání-s-claude-code-nebo-jiným-ai-agentem).
Zkráceně — 5 skillů v `.claude/skills/`, spouštěj v tomto pořadí podle
toho, co děláš:

| Skill | Kdy ho spustit |
|---|---|
| `bootstrap` | vždy jako první krok nové session — pravidla, co-op stav, prerekvizity, volba role |
| `dossier-entry` | přidáváš CLM/SRC/CASE/GAP/relation (kanonický JSON) — vynucuje autorizační scope-gate jako krok 0 |
| `investigate` | celé autorizované šetření end-to-end (scope check → větev → manifest → zdrojovaný výzkum → PR) |
| `adr` | řešíš netriviální technické rozhodnutí (nová závislost, výměna komponenty) — měřený stav, ne odhad |
| `commit` | commit samotný — formát zprávy, který gate skutečně platí, co nahlásit na co-op sběrnici |

Plná kvalitní brána (stejná jako CI):

```bash
npm run build
```

Úspěch = nulový exit kód a závěrečné `OK` řádky obou post-build kontrol
(kotvy a JSON-LD), poslední je `OK — all JSON-LD parses, carries
required fields, and contains no truth-rating markup.`

## Task runner (`just`)

Repozitář má přes třicet npm skriptů a je snadné netrefit ten, na kterém
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
| `just clean` | `rm -rf public` | build output není zdroj pravdy |
| `just regen` | `npm run data:build` | přegeneruje view modely a content adaptéry po editaci kanonického JSON |
| `just scaffold <slug> "<Jméno>" <subjekt> <AUTH-id>` | `npm run dossier:scaffold` | založí kanonický balíček; odmítne subjekt bez záznamu v `data/authorizations.toml` |
| `just authorize <entity>` | `npm run authorize:entity` | interaktivní potvrzení vlastníka; agent po jeho explicitním rozhodnutí používá auditovaný `--scope-file` režim |
| `just ares --ico=… \| --name="…"` | `scripts/osint/ares-lookup.mjs` | živý síťový dotaz, **není** součástí buildu |
| `just expand <ičo> [--write]` | `scripts/osint/expand-entity.mjs` | rozbalí rejstříkové okolí firmy na **kontextové** entity (kanonické JSON záznamy); výchozí je dry run, existující záznam nikdy nepřepíše |
| `just coop` / `just inbox` | `scripts/coop/coop.sh` | stav co-op boardu a sběrnice |

Instalace `just`: <https://github.com/casey/just#installation>.

## Referenční příkazy

| Příkaz | K čemu |
|---|---|
| `npm run build` | celá kvalitní brána (`scripts/build/pipeline.mjs build`): kanonická validace → view modely + adaptéry → validátory → generátory → CSS/JS → `zola build` → post-build kontroly |
| `npm run dev` | rychlá podmnožina pipeline + `zola serve` s live reloadem |
| `npm run check` | validace bez generování (`pipeline.mjs check`) |
| `npm run hooks:install` | nastaví `core.hooksPath` na `.githooks/` (jinak se spustí automaticky přes `npm ci`/`npm install`) |
| `npm test` | regresní testy tooling skriptů (Node built-in test runner, žádná nová závislost) — součást `npm run build` |
| `npm run data:validate` | kanonická brána: tvar (`schemas/canonical/`, AJV strict) → reference R1–R7 → sémantika S1–S8 → parita tabulky T1–T8 → JSON-LD expanze |
| `npm run data:validate -- --file <cesta>` | rychlá tvarová validace jediného kanonického souboru; chybové hlášky nesou cestu |
| `npm run data:build` | kompilace datasetu + view modely + regenerace content adaptérů + parity brána content == staging |
| `npm run dossier:scaffold -- --slug=… --title="…" --subject=… --authorization-record-id=AUTH-…` | založí minimální validní kanonický balíček nového dossieru; **odmítne** subjekt bez odpovídajícího záznamu v `data/authorizations.toml` |
| `npm run validate:authorization` | každý obsah o reálné osobě odpovídá autorizačnímu záznamu |
| `npm run verify:authorization-log` | append-only autorizační log v `AGENTS.md`: žádná existující sekce nesmí být upravena ani smazána, jen přidána nová |
| `npm run validate:dossier-types` | invarianty entity/aggregate dossierů |
| `npm run validate:navigation` | navigace odpovídá kanonickému datasetu a existujícím routám |
| `npm run verify:anchors` | po buildu: každá kotva ze zdrojů existuje v HTML |
| `npm run verify:jsonld` | po buildu: validita, pokrytí a poctivost JSON-LD (žádné truth ratingy, citační otisky se přepočítávají) |
| `npm run build:jsonld-exports` | vygeneruje `/data/dossiers/<slug>.jsonld`, `/data/graph.jsonld`, manifest s checksumy a citační otisky pro šablony — součást `npm run build` |
| `npm run verify:export` | po buildu (i offline nad staženou kopií, `--dir <cesta>`): každý export sedí na manifest hash, parsuje, nenese truth ratingy a otisky se přepočítávají |
| `npm run lint:historical-coupling` | de-specializační brána: žádná jména subjektů ve strukturálním kódu |
| `npm run lint:generated-content` | generované content adaptéry zůstávají minimální obálkou — ruční doménová pole neprojdou |
| `npm run lint:component-reuse` | každá šablona (kromě `base.html`/`404.html`) používá `macros/ui.html`, a každá šablona s tabulkou používá `macros/table.html` (`table::advanced_table`) — žádný ručně psaný duplicitní markup místo sdílené komponenty |
| `npm run build:government-roster` | z `data/government.toml` vygeneruje kontextové entity členů vlády (veřejná funkce z oficiálního zdroje, `publicationRole = "context"`, **nikdy** dossier); existující záznamy nikdy nepřepisuje; součást `npm run build` |
| `node scripts/osint/ares-lookup.mjs --ico=… \| --name="…"` | dotaz do ARES (jediný spolehlivě funkční primární rejstřík) — **není** součástí `npm run build`, dělá živý síťový dotaz; doloží identitu/sídlo/formu/status, **nedoloží** skutečné majitele ani „od kdy ovládá" |
| `npm run screening:public-money -- --ico=…` | screening toku veřejných prostředků k IČO z registru smluv (ISRS) — **není** součástí `npm run build`, stahuje měsíční otevřená data; výstup je **interní** (`data/generated/public-money-screening.json` + `reports/public-money-screening.md`), nikdy se neroutuje. Doloží zveřejněné smlouvy, objem a objednatele v pokrytém období; **nedoloží** žádné pochybení ani úplnost. Viz [screening veřejných peněz](#screening-toku-veřejných-prostředků) |
| `npm run sources:detect-family` | detekce zdrojové rodiny u zdrojů s prázdným `sourceFamily` — **není** součástí `npm run build`, stahuje živě stránky zdrojů. Výstup je **návrh** (`data/generated/source-family-proposals.json` + `reports/source-family-proposals.md`), do kanonických dat sám nezapisuje; zápis dělá samostatný krok `--apply`, a to jen u verdiktu `ctk` a jen do prázdného pole. Doloží kredit původu v metadatech/podpisu/patičce; **nedoloží** obsahovou totožnost článků ani úplnost. Viz [detekce zdrojových rodin](#detekce-zdrojových-rodin) |
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
| `--from-external-ids` | IČO z kanonických entit (`externalIds.ico`, resp. `ares`); dnes je nemá žádná z 504 entit, takže režim korektně ohlásí nula vstupů a na síť vůbec nesáhne |
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
pull request. Každý příspěvek prochází lidským review proti redakčním
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

Návrhy oprav a reakce subjektů přijímá veřejný kanál uvedený na webu
(sekce Metodika). Každá věcná změna publikovaného obsahu je dohledatelná:
commit + kanonický záznam v `data/dossiers/<slug>/updates/` (append-only).
Subjekty dossierů mohou žádat opravu, dodat reakci nebo protidůkazy;
nemají redakční veto. Podání samo o sobě dataset nemění — projde
posouzením proti redakčním pravidlům v `AGENTS.md`.

## Nasazení

Push do `master` spustí `.github/workflows/deploy.yml`: `npm ci` → celá
validace (stejné příkazy jako lokálně) → `zola check` → `zola build` →
`verify:anchors` → upload artefaktu → `actions/deploy-pages`. Ruční
spuštění: workflow_dispatch. Ověření produkce: porovnat nasazený obsah
s očekávaným commitem (`gh run list`, pak kontrola klíčových rout).

## Známá omezení (k 2026-08-01)

- Do 2026-07-30 se JSON-LD exportní routy (`/data/*.jsonld`) v produkci
  vůbec negenerovaly, přestože lokální `npm run build` je vytvářel:
  deploy workflow si kroky pipeline vypisoval ručně a nové kroky do něj
  nikdo nedoplnil. Opraveno tím, že CI volá `npm run build`; proti
  opakování hlídá `npm run check:workflow-parity` (součást build gate).
- Citační otisky (`vomaste:citationFingerprint`) jsou otiskem citace
  (url + retrieved + outlet), **ne** archivované stránky — projekt
  zatím fetchnuté stránky nearchivuje; manifest exportů je hashovaný,
  ne podepsaný (ADR práh: podpis až bude reálná potřeba prokazovat
  autorství exportu, ne jen integritu).
- Žádný důvěrný intake kanál; žádný sémantický diff ani fork starter
  kit — viz roadmapa v konstituci, § 11.
- `lint:historical-coupling` zůstává mimo build gate (spouští se ručně);
  zapojení do gate je otevřený úkol.
- Vyhledávací index a `data/generated/*` jsou interní artefakty buildu,
  ne stabilní veřejné API. Stabilní strojová vrstva jsou exporty
  `/data/*.json(ld)` s manifestem.

## Řešení potíží

| Příznak | Příčina a oprava |
|---|---|
| `zola: command not found` / build padá na Zole | Zola není v PATH nebo je jiná řada než **0.22.x** (CI pinuje 0.22.1). Instalace: <https://www.getzola.org/documentation/getting-started/installation/>; ověření `zola --version`. |
| `data:validate` hlásí T3 „řádka tabulky se neshoduje s kanonickým claimem" | Tabulka tvrzení v `dossier.json` a kanonický záznam `claims/clm-NN.json` se rozešly (text/stav/zdroje se porovnávají byte-verně). Uprav jedno či druhé tak, aby se shodovaly, a validaci zopakuj. |
| `data:check-generated:content` hlásí drift | Ručně editovaný generovaný soubor pod `content/dossiers/**` nebo `content/entities/`. Vrať úpravu do kanonického JSON a spusť `npm run data:build`. |
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
architektonická rozhodnutí (`docs/adr/`). Návrh veřejného
dossier-intake workflow (Fáze 1, PROPOSED):
[`docs/adr/ADR-public-dossier-intake.md`](docs/adr/ADR-public-dossier-intake.md)
+ auditní reporty v `reports/intake/`.

Stejné řídicí dokumenty (AGENTS.md, přispívání, konstituce, licence,
bezpečnostní politika, koop protokol) jsou navíc čitelné přímo na webu
pod **[/dokumentace/](https://vomaste.cz/dokumentace/)** — vykreslené
build-time ze stejných zdrojových souborů (žádná druhá kopie, žádný
klientský JavaScript; viz [`docs/adr/markdown-and-mermaid-rendering.md`](docs/adr/markdown-and-mermaid-rendering.md)).
