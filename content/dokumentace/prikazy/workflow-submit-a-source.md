+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow submit-a-source — Podání zdroje nebo opravy"
template = "tooling-command.html"
weight = 156
description = "Podání zdroje nebo opravy: Cesta přispěvatele, který umí najít a přečíst zdroj, ale nemá znát datový model: ověření zdroje, posouzení nezávislosti, kontrola rozsahu pokrytí a sestavení strukturovaného důkazního balíčku k lidskému posouzení.. Claude workflow, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-submit-a-source"
tooling_command = "workflow-submit-a-source"
view_model = "generated/tooling-catalog.json"
+++

Cesta přispěvatele, který umí najít a přečíst zdroj, ale nemá znát datový model: ověření zdroje, posouzení nezávislosti, kontrola rozsahu pokrytí a sestavení strukturovaného důkazního balíčku k lidskému posouzení.

## Kdy ho spustit {#kdy}

Když má někdo konkrétní zdroj s otevíratelnou URL a chce ho předat. Výsledek vyhledávání nestačí — to je kandidát.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** přispěvatel zdrojem, ověřovatel, rešeršista
- **Riziko:** bezpečný zápis
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Balíček NIC nepublikuje. Mezi ním a webem stojí kontrola rozsahu, redakční posouzení, zápis, build a review diffu — a přispěvatel to musí vědět předem.
- Chybějící údaj se nechá prázdný a označí. Vymyšlené datum je horší než mezera.
- Neveřejný materiál (soukromá konverzace, screenshot) do repozitáře nesmí ani jako podklad.

