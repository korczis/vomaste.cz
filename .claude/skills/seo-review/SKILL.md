---
name: seo-review
description: Zkontroluje metadata stránky — titulek, popis, kanonickou URL, Open Graph a Twitter karty, strukturovaná data a vnitřní prolinkování — proti tomu, jak to tenhle web dělá: z dat, ne ručně v šabloně. Použij ho při vzniku nové stránky nebo typu záznamu, nebo když se řeší, jak se odkaz zobrazí při sdílení.
argument-hint: "[cesta ke stránce nebo šabloně | nový record_type]"
---

Review metadat. **Read-only.**

## Kdy ho použít

- Vzniká nová stránka nebo nový typ záznamu.
- Mění se, co stránka o sobě říká.
- Řeší se náhled při sdílení.

## Kdy ho NEPOUŽÍT

- **K ručnímu zápisu meta tagů.** To se tady nedělá vůbec — viz níž.
- **K optimalizaci pro vyhledávače nad rámec pravdivosti.** Popis
  stránky popisuje, co na ní je. Nic víc.

## Jak to tady funguje

Metadata jsou **data, ne šablonová logika**:

| Vrstva | Vlastník |
|---|---|
| konfigurace | `data/seo.toml` |
| vykreslení | `templates/macros/meta.html` |
| vstupy | `templates/base.html` (rozloží front matter na `meta_*`) |
| strojová vrstva | `templates/partials/jsonld.html` (čte **tytéž** `meta_*`) |
| vynucení | `scripts/build/verify-og.mjs` po `zola build` |

Z toho plynou tři pravidla, která se kontrolují jako první:

1. **`<meta property="og:*">` ani `<meta name="twitter:*">` se nepíše
   ručně** v žádné šabloně. Vydává je jedině `macros/meta.html`.
2. **Rozhodovací logika patří do `data/seo.toml`**, ne do `if`
   v šabloně. Nový `record_type` bez záznamu v `[page_types.*]` shodí
   build — a obousměrně i mrtvý záznam bez použití.
3. **`og:title`/`og:description` a `name`/`description` stránkového
   uzlu JSON-LD musí být tatáž hodnota.** Nejsou to dva popisy téže
   stránky.

## Co zkontrolovat

| # | Kontrola | Co hledáš |
|---|---|---|
| 1 | **Titulek** | popisuje stránku, ne web; v mezích délky z `data/seo.toml` |
| 2 | **Popis** | je to popis obsahu, ne pozvánka; neopakuje titulek |
| 3 | **Kanonická URL** | jedna, správná, přes `meta::canonical` |
| 4 | **Open Graph a Twitter** | vydané makrem, ne ručně |
| 5 | **`og:type`** | odvozený z `record_type` přes `data/seo.toml` |
| 6 | **Obrázek** | výchozí karta, nebo médium entity — s alt textem |
| 7 | **JSON-LD** | stránka má aspoň jeden blok, tvar uzlu sedí |
| 8 | **Žádné truth-rating značky** | `ClaimReview`, `reviewRating` — **zakázané** |
| 9 | **Vnitřní odkazy** | vede na stránku aspoň něco? Není to slepý ostrov? |
| 10 | **Alias** | při přesunu URL zůstává staré přesměrování |

Kontrola 8 není kosmetika. Stavy tohohle webu popisují **doloženost**,
ne rozsouzenou pravdu, a strojová data to nesmějí naznačovat jinak.
`verify:jsonld` to hlídá a shodí build.

## Když vzniká nový `record_type`

```
1. záznam v data/seo.toml [page_types.<typ>] — og:type + schema.org typ
2. record_type ve front matteru generované stránky
3. tvar uzlu v templates/partials/jsonld.html
4. npm run build → verify:og + verify:jsonld
```

Vynechání kroku 1 shodí build. To je záměr: typ bez deklarace by
znamenal stránku, o které web neumí říct, co je.

## Výstup

```
STRÁNKA:     <cesta nebo route>
TITULEK:     <hodnota> — <délka, v mezích?>
POPIS:       <hodnota> — <délka>
KANONICKÁ:   <URL>
OG / TWITTER: <vydáno makrem | ručně v šabloně (nález)>
og:type:     <hodnota> ← <record_type z data/seo.toml>
JSON-LD:     <typy uzlů>  |  truth-rating: **žádný**
OBRÁZEK:     <výchozí | médium entity>  alt: <ano/ne>
ODKAZY SEM:  <odkud se na stránku dá dostat>
NÁLEZY:      [BLOCKER|HIGH|MEDIUM|LOW] <…>
```

## Příklady

**Základní.** Existující stránka tvrzení → metadata z makra, `og:type`
podle `record_type`, JSON-LD s uzlem `Claim`, bez nálezu.

**Realistický.** Nová stránka katalogu schopností. Nález [BLOCKER]:
`record_type` nemá záznam v `data/seo.toml`, takže build spadne dřív,
než se stránka postaví. Oprava je jeden záznam, ne úprava šablony.

**Selhání.** Návrh přidat do JSON-LD `ClaimReview` s hodnocením
pravdivosti, „aby to Google lépe chápal". [BLOCKER] a nejde o technický
problém: tenhle web neadjudikuje pravdu, jeho stavy popisují sourcing,
a strojová data to nesmějí tvrdit za něj.

## Související

`/ui-review`, `/a11y-review`, `.claude/rules/ui.md` (sekce Metadata),
`npm run verify:og`, `npm run verify:jsonld`.
