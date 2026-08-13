+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/guide — Rozcestník podle záměru"
template = "tooling-command.html"
weight = 144
description = "Rozcestník podle záměru: Zjistí, co chce člověk udělat, a doporučí jednu schopnost — ne seznam čtyřiceti příkazů. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-guide"
tooling_command = "skill-guide"
view_model = "generated/tooling-catalog.json"
+++

Zjistí, co chce člověk udělat, a doporučí jednu schopnost — ne seznam čtyřiceti příkazů. Nabídku čte z generovaného katalogu (data/generated/tooling-catalog.json), takže nemůže zastarat při přidání skillu. U každého doporučení uvádí úroveň rizika, co schopnost udělá, co je logický další krok, a přirozenou formulaci téhož, aby uživatel nemusel memorovat názvy.

## Kdy ho spustit {#kdy}

Když uživatel neví, jak začít, nebo když je cíl jasný, ale postup ne. Volitelný argument je popis záměru vlastními slovy.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář, orchestrátor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Jmenuje se `guide`, a ne `help`, protože `/help` je vestavěný příkaz Claude Code a projektový skill toho jména by v interaktivní session nešlo spustit. Dokumentovat schopnost, která se nedá vyvolat, zakazuje .claude/rules/claude-tooling.md.
- Seznam schopností v SKILL.md záměrně NENÍ — zastaral by při prvním přidání skillu. Skill čte katalog.
- Pro začátečníka je výchozí doporučení vždy READ-ONLY. Zápis se nabízí, až když je jasné, že o něj jde.
- Nerozhoduje o rozsahu pokrytí ani o publikaci. Když uživatel chce dossier na soukromou osobu, odpověď je test veřejného zájmu, ne obcházení.

