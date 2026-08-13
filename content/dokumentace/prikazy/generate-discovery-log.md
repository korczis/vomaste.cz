+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run generate:discovery-log — Append-only log objevení"
template = "tooling-command.html"
weight = 37
description = "Append-only log objevení: Append-only auditní stopa každé entity a každého vztahu ve chvíli, kdy poprvé vstoupí do systému. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/generate-discovery-log"
tooling_command = "generate-discovery-log"
view_model = "generated/tooling-catalog.json"
+++

Append-only auditní stopa každé entity a každého vztahu ve chvíli, kdy poprvé vstoupí do systému. Na rozdíl od data/generated/** je data/discovery-log.jsonl commitnutý soubor, do kterého se jen přidává.

## Kdy ho spustit {#kdy}

V build i dev pipeline. Pro už zalogované záznamy se nic nemění.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Je to záznam toho, co systém pozoroval a kdy — ne publikační rozhodnutí. Zápis sem nemá žádný vliv na to, jestli bude entita někdy autorizovaná.

