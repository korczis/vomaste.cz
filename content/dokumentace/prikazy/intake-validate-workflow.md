+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:validate-workflow — Bezpečnostní kontrola intake workflow"
template = "tooling-command.html"
weight = 6
description = "Bezpečnostní kontrola intake workflow: Statický bezpečnostní validátor .github/workflows/dossier-intake.yml. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-validate-workflow"
tooling_command = "intake-validate-workflow"
view_model = "generated/tooling-catalog.json"
+++

Statický bezpečnostní validátor .github/workflows/dossier-intake.yml. Parsuje skutečný YAML, nikdy jen grep — na to varuje sama mise, ze které pravidla pocházejí.

## Kdy ho spustit {#kdy}

Po editaci intake workflow. Do `npm test` je zapojený přes vlastní test soubor.

## Co shodí běh {#vynucuje}

- Porušení kterékoli bezpečnostní invarianty, které intake workflow musí splňovat (oddělení oprávnění, tvar kroků).

