+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "agent ui-reviewer — Recenzent UI vrstvy"
template = "tooling-command.html"
weight = 151
description = "Recenzent UI vrstvy: Projde šablony proti konvencím webu: povinné znovupoužití komponent, jednotná tabulka, čtení view modelu místo hardcodovaných slugů, doktrína F1–F7, prázdné stavy a jediná povolená cesta k zobrazení média. Claude subagent, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/agent-ui-reviewer"
tooling_command = "agent-ui-reviewer"
view_model = "generated/tooling-catalog.json"
+++

Projde šablony proti konvencím webu: povinné znovupoužití komponent, jednotná tabulka, čtení view modelu místo hardcodovaných slugů, doktrína F1–F7, prázdné stavy a jediná povolená cesta k zobrazení média. Explicitně odděluje, co ověřil staticky, od toho, co by vyžadovalo zobrazení v prohlížeči.

## Kdy ho spustit {#kdy}

Když se změnilo víc šablon najednou nebo vzniká nová.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nástroje: Read, Grep, Glob. Přednačtený skill: ui-review. Žádný Write ani Edit.
- Hardcodovaný slug dossieru v šabloně je BLOCKER: který dossier existuje, rozhoduje adresář s dossier.json.
- Brána lint:component-reuse vynucuje vlastní konvenci webu, NE shodu s flowbite.com/docs/getting-started/llm/ — ta stránka žádné strojově kontrolovatelné pravidlo neobsahuje.
- Řádek NEOVĚŘENO je povinný. Bez prohlížeče nepozná pořadí focusu, kontrast ani chování odečítače.

