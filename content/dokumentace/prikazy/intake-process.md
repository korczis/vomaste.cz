+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:process — Zpracování podnětu z issue"
template = "tooling-command.html"
weight = 99
description = "Zpracování podnětu z issue: Jediný vstupní bod, který protáhne podnět celou intake pipeline od začátku do konce. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-process"
tooling_command = "intake-process"
view_model = "generated/tooling-catalog.json"
+++

Jediný vstupní bod, který protáhne podnět celou intake pipeline od začátku do konce. Sám dělá jen parsování argumentů, atomický zápis výstupu a mapování exit kódů; každou fázi vlastní samostatný modul.

## Kdy ho spustit {#kdy}

Nad uloženou událostí issue: `node scripts/intake/process-issue.mjs --event <cesta> --output-dir <adresář> [--generated-at <ISO8601>] [--repository-commit <sha>] [--overwrite]`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

