+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "skill prismatic-promote — Promoce kandidátů do kanonických dat"
template = "tooling-command.html"
weight = 103
description = "Promoce kandidátů do kanonických dat: Má konzumovat výslovný manifest po revizi, ověřit evidenci a provenienci a zapsat kanonické změny přes EXISTUJÍCÍ generátory a datové kontrakty. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-prismatic-promote"
tooling_command = "skill-prismatic-promote"
view_model = "generated/tooling-catalog.json"
+++

Má konzumovat výslovný manifest po revizi, ověřit evidenci a provenienci a zapsat kanonické změny přes EXISTUJÍCÍ generátory a datové kontrakty. DNES NENÍ POSTAVENÁ.

## Kdy ho spustit {#kdy}

Nespouštět. Formát manifestu, zapisovač promoce ani rollback logika neexistují.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Až vznikne, bude to jediný krok Prismatic pipeline, který smí sáhnout na data/dossiers/**.
- Nikdy necommituje, nepushuje ani nenasazuje — to zůstává lidskou akcí, stejně jako u každé jiné změny v tomhle repozitáři.
- Každý promovaný záznam bude muset projít stejnými publikačními branami jako ručně psané tvrzení: chybějící zdroj, kolize identity, chybějící veřejný zájem nebo procesní rámování, které neodpovídá evidenci, znamenají odmítnutí.

