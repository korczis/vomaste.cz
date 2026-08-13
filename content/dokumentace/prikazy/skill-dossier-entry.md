+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/dossier-entry — Přidání záznamu do dossieru"
template = "tooling-command.html"
weight = 113
description = "Přidání záznamu do dossieru: Vedený, validátorem kontrolovaný postup pro přidání zdroje, tvrzení, kauzy, mezery nebo vztahu: nejdřív autorizační brána, pak editace kanonického JSON datasetu a nakonec regenerace content adaptérů a build. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-dossier-entry"
tooling_command = "skill-dossier-entry"
view_model = "generated/tooling-catalog.json"
+++

Vedený, validátorem kontrolovaný postup pro přidání zdroje, tvrzení, kauzy, mezery nebo vztahu: nejdřív autorizační brána, pak editace kanonického JSON datasetu a nakonec regenerace content adaptérů a build. Pro každý typ záznamu má vlastní krokovaný postup i pravidla, podle kterých se volí stav tvrzení.

## Kdy ho spustit {#kdy}

Před přidáním JAKÉHOKOLI záznamu do dossieru — bez výjimky, pro každý jednotlivý záznam.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, editor
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano
- **Před použitím se ověřuje rozsah pokrytí** (autorizační log v `AGENTS.md`).

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Krok 0 je autorizační brána a nemá override: výchozí stav je nepokrývat nikoho. Bez konkrétní datované podsekce v AGENTS.md, která pokrývá přesně tuhle osobu A přesně tohle téma, se zastavuje a ptá se vlastníka. Není to build-time kontrola, je to lidský úsudek, který tooling za nikoho neudělá.
- Cituje se jen zdroj, který jsi sám otevřel — nikdy z výňatku ve vyhledávači.
- Stav tvrzení se volí poctivě, ne optimisticky: dva články jednoho vydavatele nezakládají stav „doloženo dvěma nezávislými“. Povýšení stavu později vyžaduje skutečně nový nezávislý zdroj, nikdy jen přeštítkování.
- Popisuje-li tvrzení procesní výsledek (zastavené řízení, promlčení, nepravomocné rozhodnutí), musí být pokaždé, ne jednou v poznámce, výslovně řečeno, že to NENÍ zjištění o vině ani o pravdě.
- Mezera se formuluje jako neutrální otevřená otázka — co citované zdroje zatím nedokládají — nikdy jako narážka nebo skryté tvrzení.
- Nikdy needituj content/dossiers/** ani content/entities/*.md; jsou to generované adaptéry a ruční editaci blokuje lint.

