+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/pr — Otevření pull requestu"
template = "tooling-command.html"
weight = 142
description = "Otevření pull requestu: Ověří větev a čistou bránu, sestaví popis PR, ze kterého recenzent pozná, co posuzuje a jak to ověřit — rozsah po kategoriích, doložení spuštěných validací, dotčené záznamy, vztah k rozsahu pokrytí, na co se zaměřit a co autor vědomě neudělal. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-pr"
tooling_command = "skill-pr"
view_model = "generated/tooling-catalog.json"
+++

Ověří větev a čistou bránu, sestaví popis PR, ze kterého recenzent pozná, co posuzuje a jak to ověřit — rozsah po kategoriích, doložení spuštěných validací, dotčené záznamy, vztah k rozsahu pokrytí, na co se zaměřit a co autor vědomě neudělal. Otevře PR. Nikdy nemerguje.

## Kdy ho spustit {#kdy}

Když je práce hotová a /quality vrátilo READY. Ne na master v hlavním checkoutu — tam commit rovnou nasazuje.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, editor, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- disable-model-invocation: true. Otevření PR je vnější akce a Claude ji nesmí udělat mimoděk.
- Bez zeleného npm run build PR nevzniká. PR s červenou bránou plýtvá cizím časem.
- Oddíly „na co se zaměřit“ a „co jsem neudělal“ zrychlují review nejvíc: první je poctivější než tvrdit, že je všechno v pořádku, druhý brání tomu, aby se vynechání objevilo až po mergi.

