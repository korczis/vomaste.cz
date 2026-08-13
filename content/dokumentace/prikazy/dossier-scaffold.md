+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run dossier:scaffold — Scaffold kanonického dossieru"
template = "tooling-command.html"
weight = 102
description = "Scaffold kanonického dossieru: Vytvoří minimální VALIDNÍ kanonický balíček dossieru: dossier.json a prázdné registry adresáře claims/sources/cases/gaps/relations/updates. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/dossier-scaffold"
tooling_command = "dossier-scaffold"
view_model = "generated/tooling-catalog.json"
+++

Vytvoří minimální VALIDNÍ kanonický balíček dossieru: dossier.json a prázdné registry adresáře claims/sources/cases/gaps/relations/updates. Nezapisuje jediný claim, source, case, gap ani relation.

## Kdy ho spustit {#kdy}

Po zapsání autorizace do append-only logu v AGENTS.md, jako první krok nového dossieru.

## Co shodí běh {#vynucuje}

- Odmítne běžet, pokud data/authorizations.toml nemá záznam s id == --authorization-record-id, jehož subjects zahrnují --subject. Placeholder pro neautorizovaný subjekt je stejně mimo hranice jako jeho tvrzení.

## Co je potřeba vědět {#pozor}

- Použití: `npm run dossier:scaffold -- --slug=… --title="…" --subject=… --authorization-record-id=AUTH-…`
- Obsah dossieru je samostatný, plně lidský a plně zdrojovaný redakční akt — scaffold ho vědomě nedělá.

