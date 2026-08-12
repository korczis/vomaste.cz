+++
title = "A106 — Časová platnost"
description = "Každé tvrzení má čas, ke kterému platí. Jak formulovat, aby text nezestárnul do nepravdy, a proč je negativní zjištění vždy jen snímek dne."
template = "learning-lesson.html"
weight = 1106

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A106"
estimated_minutes = 8
level = "foundations"
audience = ["research", "editor"]
objectives = [
  "Formulujete tvrzení tak, aby neslo svůj čas platnosti.",
  "Rozliší se vám „neexistuje“ od „v den dotazu nebylo nalezeno“.",
  "Poznáte tvrzení, která zestárnou do nepravdy.",
]
prerequisites = ["A105"]
related_kb = ["koncepty/prubezne-overovani.md", "koncepty/procesni-vysledek.md"]
next = "A107"
+++

Statický web se nezaktualizuje sám. Věta, která je dnes pravdivá, může být
za rok nepravdivá, aniž by ji kdokoli změnil — a čtenář to nepozná.

## Tvrzení, která zestárnou do nepravdy

{% <callout kind="protipriklad" title="Skryté „teď“"> %}
- *„Případ je v současnosti vyšetřován.“*
- *„Zastává funkci ministra.“*
- *„Firma dosud nezveřejnila účetní závěrku.“*

Všechny tři obsahují nevyslovené „k dnešnímu dni“ — a to se posouvá,
zatímco text stojí.
{% </callout> %}

{% <callout kind="priklad" title="Čas v textu"> %}
- *„K 12. 3. 2026 policie uvedla, že případ vyšetřuje.“*
- *„Ministrem byl jmenován 15. 12. 2025.“* (událost, ne stav)
- *„Ke dni pořízení výpisu (3. 5. 2026) nebyla ve sbírce listin založena
  účetní závěrka za rok 2024.“*

Věty se nezhorší časem, protože nesou okamžik, ke kterému platí.
{% </callout> %}

Obecné pravidlo: **události stárnou dobře, stavy stárnou špatně.** Kde to
jde, formulujte tvrzení jako událost s datem.

## Negativní zjištění je vždy snímek

„Nenašli jsme“ neznamená „neexistuje“. Znamená to, že v konkrétní den, v
konkrétní evidenci, konkrétním dotazem nebylo nic nalezeno.

Tenhle rozdíl je v repozitáři vynucený i pro úřední evidence: negativní
odpověď soudní desky se zaznamenává jako stav toho dne, nikdy jako důkaz,
že dokument neexistoval.

{% <kontrola otazka="Píšete tvrzení o tom, že proti někomu není vedeno insolvenční řízení, protože jste ho v rejstříku nenašli. Jak to formulovat?"> %}
Nejlépe **vůbec ne** jako tvrzení o osobě.

Fakt, který máte, zní: *„K 3. 5. 2026 nebyl v insolvenčním rejstříku
nalezen záznam odpovídající subjektu X.“* To je snímek jednoho dotazu.

Věta „proti X není vedeno insolvenční řízení“ tvrdí něco o světě, a to
z negativního výsledku hledání neplyne — mohli jste hledat špatným
identifikátorem, řízení mohlo být zahájeno včera, evidence mohla mít
výpadek.

A ještě jedna otázka předtím: je nepřítomnost řízení vůbec zjištění
veřejného zájmu? Publikovat „nic jsme nenašli“ o konkrétním člověku bez
souvislosti s pokrývaným tématem znamená vytvořit dojem, že se u něj něco
hledalo — a to je samo o sobě nepříznivý záznam.
{% </kontrola> %}
