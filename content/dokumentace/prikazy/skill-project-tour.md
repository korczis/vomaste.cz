+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/project-tour — Prohlídka projektu"
template = "tooling-command.html"
weight = 149
description = "Prohlídka projektu: Vysvětlí, jak repozitář funguje, čtením skutečného stromu — kanonická data, čtyři vrstvy validace, generování adaptérů, šablony nad view modely, postavený web a brána nad ním, a nad tím vším autorizační rozsah a devět publikačních bran. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-project-tour"
tooling_command = "skill-project-tour"
view_model = "generated/tooling-catalog.json"
+++

Vysvětlí, jak repozitář funguje, čtením skutečného stromu — kanonická data, čtyři vrstvy validace, generování adaptérů, šablony nad view modely, postavený web a brána nad ním, a nad tím vším autorizační rozsah a devět publikačních bran. Každé číslo a název v odpovědi musí pocházet z běhu nebo ze souboru, ne z paměti. Volitelný argument zaostří na jednu vrstvu: data, redakce, frontend, validace, claude.

## Kdy ho spustit {#kdy}

Když je někdo v repozitáři poprvé, zná jednu vrstvu a potřebuje sousední, nebo se chystá na změnu a potřebuje vědět, čeho se dotkne.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Když se realita rozchází s tím, co prohlídka čeká, vyhrává realita a je to nález, ne chyba prohlídky.
- Nenahrazuje přečtení AGENTS.md. Prohlídka ukazuje strukturu; závazná pravidla se musí přečíst, ne shrnout.
- Typický správný výstup na otázku „kde je seznam dossierů“ je, že žádný neexistuje a nemá — registrací je adresář s dossier.json.

