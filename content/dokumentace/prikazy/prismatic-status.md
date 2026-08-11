+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:status — Stav integrace s Prismatic"
template = "tooling-command.html"
weight = 83
description = "Stav integrace s Prismatic: Reportuje, jestli je lokální checkout prismatic-platform dohledatelný a použitelný jako upstream poskytovatel schopností. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-status"
tooling_command = "prismatic-status"
view_model = "generated/tooling-catalog.json"
+++

Reportuje, jestli je lokální checkout prismatic-platform dohledatelný a použitelný jako upstream poskytovatel schopností. Cestu řeší env → .prismatic-local.toml → verzovaný výchozí stav a ověřuje, že jde o skutečný Git repozitář.

## Kdy ho spustit {#kdy}

Před čímkoli, co se opírá o Prismatic. `-- --json` vypíše strojově čitelný výstup.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nikdy neselže jen proto, že Prismatic chybí — to je normální, podporovaný stav a veřejný build na něm nezávisí. Exit je i v tom případě 0: report není kontrola.

