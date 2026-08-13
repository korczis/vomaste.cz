+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/prismatic-drift-audit — Audit driftu Prismatic"
template = "tooling-command.html"
weight = 130
description = "Audit driftu Prismatic: Má porovnávat nainstalovaný commit Prismatic, dostupné schopnosti, schémata kontraktu a fixtures proti poslednímu přijatému integračnímu baseline. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-prismatic-drift-audit"
tooling_command = "skill-prismatic-drift-audit"
view_model = "generated/tooling-catalog.json"
+++

Má porovnávat nainstalovaný commit Prismatic, dostupné schopnosti, schémata kontraktu a fixtures proti poslednímu přijatému integračnímu baseline. DNES NENÍ POSTAVENÁ.

## Kdy ho spustit {#kdy}

Nespouštět. Dokud neprojde touhle pipeline aspoň jedna promoce, neexistuje baseline, proti kterému by šlo drift měřit.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Odpovídající příkaz je stub, který vypíše odkaz na architektonické rozhodnutí a skončí nenulově.
- Chování se nesmí simulovat: kdo se na tuhle skill zeptá dnes, má dostat odpověď, že baseline ani detektor driftu neexistují.

