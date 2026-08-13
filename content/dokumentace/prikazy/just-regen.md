+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just regen — Regenerace content adaptérů"
template = "tooling-command.html"
weight = 130
description = "Regenerace content adaptérů: Zkratka na datový řetěz, který přegeneruje content adaptéry z kanonických dat.. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-regen"
tooling_command = "just-regen"
view_model = "generated/tooling-catalog.json"
+++

Zkratka na datový řetěz, který přegeneruje content adaptéry z kanonických dat.

## Kdy ho spustit {#kdy}

Po editaci data/dossiers/**/*.json.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Dřívější podoba tohohle receptu (migrace tvrzení a kauz na stránky) zanikla — content/** je generovaný adaptér kanonických dat.

