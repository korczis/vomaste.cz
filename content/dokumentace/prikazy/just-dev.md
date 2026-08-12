+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just dev — Živý náhled"
template = "tooling-command.html"
weight = 124
description = "Živý náhled: Zkratka na živý náhled na http://127.0.0.1:1111. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-dev"
tooling_command = "just-dev"
view_model = "generated/tooling-catalog.json"
+++

Zkratka na živý náhled na http://127.0.0.1:1111. Dlouho běžící: sám od sebe neskončí.

## Kdy ho spustit {#kdy}

Při práci na šablonách a stylech.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

