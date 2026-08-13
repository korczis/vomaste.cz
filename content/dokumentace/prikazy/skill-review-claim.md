+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/review-claim — Review tvrzení"
template = "tooling-command.html"
weight = 117
description = "Review tvrzení: Projde jedno tvrzení dvanácti kontrolami proti jeho zdrojům a redakčním pravidlům: atomicita, neutralita, doloženost, stav versus nezávislost zdrojů, zdrojová rodina, procesní rámování u TÉHLE zmínky, doslovnost citací, data, třetí osoby, osobní údaje, obousměrné vazby a parita s ručně psanou tabulkou. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-review-claim"
tooling_command = "skill-review-claim"
view_model = "generated/tooling-catalog.json"
+++

Projde jedno tvrzení dvanácti kontrolami proti jeho zdrojům a redakčním pravidlům: atomicita, neutralita, doloženost, stav versus nezávislost zdrojů, zdrojová rodina, procesní rámování u TÉHLE zmínky, doslovnost citací, data, třetí osoby, osobní údaje, obousměrné vazby a parita s ručně psanou tabulkou. Vrací nálezy s prioritou a vyjmenuje i to, co je v pořádku.

## Kdy ho spustit {#kdy}

Před zápisem nového tvrzení nebo hned po něm, po přidání zdroje k existujícímu tvrzení, a při periodické revizi.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Stav popisuje sílu doložení, ne pravdu. Tvrzení může být pravdivé a přesto 1 ZDROJ.
- Když tvrzení říká víc, než zdroje unesou, správná oprava je zúžit text, ne přidat výhradu. „Podle dostupných informací se zdá“ je nedoložené tvrzení v převleku.
- BLOCKER je vyhrazený pro čtyři věci: nedoložené tvrzení o člověku, chybějící procesní rámování, jmenovanou třetí osobu a osobní údaje.
- Procesní rámování se nejčastěji poruší až u DRUHÉ zmínky téhož faktu.

