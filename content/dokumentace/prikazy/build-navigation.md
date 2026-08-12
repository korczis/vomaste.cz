+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:navigation — Generátor navigačního stromu"
template = "tooling-command.html"
weight = 23
description = "Generátor navigačního stromu: Generuje primární navigační STROM z dat — to, co skutečně vykresluje base.html. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-navigation"
tooling_command = "build-navigation"
view_model = "generated/tooling-catalog.json"
+++

Generuje primární navigační STROM z dat — to, co skutečně vykresluje base.html. Statický skelet neobsahuje jediný slug ani osobu; dossierový podstrom se dopočítá.

## Kdy ho spustit {#kdy}

Po build:routes. Přidání, přejmenování ani odebrání dossieru nevyžaduje ruční zásah do skeletu.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Každý dossier visí POD položkou „Dossiery“ jako vlastní podstrom — osoba není nikdy top-level položka sidebaru. Entitní dossiery jdou první, agregátní pohledy poslední a jsou označené příznakem isAggregate.
- Koncepty jsou záměrná výjimka: nejsou dossierové záznamy, kanonický model je nenese, takže jejich front matter zůstává zdrojem.

