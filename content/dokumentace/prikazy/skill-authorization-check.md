+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/authorization-check — Kontrola rozsahu pokrytí"
template = "tooling-command.html"
weight = 106
description = "Kontrola rozsahu pokrytí: Zjistí, jestli konkrétní osoba nebo téma spadá do rozsahu, který repozitář smí pokrývat — čtením append-only logu v AGENTS.md, ne odhadem. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-authorization-check"
tooling_command = "skill-authorization-check"
view_model = "generated/tooling-catalog.json"
+++

Zjistí, jestli konkrétní osoba nebo téma spadá do rozsahu, který repozitář smí pokrývat — čtením append-only logu v AGENTS.md, ne odhadem. Rozlišuje čtyři stavy: autorizován, kontextová entita, neautorizován a ZAMÍTNUT (posouzeno a rozhodnuto proti). Vypisuje povinné rámování, které musí být u každé zmínky tématu, a co je výslovně mimo rozsah.

## Kdy ho spustit {#kdy}

Před prvním tvrzením o konkrétním člověku, před založením dossieru, a kdykoli někdo navrhne téma, které v dossieru ještě není.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne
- **Před použitím se ověřuje rozsah pokrytí** (autorizační log v `AGENTS.md`).

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Autorizaci NEUDĚLUJE a nesmí. Kanonický zapisovatel je scripts/dossier/authorize-entity.mjs a jedná na základě rozhodnutí vlastníka, ne analýzy.
- Rozsahový model se dvakrát měnil a starší záznamy se nepřepisují. Tematické limity starších záznamů dnes nebrání rozšíření, ale jejich zamítnutí a povinná rámování platí beze změny.
- Stav ZAMÍTNUT je něco jiného než NEAUTORIZOVÁN: první znamená, že se to už posuzovalo a rozhodlo proti.
- Rozsah a doloženost jsou dvě různé brány. Autorizované téma bez otevřeného zdroje se nepíše.

