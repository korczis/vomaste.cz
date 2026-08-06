+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:enrich-all — Hromadné obohacení — nehotové"
template = "tooling-command.html"
weight = 70
description = "Hromadné obohacení — nehotové: Stub. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-enrich-all"
tooling_command = "prismatic-enrich-all"
view_model = "generated/tooling-catalog.json"
+++

Stub. Vypíše odkaz na architektonické rozhodnutí a skončí nenulově.

## Kdy ho spustit {#kdy}

Nespouštět. Reálnou částí téhle vrstvy je dnes jen prismatic:plan.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Stejný fail-loud stub jako ostatní nehotové prismatic příkazy.

