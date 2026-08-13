+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:intake:preflight — Testy preflightu URL"
template = "tooling-command.html"
weight = 58
description = "Testy preflightu URL: node:test nad scripts/intake/preflight/*.test.mjs — mimo jiné chování proti skutečnému lokálnímu mock serveru.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-intake-preflight"
tooling_command = "test-intake-preflight"
view_model = "generated/tooling-catalog.json"
+++

node:test nad scripts/intake/preflight/*.test.mjs — mimo jiné chování proti skutečnému lokálnímu mock serveru.

## Kdy ho spustit {#kdy}

Rychlá smyčka při práci na preflightu.

## Co shodí běh {#vynucuje}

- Padlý test preflightu URL, včetně SSRF politiky.

