+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:concepts — Kontrola konceptů proti skupinám"
template = "tooling-command.html"
weight = 12
description = "Kontrola konceptů proti skupinám: Ověřuje stránky content/koncepty/* proti data/concept-groups.toml. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-concepts"
tooling_command = "validate-concepts"
view_model = "generated/tooling-catalog.json"
+++

Ověřuje stránky content/koncepty/* proti data/concept-groups.toml. Každá dlaždice na úvodní stránce se vykresluje z front matter konceptu a odkazuje na jeho stránku.

## Kdy ho spustit {#kdy}

V build pipeline; ručně po přidání nebo přesunu konceptu.

## Co shodí běh {#vynucuje}

- Koncept bez polí dlaždice (extra.tile_title / tile_summary / bullets) — jinak by na úvodní stránce tiše vznikl prázdný klikatelný box.
- Koncept v neznámé skupině — jinak by z úvodní stránky tiše zmizel úplně.

## Co je potřeba vědět {#pozor}

- Obě chyby jsou neviditelné v zeleném `zola build` — proto samostatná brána.

