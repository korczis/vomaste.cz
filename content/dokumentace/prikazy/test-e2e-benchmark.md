+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:e2e:benchmark — Playwright — benchmark grafu"
template = "tooling-command.html"
weight = 52
description = "Playwright — benchmark grafu: Spustí tests/e2e/graph-benchmark.spec.mjs v projektu desktop s proměnnou RUN_GRAPH_BENCHMARK=1, která test odemyká — bez ní se přeskakuje.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-e2e-benchmark"
tooling_command = "test-e2e-benchmark"
view_model = "generated/tooling-catalog.json"
+++

Spustí tests/e2e/graph-benchmark.spec.mjs v projektu desktop s proměnnou RUN_GRAPH_BENCHMARK=1, která test odemyká — bez ní se přeskakuje.

## Kdy ho spustit {#kdy}

Ručně, když měříš chování grafu v prohlížeči.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

