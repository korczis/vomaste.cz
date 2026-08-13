+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:rules-catalog — Brána proti rozejití katalogu pravidel"
template = "tooling-command.html"
weight = 74
description = "Brána proti rozejití katalogu pravidel: Týž generátor v režimu kontroly: nic nezapíše, ale spadne, kdyby zápis něco změnil, kdyby vlastník pravidla přišel o hlavičku, nebo kdyby dokumentace odkazovala na pravidlo, které žádný validátor nevlastní.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-rules-catalog"
tooling_command = "verify-rules-catalog"
view_model = "generated/tooling-catalog.json"
+++

Týž generátor v režimu kontroly: nic nezapíše, ale spadne, kdyby zápis něco změnil, kdyby vlastník pravidla přišel o hlavičku, nebo kdyby dokumentace odkazovala na pravidlo, které žádný validátor nevlastní.

## Kdy ho spustit {#kdy}

V build pipeline a před review; ručně kdykoli po zásahu do hlaviček validátorů nebo do generované stránky.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nezapisuje. Selhání znamená, že se generovaný výstup rozešel se svým zdrojem — spusť build:rules-catalog.
- Chytá i opačný směr: text odkazující na pravidlo, které nikdo nevynucuje.

