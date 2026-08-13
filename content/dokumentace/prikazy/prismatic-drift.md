+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:drift — Detektor driftu Prismatic — nehotové"
template = "tooling-command.html"
weight = 77
description = "Detektor driftu Prismatic — nehotové: Stub. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-drift"
tooling_command = "prismatic-drift"
view_model = "generated/tooling-catalog.json"
+++

Stub. Vypíše odkaz na architektonické rozhodnutí a skončí nenulově. Není proti čemu drift měřit — dosud nic neprošlo touhle pipeline až do promoce, takže neexistuje přijatý baseline.

## Kdy ho spustit {#kdy}

Nespouštět.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

