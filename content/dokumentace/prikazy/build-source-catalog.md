+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:source-catalog — Generátor katalogu zdrojů"
template = "tooling-command.html"
weight = 27
description = "Generátor katalogu zdrojů: Staví katalog zdrojů ze dvou záměrně oddělených vstupů: ručně psaných záznamů o registrech (co dokládají, co nedokládají, jaké mají pasti) a SKUTEČNĚ použitých zdrojů dopočítaných z datasetu.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-source-catalog"
tooling_command = "build-source-catalog"
view_model = "generated/tooling-catalog.json"
+++

Staví katalog zdrojů ze dvou záměrně oddělených vstupů: ručně psaných záznamů o registrech (co dokládají, co nedokládají, jaké mají pasti) a SKUTEČNĚ použitých zdrojů dopočítaných z datasetu.

## Kdy ho spustit {#kdy}

V build i dev pipeline; ručně po editaci data/source-catalog/*.json — jinak spadne verify:source-catalog.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Seznam „co bylo kdy použito“ se nikdy nepíše ručně, aby nemohl zastarat proti datům.
- Zápis je idempotentní: soubor se přepíše jen tehdy, když se jeho obsah liší.

