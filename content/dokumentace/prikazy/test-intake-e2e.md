+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:intake:e2e — Testy end-to-end fixtures"
template = "tooling-command.html"
weight = 54
description = "Testy end-to-end fixtures: node:test nad scripts/intake/run-e2e-fixture.test.mjs: protáhne golden fixtures skutečnou pipeline a kontroluje očekávané výsledky, sémantiku editace a jednu skutečně dosažitelnou (mockovanou, jen lokální) šťastnou cestu.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-intake-e2e"
tooling_command = "test-intake-e2e"
view_model = "generated/tooling-catalog.json"
+++

node:test nad scripts/intake/run-e2e-fixture.test.mjs: protáhne golden fixtures skutečnou pipeline a kontroluje očekávané výsledky, sémantiku editace a jednu skutečně dosažitelnou (mockovanou, jen lokální) šťastnou cestu.

## Kdy ho spustit {#kdy}

Když měníš chování napříč intake pipeline.

## Co shodí běh {#vynucuje}

- Odchylka od očekávaných výsledků na matici golden fixtures.

## Co je potřeba vědět {#pozor}

- Konvence repozitáře pro fixaci očekávaných hodnot jsou assertions proti skutečnému běhu, ne neprůhledné commitnuté diff soubory.

