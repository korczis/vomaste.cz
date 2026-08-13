+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:claude-tooling — Integrita Claude toolingu"
template = "tooling-command.html"
weight = 12
description = "Integrita Claude toolingu: Kontroluje, že všechno, na co CLAUDE.md, pravidla v .claude/rules/ a jednotlivé schopnosti odkazují, v repozitáři skutečně existuje: cesty v backticích, markdownové odkazy, npm příkazy a odkazy na jiné skilly. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-claude-tooling"
tooling_command = "validate-claude-tooling"
view_model = "generated/tooling-catalog.json"
+++

Kontroluje, že všechno, na co CLAUDE.md, pravidla v .claude/rules/ a jednotlivé schopnosti odkazují, v repozitáři skutečně existuje: cesty v backticích, markdownové odkazy, npm příkazy a odkazy na jiné skilly. Navíc vyžaduje, aby každý skill řekl, kdy se NEMÁ použít, a aby se jméno schopnosti neopakovalo napříč vrstvami. Zkrácený odkaz („macros/ui.html") se dohledává jako koncovka skutečné cesty, aby brána nenutila psát prózu plnými cestami; zástupné symboly (<slug>, clm-NN) a gitové reference se přeskakují.

## Kdy ho spustit {#kdy}

Po každé změně CLAUDE.md, .claude/rules/**, .claude/skills/**, .claude/agents/** nebo .claude/workflows/** — a po přejmenování či zrušení jakéhokoli skriptu, na který se z těch textů odkazuje.

## Co shodí běh {#vynucuje}

- CT1 — pravidlo v .claude/rules/ má parsovatelný frontmatter a neprázdné položky v paths
- CT2 — cesta uvedená v backticích v CLAUDE.md, pravidle nebo schopnosti existuje
- CT3 — markdownový odkaz vede na existující soubor
- CT4 — zmíněný `npm run <x>` je v package.json
- CT5 — odkaz na skill vede na existující .claude/skills/<jméno>/SKILL.md
- CT6 — skill uvádí, kdy se NEMÁ použít
- CT7 — jméno se neopakuje mezi skillem, agentem a workflow

## Co je potřeba vědět {#pozor}

- Kontroluje odkazy, ne pravdivost vět. Jestli je pravidlo obsahově správné, ze stromu odvodit nejde — na to je review, a brána to nesmí předstírat.
- Doplňuje katalog toolingu, nenahrazuje ho: katalog hlídá, že každá schopnost má záznam, tenhle validátor hlídá, že cíle odkazů existují.
- Soubory, které jsou záměrně gitignorované a lokální (.prismatic-local.toml, CLAUDE.local.md, .claude/settings.local.json), jsou vyjmenované jako výjimka. Odvozovat výjimku z .gitignore by znamenalo, že cokoli ignorovaného přestane být hlídané.

