+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/academy-lesson — Lekce vzdělávací vrstvy"
template = "tooling-command.html"
weight = 134
description = "Lekce vzdělávací vrstvy: Vytvoří nebo aktualizuje lekci Akademie či úkol Bootcampu podle skutečného schématu vzdělávací vrstvy: frontmatter s lesson_id, úrovní, audience a ověřitelnými cíli, odkazy na kanonické koncepty místo vlastních definic, cvičení na syntetických datech a zapojení do řetězu next a prerekvizit.. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-academy-lesson"
tooling_command = "skill-academy-lesson"
view_model = "generated/tooling-catalog.json"
+++

Vytvoří nebo aktualizuje lekci Akademie či úkol Bootcampu podle skutečného schématu vzdělávací vrstvy: frontmatter s lesson_id, úrovní, audience a ověřitelnými cíli, odkazy na kanonické koncepty místo vlastních definic, cvičení na syntetických datech a zapojení do řetězu next a prerekvizit.

## Kdy ho spustit {#kdy}

Když má vzniknout nová lekce, nebo když se změnilo něco, co některá lekce popisuje. Zastaralá technická lekce je horší než žádná.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** editor, vývojář, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Kanonické znění pojmu vlastní content/koncepty. Lekce pojem APLIKUJE, nikdy ho nedefinuje podruhé — druhá definice slova „sporné“ je drift, ne didaktika.
- Cvičná data jsou fiktivní, označená synthetic a v rezervovaném jmenném prostoru. Kontrola L13 shodí build, když se cvičný identifikátor objeví v reálných datech.
- Výuka nesmí být zadními vrátky k rozšíření rozsahu: nacvičovat klasifikaci obvinění na skutečném člověku by znamenalo psát o něm nedoložená tvrzení.
- Nová lekce musí zapadnout do řetězu. Osiřelá lekce shodí validate:learning.

