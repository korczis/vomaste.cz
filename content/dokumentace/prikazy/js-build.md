+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run js:build — Build JavaScriptu"
template = "tooling-command.html"
weight = 36
description = "Build JavaScriptu: Zabalí esbuildem assets/js/app.js a assets/js/graph-app.js do minifikovaných bundlů pro ES2020 v static/js/.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/js-build"
tooling_command = "js-build"
view_model = "generated/tooling-catalog.json"
+++

Zabalí esbuildem assets/js/app.js a assets/js/graph-app.js do minifikovaných bundlů pro ES2020 v static/js/.

## Kdy ho spustit {#kdy}

V build, dev i generate:all. Ručně po změně čehokoli pod assets/js/.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

