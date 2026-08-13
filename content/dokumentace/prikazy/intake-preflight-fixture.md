+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:preflight-fixture — Smoke běh s preflightem přes mock DNS"
template = "tooling-command.html"
weight = 45
description = "Smoke běh s preflightem přes mock DNS: Týž fixture jako intake:fixture, ale s `--preflight` přes MOCK DNS transport — nikdy skutečná síť. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-preflight-fixture"
tooling_command = "intake-preflight-fixture"
view_model = "generated/tooling-catalog.json"
+++

Týž fixture jako intake:fixture, ale s `--preflight` přes MOCK DNS transport — nikdy skutečná síť. URL zdroje se přes injektovaný mock rozřeší na privátní adresu, takže se uplatní SSRF politika a zablokuje ji.

## Kdy ho spustit {#kdy}

Když měníš preflight, a chceš ověřit, že celá cesta doopravdy běží a plní neprázdnou sekci source_preflight.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Produkční kód nemá žádnou zadní vrátka pro privátní cíl — a přesně proto se ta cesta dá ověřit jen takhle, mockem na úrovni transportu.

