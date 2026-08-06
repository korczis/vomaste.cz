+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run lint:historical-coupling — Zákaz vazby na historické subjekty"
template = "tooling-command.html"
weight = 8
description = "Zákaz vazby na historické subjekty: Anti-coupling lint: vomaste.cz je víceúčelový systém pro libovolný počet dossierů. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/lint-historical-coupling"
tooling_command = "lint-historical-coupling"
view_model = "generated/tooling-catalog.json"
+++

Anti-coupling lint: vomaste.cz je víceúčelový systém pro libovolný počet dossierů. Dva historické seed subjekty musí zůstat obyčejná doménová DATA, nikdy architektura.

## Kdy ho spustit {#kdy}

Ručně po refaktoru šablon nebo skriptů. Záměrně zatím není zapojený v žádné bráně — de-specializační migrace ještě běží a lint je zatím červený by design (viz komentář v .githooks/pre-commit).

## Co shodí běh {#vynucuje}

- Identifikátor historického seed subjektu (jména a odvozené slugy) ve STRUKTURÁLNÍ části zdroje: šablony, navigační data, skripty, styly, JS moduly, konfigurace, CI.

## Co je potřeba vědět {#pozor}

- Nikdy se neskenuje kanonický obsah (content/**), per-dossier data, generované artefakty ani dokumentace včetně append-only logu v AGENTS.md.
- Zbylé legitimní výskyty se povolují po jednom v scripts/lint/historical-coupling-allowlist.json s odůvodněním — žádné plošné ignorování.

