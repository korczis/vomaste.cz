+++
title = "A606 — Validační pipeline"
description = "Jeden vstupní bod, tři režimy, kroky jako data. Co běží kdy a proč je pořadí kroků samo o sobě pravidlo."
template = "learning-lesson.html"
weight = 1606

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A606"
level = "engineering"
estimated_minutes = 11
audience = ["vyvojar", "maintainer"]
objectives = [
  "Vyberete správný režim pipeline podle toho, co potřebujete.",
  "Vysvětlíte, proč jsou kroky data a ne kód.",
  "Zdůvodníte, proč některé kontroly běží až po sestavení.",
]
prerequisites = ["A605"]
related_kb = ["koncepty/prubezne-overovani.md", "koncepty/strojove-citelna-data.md"]
next = "A607"
+++

Celý build má **jeden vstupní bod** a tři režimy:

| Režim | K čemu | Co vynechává |
|---|---|---|
| `npm run build` | kanonická brána | nic |
| `npm run dev` | vývojová smyčka | testy, linty, kontroly po sestavení |
| `npm run check` | rychlé ověření | negeneruje a nesestavuje |

Kroky jsou **seznam v datech**, ne poskládaný kód. Přidat kontrolu znamená
dopsat řádek do seznamu — a protože je ten seznam čitelný, jde na první
pohled zjistit, co se doopravdy pouští. Samostatná kontrola navíc hlídá,
aby se definice v repozitáři nerozešla s tím, co spouští CI.

## Tři fáze

**Před sestavením** — validace kanonických dat, generátory, autorizace,
navigace, linty, katalogy, exporty. Tady spadne většina chyb.

**Sestavení** — generátor webu vyrobí `public/`.

**Po sestavení** — kontroly, které jdou udělat jen nad hotovým HTML:
odkazy a kotvy, strukturovaná data, metadata, úplnost stránek tvrzení a
zdrojů, responzivita tabulek, integrita exportů.

{% <callout kind="pravidlo" title="Pořadí je samo o sobě pravidlo"> %}
Některé kontroly musí být **po** sestavení, protože kontrolují výsledek,
ne záměr. Ručně napsaná kotva v textu se dá ověřit až proti vydanému HTML;
v šabloně o ní nikdo neví.

Jiné musí být **před** ním, aby se nesestavovalo z rozbitých dat. A jedna
dvojice má pořadí, které se vyplatí znát: synchronizace obsahu běží před
kontrolou parity, takže ruční úprava generované stránky se přepíše místo
ohlášení. Kontrola parity spuštěná samostatně to naopak ohlásí.
{% </callout> %}

## Zámek

Režim brány drží zámek po celou dobu běhu, aby se dvě souběžná sestavení
nervala o generované soubory. Vývojový režim se nezamyká — server běží
hodiny a zámek by blokoval všechno ostatní.

{% <kontrola otazka="Přidáváte novou kontrolu. Kam do pořadí ji zařadit a co ještě musíte doplnit?"> %}
Zařazení se řídí tím, **co kontroluje**:

- kanonická data → před generátory, hned k ostatním validacím,
- generovaný výstup → hned za generátor, který ho vyrábí,
- vydané HTML → do fáze po sestavení.

A pak jsou tři věci, na které se zapomíná:

1. **Vlastní npm skript**, aby šla kontrola spustit i samostatně. Bez toho
   se ladí jen přes celý build.
2. **Záznam v katalogu příkazů.** Nový příkaz bez záznamu build shodí —
   proto dokumentace příkazů nemůže zaostat.
3. **Rozhodnutí, jestli patří i do `check`**, tedy do rychlého režimu bez
   sestavení. Pokud nepotřebuje generované soubory, nejspíš ano.

A ověřte, že kontrola **selže**, když má selhat. Kontrola, která nikdy
nespadla, obvykle nic nekontroluje.
{% </kontrola> %}
