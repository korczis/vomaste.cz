+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:table-responsive — Responzivní tabulky"
template = "tooling-command.html"
weight = 71
description = "Responzivní tabulky: Vynucuje, že každá vydaná <table> sedí ve scroll kontextu (.dossier-prose pro markdown tabulky, obal overflow-x-auto z macros/table.html pro komponentové) — jinak by se na mobilu hroutila do šířky viewportu místo scrollování (text po jednom slově na řádek, identifikátory zlomené uprostřed tokenu).. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-table-responsive"
tooling_command = "verify-table-responsive"
view_model = "generated/tooling-catalog.json"
+++

Vynucuje, že každá vydaná <table> sedí ve scroll kontextu (.dossier-prose pro markdown tabulky, obal overflow-x-auto z macros/table.html pro komponentové) — jinak by se na mobilu hroutila do šířky viewportu místo scrollování (text po jednom slově na řádek, identifikátory zlomené uprostřed tokenu).

## Kdy ho spustit {#kdy}

Až po zola build.

## Co shodí běh {#vynucuje}

- Tabulka v hotovém HTML bez předka .dossier-prose ani overflow-x-auto — na mobilu by se hroutila místo scrollování.

## Co je potřeba vědět {#pozor}

- Doplněk lint:component-reuse na úrovni hotového HTML: šablonová brána markdown tabulky nevidí, protože ty žádnou šablonou neprocházejí — vykreslí je Zola přímo z těla stránky.

