+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:validate — Validace intake manifestu"
template = "tooling-command.html"
weight = 47
description = "Validace intake manifestu: Samostatný validátor už zapsaného manifestu proti schemas/intake/intake-manifest.schema.json.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-validate"
tooling_command = "intake-validate"
view_model = "generated/tooling-catalog.json"
+++

Samostatný validátor už zapsaného manifestu proti schemas/intake/intake-manifest.schema.json.

## Kdy ho spustit {#kdy}

Když chceš překontrolovat manifest z dřívější verze procesoru bez opakování celé pipeline.

## Co shodí běh {#vynucuje}

- Manifest, který neodpovídá schématu intake manifestu.

