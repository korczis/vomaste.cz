+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/explain — Vysvětlení jedné věci"
template = "tooling-command.html"
weight = 139
description = "Vysvětlení jedné věci: Vysvětlí jeden konkrétní záznam, soubor, pojem nebo chybovou hlášku — ve výchozím nastavení netechnicky, bez předpokladu znalosti Gitu, JSONu a struktury repozitáře. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-explain"
tooling_command = "skill-explain"
view_model = "generated/tooling-catalog.json"
+++

Vysvětlí jeden konkrétní záznam, soubor, pojem nebo chybovou hlášku — ve výchozím nastavení netechnicky, bez předpokladu znalosti Gitu, JSONu a struktury repozitáře. Kanonické definice pojmů neopisuje: vlastní je content/koncepty a vysvětlení je aplikuje na položenou otázku.

## Kdy ho spustit {#kdy}

Když někdo narazí na pojem, záznam nebo hlášku a nerozumí jí. Na celý projekt je /project-tour.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Odborný termín smí zaznít, když se hned vysvětlí. Termín bez vysvětlení je pro tazatele jen další neznámé slovo.
- Pět míst s pěti definicemi téhož pojmu je přesně ten drift, kterému datový model brání jinde.
- Na otázku typu „co je špatně na tom člověku“ odpovídá, že web nehodnotí lidi, eviduje doložená tvrzení.

