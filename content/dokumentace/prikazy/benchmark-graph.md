+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run benchmark:graph — Benchmark grafového layoutu"
template = "tooling-command.html"
weight = 82
description = "Benchmark grafového layoutu: Technický benchmark build-time layoutu grafu nad syntetickým grafem (výchozí velikost se dá změnit přes --nodes/--edges). npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/benchmark-graph"
tooling_command = "benchmark-graph"
view_model = "generated/tooling-catalog.json"
+++

Technický benchmark build-time layoutu grafu nad syntetickým grafem (výchozí velikost se dá změnit přes --nodes/--edges). Používá TÝŽ kód, jakým staví registrovou vrstvu build:graph-projections.

## Kdy ho spustit {#kdy}

Ručně, když měříš dopad změny v layoutu. Není součástí `npm run build` — je to výkonnostní report, ne obsahová brána.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

