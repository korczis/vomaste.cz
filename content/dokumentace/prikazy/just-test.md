+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just test — Regresní testy toolingu"
template = "tooling-command.html"
weight = 119
description = "Regresní testy toolingu: Zkratka na testovou sadu repozitáře; je i součástí `just build`.. just recept, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-test"
tooling_command = "just-test"
view_model = "generated/tooling-catalog.json"
+++

Zkratka na testovou sadu repozitáře; je i součástí `just build`.

## Kdy ho spustit {#kdy}

Při práci na skriptech.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

