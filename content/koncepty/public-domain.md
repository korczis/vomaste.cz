+++
title = "Public domain"
description = "Kód, tooling i původní obsah jsou uvolněny pod The Unlicense. Citované články a úryvky zůstávají právy původních vydavatelů — web je cituje, nerelicencuje."
template = "concept.html"
weight = 330

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
tile_title = "Public domain"
tile_summary = "Kód, tooling i původní obsah jsou uvolněny pod The Unlicense. Citované články a úryvky zůstávají právy původních vydavatelů — web je cituje, nerelicencuje."
+++

Kód, validátory, šablony i původní texty tohohle webu jsou uvolněné do public
domain pod [The Unlicense](https://github.com/korczis/vomaste.cz/blob/master/LICENSE.md).
Bez podmínek, bez povinné atribuce, bez „noncommercial".

## Proč tak volně

Protože forkovatelnost je u tohohle projektu vlastnost, ne vstřícnost. Kdo
nesouhlasí s výběrem témat, s hodnocením stavu nebo s celým přístupem, si má
odnést tooling a postavit vlastní, řádně autorizovaný dossier — ne žádat o
změnu tady. Licence, která by to komplikovala, by ten smysl zrušila.

## Co public domain **není**

Citované články, fotografie a úryvky zůstávají právy svých vydavatelů. Web na
ně odkazuje a cituje z nich v rozsahu potřebném k doložení tvrzení —
nerelicencuje je a nemůže. Kdo přebírá obsah odsud, přebírá i tuhle hranici.

## Co si odnést

Datový model čtyř registrů, validátory, které ho vynucují, šablony a build
pipeline. Co zatím **neexistuje**: fork starter kit, příspěvkové CLI ani
sémantický diff — viz [strojově čitelná data](@/koncepty/strojove-citelna-data.md).

## Co licence neřeší

Public domain je licence k **dílu**, ne povolení k čemukoli:

- **Cizí práva.** Citované články, fotografie a jejich úryvky patří svým
  vydavatelům. Že je odsud smíte zkopírovat technicky, neznamená, že je
  smíte publikovat jako své.
- **Osobní údaje.** Data popisují veřejné jednání veřejně činných osob a
  vznikla pod pravidly, která to omezují (test veřejného zájmu,
  nejmenování třetích stran). Ta pravidla licence nepřenáší — přebírá je
  ten, kdo data převezme, jako vlastní odpovědnost.
- **Kontext.** Vytržený řádek z `claims.json` bez stavu a bez zdroje je
  přesně ten druh „faktu", proti kterému je celý web postavený.

## Jak fork prakticky vypadá

Naklonovat repozitář, smazat `content/dossiers/*` a `data/dossiers/*`,
nechat si `templates/`, `scripts/` a `data/navigation.toml`, přidat vlastní
dossier do `data/dossiers.toml` a spustit `npm run build`. Validátory vám
řeknou, co chybí, dřív než cokoli publikujete — a autorizační brána
nepustí subjekt, který není zapsaný na záznam.

Instance zůstane vaše: nikde není hardcodovaný branding, žádné privátní
API ani skryté know-how — to je záměr, ne náhoda.
