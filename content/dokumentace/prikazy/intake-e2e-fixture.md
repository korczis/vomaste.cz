+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:e2e-fixture — End-to-end běh všech golden fixtures"
template = "tooling-command.html"
weight = 43
description = "End-to-end běh všech golden fixtures: Protáhne každý golden fixture tests/fixtures/intake/e2e-*.json PLNOU pipeline — parsování, validace, normalizace, párování entit, klasifikace rizika, preflight URL, manifest, report — s pevnými hodinami a mock DNS adaptérem.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-e2e-fixture"
tooling_command = "intake-e2e-fixture"
view_model = "generated/tooling-catalog.json"
+++

Protáhne každý golden fixture tests/fixtures/intake/e2e-*.json PLNOU pipeline — parsování, validace, normalizace, párování entit, klasifikace rizika, preflight URL, manifest, report — s pevnými hodinami a mock DNS adaptérem.

## Kdy ho spustit {#kdy}

Když měníš cokoli napříč intake pipeline a chceš vidět chování na celé matici typů podání a nepřátelských scénářů.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nikdy nesahá na veřejný internet, nikdy nezapisuje produkční dossierová data, nikdy nevolá GitHub API.

