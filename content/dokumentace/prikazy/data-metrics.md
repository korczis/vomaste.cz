+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:metrics — Navigační metriky"
template = "tooling-command.html"
weight = 33
description = "Navigační metriky: Spočítá pojmenované agregované metriky z registru scripts/data/navigation-metrics.registry.mjs a zapíše deterministický manifest, ze kterého šablony berou počty do navigačních odznaků.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-metrics"
tooling_command = "data-metrics"
view_model = "generated/tooling-catalog.json"
+++

Spočítá pojmenované agregované metriky z registru scripts/data/navigation-metrics.registry.mjs a zapíše deterministický manifest, ze kterého šablony berou počty do navigačních odznaků.

## Kdy ho spustit {#kdy}

V pipeline až PO build:jsonld-exports — metriky čtou kanonické exporty, které vyrábí právě ten krok.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Počty patří do serverem vykresleného HTML, ne do JavaScriptu: číslo dopočítané po DOMContentLoaded by problikávalo, posouvalo layout a pro crawler by neexistovalo.
- Manifest se zapisuje atomicky přes dočasný soubor a rename, aby zabitý build nenechal poloviční soubor, který by další validátor četl jako platný.

