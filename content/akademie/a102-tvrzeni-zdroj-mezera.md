+++
title = "A102 — Tvrzení, zdroj, mezera"
description = "Tři základní záznamy a pravidla, která mezi nimi platí. Co dělá tvrzení atomickým a proč mezera není chybějící tvrzení."
template = "learning-lesson.html"
weight = 1102

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A102"
level = "foundations"
estimated_minutes = 10
audience = ["ctenar", "zdroje", "research"]
objectives = [
  "Rozeznáte atomické tvrzení od slepence několika tvrzení.",
  "Vyjmenujete, co musí nést každý záznam zdroje.",
  "Vysvětlíte, proč mezera není jen chybějící tvrzení.",
]
prerequisites = ["A101"]
related_kb = ["koncepty/registr-tvrzeni.md", "koncepty/registr-zdroju.md", "koncepty/registr-mezer.md"]
next = "A103"
+++

## Tvrzení musí být atomické

Jedno tvrzení = jeden ověřitelný fakt. Důvod je praktický: stav se přiděluje
celému tvrzení. Když se do jedné věty vejdou tři fakta, nedá se označit,
protože každé z nich má jinou sílu doložení.

{% <callout kind="protipriklad" title="Tři tvrzení v jednom"> %}
*„Firma získala zakázku za 40 milionů, ačkoli neměla potřebnou praxi, a
starostka o tom věděla.“*

Cena je doložitelná ze smlouvy. Praxe je otázka výkladu podmínek. Vědomost
starostky je nejtěžší část a nejspíš nedoložená. Jako celek to nemá stav —
jen nejslabší článek táhne dolů zbytek.
{% </callout> %}

{% <callout kind="priklad" title="Rozděleno"> %}
1. *„Zakázku získala firma X za 40 milionů.“* — doloženo smlouvou
2. *„Zadávací dokumentace požadovala praxi Y.“* — doloženo dokumentací
3. *„Starostka o tom věděla.“* — nedoloženo → **mezera**

Tři záznamy, tři různé stavy, čtenář vidí přesně, co stojí na čem.
{% </callout> %}

## Zdroj

Každý záznam zdroje nese vydavatele, typ, URL, datum vydání, datum
kontroly, seznam tvrzení, která podpírá, rodinu zdrojů (podle **původu**
materiálu) a povinnou redakční poznámku — co dokládá, jak je nezávislý a
kde má hranice.

Ta poznámka je jediná ručně psaná část a nejcennější: shrnuje, co se
z otevření zdroje dozvěděl člověk, který ho otevřel.

## Mezera

Mezera **není** chybějící tvrzení. Je to zaznamenaná otázka, u které je
doloženo, že na ni dostupné zdroje neodpovídají.

Rozdíl je v tom, že mezera je tvrzení o stavu poznání — a jako každé
tvrzení má datum poslední kontroly. „K 3. 5. 2026 nebylo z veřejných
zdrojů zjistitelné X“ je ověřitelný výrok.

{% <kontrola otazka="Máte doloženo, že smlouva byla podepsána 3. 5., a doloženo, že práce začaly 20. 5. Chcete napsat, že se začalo se sedmnáctidenním zpožděním. Jde to?"> %}
Ne jako tvrzení o zpoždění — leda jako tvrzení o dvou datech.

„Zpoždění“ předpokládá, že existoval závazný termín zahájení a že ho
podpis smlouvy určuje. Nic z toho zdroje neříkají. Je to úsudek, ne fakt.

Správně: dvě tvrzení o dvou datech (obojí doložené) a mezera „zdroje
neuvádějí, jaký termín zahájení smlouva stanovila“. Čtenář si těch
sedmnáct dní spočítá sám — ale nedostane vaše slovo „zpoždění“ zabalené
jako zjištění.
{% </kontrola> %}
