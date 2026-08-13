+++
title = "10 — Claude Code: přečíst změnu"
description = "Nechte si vysvětlit diff bez znalosti Gitu a najděte v něm rozdíl mezi rozhodnutím a důsledkem."
template = "learning-lesson.html"
weight = 200

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B10"
estimated_minutes = 12
audience = ["zdroje", "research", "editor", "vyvojar"]
prerequisites = ["B09"]
objectives = [
  "Necháte si vysvětlit změny v repozitáři bez znalosti Gitu.",
  "Odlišíte funkční změnu od generovaného důsledku.",
  "Najdete v seznamu změn soubor, který tam nepatří.",
]
related_kb = ["koncepty/verzovano-v-gitu.md"]
next = "B11"
+++

Recenzovat změnu neznamená umět číst kód. Znamená to umět se zeptat.

## Krok 1 — vyrobte si změnu

Bezpečně: v repozitáři je vzorová stránka nebo dokumentace, kde překlep
nikomu neublíží. Změňte jedno slovo — **v ručně psaném souboru**, ne
v generovaném.

{% <callout kind="varovani" title="Nesahejte na dossier"> %}
Cvičení se nedělá na skutečném obsahu o lidech. Tvrzení, zdroje a mezery
nejsou hřiště; jejich změna má redakční důsledky, i když jde jen o čárku.
{% </callout> %}

## Krok 2 — nechte si to vysvětlit

{% <prikaz kind="prompt"> %}
Vysvětli mi aktuální změny jako netechnickému recenzentovi. Rozliš funkční změnu, obsah, generované soubory, dokumentaci a rizika. A řekni mi, jak si to mám ověřit.
{% </prikaz> %}

## Krok 3 — najděte pět kategorií

Dobrý výklad rozdělí změny na: **funkční**, **obsah a data**,
**generované**, **dokumentaci**, **testy a brány**. Zkontrolujte, že
tam ty kategorie jsou — a hlavně že generované soubory jsou označené
jako **důsledek**, ne jako rozhodnutí.

{% <cviceni zadani="Výklad ukazuje 44 změněných souborů: 2 datové a 42 generovaných. Kolik rozhodnutí to je?"> %}
Dvě. Těch 42 vzniklo spuštěním generátoru z těch dvou — nikdo je
nenapsal a nikdo je neposuzuje jednotlivě.

Kdyby to bylo naopak (generovaný soubor změněný **bez** změny dat),
je to nález: buď se editovalo na špatném místě, nebo se změnil
generátor. Obojí stojí za otázku.
{% </cviceni> %}

## Krok 4 — hledejte, co tam nepatří

{% <prikaz kind="prompt"> %}
Je v těch změnách něco, co tam nepatří?
{% </prikaz> %}

Do repozitáře nepatří lokální konfigurace, hesla, dočasné výstupy ani
osobní poznámky. Tohle je jediná otázka z celé lekce, která má
bezpečnostní dopad: **Git nezapomíná.** Co se jednou commitne, zůstane
v historii i po smazání.

## Krok 5 — vraťte to zpátky

Cvičnou změnu zahoďte. Vrácení nesledované změny je běžná operace
a Claude ji umí popsat — ale ať to udělá kdokoli, mělo by být předem
jasné, **co přesně** se zahazuje.

{% <kontrola otazka="Výklad říká „změny jsou bezpečné“. Co si ověříte?"> %}
Jak se to pozná. „Bezpečné" je závěr, ne důkaz — zeptejte se na
konkrétní příkaz, po kterém má být vidět, že je všechno v pořádku.
Vysvětlení bez způsobu ověření je žádost o důvěru, a ta se v tomhle
projektu nedává ani nástroji.
{% </kontrola> %}
