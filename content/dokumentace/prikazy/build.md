+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build — Plný build — brána kvality"
template = "tooling-command.html"
weight = 92
description = "Plný build — brána kvality: Jediný orchestrační vstup build pipeline. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build"
tooling_command = "build"
view_model = "generated/tooling-catalog.json"
+++

Jediný orchestrační vstup build pipeline. Deleguje na scripts/build/pipeline.mjs, který drží pořadí kroků jako data i s důvody, proč je právě takové.

## Kdy ho spustit {#kdy}

Před každým mergem nebo pushem. Tohle je TA brána kvality: pre-commit hook je rychlá podmnožina, ne náhrada. Stejnou sekvenci volá i CI, což hlídá check:workflow-parity.

## Co shodí běh {#vynucuje}

- Nenulový exit kteréhokoli kroku pipeline okamžitě zastaví běh — pipeline nepokračuje a vypíše, který krok selhal a s jakým kódem.

## Co je potřeba vědět {#pozor}

- Každý režim začíná `data:validate` — nevalidní kanonická data musí pipeline zastavit dřív, než cokoli vygeneruje.
- Režim build drží zámek po celý běh, ne jen na kroku zola build: dva souběžné buildy ve stejném checkoutu se dřív přetahovaly už o data/generated/views/**.

