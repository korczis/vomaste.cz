+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:probe — Drift kontrola proti auditu schopností"
template = "tooling-command.html"
weight = 73
description = "Drift kontrola proti auditu schopností: Kontroluje, jestli konkrétní soubory, které audit schopností skutečně otevřel, jsou pořád tam, kde je našel — jen existence souborů, žádná síť, žádné volání Mixu ani Elixiru.. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-probe"
tooling_command = "prismatic-probe"
view_model = "generated/tooling-catalog.json"
+++

Kontroluje, jestli konkrétní soubory, které audit schopností skutečně otevřel, jsou pořád tam, kde je našel — jen existence souborů, žádná síť, žádné volání Mixu ani Elixiru.

## Kdy ho spustit {#kdy}

Když chceš levně zjistit, jestli se od auditu něco nepohnulo. `-- --json` pro strojový výstup.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Chybějící soubor nutně neznamená „Prismatic se rozbil“ — může znamenat, že audit zastaral a potřebuje čerstvé přečtení. Tak či tak se to nahlásí; nikdy se mlčky nepředpokládá, že schopnost pořád vypadá, jak ji audit popsal.
- Není to znovuspuštění auditu, jen levná kontrola driftu.

