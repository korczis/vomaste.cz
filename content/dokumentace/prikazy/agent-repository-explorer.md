+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "agent repository-explorer — Průzkumník repozitáře"
template = "tooling-command.html"
weight = 152
description = "Průzkumník repozitáře: Prohledá repozitář a vrátí odpověď s dokladem, ne výpis souborů. Claude subagent, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/agent-repository-explorer"
tooling_command = "agent-repository-explorer"
view_model = "generated/tooling-catalog.json"
+++

Prohledá repozitář a vrátí odpověď s dokladem, ne výpis souborů. Existuje proto, že hledání tady znamená projít desítky souborů a z každého použít pár řádků — v hlavním kontextu by se tím utopil zbytek konverzace. Začíná od skutečnosti (package.json, pipeline, hlavičky skriptů, schémata), ne od dokumentace.

## Kdy ho spustit {#kdy}

Na otázky „kde se to validuje“, „kolik je čeho“, „čeho se dotkne změna Y“, „existuje už něco, co dělá Z“. Ne na jeden známý soubor — ten je rychlejší přečíst.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** čtenář, rešeršista, vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nástroje: Read, Grep, Glob. Žádný Write ani Edit — průzkum a změna jsou dva různé úkony.
- Netvrdí, co soubor dělá, aniž by ho otevřel. Nulový nález je odpověď, ne důvod k odhadu pravděpodobného umístění.
- Rozpor mezi dokumentací a implementací je NÁLEZ a patří do odpovědi.

