# Navigační metriky — počty odvozené z kanonických dat

> **Stav**: datová vrstva, vykreslení badge i post-build ověření hotové a
> zapojené do buildu. Badge se renderují na serveru přes sdílené macro
> `nav::nav_link` (desktop sidebar i mobilní navigace) a
> `verify:navigation-counts` porovnává každé číslo v postaveném HTML
> s manifestem. Neuzavřené položky — veřejný endpoint, sbalený sidebar,
> vizuální kontrola — viz [Co zbývá](#co-zbývá).

## Proč build-time, a ne v prohlížeči

vomaste.cz je statický Zola web. Počet načtený až po `DOMContentLoaded` by
problikl, posunul layout, zmizel při vypnutém JavaScriptu a zůstal neviditelný
pro crawlery. Počítání DOM uzlů by bylo ještě horší — měřilo by vykreslení,
ne data.

Čísla proto vznikají **před** během `zola build` a do HTML jdou už hotová.

## Datový tok

```text
content/dossiers/**            registry (jediný zdroj pravdy)
        ↓ scripts/dossier/build-jsonld-exports.mjs
static/data/*.json             kanonické kolekční exporty
static/data/graph.jsonld       kanonický JSON-LD graf
        ↓ scripts/data/build-navigation-metrics.mjs
data/generated/navigation-metrics.json   generovaný manifest
        ↓ templates/macros/nav.html (nav::nav_link)
statické HTML s badge
        ↓ scripts/data/verify-navigation-counts.mjs
ověřeno proti manifestu
```

## Kde leží kanonická data a proč se nepočítají `@type`

`graph.jsonld` i `static/data/<kolekce>.json` vyrábí **tentýž** generátor,
takže obojí je kanonická projekce stejných registrů. **Zaměnitelné pro
počítání ale nejsou.** Naměřeno 2026-07-30:

| Kolekce | Součet `@type` v `graph.jsonld` | Kolekční export | Route ukazuje | |
|---|---|---|---|---|
| claims | `Claim` = 666 | 666 | 666 | ✅ |
| cases | `vomaste:Case` = 70 | 70 | 70 | ✅ |
| relations | `vomaste:Relation` = 75 | 75 | 75 | ✅ |
| gaps | `vomaste:Gap` = 154 | 154 | 154 | ✅ |
| dossiers | `Dataset` = 31 | 22 | 22 | ❌ |
| entities | `Person` = 21 | 60 | 60 | ❌ |
| sources | creative-work typy = 418 | 387 | 387 | ❌ |

Ty tři neshody nejsou chyby v grafu — jsou to kategoriální chyby naivního
součtu:

- `Dataset` zahrnuje globální dataset descriptor i per-dossier descriptory,
  které nejsou dossiery v navigačním smyslu;
- `Person` se emituje jen pro entity s person sémantikou, takže tiše vypadnou
  organizace, veřejné instituce a firmy, které `/entities/` vypisuje;
- mezi creative-work typy (`NewsArticle`, `Report`, `OpinionNewsArticle`,
  `Article`, `Thing`) padají i uzly, které nejsou zdrojové záznamy.

Počítání typů by tedy porušilo pravidlo **„stejná route, stejná populace"** —
badge by nesouhlasil s tím, co uživatel na dané route skutečně otevře.
Kolekční exporty **jsou** populace route, takže jsou zdrojem metrik.

## Jak se počítá

Každá metrika počítá `COUNT(DISTINCT kanonická identita)`, nikdy délku pole.
Identita se hledá v pořadí `@id` → `id` → `url` → `slug`; záznam bez identity
dostane poziční identitu, aby se nezhroutil do jednoho koše a tiše
nepodpočítal. Multi-typed uzel se počítá **jednou**.

Výsledek musí být celé nezáporné číslo. Cokoli jiného je build error, ne nula
— vyrenderovat věrohodný badge nad rozbitými daty je nejhorší možný výsledek
téhle funkce.

## Registr metrik

Definice žijí v `scripts/data/navigation-metrics.registry.mjs`, **oddělené od
mechanismu**, který je spouští. Vykonávací vrstvu tak lze později vyměnit —
například za DuckDB pre-query registry za `/data/` — beze změny jediného
metric ID, šablony nebo testu.

Každá definice nese: stabilní ID, popis, zdroj, přesnou count sémantiku,
pravidlo deduplikace, zacházení s nepublikovanými záznamy a cílovou route.

| Metric ID | Route | Sémantika |
|---|---|---|
| `dossiers.total` | `/dossiers/` | publikované dossiery (entitní + agregované) |
| `entities.total` | `/entities/` | unikátní entity globálního registru |
| `claims.total` | `/dossiers/` | tvrzení; identita je globální, ne lokální `CLM-01` |
| `sources.total` | `/dossiers/` | zdrojové **záznamy**, ne unikátní média |
| `cases.total` | `/dossiers/` | kauzy |
| `relations.total` | `/map/` | **kurátorované** hrany, ne odvozená registrová vrstva |
| `gaps.total` | `/dossiers/` | evidované mezery |

**Grouped metriky** — rozdělení, ne rodina ručně vypsaných metrik. Klíčem je
pole, které záznam už nese, takže přidání dossieru nebo typu entity
nevyžaduje sáhnout do registru:

| Metric ID | Klíč skupiny | Kde se zobrazí |
|---|---|---|
| `claims.by_dossier` | `dossier` | počet tvrzení u každého dossieru v sidebaru |
| `entities.by_type` | `entity_type` | počet entit u každého typu v podstromu „Entity" |

Obě mají v generátoru **kontrolu rozdělení proti celku**: součet skupin se musí
rovnat `claims.total`, resp. `entities.total`, jinak build spadne. Kdyby se
rozešly, čtenář by viděl dvě čísla, která si odporují — přesně to, čemu má tahle
vrstva bránit. Seskupovací logika je jeden sdílený helper, aby druhé seskupení
nemohlo zavést druhou interpretaci toho, jak se počítá.

`entities.by_type` **záměrně nedělí podle `publication_role`**: to by postavilo
„lidi, o kterých píšeme" a „lidi, které jen zmiňujeme" do oddělených vizuálních
přihrádek, což je redakční tvrzení, do kterého navigaci nic není.

Dvě sémantiky, které se snadno popletou:

- **`sources.total` počítá záznamy, ne média.** Jedno médium citované ke třem
  článkům jsou tři záznamy. Liší se to od source-**family** seskupení, kterým
  `validate-dossier.mjs` rozhoduje o korroboraci.
- **`relations.total` počítá kurátorovanou vrstvu** — hrany ručně zapsané
  v `data/dossiers/<slug>/graph.toml`, každá krytá tvrzeními a zdroji. Odvozená
  plná registrová vrstva globálního grafu materializuje řádově víc hran a není
  to, co `/map/` prezentuje jako vztahy.

## Routy /entities/typ/<typ>/

Devět filtrovaných pohledů na globální registr entit, jeden na typ, generuje
`scripts/dossier/build-entity-type-sections.mjs` do
`content/entities/typ/<id>/`. Podstrom v sidebaru staví z existujících sekcí
`build-navigation.mjs`.

**Proč routa a ne kotva**: `/entities/` seskupení podle typu už má, ale dělá
ho za běhu — server renderuje jeden plochý pool všech entit a Alpine z něj
staví skupiny. Je to záměrný a správný návrh (pool je použitelný registr
i s vypnutým JavaScriptem), ale znamená to, že není kam odkazovat: kotva
`#type-person` serverově neexistuje a byla by špatně ve chvíli, kdy si čtenář
přepne seskupení na „dossier" nebo „role", což ovládá on. Routa je stabilní
cíl, fragment do uživatelem ovládaného stavu ne.

**Proč projekce a ne přesun**: stránky entit zůstávají, kde jsou. Každá entita
má jedinou kanonickou stránku a URL, na které visí aliasy z dossierových
podstromů a `@id` v JSON-LD exportech; rozházet je do adresářů podle typu by
všechny ty identifikátory změnilo. Sekce jsou filtrované pohledy nad jedním
registrem, nikdy druhá kopie záznamů.

Routa vzniká pro **každý** typ v datech, včetně typů s jedinou entitou. Práh by
byl nezdokumentovaná mezera — čtenář, který vidí „9 typů" a najde 6 rout, byl
uveden v omyl.

Šablony **neemitují JSON-LD `Person`**: `verify-jsonld.mjs` vynucuje, že Person
markup nese výhradně hlavní stránka entitního dossieru, a druhý uzel pro tutéž
osobu by z jednoho člověka udělal ve strojových datech dva.

## Položky bez badge

`INTENTIONALLY_UNMEASURED` v registru drží důvod u každé navigační položky,
která badge záměrně nemá (`home`, `docs`, `concepts`, `data`). Je to v kódu a
test vynucuje, aby důvod byl věcný — aby nikdo nevymyslel dekorativní metriku,
jen aby zaplnil vizuální mezeru.

**Chybějící metrika není nula.** Deklarovaná metrika, kterou build neumí
spočítat, musí build shodit.

## Determinismus

Manifest se nesmí měnit bez změny dat:

- klíče metrik se emitují **seřazené**, ne v pořadí registru;
- **žádný wall-clock timestamp** — `sourceDigest` je hash přesných bajtů, ze
  kterých se počítalo, takže nezměněný dataset dá byte-identický manifest a
  prázdný git diff;
- počty jsou množiny identit, takže pořadí vstupu výsledek změnit nemůže;
- zápis je atomický přes temp soubor a `rename`, takže zabitý build nikdy
  nenechá polovičatý manifest. (Souběžné buildy v tomhle sdíleném checkoutu
  jsou reálné — 30. 7. 2026 tu závodily tři zola procesy.)

## Proč je to samostatný krok pipeline

`build:navigation` běží **před** `build:jsonld-exports`, ale metriky čtou
exporty, které vyrábí až ten druhý. Vložení metrik do `build-navigation.mjs`
by si vynutilo přeházení pořadí, na kterém závisí několik dalších validátorů.
Samostatný malý generovaný soubor, který si šablony připojí přes metric ID,
nechá existující pořadí netknuté.

**`data:metrics` proto musí běžet až za `build:jsonld-exports`.** Generátor to
sám kontroluje a s vysvětlením spadne, pokud vstupní export neexistuje.

## Příkazy

```bash
npm run data:metrics                  # přepočítá manifest
npm run validate:navigation-metrics   # ověří, že manifest není zastaralý
node --test scripts/data/*.test.mjs   # testy počítacích pravidel
```

Obojí je zapojené v `npm run build` i `npm run dev`.

Testy schválně **netestují aktuální obsah** — test tvrdící `claims.total === 666`
by spadl při každém redakčním commitu a do týdne by ho někdo smazal. Testuje se
sémantika: distinktní kanonická identita, nezávislost na pořadí, jeden počet na
uzel.

## Hodnoty se nikdy neupravují ručně

`data/generated/navigation-metrics.json` je generovaný artefakt. Ruční editace
je zbytečná (přepíše se) a nebezpečná (`validate:navigation-metrics` ji odhalí
jako stale a shodí build). Hodnota badge se nikdy nezapisuje do TOML, HTML,
Markdownu ani JavaScriptu — navigační konfigurace smí odkazovat jen na
**metriku**, nikdy na hodnotu.

## Jak přidat novou countable route

1. Ujisti se, že kolekce má kanonický export ve `static/data/`.
2. Přidej definici do `METRIC_DEFINITIONS` — včetně sémantiky, deduplikace a
   cílové route. Neúplnou definici testy odmítnou.
3. Spusť `npm run data:metrics` a commitni manifest.
4. Až bude hotová šablonová vrstva, přidej `count_metric = "<id>"` k položce
   v `data/navigation.toml`.

## Co zbývá

> **Sbalený sidebar zde neexistuje.** Zadání s ním počítalo, ale ani
> `templates/base.html`, ani `assets/js/app.js` žádný collapse stav nemají —
> sidebar je vždy rozbalený. Počet je i tak v `title` odkazu, takže kdyby
> collapse někdy přibyl, zůstane dostupný bez další práce. Stavět sbalování
> jen kvůli badge by bylo řešení problému, který nikdo nemá.


Hotové: registr metrik, generátor, testy, `count_metric` v
`data/navigation.toml`, vykreslení badge ve sdíleném macru `nav::nav_link`
(používá ho desktop sidebar i mobilní navigace, takže obě větve resolvují
metriku jedním lookupem a nemůžou se rozejít).

Badge dnes mají tři položky s jednoznačnou populací route: `dossiers.total`,
`entities.total`, `relations.total`.

Post-build verifier `scripts/data/verify-navigation-counts.mjs` porovnává
každé číslo v postaveném HTML s manifestem a odmítne badge odkazující na
neexistující metriku. Běží v `npm run build` za `zola build`.

Parsuje atributy, neregexuje je — minifikátor maže uvozovky a přehazuje
pořadí, takže badge ve výstupu vypadá jako
`data-count=22 data-metric-id=dossiers.total`. Regex hledající
`data-metric-id="..."` proti tomu nenajde nic; přesně tahle chyba při vývoji
ohlásila chybějící badge, které tam byly.

Neimplementované:

- **vizuální kontrola** na reálných viewportech (1440×1000, 1024×768,
  390×844), včetně dlouhých labelů a tříciferných hodnot;
- **OG karty** tří nejnovějších dossierů — Playwright na macOS 13 chromium
  nenainstaluje, takže `scripts/og/build-og-images.mjs` musí proběhnout jinde.

- **vizuální kontrola** na reálných viewportech (1440×1000, 1024×768,
  390×844), včetně dlouhých labelů a tříciferných hodnot;

Zadání pro tuhle práci předpokládalo jiné informační architektury, než jakou
web má: sidebar má **sedm** top-level položek (`home`, `dossiers`, `entities`,
`map`, `concepts`, `data`, `docs`). Položky jako `claims`, `sources`, `cases`
nebo `relations` **nejsou top-level** — jsou to registrové podstromy pod
každým dossierem. Routy `Timeline`, `Analysis` a `Audit` v projektu
neexistují. Badge patří na skutečné položky, ne na vymyšlené.
