+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/find-source — Hledání kandidátních zdrojů"
template = "tooling-command.html"
weight = 114
description = "Hledání kandidátních zdrojů: Hledá kandidáty ke konkrétní otázce v pořadí primární registr → jmenované zpravodajství → agregátor jako rozcestník, a přísně odděluje čtyři stavy: kandidát, otevřený, ověřený, citovatelný. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-find-source"
tooling_command = "skill-find-source"
view_model = "generated/tooling-catalog.json"
+++

Hledá kandidáty ke konkrétní otázce v pořadí primární registr → jmenované zpravodajství → agregátor jako rozcestník, a přísně odděluje čtyři stavy: kandidát, otevřený, ověřený, citovatelný. Dodává výhradně první stupeň. Nulový nález hlásí jako výsledek a kandidáta na mezeru, ne jako neúspěch.

## Kdy ho spustit {#kdy}

Když je otázka už zúžená a potřebuje doklad. U faktů, na které odpoví primární registr přímo, se ve zpravodajství nehledá.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, přispěvatel zdrojem, rešeršista
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Výstup NESMÍ být citován u tvrzení. Zaměnit kandidáta za citovatelný zdroj je jeden z mála způsobů, jak tenhle projekt může vyrobit vymyšlenou citaci.
- Vydavatel podle domény a datum podle výsledku vyhledávání se běžně liší od toho, co je na stránce.
- Negativní odpověď registru znamená „v den dotazu tam nic nebylo“, nikdy „nikdy to neexistovalo“.
- Hledat doklad pro předem hotový závěr skill odmítá a zadání otočí na hledání evidenčních faktů.

