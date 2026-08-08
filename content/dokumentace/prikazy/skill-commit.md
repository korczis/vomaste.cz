+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "skill commit — Dobře utvořený commit"
template = "tooling-command.html"
weight = 106
description = "Dobře utvořený commit: Vede k commitu, který odpovídá zvyklostem repozitáře: konvenční zpráva, správná brána pro danou situaci (rychlá pre-commit podmnožina versus plný build před mergem nebo pushem) a odpovídající hlášení na co-op sběrnici podle role.. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-commit"
tooling_command = "skill-commit"
view_model = "generated/tooling-catalog.json"
+++

Vede k commitu, který odpovídá zvyklostem repozitáře: konvenční zpráva, správná brána pro danou situaci (rychlá pre-commit podmnožina versus plný build před mergem nebo pushem) a odpovídající hlášení na co-op sběrnici podle role.

## Kdy ho spustit {#kdy}

Před každým commitem, pokud si nejsi jistý, co se v téhle situaci od commitu čeká.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Na větvi master se hned po commitu spouští post-commit hook: fetch → rebase → PLNÝ build → push (tedy deploy) → zpráva na sběrnici. Commit na masteru proto NENÍ bezpečný, vratný krok — během několika sekund se typicky nasadí.
- Hook se čistě přeruší při konfliktu rebase i při červeném buildu; rozbitý stav nikdy nepushne.
- V pracovním worktree je post-commit hook no-op (spouští se jen na masteru), takže tam platí ruční postup: plný build před předáním k revizi.
- U obsahové změny žije editace v kanonickém JSON; před commitem se pouští datový řetěz a regenerované adaptéry patří do TÉHOŽ commitu, jinak paritní brána drift stejně najde.
- `--no-verify` je skutečná úniková cesta, ne zakázaná — ale nikdy tiše. A pre-commit sice přeskočí, post-commit ne.

