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

**Poctivý aktuální stav (k 2026-07-29)**: repozitář hostí dossiery o
Petru Macinkovi a Filipu Turkovi (přesný, datovaný, append-only rozsah
autorizace viz `AGENTS.md`). De-specializace platformy — dossiery a
entity jako čistá data, žádné hardcodované subjekty — aktivně probíhá:
inventura vazby je v
[`docs/migrations/remove-macinka-turek-coupling-audit.md`](docs/migrations/remove-macinka-turek-coupling-audit.md)
a regresní brána `npm run lint:historical-coupling` hlídá, aby se
historická vazba nevracela. Příspěvkové balíčky, CLI, sémantický diff,
fork starter kit ani JSON-LD dataset **zatím neexistují** — nic z toho
tento README neinzeruje jako hotové.

## Jak systém funguje

```text
ručně psaný obsah (content/) + strukturovaná data (data/)
→ validátory (registr tvrzení/zdrojů, graf, autorizace, typy dossierů, navigace)
→ generátory (statistiky, route manifest, search index, globální graf)
→ Tailwind + esbuild (assets)
→ zola build (statické HTML se strukturovanými daty JSON-LD)
→ verify:anchors (kotvy v hotovém HTML)
→ verify:jsonld (validita a poctivost strukturovaných dat)
→ GitHub Actions → GitHub Pages
```

Tentýž řetěz běží lokálně (`npm run build`) i v CI
(`.github/workflows/deploy.yml`) — zelený lokální build znamená
nasaditelný stav. Generované soubory (`data/dossiers/*/stats.toml`,
`data/generated/*`, `static/search-index.json`, `static/css/main.css`,
`static/js/app.js`) se needitují ručně.

## Datový model

- **Dossier** — kurátorovaný vyšetřovací rozsah
  (`content/dossiers/<slug>/`, registr `data/dossiers.toml`). Typ
  `entity` (jedna osoba; fyzicky vlastní záznamy — po probíhající
  migraci) nebo `aggregate` (generovaný souhrn, bez vlastních záznamů).
