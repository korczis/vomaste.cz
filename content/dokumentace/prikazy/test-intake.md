+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:intake — Testy intake pipeline"
template = "tooling-command.html"
weight = 57
description = "Testy intake pipeline: node:test nad scripts/intake/*.test.mjs a podadresáři matching, risk, preflight, adapters a github.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-intake"
tooling_command = "test-intake"
view_model = "generated/tooling-catalog.json"
+++

node:test nad scripts/intake/*.test.mjs a podadresáři matching, risk, preflight, adapters a github.

## Kdy ho spustit {#kdy}

Při práci na intake; celá sada je podmnožinou toho, co pokrývá `npm test`.

## Co shodí běh {#vynucuje}

- Padlý test kdekoli v intake pipeline.

