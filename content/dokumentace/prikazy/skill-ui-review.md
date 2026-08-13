+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/ui-review — Review UI vrstvy"
template = "tooling-command.html"
weight = 120
description = "Review UI vrstvy: Zkontroluje změnu v šablonách proti konvencím tohohle webu: povinné znovupoužití macros/ui.html a jednotné tabulkové komponenty, čtení view modelu místo hardcodovaných dat a slugů, doktrínu F1–F7, prázdné a mezní stavy, responzivitu na čtyřech šířkách a jedinou povolenou cestu k zobrazení média.. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-ui-review"
tooling_command = "skill-ui-review"
view_model = "generated/tooling-catalog.json"
+++

Zkontroluje změnu v šablonách proti konvencím tohohle webu: povinné znovupoužití macros/ui.html a jednotné tabulkové komponenty, čtení view modelu místo hardcodovaných dat a slugů, doktrínu F1–F7, prázdné a mezní stavy, responzivitu na čtyřech šířkách a jedinou povolenou cestu k zobrazení média.

## Kdy ho spustit {#kdy}

Po změně v templates/, assets/ nebo static/css/, a při vzniku nové šablony.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Brána lint:component-reuse vynucuje vlastní konvenci tohohle webu, NE shodu s flowbite.com/docs/getting-started/llm/ — ta stránka žádné strojově kontrolovatelné pravidlo neobsahuje. Popisovat ji jako „Flowbite compliance“ by bylo tvrzení o vynucení, které neexistuje.
- Prohlížečová automatizace není povinná a build na ní nestojí. Bez ní se dělá statická kontrola a explicitně se řekne, co ověřeno nebylo.
- Tvrdit, že něco vypadá dobře, bez zobrazení, je přesně ten druh nepodloženého tvrzení, kterému repozitář brání jinde.

