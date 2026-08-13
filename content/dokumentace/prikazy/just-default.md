+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just default — Výpis receptů"
template = "tooling-command.html"
weight = 161
description = "Výpis receptů: Vypíše všechny recepty. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-default"
tooling_command = "just-default"
view_model = "generated/tooling-catalog.json"
+++

Vypíše všechny recepty. Spustí se i při holém `just` bez argumentu.

## Kdy ho spustit {#kdy}

Když si nepamatuješ název receptu.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

