+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:fixture — Smoke běh nad syntetickým podnětem"
template = "tooling-command.html"
weight = 46
description = "Smoke běh nad syntetickým podnětem: Protáhne jeden syntetický validní fixture celou pipeline s pevnými hodinami a commitem do gitignorovaného .tmp/intake/ a vypíše vzniklé cesty.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-fixture"
tooling_command = "intake-fixture"
view_model = "generated/tooling-catalog.json"
+++

Protáhne jeden syntetický validní fixture celou pipeline s pevnými hodinami a commitem do gitignorovaného .tmp/intake/ a vypíše vzniklé cesty.

## Kdy ho spustit {#kdy}

Kdykoli chceš ověřit, že intake pipeline jako celek pořád funguje. Nezanechává sledované změny.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

