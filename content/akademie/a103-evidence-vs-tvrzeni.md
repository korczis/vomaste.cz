+++
title = "A103 — Doklad není tvrzení"
description = "Rozdíl mezi tím, co zdroj obsahuje, a tím, co z něj plyne. Nejčastější místo, kde se rešerše tiše zlomí."
template = "learning-lesson.html"
weight = 1103

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A103"
level = "foundations"
estimated_minutes = 9
audience = ["research", "editor"]
objectives = [
  "Oddělíte obsah zdroje od závěru, který si z něj děláte.",
  "Přeformulujete tvrzení tak, aby nesahalo dál než doklad.",
  "Poznáte typické slovní obraty, kterými se závěr vydává za fakt.",
]
prerequisites = ["A102"]
related_kb = ["koncepty/zdrojovano.md", "koncepty/fakt-oddelene-od-nazoru.md"]
next = "A104"
+++

Doklad je to, co ve zdroji **doslova stojí**. Tvrzení je věta, kterou z něj
odvozujete. Mezi nimi je krok, a v tom kroku se rešerše láme nejčastěji.

## Testovací otázka

Ke každému tvrzení si položte: *„Kdyby autor zdroje četl moji větu,
poznal by v ní, co napsal?“*

Když by řekl „to jsem netvrdil“, sáhli jste dál než doklad.

## Obraty, které maskují závěr

| Obrat | Co ve skutečnosti dělá |
|---|---|
| „podle všeho“, „zřejmě“ | vydává úsudek za pozorování |
| „nepřekvapivě“ | podsouvá výklad jako samozřejmý |
| „ačkoli“, „přestože“ | tvoří příčinnou vazbu, kterou zdroj neuvádí |
| „opět“, „znovu“ | tvrdí vzorec, který je doložen jedním případem |
| „připustil“ | mění neutrální vyjádření v doznání |

{% <callout kind="protipriklad" title="Jedno slovo, celý posun"> %}
Zdroj: *„Ministerstvo uvedlo, že o auditu vědělo od roku 2019.“*

Tvrzení: *„Ministerstvo **připustilo**, že o auditu vědělo už od roku
2019.“*

„Připustilo“ a „už“ přidávají, že šlo o nepříjemné doznání a že ten rok je
podezřele brzy. Ani jedno ve zdroji není.
{% </callout> %}

## Kdy je odvození v pořádku

Když je **mechanické a ověřitelné**: přepočet měny, součet položek ze
smlouvy, rozdíl dvou dat. To nejsou závěry, to je aritmetika — a uvádí se
z čeho.

Naproti tomu „z toho plyne, že o tom musel vědět“ není aritmetika. To je
teze, a ta buď má vlastní doklad, nebo je z ní mezera.

{% <kontrola otazka="Zdroj uvádí, že firma vznikla tři týdny před vypsáním zakázky, kterou pak vyhrála. Chcete napsat, že byla založena účelově. Můžete?"> %}
Ne. Doložená jsou dvě data a jejich pořadí. „Účelově“ je tvrzení o záměru
zakladatelů — a záměr se z časové souslednosti nedá odvodit.

Napište obojí zvlášť: *„Firma byla zapsána do rejstříku 3. 5.“* a
*„Zakázka byla vypsána 24. 5.“*, obojí doložené. Blízkost dat si čtenář
všimne sám.

A pokud vám ta souvislost připadá důležitá, je to zadání pro rešerši, ne
pro formulaci: mezera zní „zdroje neuvádějí, za jakým účelem byla firma
založena“. Konstituce projektu to má jako samostatné pravidlo — vazba
sama o sobě nezakládá odpovědnost ani úmysl.
{% </kontrola> %}
