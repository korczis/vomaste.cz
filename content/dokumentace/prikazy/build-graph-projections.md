+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:graph-projections — Grafové projekce"
template = "tooling-command.html"
weight = 19
description = "Grafové projekce: Nahrazuje monolitický globální graf manifestem a samostatně stahovatelnými vrstvami: kurátorovaný entitní graf, plná registrová vrstva a per-dossier graf.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-graph-projections"
tooling_command = "build-graph-projections"
view_model = "generated/tooling-catalog.json"
+++

Nahrazuje monolitický globální graf manifestem a samostatně stahovatelnými vrstvami: kurátorovaný entitní graf, plná registrová vrstva a per-dossier graf.

## Kdy ho spustit {#kdy}

Po build:routes a build:data-exports, jejichž výstupy čte.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Všechno je projekce, ne nový zdroj pravdy. Souřadnice se počítají jednou při buildu, takže prohlížeč nikdy nespouští synchronní layout při načtení.

