+++
title = "A201 — Jak formulovat atomické tvrzení"
description = "Jedno tvrzení, jeden ověřitelný fakt. Techniky rozkladu složených vět a test, kterým poznáte, že je věta pořád příliš velká."
template = "learning-lesson.html"
weight = 1201

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A201"
level = "research"
estimated_minutes = 11
audience = ["research", "editor"]
objectives = [
  "Rozložíte složenou větu na tvrzení, z nichž každé má vlastní doklad.",
  "Použijete test jednoho stavu k odhalení příliš velkého tvrzení.",
  "Vyhnete se hodnotícím přívlastkům uvnitř faktického tvrzení.",
]
related_kb = ["koncepty/registr-tvrzeni.md", "koncepty/fakt-oddelene-od-nazoru.md"]
next = "A202"
+++

## Test jednoho stavu

Nejrychlejší způsob, jak poznat příliš velké tvrzení: **zkuste mu přidělit
jeden stav.** Když u částí věty vycházejí různé stavy, je to víc tvrzení.

*„Zakázku za 40 milionů získala firma bez zkušeností, kterou vlastní bývalý
kolega starostky.“*

- cena a vítěz → doloženo smlouvou (ověřeno)
- „bez zkušeností“ → výklad podmínek (sporné, nebo mezera)
- vlastník → rejstřík (ověřeno)
- „bývalý kolega“ → čím doloženo? (nejspíš mezera)

Čtyři různé stavy = čtyři tvrzení.

## Tři typické zdroje složenosti

**Přívlastek s hodnocením.** „Předražená zakázka“, „sporný tendr“,
„kontroverzní vyjádření“. Hodnocení se buď doloží samostatně jako cizí
výrok, nebo vypadne.

**Spojka, která tvoří příčinu.** „Ačkoli“, „protože“, „přestože“. Kauzalita
je vždycky samostatné tvrzení a bývá nejhůř doložitelná.

**Vsuvka.** Vedlejší věta v čárkách vypadá jako kontext, ale je to plné
tvrzení, které nikdo nedokládá — právě proto, že vypadá jako kontext.

{% <callout kind="priklad" title="Rozklad"> %}
1. *„Veřejnou zakázku na rekonstrukci získala firma X.“* — smlouva
2. *„Smluvní cena byla 40 mil. Kč.“* — smlouva
3. *„Jediným společníkem firmy X je Y.“* — rejstřík
4. Mezera: *„Zdroje neuvádějí, jakou praxi zadávací dokumentace
   požadovala.“*
5. Mezera: *„Vztah mezi Y a starostkou nebyl z veřejných zdrojů ověřen.“*

Čtenář dostane víc informací než z původní věty — a u každé ví, jak je
doložená.
{% </callout> %}

{% <callout kind="varovani" title="Nedělte donekonečna"> %}
Atomické neznamená nejkratší možné. „Smlouva byla podepsána“ + „Smlouva
byla podepsána 3. 5.“ jsou dvě verze téhož; stačí druhá. Kritérium je
**jeden doklad, jeden stav**, ne počet slov.
{% </callout> %}

{% <kontrola otazka="Chcete napsat: „Ministerstvo o auditu vědělo od roku 2019, ale peníze nevymáhalo.“ Kolik je to tvrzení a co s nimi?"> %}
Nejméně tři, možná čtyři:

1. *„Audit byl doručen ministerstvu v roce 2019.“* — doložitelné
   dokumentem nebo tvrzením zdroje.
2. *„Ministerstvo do [datum] nezahájilo vymáhání.“* — pozor, tohle je
   negativní zjištění; musí nést čas a evidenci, ve které se hledalo.
3. Implicitní: *„Ministerstvo mělo povinnost vymáhat.“* — právní posouzení,
   které buď má zdroj, nebo je to úsudek autora.
4. Slovo **„ale“** tvrdí souvislost mezi 1 a 2 — tedy že nekonání bylo
   navzdory vědomosti. To je nejtěžší část a nejčastěji nedoložená.

Praktický postup: napsat 1 a 2 jako samostatná tvrzení s vlastními doklady,
3 jen pokud existuje zdroj, a 4 nechat na čtenáři. Když souvislost tvrdí
citovaná redakce, je to její tvrzení — cituje se jako její, ne jako
zjištění webu.
{% </kontrola> %}
