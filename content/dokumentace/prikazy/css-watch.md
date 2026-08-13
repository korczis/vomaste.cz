+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run css:watch — CSS ve watch režimu"
template = "tooling-command.html"
weight = 94
description = "CSS ve watch režimu: Totéž co css:build, ale bez minifikace a v nekonečném watch režimu.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/css-watch"
tooling_command = "css-watch"
view_model = "generated/tooling-catalog.json"
+++

Totéž co css:build, ale bez minifikace a v nekonečném watch režimu.

## Kdy ho spustit {#kdy}

Vedle `zola serve`, když ladíš styly a nechceš po každé změně spouštět build.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

