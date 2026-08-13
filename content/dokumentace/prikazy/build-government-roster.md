+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:government-roster — Vládní jmenný seznam jako kontext"
template = "tooling-command.html"
weight = 21
description = "Vládní jmenný seznam jako kontext: Generuje globální KONTEXTOVÝ záznam entity pro každého člena vládního seznamu v data/government.toml — faktický veřejný údaj „kdo zastává který úřad“, záměrně nejslabší publikační stav, jaký repozitář má.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-government-roster"
tooling_command = "build-government-roster"
view_model = "generated/tooling-catalog.json"
+++

Generuje globální KONTEXTOVÝ záznam entity pro každého člena vládního seznamu v data/government.toml — faktický veřejný údaj „kdo zastává který úřad“, záměrně nejslabší publikační stav, jaký repozitář má.

## Kdy ho spustit {#kdy}

V build pipeline; ručně po editaci data/government.toml. `--dry-run` ukáže, co by vzniklo.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Není to způsob, jak někoho dostat do dossierového pokrytí: generované záznamy jsou vždy publicationRole = "context", dossierEnabled = false, dossierStatus = "not_authorized", coverageState = "referenced".
- Nikdy nepřepisuje existující kanonický záznam. Idempotentní — vytváří jen to, co ještě neexistuje.

