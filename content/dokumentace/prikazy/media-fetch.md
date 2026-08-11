+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run media:fetch — Stažení licencovaného portrétu nebo loga"
template = "tooling-command.html"
weight = 73
description = "Stažení licencovaného portrétu nebo loga: Stáhne pro jednu entitu volně licencovaný obrázek, uloží bajty do repozitáře a licenci, autora i zdroj zapíše do kanonického záznamu.. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/media-fetch"
tooling_command = "media-fetch"
view_model = "generated/tooling-catalog.json"
+++

Stáhne pro jednu entitu volně licencovaný obrázek, uloží bajty do repozitáře a licenci, autora i zdroj zapíše do kanonického záznamu.

## Kdy ho spustit {#kdy}

Ručně, při zakládání nebo doplňování entity. Vždy jedna entita na běh.

## Co shodí běh {#vynucuje}

- Licence se čte ze strojových metadat zdroje PŘED stažením; soubor s nesvobodnou licencí se nestahuje vůbec.
- Identita subjektu se rozhoduje přes Wikidata (jen lidé, P31=Q5, obrázek z P18), ne fulltextem — hledání „Karel Havlíček“ na Commons vrací portrét Havlíčka Borovského.
- Bajty jdou do repozitáře, ne hotlink: cizí CDN se přeuspořádá a náhled se tiše rozbije.
- Když volný obrázek neexistuje, entita zůstane bez obrázku — žádný placeholder.

## Co je potřeba vědět {#pozor}

- Jedna entita na běh je záměr, ne omezení: každý obrázek je publikační rozhodnutí o konkrétním člověku a smyčka přes pět set entit je přesně ten hromadný akt, kterému pravidla repozitáře brání.
- Potvrzená identita se ukládá do `externalIds.wikidata`, aby ji další běh nemusel hádat — jméno není identifikátor.
- Volby: --wikidata Q… (přišpendlí identitu), --file File:… (přišpendlí soubor), --allow-search (fulltext, výsledek se musí ověřit očima), --add, --force, --dry-run.
- Po stažení je potřeba `npm run data:build` a `npm run validate:media`.

