+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/research-question — Zúžení rešeršní otázky"
template = "tooling-command.html"
weight = 130
description = "Zúžení rešeršní otázky: Rozseká široké zadání („prověř firmu X“) na konkrétní doložitelné podotázky a ke každé přiřadí registr nebo typ zdroje, který na ni vůbec může odpovědět — včetně toho, co ten zdroj nedokáže a na jakou past se v něm už najelo. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-research-question"
tooling_command = "skill-research-question"
view_model = "generated/tooling-catalog.json"
+++

Rozseká široké zadání („prověř firmu X“) na konkrétní doložitelné podotázky a ke každé přiřadí registr nebo typ zdroje, který na ni vůbec může odpovědět — včetně toho, co ten zdroj nedokáže a na jakou past se v něm už najelo. Podotázky bez zdroje označí jako očekávané mezery, ne jako úkol.

## Kdy ho spustit {#kdy}

Než se otevře deset záložek. Když zadání zní „prověř“, „zjisti“, „co je s“, nebo když rešerše nemá jasný cíl.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, editor, přispěvatel zdrojem
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Zúžení otázky NIKDY nesmí vyrobit téma, které rozsah pokrytí nedovoluje. Rešerše smí být širší než publikace, ne než rozsah.
- Bez jednoznačně ověřené identity se nedá začít. Jmenovec je nejčastější a nejtišší chyba celé rešerše.
- Podotázka, jejíž odpovědí je dojem („jak moc problematické“), není podotázka.
- Agregátor je rozcestník, ne cíl. Tvrzení opřené jen o agregátor zůstává 1 ZDROJ.

