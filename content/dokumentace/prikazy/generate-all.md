+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run generate:all — Všechny generátory bez validace"
template = "tooling-command.html"
weight = 102
description = "Všechny generátory bez validace: Generační podmnožina jednotné dev pipeline: view modely a content adaptéry, sekce typů entit, routy, navigace, sekundární providery, katalogy, exporty, grafové projekce, JSON-LD, metriky, index vyhledávání, kandidáti, log objevení, CSS a JS.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/generate-all"
tooling_command = "generate-all"
view_model = "generated/tooling-catalog.json"
+++

Generační podmnožina jednotné dev pipeline: view modely a content adaptéry, sekce typů entit, routy, navigace, sekundární providery, katalogy, exporty, grafové projekce, JSON-LD, metriky, index vyhledávání, kandidáti, log objevení, CSS a JS.

## Kdy ho spustit {#kdy}

Jako záchrana po klonu nebo po `git pull`, kdy data/generated/** neexistuje. Volá ho `npm run serve`, když preflight ohlásí chybějící vstupy.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Neobsahuje validátory ani post-build brány — není náhradou `npm run build`.

