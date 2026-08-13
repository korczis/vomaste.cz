+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/review-gap — Review mezery"
template = "tooling-command.html"
weight = 115
description = "Review mezery: Sedmi kontrolami posoudí, jestli je zapsaná mezera skutečně otevřenou otázkou, a ne skrytou spekulací. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-review-gap"
tooling_command = "skill-review-gap"
view_model = "generated/tooling-catalog.json"
+++

Sedmi kontrolami posoudí, jestli je zapsaná mezera skutečně otevřenou otázkou, a ne skrytou spekulací. Rozhodující je test čtenáře, který o věci nic neví: co si odnese, kdyby mezeru nikdo nikdy nedoplnil. Dobrá mezera po sobě nechá prázdné místo, ne stín — a řekne, co konkrétně chybí ve zdrojích, místo aby naznačila, co si má čtenář domyslet.

## Kdy ho spustit {#kdy}

Před zápisem nové mezery, při revizi dossieru, a když někdo namítne, že formulace mezery něco naznačuje.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Mezera je nejcitlivější typ záznamu: na tvrzení je vidět, že je tvrzení, ale mezera vypadá jako poctivé přiznání neznalosti — a proto se do ní dá schovat obvinění, které by jako tvrzení neprošlo.
- Skill nerozhoduje, jestli má mezera vzniknout. Vzniknout má vždy, když zdroje na otázku neodpovídají; kontroluje se, JAK je napsaná.
- U nálezu BLOCKER je návrh nového znění povinný. U mezery, která zavádí téma bez jediného zdroje, je správný návrh žádný — má zaniknout.

