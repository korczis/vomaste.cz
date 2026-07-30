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

## Co si můžete stáhnout

Od 30. 7. 2026 vydává build i **ploché JSON exporty všech registrů** na
stabilních adresách pod `/data/` — `claims`, `sources`, `cases`, `gaps`,
`relations`, `entities`, `dossiers`, plus `manifest.json` s počty řádků.
Jsou to prosté pole objektů, použitelné s `curl` a `jq`, dohromady desítky
kilobajtů. Generuje je `scripts/dossier/build-data-exports.mjs` z týchž
front matter, ze kterých se renderují stránky — je to projekce, ne druhý
zdroj pravdy.

Nad týmiž soubory běží [SQL konzole](@/data/_index.md): DuckDB-Wasm přímo
v prohlížeči, dotaz ani výsledek nikam neodchází. Načte se až po kliknutí,
protože stojí ~6 MB.

## Co pořád neexistuje

Samostatné **JSON-LD** exportní routy (`/data/*.jsonld`), checksumy a
jakákoli záruka stability schématu. Plochý JSON výše je popsaný, ale není
to verzované API: sloupce můžou přibýt nebo se přejmenovat s tím, jak se
mění datový model. Kdo staví něco, co na tom má záviset, ať si build
zreprodukuje — je to celé v repozitáři.

`search-index.json` a generované grafové soubory (`global-graph.json`,
`navigation.json`) jsou **interní artefakty buildu**, ne veřejné API.
Můžou se změnit bez ohlášení a nemá smysl na ně cokoli navazovat.

## Proč to není jen technický detail

Strojově čitelná data jsou to jediné, co umožňuje web zkontrolovat jako
celek, ne po jedné stránce. „Kolik tvrzení stojí na jediném zdroji?" nebo
„které zdroje nepodpírají nic?" jsou otázky, na které web nemá důvod
odpovídat hezky — a přesně proto je poctivější dát čtenáři data a nechat
ho zeptat se sám, viz [zdrojováno](@/koncepty/zdrojovano.md).
