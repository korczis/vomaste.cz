+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow change-a-schema — Změna datového kontraktu"
template = "tooling-command.html"
weight = 162
description = "Změna datového kontraktu: Nejrizikovější běžná změna v repozitáři, vedená tak, aby po ní nezůstalo poloviční pole: co dnes platí podle schématu, třináct míst fan-outu s explicitním „netýká se, protože“, migrace u povinného pole, testy a golden snapshot, dopad na dokumentaci, ADR u sporného rozhodnutí a plná brána.. Claude workflow, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-change-a-schema"
tooling_command = "workflow-change-a-schema"
view_model = "generated/tooling-catalog.json"
+++

Nejrizikovější běžná změna v repozitáři, vedená tak, aby po ní nezůstalo poloviční pole: co dnes platí podle schématu, třináct míst fan-outu s explicitním „netýká se, protože“, migrace u povinného pole, testy a golden snapshot, dopad na dokumentaci, ADR u sporného rozhodnutí a plná brána.

## Kdy ho spustit {#kdy}

Při přidání, přejmenování nebo odebrání pole. Nezačíná se bez jasna v tom, kdo pole bude číst.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** údržbář, vývojář
- **Riziko:** údržbář
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nejlevnější pole je to, které nevzniklo. Hloubka v grafu se počítá, ne ukládá — a to je vzor.
- Povinné pole bez migrace shodí build na každém existujícím záznamu. Doplnit ho odhadem je horší než nechat pole volitelné.
- additionalProperties: false je brána, ne překážka. Šablona čtoucí pole, které schéma nezná, znamená postup shora dolů.

