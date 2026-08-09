+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:compile — Kompilace kanonického datasetu"
template = "tooling-command.html"
weight = 2
description = "Kompilace kanonického datasetu: Načte kanonický dataset, zvaliduje ho a zkompiluje do modelu, se kterým dál pracují generátory. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-compile"
tooling_command = "data-compile"
view_model = "generated/tooling-catalog.json"
+++

Načte kanonický dataset, zvaliduje ho a zkompiluje do modelu, se kterým dál pracují generátory. Vypíše souhrn: počet balíčků, záznamů podle typu, rout, uzlů a hran grafu a schemaVersion manifestu.

## Kdy ho spustit {#kdy}

Když chceš vidět, co z dat po validaci vznikne (počty záznamů, rout, velikost grafu). V build pipeline nefiguruje — generátory si model kompilují samy.

## Co shodí běh {#vynucuje}

- Nenačtitelný nebo nevalidní kanonický dataset (tytéž chyby jako data:validate — sdílí runCheck).

