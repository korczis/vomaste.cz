+++
title = "C105 — Nejdřív plán, potom zápis"
description = "Nejužitečnější návyk při práci s Claude Code, a proč funguje i pro toho, kdo kódu nerozumí."
template = "learning-lesson.html"
weight = 1805

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C105"
level = "claude-code"
estimated_minutes = 6
audience = ["zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Použijete formulaci, která si vyžádá plán bez provedení.",
  "Poznáte, co má dobrý plán obsahovat.",
  "Vysvětlíte, proč je plán užitečný i bez znalosti kódu.",
]
related_kb = ["koncepty/co-je-dossier.md"]
next = "C106"
+++

Jeden návyk stojí za víc než všechny ostatní dohromady: **než se něco
změní, nechte si říct, co se změní.**

## Jak si vyžádat plán

{% <prikaz kind="prompt"> %}
Prozkoumej ten problém, ale zatím nic neupravuj. Vrať mi: co jsi zjistil, kterých souborů se to dotkne, co je rizikové a jak to půjde ověřit.
{% </prikaz> %}

Tahle formulace funguje vždycky a nepotřebujete k ní znát jediný název
schopnosti.

## Co má plán obsahovat

Dobrý plán odpoví na čtyři věci:

1. **Co se zjistilo** — jaká je vlastně příčina, ne jen projev.
2. **Čeho se to dotkne** — konkrétní soubory, ne „datovou vrstvu".
3. **Co je rizikové** — kde se to může pokazit a co by to způsobilo.
4. **Jak se to ověří** — příkaz, který má na konci projít.

Když některá část chybí, je to samo o sobě informace: nejasnost v plánu
se nezmenší tím, že se začne psát.

{% <callout kind="varovani" title="Pozor na plán, který zní hladce"> %}
Plán, ve kterém není ani jedno riziko a nic se v něm „netýká", bývá
plán, který se na věc nepodíval. Zeptejte se na to, co v něm chybí:
„čeho ses nedotkl a proč?"
{% </callout> %}

## Proč to funguje i bez znalosti kódu

Plán je psaný česky a odpovídá na otázky, které umíte posoudit i bez
technického vzdělání:

- Odpovídá rozsah tomu, co jsem chtěl? (Chtěl jsem opravit překlep,
  a dotkne se to dvaceti souborů?)
- Je mezi dotčenými soubory něco, co mě překvapuje?
- Dává navržené ověření smysl?

Tři otázky, tři odpovědi. To je celé.

## Potom teprve provedení

{% <prikaz kind="prompt"> %}
Dobře, proveď ten plán. Nic navíc.
{% </prikaz> %}

Věta „nic navíc" není nedůvěra — je to způsob, jak se vyhnout tomu, že
se cestou opraví i tři další věci, které jste neviděli.

{% <kontrola otazka="Požádáte o opravu jednoho překlepu a plán uvádí osmnáct dotčených souborů. Co to znamená?"> %}
Nejspíš jedno ze dvou. Buď je ten překlep v **kanonických datech**
a osmnáct souborů jsou **generované důsledky** — pak je to v pořádku
a plán to má říct výslovně. Nebo se do opravy přibalilo něco dalšího —
a pak je správná reakce zeptat se, co konkrétně, a nechat to na jindy.
Rozdíl mezi těmi dvěma se pozná z toho, jestli jsou ty soubory
generované.
{% </kontrola> %}
