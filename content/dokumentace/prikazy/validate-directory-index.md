+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:directory-index — Kontrola prezentačního indexu adresáře"
template = "tooling-command.html"
weight = 64
description = "Kontrola prezentačního indexu adresáře: Ověřuje, že index adresáře nese vše, co adresář potřebuje, že jeho počty pocházejí z kanonických dat a že routy registrů se čtou z navigačního manifestu místo skládání z řetězců.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-directory-index"
tooling_command = "validate-directory-index"
view_model = "generated/tooling-catalog.json"
+++

Ověřuje, že index adresáře nese vše, co adresář potřebuje, že jeho počty pocházejí z kanonických dat a že routy registrů se čtou z navigačního manifestu místo skládání z řetězců.

## Kdy ho spustit {#kdy}

Až po generátorech, ne v `npm test`: potřebuje static/data/dossiers.json a data/generated/navigation.json, které v čerstvém checkoutu před generátory neexistují. Přesně tenhle rozdíl mezi vývojářským a CI prostředím už dvakrát shodil CI.

## Co shodí běh {#vynucuje}

- Prázdné pole navíc v indexu (index tvrdí víc, než má obsah).
- Počet, který se neshoduje s compiled kanonickým modelem — tedy ručně dopsané číslo.
- Routa registru, která se neshoduje s navigačním manifestem.

