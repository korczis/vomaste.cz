---
paths:
  - "content/**"
---

# `content/` je generovaný adaptér, ne zdroj

Zola potřebuje ke vzniku routy soubor v `content/`. Proto
`npm run data:build` regeneruje minimální stránky s `generated = true`
a ukazatelem na view model. **Ruční editace generované stránky není
oprava** — kanonická je vždycky: uprav `data/dossiers/**`, spusť
`npm run data:build`.

## Co je v generovaném rozsahu

Definuje `isSyncedPath` v `scripts/data/sync-content.mjs`:

```
content/dossiers/<slug>/_index.md
content/dossiers/<slug>/{claims,sources,cases,gaps,relations}/*.md
content/entities/*.md
```

Generované jinou cestou (mimo paritní bránu):
`content/entities/typ/**` (`build-entity-type-sections.mjs`),
`content/dokumentace/prikazy/**` (`build-tooling-catalog.mjs`),
`content/zdroje/**` (`build-source-catalog.mjs`).

## Co je ručně psané a zůstane

Kořenové indexy (`content/dossiers/_index.md`,
`content/entities/_index.md`), tenké směrovací skořápky
`dossiers/<slug>/evidence/_index.md` a `dossiers/<slug>/entities/_index.md`,
dále `content/koncepty/**`, `content/dokumentace/**` (mimo `prikazy/`),
`content/map/`, `content/data/`, `content/_index.md` a celá vzdělávací
vrstva (`start`, `bootcamp`, `akademie`, `prirucka`, `prispet`).

## Past, kterou je potřeba znát

Uvnitř `npm run build` běží **sync dřív než paritní brána**. Ruční
editace generované stránky se proto tiše **přepíše** místo aby se
nahlásila — build zůstane zelený a změna prostě zmizí. Pre-commit ji
taky nechytí: `data:check-generated:content` není v jeho rychlé sadě.

Když ti diff v `content/` přijde podezřelý, spusť bránu samostatně:

```
npm run data:check-generated:content
```

To je jediný běh, který ruční editaci ohlásí jako chybu.

`npm run lint:generated-content` kontroluje **jen frontmatter**
(pravidla L1–L3). Ruční zásah do **těla** stránky projde bez povšimnutí.

## JSON-LD na každé publikované stránce

`templates/base.html` vkládá `partials/jsonld.html` právě jednou.
`npm run verify:jsonld` po buildu vyžaduje aspoň jeden parsovatelný blok
`application/ld+json` na každé postavené stránce (výjimkou jsou jen
alias přesměrování Zoly) plus správný tvar uzlů — a **zakazuje značky
o pravdivosti** (`ClaimReview`, `reviewRating`). Stavy tohohle webu
popisují doloženost, ne rozsouzenou pravdu, a strojová data to nesmějí
naznačovat jinak.
