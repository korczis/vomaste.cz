+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:github-event — Vstupní bod workflow"
template = "tooling-command.html"
weight = 91
description = "Vstupní bod workflow: JEDINÝ krok GitHub Actions workflow, který čte $GITHUB_EVENT_PATH — a nikdy nedostane GITHUB_TOKEN do prostředí. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-github-event"
tooling_command = "intake-github-event"
view_model = "generated/tooling-catalog.json"
+++

JEDINÝ krok GitHub Actions workflow, který čte $GITHUB_EVENT_PATH — a nikdy nedostane GITHUB_TOKEN do prostředí. Oddělení oprávnění: tenhle krok umí zpracovat nepřátelské tělo issue bez jakékoli možnosti mluvit s GitHub API.

## Kdy ho spustit {#kdy}

Volá ho workflow. Ručně jen při ladění, s explicitními parametry --event/--output-dir/--repository-commit/--delivery-id/--expected-repository.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Stavový soubor se zapisuje vždy, bez ohledu na výsledek — pozdější krok s tokenem má tak jedno místo, kam se dívat.

