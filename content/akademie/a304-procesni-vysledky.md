+++
title = "A304 — Procesní výsledky"
description = "Odloženo není vyvráceno, promlčeno není nevinen, nepravomocné není konečné. Nejdůležitější rozlišení celého redakčního kurikula."
template = "learning-lesson.html"
weight = 1304

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A304"
level = "editorial"
estimated_minutes = 13
audience = ["ctenar", "editor", "research"]
objectives = [
  "Přeložíte procesní výsledek na to, co doopravdy znamená.",
  "Uvedete rozlišení u každé zmínky, ne jednou v poznámce.",
  "Poznáte formulace, které z mezikroku dělají výsledek.",
]
prerequisites = ["A303"]
related_kb = ["koncepty/procesni-vysledek.md", "koncepty/stav-sporne.md"]
next = "A305"
+++

Procesní výsledek říká, **co se stalo s řízením**. Věcné zjištění říká,
**co se stalo se skutkem**. Zaměnit je znamená vydat mlčení systému za
odpověď.

## Překladová tabulka

| Procesní výsledek | Co doopravdy znamená | Co **ne**znamená |
|---|---|---|
| Věc odložena | Orgán nepokračuje | „Skutek se nestal“ |
| Promlčeno | Uplynula doba pro stíhání | „Obvinění bylo vyvráceno“ |
| Stíhání zastaveno | Řízení skončilo před soudem | „Byl zproštěn“ |
| Nepravomocný rozsudek | Soud rozhodl, není konečné | „Je odsouzen / zproštěn“ |
| Zrušený rozsudek | Vrací se k novému projednání | „Rozhodnutí bylo opačné“ |
| Zproštěn obžaloby | Soud rozhodl, že se neprokázalo | Podle důvodu: „nestalo se“, nebo „neprokázalo se“ |
| Nebyl obviněn | Nikdo ho nestíhal | „Prověřen a čistý“ |

Pravý sloupec je to, co si čtenář domyslí, když mu levý sloupec podáte
bez vysvětlení.

{% <callout kind="varovani" title="Formulace, které mezikrok mění ve výsledek"> %}
- *„Případ byl uzavřen“* — procesně možná, věcně nikdy nebyl otevřen.
- *„Soud rozhodl, že…“* u nepravomocného rozhodnutí.
- *„Byl očištěn“* — v právu neexistuje, čte se jako věcné zjištění.
- *„Nic mu nebylo prokázáno“* — pravdivé i tam, kde se nic nezkoumalo.
{% </callout> %}

## Proč u každé zmínky

Protože stránky se čtou jednotlivě. Kdo přijde z vyhledávače rovnou na
konkrétní tvrzení, poznámku o pět obrazovek výš neuvidí — a odnese si
větu bez rámce.

Je to i pravidlo tohoto repozitáře, ne stylistické doporučení: procesní
výsledek se odlišuje od věcného zjištění **při každém uvedení**.

{% <kontrola otazka="Odvolací soud zrušil zprošťující rozsudek a vrátil věc k novému projednání. Jak to napsat, aby si to čtenář nepřečetl jako „takže je vinen“?"> %}
Doslova to, co se stalo, plus výslovně to, co se nestalo:

*„Odvolací soud dne [datum] zrušil zprošťující rozsudek a vrátil věc soudu
prvního stupně k novému projednání. Zrušení není rozhodnutím o vině —
odvolací soud sám o vině nerozhoduje; věc se vrací k novému projednání a
obžalovaný vinu popírá.“*

Tři věci, které tam musí být:

1. **Kdo co udělal a kdy** — přesně, s datem.
2. **Co ten krok není** — a to výslovně, protože samotné „zrušil
   zprošťující rozsudek“ se čte jako obrat ve prospěch obžaloby.
3. **Stav obviněného** — popírá, a to jeho slovy.

Když odvolací soud vyslovil závazný právní názor, cituje se jako jeho
názor, ne jako zjištění o skutku — a s poznámkou, že soud prvního stupně
teprve rozhodne.
{% </kontrola> %}
