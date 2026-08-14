+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just build — Brána kvality"
template = "tooling-command.html"
weight = 175
description = "Brána kvality: Zkratka na plný build. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-build"
tooling_command = "just-build"
view_model = "generated/tooling-catalog.json"
+++

Zkratka na plný build. TA brána kvality — stejná sekvence, jakou spouští CI. Změna není hotová, dokud tohle neskončí čistě.

## Kdy ho spustit {#kdy}

Před každým mergem nebo pushem.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Pre-commit hook je rychlá podmnožina, ne náhrada.

