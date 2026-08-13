+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:index — Index pro párování entit"
template = "tooling-command.html"
weight = 37
description = "Index pro párování entit: Odvozuje jeden plochý, deterministicky seřazený seznam ze dvou kanonických zdrojů — entitních dossierů a sdílených registrových entit — a do žádného z nich nic nezapisuje.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-index"
tooling_command = "intake-index"
view_model = "generated/tooling-catalog.json"
+++

Odvozuje jeden plochý, deterministicky seřazený seznam ze dvou kanonických zdrojů — entitních dossierů a sdílených registrových entit — a do žádného z nich nic nezapisuje.

## Kdy ho spustit {#kdy}

Před párováním entit v intake pipeline nebo při jeho ladění.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Jen pole relevantní pro párování: žádný text tvrzení, žádné tělo zdroje, žádný narativní obsah.

