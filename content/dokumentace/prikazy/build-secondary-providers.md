+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:secondary-providers — Data pro sekundární sidebar a explorery"
template = "tooling-command.html"
weight = 25
description = "Data pro sekundární sidebar a explorery: Staví tři artefakty pro sekundární navigaci: nezávisle načitatelné per-dossier podstromy, katalog dossierů s fasetovými poli a explorer entit se server-side spočítanými fasetami.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-secondary-providers"
tooling_command = "build-secondary-providers"
view_model = "generated/tooling-catalog.json"
+++

Staví tři artefakty pro sekundární navigaci: nezávisle načitatelné per-dossier podstromy, katalog dossierů s fasetovými poli a explorer entit se server-side spočítanými fasetami.

## Kdy ho spustit {#kdy}

V build i dev pipeline po build:navigation.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Popisky, ikony a pořadí registrů se čtou ze stejného data/navigation.toml, který používá build:navigation — primární a sekundární sidebar tak nemohou rozejít.
- Ani jeden slug není v souboru napsaný: všechno jde z compiled modelu nebo z registry seznamu.

