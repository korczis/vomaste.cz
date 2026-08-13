+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run authorize:entity — Autorizace subjektu"
template = "tooling-command.html"
weight = 95
description = "Autorizace subjektu: Jediná cesta, jak se dossierový status kontextové entity změní na „authorized“. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/authorize-entity"
tooling_command = "authorize-entity"
view_model = "generated/tooling-catalog.json"
+++

Jediná cesta, jak se dossierový status kontextové entity změní na „authorized“. Přidá datovaný append-only záznam do logu v AGENTS.md, odpovídající strukturovaný záznam do data/authorizations.toml a překlopí roli entity na subject.

## Kdy ho spustit {#kdy}

Před založením nového dossieru, po rozhodnutí vlastníka. Následuje authorization:anchor a teprve pak dossier:scaffold.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Normální cesta je interaktivní a vyžaduje, aby člověk napsal id entity, rozsah a potvrzovací frázi. Obecný CI/background režim --yes neexistuje.
- Nescaffolduje obsah dossieru. Dělá entitu jen způsobilou; validate:authorization dál shodí build, pokud dossier existuje bez skutečných zdrojů a tvrzení.

