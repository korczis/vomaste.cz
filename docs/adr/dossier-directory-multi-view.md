# ADR: adresář dossierů — tři projekce jednoho datasetu

**Stav:** přijato, implementováno (coop T-027)
**Datum:** 2026-07-31

## Problém

Úvodní stránka vykreslovala každý dossier jako kartu přes celou šířku
sekce: nadpis, odstavec popisu, čtyři statistické dlaždice a čtyři velká
tlačítka na registry. Při dvou dossierech to byla vitrína. Při dvaadvaceti
to je stěna, kterou musí návštěvník na mobilu odrolovat, aby vůbec zjistil,
co web obsahuje — jedna karta zabírala prakticky celý viewport a ukazovala
jednu osobu.

Adresář s dvaceti a více položkami je katalog, ne upoutávka. A šest velkých
tlačítek na položku není navigace, ale formulářová plocha převlečená za
navigaci.

Sekundárně: `/dossiers/` už hustou řaditelnou tabulku měl (T-019), zatímco
úvodní stránka zůstala u karet. Dvě podoby téhož seznamu se lišily nejen
vzhledem, ale i tím, co o dossieru řekly.

## Rozhodnutí

Jedna sdílená komponenta (`templates/partials/dossier-directory.html`) se
třemi projekcemi nad **jedním** normalizovaným datasetem:

| projekce | k čemu |
|---|---|
| tabulka | analytický pohled; řazení podle kteréhokoli počtu |
| seznam | hustý mobilní pohled, ~125 px na položku |
| dlaždice | rychlé vizuální procházení |

Tabulka, seznam i dlaždice čtou tentýž seznam předaný parametrem. Nevzniká
druhý model, který by se mohl rozejít.

## Kanonické zdroje dat

Adresář nepřidal žádný nový zdroj pravdy. Sesbíral jen to, co už existovalo
roztroušeně a co si dosud každá šablona skládala sama:

| údaj | zdroj | generuje |
|---|---|---|
| identita, typ | `data/dossiers.toml` | ručně udržovaný registr |
| počty | `data/dossiers/<slug>/stats.toml` | `generate-stats.mjs` |
| popis, data | front matter `content/dossiers/<slug>/_index.md` | redakce |
| routy registrů | `data/generated/navigation.json` | `build-navigation.mjs` |

Vše se slévá v `scripts/dossier/lib/record-tables.mjs` do existujícího
exportu `static/data/dossiers.json`, který tím získal `description`,
`updated`, `reviewed_at`, `counts` a `routes`. **Rozšířil se existující
export, nevznikl konkurenční.**

Routy se **čtou** z navigačního manifestu, neskládají se z řetězců.
Manifest je kanonický, takže přejmenování registru se projeví na jednom
místě. Skládání cest v šabloně by tichý rozchod nezachytilo.

## Progresivní vylepšení

Všechny tři projekce vykresluje Tera **na serveru**. JavaScript jen:
přepíná viditelnou projekci, filtruje, řadí, zapisuje stav do adresy a
ukládá preferenci.

Klientské sestavení adresáře z JSON bylo zamítnuto: poškodilo by SEO,
first contentful paint, čitelnost bez skriptu i odolnost statického webu —
a routy by držel jen JavaScript. Bez skriptu zůstává viditelná výchozí
projekce s plnými `<a href>` odkazy; není to omluvený degradovaný režim,
ale normálně použitelný adresář.

Cenou je větší HTML (tři projekce téhož seznamu). Při dvaadvaceti
dossierech je to přijatelné; nad řádově stovkami bude namístě buď
serverově vykreslovat jen výchozí projekci a zbylé dogenerovat z DOM, nebo
zavést stránkování — viz „Budoucí rozšiřování".

## Stav v URL a persistence

Kanonický je query parametr `view` s hodnotami `table`, `list`, `grid`;
neplatná hodnota se bezpečně ignoruje a zobrazí se výchozí projekce.

Pořadí priorit při startu: **URL > uložená preference > šířka displeje**.
URL vyhrává, aby sdílený odkaz ukázal příjemci to, co viděl odesílatel.

