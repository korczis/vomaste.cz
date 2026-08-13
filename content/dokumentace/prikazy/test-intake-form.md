+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:intake:form — Testy kontraktu formulář ↔ parser"
template = "tooling-command.html"
weight = 59
description = "Testy kontraktu formulář ↔ parser: node:test nad kompatibilitou skutečné issue šablony s parserem, nad strukturálním validátorem formulářů a nad regresní stráží šablon.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-intake-form"
tooling_command = "test-intake-form"
view_model = "generated/tooling-catalog.json"
+++

node:test nad kompatibilitou skutečné issue šablony s parserem, nad strukturálním validátorem formulářů a nad regresní stráží šablon.

## Kdy ho spustit {#kdy}

Po každé editaci .github/ISSUE_TEMPLATE/**.

## Co shodí běh {#vynucuje}

- Rozejití skutečné .github/ISSUE_TEMPLATE/navrh-dossieru.yml s parserem — chyba se pak neprojeví až na podání skutečného člověka.
- Povolené blank issues, contact_links slibující důvěrnost nebo anonymitu, obsahový formulář bez varování o veřejnosti a bez povinného potvrzovacího checkboxu.

## Co je potřeba vědět {#pozor}

- Syntaktická kontrola YAML používá systémové `ruby -ryaml`, je-li k dispozici. Repozitář kvůli jedné stráži nepřidává YAML parser jako závislost; strukturální kontroly běží vždy.

