+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run dev — Vývojový server"
template = "tooling-command.html"
weight = 94
description = "Vývojový server: Vývojový režim jednotné pipeline: validace, archivní offline brána, potřebné generátory a nakonec dlouho běžící `zola serve`.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/dev"
tooling_command = "dev"
view_model = "generated/tooling-catalog.json"
+++

Vývojový režim jednotné pipeline: validace, archivní offline brána, potřebné generátory a nakonec dlouho běžící `zola serve`.

## Kdy ho spustit {#kdy}

Při práci na šablonách a stylech. Dlouho běžící: sám od sebe neskončí.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Režim build drží zámek po celý běh, `dev` ne: `zola serve` může běžet hodiny a zamykat by na tu dobu blokovalo každý jiný build ve stejném checkoutu.

