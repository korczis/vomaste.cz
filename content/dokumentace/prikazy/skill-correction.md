+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/correction — Řízená oprava obsahu"
template = "tooling-command.html"
weight = 135
description = "Řízená oprava obsahu: Vede opravu publikovaného obsahu od nahlášení přes vlastní ověření, zjištění dosahu a zápis do kanonických dat až po validaci a doložení, co se změnilo a proč. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-correction"
tooling_command = "skill-correction"
view_model = "generated/tooling-catalog.json"
+++

Vede opravu publikovaného obsahu od nahlášení přes vlastní ověření, zjištění dosahu a zápis do kanonických dat až po validaci a doložení, co se změnilo a proč. Nejdřív určí typ opravy, protože faktická oprava, chybějící procesní rámování, mrtvý odkaz a překlep mají velmi různé nároky — a jednoslovná změna faktu není drobnost.

## Kdy ho spustit {#kdy}

Když někdo nahlásí chybu v publikovaném obsahu, když review vrátil nález, když vydavatel opravil svůj článek, nebo když přestal fungovat odkaz.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** přispěvatel zdrojem, editor, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Bez dokladu oprava nezačíná. „Vím to“ není doklad, a smazání nepohodlného faktu není oprava.
- Když hlásící nemá pravdu, je to taky výsledek: odmítnutá oprava s odůvodněním má stejnou hodnotu jako provedená.
- Chyba je málokdy na jednom místě. Dosah zahrnuje ostatní zmínky téhož faktu, tabulku tvrzení, časovou osu, vazby a jiné dossiery se sdílenou entitou.
- Oprava, která tvrzení ZOSTŘUJE, vyžaduje stejnou důkazní laťku jako nové tvrzení — protože to nové tvrzení je.

