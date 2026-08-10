+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run preflight — Preflight vygenerovaných vstupů"
template = "tooling-command.html"
weight = 102
description = "Preflight vygenerovaných vstupů: Zkontroluje, jestli existují vygenerované soubory, které šablony čtou přes load_data. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/preflight"
tooling_command = "preflight"
view_model = "generated/tooling-catalog.json"
+++

Zkontroluje, jestli existují vygenerované soubory, které šablony čtou přes load_data. Je to mapa mezi symptomem („load_data … does not exist“ z hloubi base.html) a příčinou („neběžely generátory“).

## Kdy ho spustit {#kdy}

Před `zola serve`, po klonu nebo po `git pull`. `--quiet` mlčí, když je vše v pořádku.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Není náhrada generátorů — jen řekne, který příkaz chybějící vstupy vyrobí.

