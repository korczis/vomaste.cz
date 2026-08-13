+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow work-a-coop-task — Práce na co-op úkolu"
template = "tooling-command.html"
weight = 167
description = "Práce na co-op úkolu: Cesta pro souběžnou práci víc instancí: kontrola stavu sběrnice a kolizí, vlastní worktree a větev, doplnění prerekvizit v novém worktree, ohlášení překryvu PŘED začátkem, zelený build a merge-request. Claude workflow, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-work-a-coop-task"
tooling_command = "workflow-work-a-coop-task"
view_model = "generated/tooling-catalog.json"
+++

Cesta pro souběžnou práci víc instancí: kontrola stavu sběrnice a kolizí, vlastní worktree a větev, doplnění prerekvizit v novém worktree, ohlášení překryvu PŘED začátkem, zelený build a merge-request. Merge a push dělá ORCH.

## Kdy ho spustit {#kdy}

Když v repozitáři běží souběžná práce a máš konkrétní úkol T-### z boardu.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** orchestrátor, vývojář, editor, údržbář
- **Riziko:** údržbář
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- docs/coop/TASKS.md edituje jen ORCH. Single-writer pravidlo je stejné jako u dat.
- Nový worktree nemá node_modules ani vygenerované vstupy; bez nich spadne pre-commit dřív, než se stihne podivit.
- Konflikt v generovaném souboru není chyba, je to důsledek souběžnosti. Recept je v protokolu, ne v hlavě.

