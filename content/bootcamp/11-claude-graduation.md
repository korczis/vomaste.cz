+++
title = "11 — Claude Code: brána a příspěvek"
description = "Poslední úkol: spusťte bránu kvality, přečtěte její výsledek a řekněte, co znamená „hotovo“."
template = "learning-lesson.html"
weight = 210

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B11"
estimated_minutes = 14
audience = ["zdroje", "research", "editor", "vyvojar"]
prerequisites = ["B10"]
objectives = [
  "Spustíte kanonickou bránu kvality a přečtete její výsledek.",
  "Popíšete, co jediné znamená „hotovo“.",
  "Vyjmenujete pět míst, kde rozhoduje člověk a ne nástroj.",
]
related_kb = ["koncepty/prubezne-overovani.md", "koncepty/pravo-opravit.md"]
+++

Poslední úkol Bootcampu. Nic se při něm nepublikuje.

## Krok 1 — spusťte bránu

{% <prikaz kind="terminal" note="Trvá minuty. Nepřerušujte to kvůli varováním."> %}
npm run build
{% </prikaz> %}

Nebo s výkladem výsledku:

{% <prikaz kind="claude"> %}
/build
{% </prikaz> %}

## Krok 2 — přečtěte výsledek

Zajímají vás dvě věci: **skončilo to nulou?** a když ne, **který krok
padl jako první**. Kroky na sebe navazují — pozdější chyby bývají
následek té první.

{% <cviceni zadani="Brána spadla na kontrole kotev: odkaz míří na místo, které v hotovém webu není. Kde se to opravuje?"> %}
Skoro nikdy v šabloně. Mrtvá kotva bývá **důsledek** toho, že se
přečísloval nebo přejmenoval záznam, na který odkaz míří — takže oprava
patří tam, odkud odkaz vede, nebo do dat.

Obecné pravidlo: opravuje se **příčina**, ne projev. A když je příčina
v datech, oprava nepatří do generovaného výstupu.
{% </cviceni> %}

## Krok 3 — co znamená hotovo

{% <callout kind="pravidlo" title="Jediná definice, která platí"> %}
Hotovo znamená **`npm run build` s návratovým kódem 0**.

Ne „testy prošly". Ne „vypadá to dobře". Ne „padá to jen na jedné
kontrole". Testy pokrývají skripty; brána kontroluje postavený web —
kotvy, strojová data, metadata, responzivitu. Obojí může projít
nezávisle na tom druhém.
{% </callout> %}

## Krok 4 — kde rozhoduje člověk

Projděte si těch pět míst a zkuste u každého říct **proč** to nejde
automatizovat:

{% <seznam id="graduation-checkpointy" nadpis="Lidské checkpointy"> %}
Rozsah pokrytí — smí se o téhle osobě psát?
Publikace — jde tenhle záznam ven?
Sporná nezávislost zdrojů — je to jeden hlas, nebo dva?
Rozhodnutí o třetí osobě — zůstává nejmenovaná?
Merge a nasazení.
{% </seznam> %}

Odpověď je u všech stejná: vyžadují **úsudek o následcích pro konkrétní
lidi**. Nástroj je umí popsat, ale popsat rozhodnutí není totéž co
nést je.

## Absolvováno

Umíte-li tohle, umíte pracovat bezpečně:

{% <seznam id="graduation-umim" nadpis="Co teď umíte"> %}
Rozlišit terminál, volání schopnosti a přirozený popis
Najít schopnost, aniž byste znali její název
Přečíst úroveň rizika dřív, než něco spustíte
Poznat generovaný soubor od kanonického
Nechat si vysvětlit změnu a najít v ní, co tam nepatří
Spustit bránu a přečíst její výsledek
Říct, kde končí nástroj a začíná rozhodnutí
{% </seznam> %}

{% <kontrola otazka="Claude oznámí „hotovo, všechno prošlo“, ale bránu nespustil. Co uděláte?"> %}
Zeptáte se, co konkrétně spustil, a bránu pustíte. „Prošlo to" je
tvrzení jako každé jiné — platí, když je doložené. V tomhle projektu
je to shodou okolností nejlevnější ověřitelné tvrzení vůbec: jeden
příkaz a jedno číslo na konci.
{% </kontrola> %}