- **Tvrzení (CLM-##)** — atomický, ozdrojovaný výrok se stavem ověření.
  Žije dvakrát: řádek v tabulce hlavní stránky dossieru (to edituje
  redaktor) a vlastní stránka `claims/clm-NN.md` (derivát). Validátor
  build shodí, pokud se liší byť o bajt.
- **Zdroj (SRC-##)** — `sources/src-NN.md`: outlet, typ, URL, datum
  vydání i stažení, podporovaná tvrzení. Index zdrojů vede „vydavatelské
  rodiny" — zdroje téhož vydavatele se nepočítají jako nezávislá
  potvrzení.
- **Kauza (CASE-##)** — tematický celek; karta v front matter hlavní
  stránky + odvozená stránka `cases/case-NN.md`.
- **Mezera (GAP-##)** — otevřená otázka s prioritou, datem poslední
  kontroly a vazbou na tvrzení. Otevřenost není zjištění žádným směrem.
- **Entita a vztah** — globální entity (`content/entities/`) a hrany
  grafu (`data/dossiers/<slug>/graph.toml` + stránky `relations/`);
  každá hrana musí být krytá tvrzeními a zdroji, validátor kontroluje
  paritu dat a stránek.
- **Opravy** — append-only historie revizí
  (`data/dossiers/<slug>/updates.toml`): co bylo kdy skutečně ověřeno a
  změněno.

## Stavy tvrzení

| Stav | Význam | Vynucení |
|---|---|---|
| `CORROBORATED` | potvrzeno nezávisle více redakcemi | validátor vyžaduje ≥ 2 různé zdroje |
| `1 ZDROJ` | doloženo jediným citovaným zdrojem, bez nezávislého potvrzení | validátor vyžaduje právě 1 zdroj |
| `CITACE` | přímý výrok subjektu — ověřuje, že výrok padl, **ne** že platí jeho obsah | — |
| `SPORNÉ` | neuzavřené, nepotvrzené či rozporované tvrzení | — |
| `NÁZOR` | autorský komentář, strukturálně oddělený od zpravodajství | — |

Trvalá pravidla: procesní výsledek (odložení, promlčení, nepravomocné
rozhodnutí) se **pokaždé** odlišuje od meritorního rozhodnutí o
vině/pravdě; derivativní články jednoho původu nejsou korroborace;
povýšení stavu vyžaduje nový důkaz, nikdy jen přeznačení. Ověření, že
výrok padl, není ověřením jeho obsahu.

## Strukturovaná data (JSON-LD)

Každá stránka vydává při buildu jeden blok `application/ld+json`
(`@graph`), generovaný centrálně v `templates/base.html` z front matter a
registru `data/dossiers.toml` — žádné jméno, slug ani URL nejsou v
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
shodí, kdyby se hodnoticí typ kdekoli objevil. Data jsou vložená přímo
v HTML stránkách; samostatné exportní routy (`/data/*.jsonld`,
manifest datasetu) zatím neexistují — viz Známá omezení.

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
stránky. Data tabulek dnes pocházejí ze stejných front-matter/data
zdrojů jako JSON-LD `@graph`; výhledovým **plánem** (neimplementováno)
je DuckDB (`.mjs`) pipeline nad stejnými záznamy.

## Struktura repozitáře

```text
.
├── content/                # obsah Zoly: dossiery (1 stránka = 1 záznam), entity, mapa
├── templates/              # Tera šablony (base, dossier*, entity-dossier*, macros)
├── data/                   # registr dossierů, navigace, graf, updates, generovaná data
├── assets/js/              # zdrojové JS moduly (bundluje esbuild)
├── static/                 # statická aktiva + zkompilované CSS/JS + search index
├── scripts/dossier/        # validátory, generátory, migrační nástroje
├── scripts/lint/           # anti-coupling linter (de-specializace)
├── scripts/coop/           # koordinace více instancí (bus, worktrees)
├── scripts/setup/          # instalace git hooks (postinstall)
├── .githooks/              # pre-commit: rychlá podmnožina validátorů
├── .claude/skills/         # bootstrap, dossier-entry, adr, commit — vedení pro Claude Code
├── docs/                   # konstituce, audity, migrace, koop protokol, ADR
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

`npm ci`/`npm install` mimochodem nastaví `core.hooksPath` na `.githooks/`
(`scripts/setup/install-git-hooks.mjs`, best-effort, nikdy nerozbije
instalaci) — od té chvíle `git commit` sám spustí rychlou podmnožinu
validátorů (`.githooks/pre-commit`); ruční přeinstalace: `npm run
hooks:install`. Je to jen rychlá předběžná brána, ne náhrada za `npm run
build` před review-requestem/mergem/pushem.

**Přispíváš přes Claude Code (nebo jiného AI agenta)?** Podrobný postup
je v [`CONTRIBUTING.md`, sekce „Přispívání s Claude Code“](CONTRIBUTING.md#přispívání-s-claude-code-nebo-jiným-ai-agentem).
Zkráceně — 4 skilly v `.claude/skills/`, spouštěj v tomto pořadí podle
toho, co děláš:

| Skill | Kdy ho spustit |
|---|---|
| `bootstrap` | vždy jako první krok nové session — pravidla, co-op stav, prerekvizity, volba role |
| `dossier-entry` | přidáváš CLM/SRC/CASE/GAP/relation — vynucuje autorizační scope-gate jako krok 0 |
| `adr` | řešíš netriviální technické rozhodnutí (nová závislost, výměna komponenty) — měřený stav, ne odhad |
| `commit` | commit samotný — formát zprávy, který gate skutečně platí, co nahlásit na co-op sběrnici |

Plná kvalitní brána (stejná jako CI):

```bash
npm run build
```

Úspěch = nulový exit kód a závěrečné `OK` řádky obou post-build kontrol
(kotvy a JSON-LD), poslední je `OK — all JSON-LD parses, carries
required fields, and contains no truth-rating markup.`

## Referenční příkazy

| Příkaz | K čemu |
|---|---|
| `npm run build` | celá kvalitní brána: všechny validátory → generátory → CSS/JS → `zola build` → kontrola kotev |
| `npm run dev` | totéž bez plné validace registru + `zola serve` s live reloadem |
| `npm run hooks:install` | nastaví `core.hooksPath` na `.githooks/` (jinak se spustí automaticky přes `npm ci`/`npm install`) |
| `npm test` | regresní testy tooling skriptů (Node built-in test runner, žádná nová závislost) — součást `npm run build` |
| `npm run validate:dossier` | integrita registru tvrzení/zdrojů: kotvy, reference, duplicitní ID, parita tabulka ↔ stránky, stavová pravidla |
| `npm run validate:graph` | referenční integrita grafu, povolené typy vztahů, parita s entitami/vztahy, nezávislost zdrojů hran |
| `npm run validate:authorization` | každý obsah o reálné osobě odpovídá autorizačnímu záznamu |
| `npm run verify:authorization-log` | append-only autorizační log v `AGENTS.md`: žádná existující sekce nesmí být upravena ani smazána, jen přidána nová |
| `npm run validate:dossier-types` | invarianty entity/aggregate dossierů |
| `npm run validate:navigation` | navigace odpovídá registru a existujícím routám |
| `npm run verify:anchors` | po buildu: každá kotva ze zdrojů existuje v HTML |
| `npm run verify:jsonld` | po buildu: validita, pokrytí a poctivost JSON-LD (žádné truth ratingy) |
| `npm run lint:historical-coupling` | de-specializační brána: žádná jména subjektů ve strukturálním kódu |
| `npm run lint:component-reuse` | každá šablona (kromě `base.html`/`404.html`) používá `macros/ui.html`, a každá šablona s tabulkou používá `macros/table.html` (`table::advanced_table`) — žádný ručně psaný duplicitní markup místo sdílené komponenty |
| `node scripts/dossier/migrate-claims-to-pages.mjs` | přegenerovat stránky tvrzení z tabulky |
| `node scripts/dossier/migrate-cases-to-pages.mjs` | přegenerovat stránky kauz z front matter |
| `node scripts/dossier/tag-subjects.mjs` | orazítkovat záznamy poli `subjects` |
| `npm run scaffold:dossier -- --slug=<slug> --title="<Jméno>"` | vygeneruje placeholder skeleton nového entity dossieru (registry adresáře, `graph.toml`, `updates.toml`) — odmítne běžet, pokud `<Jméno>` není v autorizačním logu `AGENTS.md`; nezapisuje do `data/dossiers.toml` |

## Přidání obsahu do dossieru

> Rozšíření na nový subjekt nebo novou kauzu vyžaduje **předchozí**
> autorizaci vlastníka zapsanou v `AGENTS.md` (append-only log). Bez ní
> se obsah o reálných osobách nepřidává — v pochybnostech se ptej,
> nerozšiřuj.

1. **Zdroj**: `content/dossiers/<slug>/sources/src-NN.md` dle existujícího
   schématu (`src_id`, `outlet`, `src_type`, `url`, `retrieved`,
   `published`, `claims`, `subjects`). Zdroj cituj, jen pokud jsi ho
   skutečně otevřel — nikdy ze snippetu vyhledávače.
2. **Tvrzení**: řádek `CLM-NN` do tabulky v `_index.md` (s kotvou
   `<a id="clm-NN"></a>` a odkazem na detail), pak přegenerovat/dopsat
   `claims/clm-NN.md`. Jedno tvrzení = jeden ověřitelný výrok; stav
   podle skutečné síly důkazu (viz tabulka výše).
3. **Kauza**: `[[extra.cases]]` ve front matter `_index.md`, pak
   `cases/case-NN.md`.
4. **Mezera**: `gaps/gap-NN.md` (`gap_id`, `priority`, `checked`,
   `claims`) — neutrálně formulovaná otázka, ne insinuace.
5. **Vztah**: hrana v `data/dossiers/<slug>/graph.toml` + stránka
   `relations/edge-*.md`; hrana bez tvrzení a zdroje neprojde validací.
6. `npm run build` — červená znamená chybějící zdroj, kotvu, referenci
   nebo drift mezi tabulkou a stránkami. Nikdy neobcházet.

## Příspěvky (pull requesty)

Standardní GitHub flow: fork → větev → změna → zelený `npm run build` →
pull request. Každý příspěvek prochází lidským review proti redakčním
pravidlům a konstituci; **obsah o reálných osobách navíc vyžaduje
předchozí autorizaci vlastníka v append-only logu `AGENTS.md`** — PR
rozšiřující pokrytí bez ní nebude přijat, jakkoli je téma „veřejně
zajímavé". Automatika kontroluje integritu (zdroje, kotvy, parity,
stavy), **nikoli pravdivost** — tu žádný nástroj nerozhodne, od toho je
review a zdrojová disciplína. Samostatné `CONTRIBUTING.md`, příspěvkové
CLI ani sémantický diff zatím neexistují; do té doby je normou tento
README + `AGENTS.md`. Pamatuj: pull requesty jsou veřejné (viz
bezpečnostní hranice nahoře).

## Nový dossier

Nový dossier je datová operace, ne zásah do jádra:

1. autorizace subjektu vlastníkem — nový datovaný záznam v append-only
   logu `AGENTS.md` (bez něj stop);
2. záznam v registru `data/dossiers.toml` (slug, titul, `dossier_type`);
3. obsahový strom `content/dossiers/<slug>/` (hlavní `_index.md` +
   podregistry) a data `data/dossiers/<slug>/` (`graph.toml`,
   `updates.toml`);
4. položka v `data/navigation.toml` — `validate:navigation` vynucuje, že
   entity dossier v navigaci je a odkazuje na existující routy;
5. `npm run build` — `validate:dossier-types` a spol. vynucují zbytek.

Zbytková historická vazba na výchozí dossiery (viz Fork níže) se právě
odstraňuje; do jejího dokončení může nový dossier vyžadovat drobné ruční
úpravy nad rámec kroků výše.

## Fork a nezávislé nasazení

Fork je deklarovaný cíl (konstituce, invariant 4) a z velké části už
realita: build nepotřebuje žádné tajemství, privátní backend ani službu
mimo repozitář; nasazení jede přes GitHub Actions → Pages (OIDC token
workflow, žádný PAT). Co fork nastavuje: `base_url` v `config.toml`
(+ `static/CNAME` pro vlastní doménu), `title`/`description`,
`data/dossiers.toml` a obsah `content/`. **Poctivé omezení**: dokud
neskončí de-specializační migrace, zůstávají v navigaci a několika
šablonách zbytky historické vazby na výchozí dossiery (přesný seznam:
`docs/migrations/remove-macinka-turek-coupling-audit.md`) — fork je
možný, ale vyžaduje jejich ruční úpravu. Redakční odpovědnost, právní
posouzení a případný intake si každý fork řeší sám; fork nepřebírá
redakční schválení upstreamu.

## Opravy a právo na odpověď

Návrhy oprav a reakce subjektů přijímá veřejný kanál uvedený na webu
(sekce Metodika). Každá věcná změna publikovaného obsahu je dohledatelná:
commit + záznam v `data/dossiers/<slug>/updates.toml` (append-only).
Subjekty dossierů mohou žádat opravu, dodat reakci nebo protidůkazy;
nemají redakční veto. Podání samo o sobě dataset nemění — projde
posouzením proti redakčním pravidlům v `AGENTS.md`.

## Nasazení

Push do `master` spustí `.github/workflows/deploy.yml`: `npm ci` → celá
validace (stejné příkazy jako lokálně) → `zola check` → `zola build` →
`verify:anchors` → upload artefaktu → `actions/deploy-pages`. Ruční
spuštění: workflow_dispatch. Ověření produkce: porovnat nasazený obsah
s očekávaným commitem (`gh run list`, pak kontrola klíčových rout).

## Známá omezení (k 2026-07-29)

- JSON-LD žije vložené v HTML stránkách (viz výše); samostatný
  stahovatelný JSON-LD dataset, manifest ani stabilní exportní routy
  zatím neexistují.
- Žádný důvěrný intake kanál; žádné příspěvkové CLI, sémantický diff ani
  fork starter kit — viz roadmapa v konstituci, § 11.
- De-specializace architektury (T-001…) probíhá; do jejího dokončení
  `lint:historical-coupling` není součástí build gate.
- Vyhledávací index a `data/generated/*` jsou interní artefakty buildu,
  ne stabilní veřejné API.

## Řešení potíží

| Příznak | Příčina a oprava |
|---|---|
| `zola: command not found` / build padá na Zole | Zola není v PATH nebo je jiná řada než **0.22.x** (CI pinuje 0.22.1). Instalace: <https://www.getzola.org/documentation/getting-started/installation/>; ověření `zola --version`. |
| `validate:dossier`: „page status/text does not match table" | Ručně editovaná tabulka tvrzení nebo `[[extra.cases]]` bez regenerace detailních stránek. Spusť `node scripts/dossier/migrate-claims-to-pages.mjs` / `migrate-cases-to-pages.mjs` a build zopakuj. |
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
architektonická rozhodnutí (`docs/adr/`).

Stejné řídicí dokumenty (AGENTS.md, přispívání, konstituce, licence,
bezpečnostní politika, koop protokol) jsou navíc čitelné přímo na webu
pod **[/dokumentace/](https://vomaste.cz/dokumentace/)** — vykreslené
build-time ze stejných zdrojových souborů (žádná druhá kopie, žádný
klientský JavaScript; viz [`docs/adr/markdown-and-mermaid-rendering.md`](docs/adr/markdown-and-mermaid-rendering.md)).
