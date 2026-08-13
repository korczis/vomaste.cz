+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:run — Spuštění úloh Prismatic — nehotové"
template = "tooling-command.html"
weight = 86
description = "Spuštění úloh Prismatic — nehotové: Stub. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-run"
tooling_command = "prismatic-run"
view_model = "generated/tooling-catalog.json"
+++

Stub. Vypíše odkaz na architektonické rozhodnutí a skončí nenulově. Exekutor úloh neexistuje a Prismatic sám zatím nemá odpovídající exportér, který by šlo volat.

## Kdy ho spustit {#kdy}

Nespouštět. Až bude postavený — plán je ve Fázi 2 mise integrace.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Selhává hlasitě a schválně: podle konstituce se politika, kterou nic nevynucuje, nepočítá za implementovanou, takže příkaz nesmí projít jako tiše úspěšný krok skriptu ani CI úlohy.

