+++
title = "C110 — Bezpečný příspěvek od začátku do konce"
description = "Celá cesta od nápadu k pull requestu, s uvedením míst, kde rozhoduje člověk."
template = "learning-lesson.html"
weight = 1810

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C110"
level = "claude-code"
estimated_minutes = 10
audience = ["zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Projdete celou cestu od nápadu k odeslanému příspěvku.",
  "Ukážete na místa, kde rozhoduje člověk a ne nástroj.",
  "Řeknete, co musí platit, než se práce označí za hotovou.",
]
related_kb = ["koncepty/pravo-opravit.md", "koncepty/prubezne-overovani.md"]
next = "C111"
+++

Tady se všechno předchozí skládá dohromady.

## Celá cesta

**1. Orientace.** `/bootstrap` určí roli a skončí konkrétním
doporučením. Když je prostředí rozbité, řekne to dřív, než se něco
zkazí.

**2. Rozklad zadání.** Čeho se to dotkne? Je to obsah, data, kód, nebo
dokumentace? Dotýká se to toho, o kom se smí psát?

{% <prikaz kind="skill"> %}
/task Chci opravit datum u jednoho zdroje.
{% </prikaz> %}

**3. Vlastní větev.** Ne hlavní. Na hlavní větvi commit rovnou nasazuje
web — mezi „commitnuto" a „na webu" nejsou vteřiny, ale ani ta pauza na
rozmyšlenou.

**4. Plán.** Co se změní, čeho se to dotkne, co je rizikové, jak se to
ověří. Teprve pak provedení.

**5. Změna** v kanonických datech. Nikdy v generovaném výstupu.

**6. Kontrola.** Vysvětlení změn, pohled na to, jestli tam není něco
navíc.

**7. Brána.** `npm run build` s nulou. Nic jiného není hotovo.

**8. Odeslání.** Commit a pull request s popisem, ze kterého recenzent
pozná, co posuzuje.

## Kde rozhoduje člověk

Pět míst. Ani jedno z nich nejde automatizovat, i když by to šlo popsat:

{% <seznam id="checkpointy" nadpis="Lidské checkpointy"> %}
Rozsah pokrytí — smí se o téhle osobě vůbec psát?
Publikace — jde tenhle záznam ven?
Sporná nezávislost zdrojů — je to jeden hlas, nebo dva?
Citlivé rozhodnutí o třetí osobě — zůstává nejmenovaná?
Merge a nasazení — podle pravidel projektu.
{% </seznam> %}

{% <callout kind="pravidlo" title="Proč zrovna tahle pětice"> %}
Všechno ostatní je mechanika: dá se popsat, ověřit a zkontrolovat
strojově. Těchhle pět vyžaduje **úsudek o následcích pro konkrétní
lidi** — a ten se nedeleguje na nástroj jenom proto, že by ho uměl
formulovat.
{% </callout> %}

## Co musí platit, než řeknete „hotovo"

- brána kvality skončila s nulou;
- v diffu není nic, co tam nepatří;
- obsahová změna prošla redakčním review;
- to, co se nepodařilo doložit, je zapsané jako mezera, ne jako opatrné
  tvrzení;
- popis příspěvku říká i to, co jste **ne**udělali.

Poslední bod se přehlíží a je nejcennější. Vynechání, které se přizná
předem, je informace; vynechání, které se objeví po mergi, je problém.

{% <kontrola otazka="Všechno je zelené, ale nestihli jste ověřit jeden ze tří zdrojů. Co napíšete do popisu?"> %}
Přesně to. Do oddílu „co jsem neudělal": třetí zdroj nebyl otevřen,
tvrzení proto zůstává na jednom doloženém hlasu. Recenzent tím dostane
zadání místo překvapení — a nikdo nebude v pokušení označit tvrzení za
ověřené víc, než je.
{% </kontrola> %}
