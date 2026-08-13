+++
title = "A108 — Práce s nejistotou"
description = "Nejistota se nezaokrouhluje. Jak ji udržet viditelnou v textu, ve stavu i v registru mezer — a proč je tlak na závěr hlavní riziko."
template = "learning-lesson.html"
weight = 1108

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A108"
level = "foundations"
estimated_minutes = 10
audience = ["ctenar", "research", "editor"]
objectives = [
  "Rozeznáte čtyři různé druhy nejistoty a nebudete je slévat.",
  "Napíšete větu, která nejistotu nese, místo aby ji schovala.",
  "Odoláte tlaku na závěr tam, kde zdroje závěr nedovolují.",
]
prerequisites = ["A107"]
related_kb = ["koncepty/registr-mezer.md", "koncepty/stav-sporne.md", "koncepty/procesni-vysledek.md"]
next_route = "@/akademie/a201-atomicky-claim.md"
next_label = "A201 — Atomické tvrzení (úroveň Rešerše)"
+++

Nejčastější tichá manipulace v podobných textech není lež. Je to
**zaokrouhlení nejistoty** — převedení čtyř různých stavů poznání na jeden
generický „fakt“.

## Čtyři různé nejistoty

| Situace | Co s tím |
|---|---|
| Zdroje si odporují | stav **sporné**, obě verze s atribucí |
| Zdroj mlčí | **mezera** |
| Věc je procesně otevřená | tvrzení o procesním stavu, s datem |
| Věc byla procesně uzavřená bez věcného závěru | **procesní výsledek**, výslovně odlišený |

Ty čtyři se nesmějí slít. „Nevíme, protože si zdroje odporují“ a „nevíme,
protože o tom nikdo nepsal“ jsou pro čtenáře úplně jiné informace.

## Tlak na závěr

Text bez závěru působí nedodělaně. Autor cítí, že má odvést práci, a
odvede ji — slovem „pravděpodobně“, „podle všeho“, „vše nasvědčuje“.

{% <callout kind="varovani" title="Hedging není opatrnost"> %}
„Zřejmě“ nezmenšuje tvrzení, jen z něj snímá odpovědnost. Čtenář si
odnese obsah a zapomene modalitu. Buď je tvrzení doložené a napíše se bez
příslovce, nebo doložené není a patří do mezer.
{% </callout> %}

## Nejistota se dá napsat tak, že je užitečná

Špatně: *„Není zcela jasné, jak byla zakázka zadána.“*

Lépe: *„Zadávací dokumentace nebyla ve veřejném registru k 3. 5. 2026
nalezena; ministerstvo na dotaz redakce podle citovaného článku
neodpovědělo.“*

Druhá verze říká přesně, co se hledalo, kde, kdy a s jakým výsledkem.
Je to zároveň zadání pro dalšího člověka — a to první není.

{% <kontrola otazka="Máte doloženo, že věc byla odložena pro promlčení. Novinář se ptá, jestli to znamená, že se to nestalo. Co odpovíte a jak to napíšete do dossieru?"> %}
Odpověď: **neznamená to ani jedno.** Promlčení říká, že uplynula doba, po
kterou bylo možné stíhat. O tom, jestli se skutek stal, neříká nic — soud
o tom nerozhodoval.

Do dossieru patří obojí v jedné větě, při **každé** zmínce, ne jednou
v poznámce pod čarou: co se procesně stalo a že to není zjištění o skutku.
A jestliže obviněný obvinění popírá, popření se cituje jeho slovy —
ani zjemněně, ani zesíleně.

Důvod, proč se to opakuje pokaždé: čtenáři chodí na jednotlivé stránky
z vyhledávače. Kdo přijde rovnou na tvrzení, poznámku o pět obrazovek výš
nikdy neuvidí.
{% </kontrola> %}
