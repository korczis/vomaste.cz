+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:e2e:desktop — Playwright — jen desktop"
template = "tooling-command.html"
weight = 53
description = "Playwright — jen desktop: Totéž co test:e2e, omezené na projekt `desktop`.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-e2e-desktop"
tooling_command = "test-e2e-desktop"
view_model = "generated/tooling-catalog.json"
+++

Totéž co test:e2e, omezené na projekt `desktop`.

## Kdy ho spustit {#kdy}

Ručně, když nepotřebuješ mobilní projekty a chceš rychlejší běh.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

