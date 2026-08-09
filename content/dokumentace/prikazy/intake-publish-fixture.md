+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:publish-fixture — Demo publikačního kroku"
template = "tooling-command.html"
weight = 44
description = "Demo publikačního kroku: Předvede vytvoření komentáře, aktualizaci TÉHOŽ komentáře při opakovaném běhu, synchronizaci štítků a rozhodnutí o notifikaci vlastníka — výhradně proti in-memory mock GitHub adaptéru.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-publish-fixture"
tooling_command = "intake-publish-fixture"
view_model = "generated/tooling-catalog.json"
+++

Předvede vytvoření komentáře, aktualizaci TÉHOŽ komentáře při opakovaném běhu, synchronizaci štítků a rozhodnutí o notifikaci vlastníka — výhradně proti in-memory mock GitHub adaptéru.

## Kdy ho spustit {#kdy}

Když měníš publikační logiku a chceš vidět její chování bez skutečného GitHubu.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Žádná síť; GITHUB_TOKEN se v tomhle souboru nikde nečte.

