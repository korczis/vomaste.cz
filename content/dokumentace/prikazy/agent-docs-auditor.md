+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "agent docs-auditor — Auditor dokumentace"
template = "tooling-command.html"
weight = 149
description = "Auditor dokumentace: Porovná, co dokumentace tvrdí, s tím, co repozitář dělá — příkazy proti package.json, brány proti kódu validátorů, pole proti schématům, kroky buildu proti pipeline, definice proti kanonickým konceptům a odkazy proti existenci cílů. Claude subagent, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/agent-docs-auditor"
tooling_command = "agent-docs-auditor"
view_model = "generated/tooling-catalog.json"
+++

Porovná, co dokumentace tvrdí, s tím, co repozitář dělá — příkazy proti package.json, brány proti kódu validátorů, pole proti schématům, kroky buildu proti pipeline, definice proti kanonickým konceptům a odkazy proti existenci cílů. U každého driftu rozhoduje směr opravy: zaostal text, nebo je špatně implementace?

## Kdy ho spustit {#kdy}

Po větší změně a periodicky. Zvlášť užitečný na napočítané konstanty v próze, které nikdo nepřepočítává.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, údržbář, recenzent
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nástroje: Read, Grep, Glob. Žádný Write ani Edit.
- NEPŘEPISUJE HISTORII. ADR, implementační reporty a append-only autorizační log popisují stav v době vzniku; zastaralost tam není drift a správná oprava je doplnit odkaz na aktuální stav.
- Popsaná schopnost, která neexistuje, je vážnější než zaostalý popis existující — text slibuje něco, co nejde udělat.
- Rozlišuje zaostalý text od nesprávného: první se aktualizuje, druhý opravuje.

