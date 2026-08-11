+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:promote — Promoce do kanonických dat — nehotové"
template = "tooling-command.html"
weight = 80
description = "Promoce do kanonických dat — nehotové: Stub. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-promote"
tooling_command = "prismatic-promote"
view_model = "generated/tooling-catalog.json"
+++

Stub. Vypíše odkaz na architektonické rozhodnutí a skončí nenulově. Formát manifestu, zapisovač promoce ani rollback logika neexistují — dnes tenhle příkaz do kanonických dat zapsat nic nemůže.

## Kdy ho spustit {#kdy}

Nespouštět.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Až vznikne, bude to JEDINÝ krok integrace, který smí sáhnout na data/dossiers/**, a musí projít stejnými publikačními branami jako ručně psané tvrzení.

