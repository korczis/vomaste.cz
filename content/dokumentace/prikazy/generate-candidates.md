+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run generate:candidates — Přehled kontextových entit k posouzení"
template = "tooling-command.html"
weight = 35
description = "Přehled kontextových entit k posouzení: Generuje přehled každé kontextové entity v systému — tedy entity objevené proto, že ji pojmenoval zdroj nebo tvrzení, ale která nemá vlastní autorizovaný dossier. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/generate-candidates"
tooling_command = "generate-candidates"
view_model = "generated/tooling-catalog.json"
+++

Generuje přehled každé kontextové entity v systému — tedy entity objevené proto, že ji pojmenoval zdroj nebo tvrzení, ale která nemá vlastní autorizovaný dossier. NENÍ to autorizace.

## Kdy ho spustit {#kdy}

V build i dev pipeline; výstup čte vlastník webu, ne návštěvník.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nikdy nezapisuje do AGENTS.md, nikdy nenastavuje autorizovaný status a není to veřejná routa — publikovat „koho bychom mohli prošetřit příště“ by byl přesně ten redakční přesah, kterému pravidla webu brání.
- Uvádí jen fakta už doložená uvnitř současného autorizovaného dossieru; nespekuluje o tom, co by hypotetický budoucí dossier pokrýval.

