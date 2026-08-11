+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:views — View modely pro šablony"
template = "tooling-command.html"
weight = 31
description = "View modely pro šablony: Z compiled modelu generuje deterministické view modely — jediný datový vstup šablon. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-views"
tooling_command = "data-views"
view_model = "generated/tooling-catalog.json"
+++

Z compiled modelu generuje deterministické view modely — jediný datový vstup šablon. Žádné nové faktické tvrzení: jen projekce kanonických záznamů plus dopočítané routy, titulky, popisky a počty.

## Kdy ho spustit {#kdy}

Automaticky v pipeline hned po kanonické bráně. Ručně, když šablona hlásí chybějící load_data.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Determinismus je závazek: stabilní pořadí klíčů, LF, koncový newline, žádné buildové timestampy — druhý běh nad stejným vstupem nesmí změnit jediný bajt.
- Výstupní adresář se před zápisem čistí, aby nepřežily soubory z minulých běhů.

