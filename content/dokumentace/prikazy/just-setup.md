+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just setup — Instalace závislostí"
template = "tooling-command.html"
weight = 184
description = "Instalace závislostí: Nainstaluje závislosti; git hooky se zapojí samy přes postinstall.. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-setup"
tooling_command = "just-setup"
view_model = "generated/tooling-catalog.json"
+++

Nainstaluje závislosti; git hooky se zapojí samy přes postinstall.

## Kdy ho spustit {#kdy}

Po klonu repozitáře.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

