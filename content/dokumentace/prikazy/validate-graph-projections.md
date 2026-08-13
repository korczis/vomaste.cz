+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:graph-projections — Brána grafového kontraktu"
template = "tooling-command.html"
weight = 65
description = "Brána grafového kontraktu: Vlastní mezisouborovou SÉMANTIKU grafových projekcí, kterou nelze vyjádřit schématem: referenční integritu, paritu manifestu se soubory, integritu hashů a pokrytí registrové vrstvy.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-graph-projections"
tooling_command = "validate-graph-projections"
view_model = "generated/tooling-catalog.json"
+++

Vlastní mezisouborovou SÉMANTIKU grafových projekcí, kterou nelze vyjádřit schématem: referenční integritu, paritu manifestu se soubory, integritu hashů a pokrytí registrové vrstvy.

## Kdy ho spustit {#kdy}

Hned po build:graph-projections, před zola build.

## Co shodí běh {#vynucuje}

- Payload, který v manifestu chybí, nebo záznam manifestu bez souboru.
- Nesouhlasící hash payloadu.
- Referenční nekonzistence uvnitř projekcí a nepokrytí registrové vrstvy.

