+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:match-fixture — Fixture pro ladění párování"
template = "tooling-command.html"
weight = 44
description = "Fixture pro ladění párování: Předvyplněné volání intake:process nad fixture tests/fixtures/intake/valid-new-dossier.json s pevným časem, pevným commitem a --overwrite do .tmp/intake/match-fixture.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-match-fixture"
tooling_command = "intake-match-fixture"
view_model = "generated/tooling-catalog.json"
+++

Předvyplněné volání intake:process nad fixture tests/fixtures/intake/valid-new-dossier.json s pevným časem, pevným commitem a --overwrite do .tmp/intake/match-fixture.

## Kdy ho spustit {#kdy}

Při ladění párování entit, kdy chceš opakovaně stejný deterministický vstup.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

