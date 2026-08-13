+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:review — Report k posouzení — nehotové"
template = "tooling-command.html"
weight = 83
description = "Report k posouzení — nehotové: Stub. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-review"
tooling_command = "prismatic-review"
view_model = "generated/tooling-catalog.json"
+++

Stub. Vypíše odkaz na architektonické rozhodnutí a skončí nenulově. Generátor reportu k posouzení neexistuje.

## Kdy ho spustit {#kdy}

Nespouštět.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Soubor se jmenuje review-report.mjs a hlásí se jako `prismatic:review-report`, zatímco npm skript se jmenuje `prismatic:review` — drobný nesoulad pojmenování, ne dvě různé věci.

