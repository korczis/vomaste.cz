+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:sync-content — Sync stagingu do content/"
template = "tooling-command.html"
weight = 29
description = "Sync stagingu do content/: Kopíruje data/generated/content-staging/** do content/** pro všechny cesty pokryté kanonickým modelem. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-sync-content"
tooling_command = "data-sync-content"
view_model = "generated/tooling-catalog.json"
+++

Kopíruje data/generated/content-staging/** do content/** pro všechny cesty pokryté kanonickým modelem. Uvnitř pokrytého scope maže .md soubory bez staging protějšku — zaniklý kanonický záznam nesmí v content/ zůstat jako sirotčí stránka.

## Kdy ho spustit {#kdy}

Automaticky v pipeline po data:generate-content. Nikdy needituj content/** v pokrytém scope ručně — nejbližší sync to přepíše.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nikdy nekopíruje ani nemaže ručně psané kořenové indexy (content/dossiers/_index.md, content/entities/_index.md) ani aux stránky dossierů.
- Kopírování je byte-verné; druhý běh nad stejným stavem vypíše copied=0, deleted=0.

