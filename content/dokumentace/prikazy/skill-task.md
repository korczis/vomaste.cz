+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/task — Rozklad zadání"
template = "tooling-command.html"
weight = 150
description = "Rozklad zadání: Rozloží konkrétní zadání na personu, typ změny, úroveň rizika, vztah k rozsahu pokrytí, dotčené podsystémy, příkazy, které budou muset projít, a jeden vstupní bod. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-task"
tooling_command = "skill-task"
view_model = "generated/tooling-catalog.json"
+++

Rozloží konkrétní zadání na personu, typ změny, úroveň rizika, vztah k rozsahu pokrytí, dotčené podsystémy, příkazy, které budou muset projít, a jeden vstupní bod. Cílem je odhalit práci, která zní jako jedna vrstva a je ve třech — typicky nové pole v záznamu nebo oprava mířící do generovaného content/ místo do kanonických dat. Sám nic nemění.

## Kdy ho spustit {#kdy}

Před první editací u zadání, kde není jasné, čeho se dotkne. U triviální jednoznačné změny je to obřad navíc.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Router a plánovač, ne prováděč. Výstupem je doporučený vstupní bod, ne hotová změna.
- Nejcennější nález je oprava mířící do content/ místo do data/ — sync uvnitř buildu ji tiše přepíše a build zůstane zelený.
- U zadání typu „napiš, že je zapletený do kauzy“ musí rozklad skončit odmítnutím postupu, ne návrhem: „podle mě“ není zdroj a mezera je poctivější než hedge věta.

