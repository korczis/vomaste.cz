+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run dossier:next-id — Další volné ID záznamu, ověřené i proti originu"
template = "tooling-command.html"
weight = 68
description = "Další volné ID záznamu, ověřené i proti originu: Spočítá další volné ID pro claim/source/case/gap jednoho dossieru a kontroluje přitom nejen lokální strom, ale i origin/master — a hlásí, když se liší.. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/dossier-next-id"
tooling_command = "dossier-next-id"
view_model = "generated/tooling-catalog.json"
+++

Spočítá další volné ID pro claim/source/case/gap jednoho dossieru a kontroluje přitom nejen lokální strom, ale i origin/master — a hlásí, když se liší.

## Kdy ho spustit {#kdy}

Před založením každého nového kanonického záznamu v dossieru, na kterém může pracovat i někdo jiný.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Vzniklo z reálné kolize: dvě souběžné instance spočítaly totéž „další volné" ID ze svých lokálních kopií a výsledkem bylo ruční přečíslování sedmi záznamů.
- `--no-fetch` přeskočí `git fetch` pro offline běh; tím ale mizí právě ta kontrola, kvůli které skript existuje.

