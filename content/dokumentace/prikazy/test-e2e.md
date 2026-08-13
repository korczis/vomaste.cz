+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:e2e — Playwright end-to-end testy"
template = "tooling-command.html"
weight = 52
description = "Playwright end-to-end testy: Spustí Playwright testy podle playwright.config.mjs nad všemi nakonfigurovanými projekty.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-e2e"
tooling_command = "test-e2e"
view_model = "generated/tooling-catalog.json"
+++

Spustí Playwright testy podle playwright.config.mjs nad všemi nakonfigurovanými projekty.

## Kdy ho spustit {#kdy}

Ručně, nad postaveným webem. Není součástí `npm run build`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