Na úzkém displeji je výchozí projekcí seznam; osmisloupcová tabulka je na
390 px nepoužitelná. Rozhoduje se **jednou při startu**, ne při každé změně
šířky — přepnutí pohledu pod rukama je horší než nepohodlí.

Přepnutí pohledu zapisuje `pushState`, filtrování `replaceState`. Přepnutí
je pro uživatele navigační akce, takže tlačítko zpět se má vrátit
k předchozímu pohledu; filtrování je průběžné ladění a zaplnilo by historii
na každý úhoz.

### Past, na kterou se přišlo až testem

`readState(spec)` vrací pro **chybějící** parametr výchozí hodnotu ze
specifikace. Když měl `view` ve specifikaci jako výchozí `data-default-view`,
větev „hodnota z URL" vždycky uspěla a rozhodování podle šířky displeje se
nikdy nespustilo. Rozlišení „parametr chybí" od „parametr má výchozí
hodnotu" je pro tuhle logiku nosné; čte se proto proti prázdné výchozí
hodnotě.

## Jedna kolekce, ne tři

Filtrování a řazení pracuje s **pojmem záznamu**, ne s řádkem tabulky.
Záznam existuje v každé projekci jednou a pojí je `data-record-key`; filtr
skryje nebo zobrazí všechny jeho uzly najednou.

Kdyby se filtrovalo po projekcích zvlášť, vznikly by tři nezávislé stavy a
přepnutí pohledu by ukázalo jiný výsledek, než jaký měl uživatel před
chvílí před sebou. Pořadí při řazení určují řádky tabulky (nesou
`data-sort-value`) a ostatní projekce se přeskládají podle stejného klíče:
jedna pravda o pořadí, tři vykreslení.

Rozšířila se proto existující komponenta `advancedTable()`
(`assets/js/modules/table-filter.js`), nevznikl druhý filtrovací engine.

## Přístupnost

- Přepínač je `role="group"` s `aria-pressed`, ne tabs: pohledy nejsou
  panely jednoho obsahu, ale tři podoby téhož seznamu; tab pattern by
  sliboval navigaci, která tu není.
- Popisky jsou **textové**; ikona by nesla význam jen pro vidoucí.
- Skryté projekce mají `hidden` na kontejneru, takže do nich nevstupuje
  tabulátor ani odečítač — jinak by uživatel na klávesnici procházel tři
  kopie téhož seznamu.
- Počet zobrazených záznamů je v `aria-live="polite"`.
- Tabulka má `caption`, `thead`/`tbody` a `th scope`; seznam je `<ul>`,
  dlaždice `<article>`.
- Kotvy jsou jedinečné napříč projekcemi (`<id>-<view>-<slug>`), protože
  tentýž záznam je v DOM třikrát.

## Vztah k JSON-LD

Adresář nevydává vlastní strukturovaná data. `static/data/dossiers.json`
je **prezentační** index odvozený z týchž front matter dat, ze kterých
vzniká `@graph` v `build-jsonld-exports.mjs`. Významový model zůstává
jeden; tabulka i export jsou dvě reprezentace téhož záznamu, nikdy dvě
ručně udržované kopie.

## Budoucí rozšiřování

- Nové metriky se přidávají do jednoho seznamu v komponentě; všechny tři
  projekce je převezmou. Kdyby si každá projekce psala vlastní výčet,
  rozešly by se významově.
- Nové filtry patří do `advancedTable()`, ne vedle něj.
- Agregované dossiery musí zůstat vizuálně odlišené — invariant z
  `AGENTS.md`: agregát nikdy nesmí vypadat jako další rovnocenný dossier
  o osobě. Hlídá to test.
- Do komponenty se nesmí dostat jméno ani slug konkrétního dossieru;
  jakmile se tam dostane, přestane být komponentou a stane se stránkou
  o někom. Hlídá to regresní test.
- Stránkování zatím záměrně chybí: při dvaadvaceti záznamech by rozbilo
  Ctrl+F i odkaz na konkrétní dossier. Je to první věc k doplnění, až
  adresář přeroste řádově stovky položek.
