+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "agent claim-reviewer — Recenzent tvrzení"
template = "tooling-command.html"
weight = 150
description = "Recenzent tvrzení: Projde zadaná tvrzení dvanácti kontrolami proti jejich zdrojům a vrátí nálezy s prioritou, sloučené podle typu, plus výčet toho, co je v pořádku. Claude subagent, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/agent-claim-reviewer"
tooling_command = "agent-claim-reviewer"
view_model = "generated/tooling-catalog.json"
+++

Projde zadaná tvrzení dvanácti kontrolami proti jejich zdrojům a vrátí nálezy s prioritou, sloučené podle typu, plus výčet toho, co je v pořádku. Má přednačtený skill review-claim. Existuje proto, že review jednoho tvrzení znamená přečíst jeho záznam, každý citovaný zdroj, řádek v tabulce a navázané mezery — u deseti tvrzení padesát souborů.

## Kdy ho spustit {#kdy}

Když je tvrzení víc než dvě, nebo mají hodně zdrojů.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nástroje: Read, Grep, Glob. Přednačtený skill: review-claim. Žádný Write ani Edit.
- Neposuzuje pravdu. Stav popisuje sílu doložení — tvrzení může být pravdivé a přesto 1 ZDROJ.
- Nepovyšuje stav bez skutečně nového nezávislého hlasu.
- Když tvrzení říká víc, než zdroje unesou, navrhuje zúžení textu, ne přidání výhrady.

