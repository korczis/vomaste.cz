+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:build — Datový řetěz bez webu"
template = "tooling-command.html"
weight = 98
description = "Datový řetěz bez webu: Řetěz npm skriptů: validace, kompilace, view modely, content adaptéry, sync, parita content a evidenční plán. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-build"
tooling_command = "data-build"
view_model = "generated/tooling-catalog.json"
+++

Řetěz npm skriptů: validace, kompilace, view modely, content adaptéry, sync, parita content a evidenční plán. Nestaví web ani assety.

## Kdy ho spustit {#kdy}

Když pracuješ na datech a chceš je protáhnout celým datovým řetězcem bez čekání na zola build.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

