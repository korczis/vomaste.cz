+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just clean — Smazání build outputu"
template = "tooling-command.html"
weight = 174
description = "Smazání build outputu: Smaže public/. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-clean"
tooling_command = "just-clean"
view_model = "generated/tooling-catalog.json"
+++

Smaže public/. Nic v něm není zdroj pravdy.

## Kdy ho spustit {#kdy}

Když chceš vyloučit, že problém způsobuje starý výstup.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

