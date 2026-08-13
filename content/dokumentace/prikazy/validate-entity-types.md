+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:entity-types — Kontrola typů entit"
template = "tooling-command.html"
weight = 16
description = "Kontrola typů entit: Ověřuje kanonické záznamy entit proti slovníku data/entity-types.toml, a to oběma směry.. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-entity-types"
tooling_command = "validate-entity-types"
view_model = "generated/tooling-catalog.json"
+++

Ověřuje kanonické záznamy entit proti slovníku data/entity-types.toml, a to oběma směry.

## Kdy ho spustit {#kdy}

V build pipeline; po zavedení nového typu entity.

## Co shodí běh {#vynucuje}

- Typ entity použitý v datech, který ve slovníku nemá záznam — jinak by skupina v registru entit nesla syrovou hodnotu místo názvu.
- Záznam ve slovníku, který v datech nikdo nepoužívá (mrtvý překlad).

## Co je potřeba vědět {#pozor}

- Slovník je jen popiskovač; zdrojem pravdy o existujících typech zůstávají kanonické záznamy entit.

