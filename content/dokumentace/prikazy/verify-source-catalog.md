+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:source-catalog — Aktuálnost katalogu zdrojů"
template = "tooling-command.html"
weight = 75
description = "Aktuálnost katalogu zdrojů: Týž generátor s přepínačem --check: nic nezapíše, jen skončí nenulově, pokud by zápis něco změnil.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-source-catalog"
tooling_command = "verify-source-catalog"
view_model = "generated/tooling-catalog.json"
+++

Týž generátor s přepínačem --check: nic nezapíše, jen skončí nenulově, pokud by zápis něco změnil.

## Kdy ho spustit {#kdy}

Před commitem. V build pipeline by kontrola smysl neměla — běžela by hned po generátoru a nikdy by neselhala; smysl má jen před commitem, kde chytí nepřegenerovaný výstup.

## Co shodí běh {#vynucuje}

- Rozdíl mezi vygenerovaným katalogem a tím, co leží v repozitáři — tedy zastaralé stránky /zdroje/ nebo docs/osint/SOURCE_CATALOG.md. Náprava: `npm run build:source-catalog`.

