+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just inbox — Zprávy pro tohoto agenta"
template = "tooling-command.html"
weight = 131
description = "Zprávy pro tohoto agenta: Vypíše zprávy adresované tomuhle agentovi na co-op sběrnici.. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-inbox"
tooling_command = "just-inbox"
view_model = "generated/tooling-catalog.json"
+++

Vypíše zprávy adresované tomuhle agentovi na co-op sběrnici.

## Kdy ho spustit {#kdy}

Průběžně během práce ve worktree.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

