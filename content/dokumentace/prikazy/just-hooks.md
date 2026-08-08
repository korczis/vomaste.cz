+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just hooks — Přeinstalace git hooků"
template = "tooling-command.html"
weight = 119
description = "Přeinstalace git hooků: Zkratka, která znovu nasměruje core.hooksPath na .githooks/. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-hooks"
tooling_command = "just-hooks"
view_model = "generated/tooling-catalog.json"
+++

Zkratka, která znovu nasměruje core.hooksPath na .githooks/. Normálně to udělá `just setup`.

## Kdy ho spustit {#kdy}

Když `git config core.hooksPath` neukazuje na .githooks.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

