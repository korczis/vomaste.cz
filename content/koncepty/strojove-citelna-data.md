+++
title = "Strojově čitelná data"
description = "Každá stránka nese JSON-LD generované při buildu — záměrně bez jakéhokoli hodnocení pravdivosti. Samostatné exportní routy datasetu zatím neexistují."
template = "concept.html"
weight = 320

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
tile_title = "Strojově čitelná data"
tile_summary = "Každá stránka nese strukturovaná data JSON-LD generovaná při buildu — záměrně <em>bez</em> jakéhokoli hodnocení pravdivosti: stavy popisují zdrojování, ne rozsudek. Samostatné exportní routy datasetu zatím neexistují a web to netvrdí."
+++

Každá stránka vydává při buildu blok `application/ld+json` generovaný
centrálně z front matter a registru dossierů: typ stránky, breadcrumbs,
navigaci, u tvrzení jeho text a citované zdroje, u entity dossieru osobu.

## Vědomé omezení: žádné hodnocení pravdivosti

Strukturovaná data **nenesou** `ClaimReview`, `reviewRating` ani nic
podobného. Důvod není technický: stavy na tomhle webu popisují **zdrojování**,
ne rozhodnutí o pravdě, a schéma, které vyžaduje číselný „rating pravdivosti",
by tomu dalo význam, jaký web nemá. `verify:jsonld` je součástí build gate a
shodí build, kdyby se hodnoticí typ kdekoli objevil.

## Co zatím neexistuje

Samostatné exportní routy (`/data/*.jsonld`), manifest datasetu ani
checksumy. Data jsou vložená v HTML stránkách; kdo je chce hromadně, sáhne
zatím do repozitáře nebo si build zreprodukuje sám. Je to napsané, protože
inzerovat neexistující API by bylo přesně to, co si projekt zakázal — viz
[bezpečnostní hranice](@/koncepty/bezpecnostni-hranice.md).

## A search index?

`search-index.json` a generované grafové soubory jsou interní artefakty
buildu, ne stabilní veřejné API. Můžou se změnit bez ohlášení.
