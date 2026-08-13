+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:tooling-catalog — Obousměrná brána katalogu toolingu"
template = "tooling-command.html"
weight = 76
description = "Obousměrná brána katalogu toolingu: Týž generátor s přepínačem --check: nic nezapíše, jen skončí nenulově, pokud katalog neodpovídá repozitáři nebo pokud by se commitnutý výstup lišil od toho, co z dat vzniká.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-tooling-catalog"
tooling_command = "verify-tooling-catalog"
view_model = "generated/tooling-catalog.json"
+++

Týž generátor s přepínačem --check: nic nezapíše, jen skončí nenulově, pokud katalog neodpovídá repozitáři nebo pokud by se commitnutý výstup lišil od toho, co z dat vzniká.

## Kdy ho spustit {#kdy}

Před commitem a v buildu, kde běží PŘED generátorem — kdyby běžela za ním, porovnávala by výstup se sebou samým a nikdy by neselhala.

## Co shodí běh {#vynucuje}

- G1 — npm skript v package.json (mimo npm lifecycle hooky) bez záznamu v data/tooling/, a záznam ukazující na skript, který v package.json není.
- G2 — adresář .claude/skills/<name>/ se souborem SKILL.md bez záznamu, a záznam ukazující na skill, který neexistuje.
- G3 — recept v justfile bez záznamu, a záznam ukazující na recept, který v justfile není.
- G4 — identifier záznamu, který neodpovídá dvojici kind+name (slug ukazující na jiný příkaz, než jaký popisuje).
- G5 — deklarovaný sourceFile, který neexistuje, nebo který příkazová řádka npm skriptu vůbec nevolá.
- G6 — npm skript, který spouští soubor repozitáře jako svůj program, ale záznam sourceFile neuvádí.
- G7 — rozdíl mezi commitnutými stránkami / docs/TOOLING.md a tím, co by z dat vzniklo. Náprava: `npm run build:tooling-catalog`.

## Co je potřeba vědět {#pozor}

- Gitignorovaný view model data/generated/tooling-catalog.json se do porovnání nezapočítává: v čerstvém klonu neexistuje a brána by hlásila zastaralost u souboru, který v repozitáři z principu nikdy neleží.
- Nový příkaz bez dokumentace shodí build. To je smysl brány — dokumentace toolingu nesmí zaostat za kódem.

