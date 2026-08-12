+++
title = "A207 — Veřejné registry"
description = "Které evidence na co odpovídají, jaké pasti v nich jsou a proč se identita nikdy nespojuje podle jména."
template = "learning-lesson.html"
weight = 1207

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A207"
level = "research"
estimated_minutes = 13
audience = ["research"]
objectives = [
  "Vyberete evidenci podle toho, na co umí odpovědět.",
  "Ověříte identitu jednoznačným identifikátorem, ne shodou jména.",
  "Vynecháte z výpisu údaje, které se nikdy nepřebírají.",
]
prerequisites = ["A206"]
related_kb = ["koncepty/primarni-dokumenty.md", "koncepty/tretiosoby.md", "koncepty/bezpecnostni-hranice.md"]
next = "A208"
+++

Veřejné evidence jsou nejsilnější běžně dostupný doklad. Taky jsou to
místo, kde se dělají nejzávažnější chyby — protože působí objektivně.

## Katalog zdrojů

Než začnete hledat, přečtěte si [katalog zdrojů](@/zdroje/_index.md). Odpovídá na
otázku, kterou si rešerše klade jako první: **který registr vůbec odpoví,
co z jeho odpovědi lze citovat a na jaké pasti se v něm už najelo.**

Ten katalog není teorie. Je to zapsaná zkušenost — třeba že jedna evidence
rozlišuje dva různé významy odpovědi „nenalezeno“, že jiná tiše ignoruje
vlastní stránkování, nebo že vyhledávání vrací nefiltrovaná data na filtr,
který neumí. Každý takový poznatek někdo zaplatil časem; katalog brání
tomu, aby se platil znovu.

Narazíte-li na novou past, patří jako záznam do katalogu — ne do commit
zprávy, kde ji najde jen ten, kdo ví, že ji má hledat.

## Identita se ověřuje, nehádá

{% <callout kind="pravidlo" title="Shoda jména není důkaz totožnosti"> %}
Jmenovců jsou v každé evidenci desítky. Spojit záznam s osobou jen podle
jména znamená připsat člověku firmu, funkci nebo dluh, se kterými nemá nic
společného.

Identita se ověřuje **jednoznačným identifikátorem** — číslem subjektu,
listinou, nebo jinak nezpochybnitelně. Když jednoznačné ověření není, je
to **mezera**, nikdy domněnka. A identifikátor se nikdy nedoplňuje odhadem.
{% </callout> %}

## Co se z výpisu nikdy nepřebírá

Registry obsahují víc, než se smí publikovat:

- **datum narození**,
- **adresu bydliště**,
- **rodné číslo** a podobné identifikátory,
- údaje o dalších osobách, které s tématem nesouvisejí.

To, že jsou v čitelném veřejném výpisu, není důvod je zveřejnit. Publikuje
se **minimum, které tvrzení dokládá**.

## Zápis v registru není obvinění

Že je někdo jednatelem firmy, která dostala veřejnou zakázku, je evidenční
fakt. Není to podezření a nesmí se tak podat — ani formulací, ani
zařazením mezi problematické položky.

Stejně tak platí, že vazba sama o sobě nezakládá vliv, koordinaci ani
odpovědnost. Společná adresa, společný zaměstnavatel nebo účast na téže
akci nejsou zjištění o jednání.

{% <kontrola otazka="Chcete doložit, že firma dostala veřejné peníze. Najdete ji v registru smluv jako smluvní stranu u tří smluv. Jaké tvrzení z toho můžete napsat?"> %}
Přesně tohle a nic víc: *„V registru smluv jsou k [datum pořízení]
evidovány tři smlouvy, jejichž smluvní stranou je firma X, s celkovou
smluvní hodnotou Y.“*

Čtyři věci, které se z toho **nedají** odvodit:

1. **Že peníze byly proplaceny.** Smluvní hodnota není plnění.
2. **Že jsou to všechny smlouvy.** Registr má výjimky a subjekt může
   figurovat pod jiným identifikátorem.
3. **Že jde o všechny veřejné peníze.** Dotace, granty a zakázky pod
   limitem jsou jinde.
4. **Že je na tom cokoli špatně.** Firma dodávající státu je normální stav.

Odtud vzniká mezera: *„Zdroje neuvádějí, jaké částky byly podle smluv
skutečně proplaceny.“*
{% </kontrola> %}
