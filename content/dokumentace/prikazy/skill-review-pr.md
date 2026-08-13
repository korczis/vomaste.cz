+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/review-pr — Review cizí změny"
template = "tooling-command.html"
weight = 115
description = "Review cizí změny: Posoudí pull request podle toho, čeho se skutečně dotýká — pustí jen relevantní osy (redakční, schéma, UI, přístupnost, skripty, tooling, dokumentace), ověří, co autor tvrdí, a posoudí i rozsah: dělá změna to, co měla, nevynechává něco tiše, a nevzniká tím snadnější cesta k nedoloženému tvrzení nebo úniku dat než předtím.. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-review-pr"
tooling_command = "skill-review-pr"
view_model = "generated/tooling-catalog.json"
+++

Posoudí pull request podle toho, čeho se skutečně dotýká — pustí jen relevantní osy (redakční, schéma, UI, přístupnost, skripty, tooling, dokumentace), ověří, co autor tvrdí, a posoudí i rozsah: dělá změna to, co měla, nevynechává něco tiše, a nevzniká tím snadnější cesta k nedoloženému tvrzení nebo úniku dat než předtím.

## Kdy ho spustit {#kdy}

Když má někdo posoudit změnu, kterou nedělal — před mergem, po obdržení PR.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** recenzent, editor, údržbář, orchestrátor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Třetí otázka o rozsahu je epistemický test celého projektu. Když změna usnadní nedoložené tvrzení, tiché rozšíření rozsahu nebo únik dat, je to BLOCKER bez ohledu na kvalitu kódu.
- Tvrzení „build zelený“ se ověřuje spuštěním. Je to stejný druh tvrzení jako každé jiné v tomhle repozitáři.
- Řádek CO JE DOBŘE není zdvořilost: říká autorovi, co nemá při opravě rozbít.
- Blokující hook bez testu je BLOCKER, ne HIGH — chybným parsováním může zablokovat celý repozitář.

