+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run authorization:anchor — Ukotvení záznamu autorizačního logu"
template = "tooling-command.html"
weight = 91
description = "Ukotvení záznamu autorizačního logu: Jediná cesta, jak se záznam z autorizačního logu v AGENTS.md dostane do hash-kotvy. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/authorization-anchor"
tooling_command = "authorization-anchor"
view_model = "generated/tooling-catalog.json"
+++

Jediná cesta, jak se záznam z autorizačního logu v AGENTS.md dostane do hash-kotvy. Nový záznam vyžaduje potvrzení „ANCHOR“; změna nebo zmizení už ukotveného záznamu je porušení append-only pravidla a vyžaduje silnější potvrzení „OVERRIDE-APPEND-ONLY“.

## Kdy ho spustit {#kdy}

Hned po authorize:entity — dokud nový záznam není ukotvený, verify:authorization-log build fail-closed zastaví.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Běžně interaktivní. Čistě nový záznam smí agent ukotvit neinteraktivně po výslovném rozhodnutí vlastníka v aktuální konverzaci; existující záznam tímhle režimem změnit nelze nikdy.

