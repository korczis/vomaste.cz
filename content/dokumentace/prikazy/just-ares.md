+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just ares *args — Dotaz do ARES"
template = "tooling-command.html"
weight = 166
description = "Dotaz do ARES: Dotaz do českého primárního obchodního registru podle `--ico=` nebo `--name=`. just recept, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-ares"
tooling_command = "just-ares"
view_model = "generated/tooling-catalog.json"
+++

Dotaz do českého primárního obchodního registru podle `--ico=` nebo `--name=`. Živá síť, nikdy součást buildu.

## Kdy ho spustit {#kdy}

Při rešerši k firmě. Příklady: `just ares --ico=28274318`, `just ares --name="GMR GAS"`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- DOKLÁDÁ identitu, sídlo, právní formu a stav subjektu k datu výpisu.
- NEDOKLÁDÁ vlastnictví, skutečné majitele ani to, od kdy kdo co ovládal.
- Je to jeden REST dotaz, reimplementovaný záměrně: závislost na cizí platformě by porušila invariant forkovatelnosti. Znovu se použila znalost, KTERÝ endpoint a tvar dotazu funguje — ne kód.

