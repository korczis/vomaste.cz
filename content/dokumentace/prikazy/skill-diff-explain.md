+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/diff-explain — Vysvětlení změn"
template = "tooling-command.html"
weight = 138
description = "Vysvětlení změn: Převede aktuální diff na srozumitelné shrnutí pro netechnického recenzenta: rozdělí změny na funkční, obsahové, generované, dokumentační a testové, řekne, které generované soubory jsou důsledkem které změny dat, vyjmenuje rizika a nečekané soubory a přidá konkrétní způsob ověření.. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-diff-explain"
tooling_command = "skill-diff-explain"
view_model = "generated/tooling-catalog.json"
+++

Převede aktuální diff na srozumitelné shrnutí pro netechnického recenzenta: rozdělí změny na funkční, obsahové, generované, dokumentační a testové, řekne, které generované soubory jsou důsledkem které změny dat, vyjmenuje rizika a nečekané soubory a přidá konkrétní způsob ověření.

## Kdy ho spustit {#kdy}

Před review, před odesláním příspěvku, nebo po delší práci, kdy se ztratil přehled.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** přispěvatel zdrojem, editor, vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Rozdělení do kategorií je celý přínos: diff se čtyřiceti soubory vypadá hrozivě, i když je to jedna změna dat.
- Generovaný soubor BEZ odpovídající změny dat je nález, ne šum.
- Řádek JAK OVĚŘIT je povinný. Vysvětlení bez způsobu ověření je žádost o důvěru.
- Nezamlčí soubor proto, že „je to jen generované“.

