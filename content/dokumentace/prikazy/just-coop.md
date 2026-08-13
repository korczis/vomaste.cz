+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just coop — Stav víceagentní spolupráce"
template = "tooling-command.html"
weight = 173
description = "Stav víceagentní spolupráce: Vypíše stav co-op: board úkolů, worktrees a poslední zprávy na sběrnici.. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-coop"
tooling_command = "just-coop"
view_model = "generated/tooling-catalog.json"
+++

Vypíše stav co-op: board úkolů, worktrees a poslední zprávy na sběrnici.

## Kdy ho spustit {#kdy}

Na začátku session a před sáhnutím na soubor, který může držet jiný úkol.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

