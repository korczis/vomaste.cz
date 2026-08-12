+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:learning — Kontrola integrity vzdělávací vrstvy"
template = "tooling-command.html"
weight = 15
description = "Kontrola integrity vzdělávací vrstvy: Ověřuje Start, Bootcamp, Akademii, Příručku a Jak přispět proti data/learning.toml a data/learning-fixtures.toml. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-learning"
tooling_command = "validate-learning"
view_model = "generated/tooling-catalog.json"
+++

Ověřuje Start, Bootcamp, Akademii, Příručku a Jak přispět proti data/learning.toml a data/learning-fixtures.toml. Kurikulum je graf a graf se rozbíjí tiše — lekce s odkazem na neexistující pokračování se projeví jen tím, že se odkaz nevykreslí, a build zůstane zelený.

## Kdy ho spustit {#kdy}

V build pipeline a v režimu check; ručně po přidání nebo přesunu lekce, po změně učební cesty a po jakékoli úpravě cvičných dat.

## Co shodí běh {#vynucuje}

- Rozbitý řetěz `next` nebo `next_route` — čtenář by skončil ve slepé uličce uprostřed kurzu.
- Prerekvizita na neexistující nebo cizí lekci, kterou šablona nedohledá.
- Duplicitní `lesson_id` a kód lekce neodpovídající kódu své úrovně.
- Nedosažitelná lekce — nevede na ni žádný `next` ani učební cesta.
- Učební cesta jmenující lekci, která neexistuje.
- Odkaz `related_kb` na neexistující stránku konceptu (a prefix `@/`, který get_page() nepřijímá).
- Cvičná data bez označení `synthetic` a cvičné URL mimo rezervovaný jmenný prostor (RFC 2606).
- Odpověď klasifikačního cvičení neodpovídající žádnému skutečnému stavu tvrzení.
- Cvičný identifikátor vyskytující se v data/dossiers/** — výuka nesmí být zadními vrátky k rozšíření rozsahu.

## Co je potřeba vědět {#pozor}

- Kontrola L13 (cvičná data mimo kanonický dataset) je jediný důvod, proč tenhle validátor prochází i data/dossiers/**. Cvičný subjekt v publikovaných datech by znamenal tvrzení o osobě, která neexistuje, bez zdroje a mimo jakýkoli rozsah.
- Cíle lekce se vyžadují jen u výukových sekcí. Příručka je lookup, ne kurz — místo cílů se u ní vyžaduje kategorie.

