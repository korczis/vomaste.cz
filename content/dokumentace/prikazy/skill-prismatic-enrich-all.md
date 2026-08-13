+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/prismatic-enrich-all — Hromadné obohacení přes Prismatic"
template = "tooling-command.html"
weight = 126
description = "Hromadné obohacení přes Prismatic: Postaví deterministický plán úloh napříč kanonickými entitami a dossiery, spustí jen použitelné schopnosti, naimportuje očištěné kandidáty do stagingu a vygeneruje report k posouzení. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-prismatic-enrich-all"
tooling_command = "skill-prismatic-enrich-all"
view_model = "generated/tooling-catalog.json"
+++

Postaví deterministický plán úloh napříč kanonickými entitami a dossiery, spustí jen použitelné schopnosti, naimportuje očištěné kandidáty do stagingu a vygeneruje report k posouzení. Do kanonického obsahu nezapisuje nikdy.

## Kdy ho spustit {#kdy}

Až poté, co příprava integrace potvrdí, že jsou oba repozitáře připravené.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, údržbář
- **Riziko:** bezpečný zápis
- **Zapisuje do souborů:** ano
- **Před použitím se ověřuje rozsah pokrytí** (autorizační log v `AGENTS.md`).

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Reálná je dnes jen fáze plánu, a i ta záměrně jen pro JEDINOU schopnost, kterou audit ověřil jako bezpečnou k plánování: dohledání firmy v ARES pro entity typu company/organization bez IČO.
- Spuštění, import a report k posouzení jsou pořád stuby — neexistuje exekutor úloh, rozřešení identit, zapisovač do stagingu ani generátor reportu.
- Plán nic nespouští; je read-only nad vlastními daty vomaste. Počty úloh a zdůvodnění jednotlivých položek se reportují poctivě, ne domýšlejí.

