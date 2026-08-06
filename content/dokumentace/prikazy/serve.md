+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run serve — Zola server s automatickou nápravou"
template = "tooling-command.html"
weight = 94
description = "Zola server s automatickou nápravou: Spustí preflight; když chybí vygenerované vstupy, dožene je přes generate:all a teprve pak spustí `zola serve`.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/serve"
tooling_command = "serve"
view_model = "generated/tooling-catalog.json"
+++

Spustí preflight; když chybí vygenerované vstupy, dožene je přes generate:all a teprve pak spustí `zola serve`.

## Kdy ho spustit {#kdy}

Nejrychlejší cesta k živému náhledu v čerstvém checkoutu.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

