+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run check:workflow-parity — Parita CI s lokálním buildem"
template = "tooling-command.html"
weight = 4
description = "Parita CI s lokálním buildem: Hlídá, že deploy workflow volá `npm run build`, a ne že si znovu vypisuje jednotlivé kroky pipeline.. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/check-workflow-parity"
tooling_command = "check-workflow-parity"
view_model = "generated/tooling-catalog.json"
+++

Hlídá, že deploy workflow volá `npm run build`, a ne že si znovu vypisuje jednotlivé kroky pipeline.

## Kdy ho spustit {#kdy}

Po každé editaci .github/workflows/deploy.yml.

## Co shodí běh {#vynucuje}

- Workflow, který přestal volat `npm run build`.
- Workflow, který začal znovu vyjmenovávat kroky pipeline jednotlivě.

## Co je potřeba vědět {#pozor}

- Vznikl z reálné škody: workflow si kroky vypisoval ručně, nové kroky se do něj nedostaly a produkce týdny neměla JSON-LD exporty, které lokální build vyráběl.
- Záměrně NEporovnává seznamy kroků. Vyjmenovávání JE ta chyba; pravidlo zní „nevyjmenovávej“ a kontroluje se přesně to.

