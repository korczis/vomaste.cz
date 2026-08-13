+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run css:build — Build CSS"
template = "tooling-command.html"
weight = 29
description = "Build CSS: Přeloží static/css/input.css Tailwindem do minifikovaného static/css/main.css.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/css-build"
tooling_command = "css-build"
view_model = "generated/tooling-catalog.json"
+++

Přeloží static/css/input.css Tailwindem do minifikovaného static/css/main.css.

## Kdy ho spustit {#kdy}

V build, dev i generate:all. Ručně po změně tříd v šablonách nebo tailwind.config.js.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

