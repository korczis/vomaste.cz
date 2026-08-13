+++
title = "A306 — Oddělení názoru"
description = "Komentář je doložitelný jako komentář. Jak ho zaznamenat, aniž by se z hodnocení stalo zjištění — a proč nestačí ho jen označit."
template = "learning-lesson.html"
weight = 1306

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A306"
level = "editorial"
estimated_minutes = 9
audience = ["editor", "research"]
objectives = [
  "Zaznamenáte cizí hodnocení jako cizí, včetně autora.",
  "Poznáte, kdy se názor vplížil do faktického tvrzení.",
  "Vysvětlíte, proč strukturální oddělení nestačí nahradit štítkem.",
]
prerequisites = ["A305"]
related_kb = ["koncepty/stav-nazor.md", "koncepty/fakt-oddelene-od-nazoru.md"]
next = "A307"
+++

Komentář je doložitelný — jako komentář. Doložené je, že **autor napsal
Y**, ne že **Y platí**.

## Jak se názor vplíží do faktu

**Přejatým přívlastkem.** Komentátor napíše „bezprecedentní postup“, vy to
použijete jako popis. Hodnocení tím změnilo majitele.

**Nepřiřazeným shrnutím.** „Postup byl kritizován jako netransparentní“ —
kým? Trpný rod ukrývá, že kritik je jeden a je to komentátor.

**Uspořádáním.** Tři doložená fakta seřazená tak, aby z nich plynul závěr,
který nikdo netvrdí. Formálně bez hodnocení, fakticky argument.

{% <callout kind="pravidlo" title="Štítek nestačí"> %}
Označit položku jako názor je nutné, ne dostatečné. Když se hodnocení z
komentáře objeví i v souhrnu nebo v textu jiného tvrzení, štítek na
původní položce nic neopraví.

Oddělení je **strukturální**: názory jsou vlastní záznamy a nevlévají se
do faktických tvrzení.
{% </callout> %}

## Jak to zapsat

Špatně: *„Postup byl podle odborníků problematický.“*

Lépe: *„[Autor] v komentáři pro [médium] označil postup za problematický.“*
Stav **názor**.

Rozdíl: druhá verze je ověřitelná (buď to napsal, nebo ne) a čtenář ví,
čí je to hodnocení. „Podle odborníků“ není ověřitelné, protože není
vymezené.

{% <kontrola otazka="Chcete použít analýzu, ve které autor na základě veřejných dat spočítal, že objem zakázek vzrostl o 300 %. Je to fakt, nebo názor?"> %}
Obojí, a musí se to rozdělit.

**Výpočet je fakt** — ověřitelný, pokud autor uvedl data a metodu. Použije
se jako tvrzení s tím zdrojem: *„Podle [autor, médium, datum] vzrostl
objem zakázek v období X o 300 %.“* Stav podle síly dokladu, a v ideálním
případě si ho ověříte z primárních dat sami.

**Interpretace je názor** — že to je „známka klientelismu“ nebo „přirozený
důsledek investičního cyklu“ jsou dva výklady téhož čísla. Cituje se
s atribucí a stavem názor.

Nejčastější chyba je vzít z takové analýzy obojí najednou: číslo jako fakt
a jeho výklad jako kontext. Čtenář si pak odnese, že „vzrostlo to o 300 %,
což ukazuje na…“ — a druhá půlka věty nemá stejnou váhu jako první.
{% </kontrola> %}
