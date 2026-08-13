+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:intake:github — Testy GitHub adaptérů a publikace"
template = "tooling-command.html"
weight = 60
description = "Testy GitHub adaptérů a publikace: node:test nad adaptéry, zpracováním události, publikací výsledku, moduly github/ a kontrolou bezpečnosti artefaktů.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-intake-github"
tooling_command = "test-intake-github"
view_model = "generated/tooling-catalog.json"
+++

node:test nad adaptéry, zpracováním události, publikací výsledku, moduly github/ a kontrolou bezpečnosti artefaktů.

## Kdy ho spustit {#kdy}

Při práci na integraci s GitHubem.

## Co shodí běh {#vynucuje}

- Padlý test v GitHub vrstvě intake pipeline.

## Co je potřeba vědět {#pozor}

- Tři z těchhle testových souborů (process-github-event, publish-github-result, validate-artifact-safety) nemají hlavičkový komentář — co pokrývají, se dá zjistit jen ze jmen testů uvnitř.

