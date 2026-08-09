+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:search-index — Statický index vyhledávání"
template = "tooling-command.html"
weight = 23
description = "Statický index vyhledávání: Staví statický index pokrývající každý routovatelný záznam napříč dossiery — zdroje, tvrzení, kauzy, mezery, vztahy, samotné stránky dossierů i globální registr entit. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-search-index"
tooling_command = "build-search-index"
view_model = "generated/tooling-catalog.json"
+++

Staví statický index pokrývající každý routovatelný záznam napříč dossiery — zdroje, tvrzení, kauzy, mezery, vztahy, samotné stránky dossierů i globální registr entit. Deterministické, bez sítě.

## Kdy ho spustit {#kdy}

V build i dev pipeline před zola build.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

