+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test — Testová sada repozitáře"
template = "tooling-command.html"
weight = 51
description = "Testová sada repozitáře: Spouští node:test nad všemi *.test.mjs v scripts/build, dossier, data, migrations, lint, ui, ci, osint, intake (včetně matching/risk/preflight) a prismatic.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test"
tooling_command = "test"
view_model = "generated/tooling-catalog.json"
+++

Spouští node:test nad všemi *.test.mjs v scripts/build, dossier, data, migrations, lint, ui, ci, osint, intake (včetně matching/risk/preflight) a prismatic.

## Kdy ho spustit {#kdy}

Je krokem build pipeline hned po datovém řetězci. Lokálně kdykoli — je rychlá a nepotřebuje síť.

## Co shodí běh {#vynucuje}

- Jakýkoli padlý test v uvedených adresářích. Několik validátorů (validate-issue-forms, validate-intake-workflow) je do sady zapojených přes vlastní test soubor právě proto, aby nemusely být samostatným krokem pipeline.

