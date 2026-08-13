+++
title = "A202 — Jak hledat doklad"
description = "Postup od tvrzení k dokladu: jaký doklad by byl ideální, kde takový doklad bydlí a co dělat, když neodpovídá."
template = "learning-lesson.html"
weight = 1202

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A202"
level = "research"
estimated_minutes = 12
audience = ["research"]
objectives = [
  "Začnete rešerši otázkou, jaký doklad by tvrzení uzavřel, ne dotazem do vyhledávače.",
  "Vyberete evidenci podle toho, na co umí odpovědět.",
  "Odmítnete zdroj, který na vaši otázku odpovědět neumí, místo abyste ho ohnuli.",
]
prerequisites = ["A201"]
related_kb = ["koncepty/primarni-dokumenty.md", "koncepty/zdrojovano.md"]
next = "A203"
+++

Špatná rešerše začíná dotazem do vyhledávače. Dobrá začíná otázkou:
**„jaký doklad by tohle tvrzení uzavřel?“**

Teprve pak se hledá, kde takový doklad bydlí.

## Postup

1. **Napište tvrzení** v konečné podobě, atomicky.
2. **Popište ideální doklad.** „Smlouva s uvedenou cenou a datem podpisu.“
3. **Určete evidenci**, ve které takový doklad bývá.
4. **Hledejte tam.** Ne ve vyhledávači obecně.
5. **Otevřete, co najdete.** Úryvek z výsledku není zdroj.
6. **Zaznamenejte i neúspěch** — s datem a s tím, kde a jak jste hledali.

{% <callout kind="pravidlo" title="Agregátor ukazuje, primární registr dokládá"> %}
Nástroje, které data sbírají z víc míst, jsou vynikající rozcestníky. Pak
se ale cituje to, na co ukázaly. Tvrzení opřené jen o agregátor zůstává
na jednom zdroji — a když agregátor zmizí nebo přepočítá data, zmizí
s ním i doklad.
{% </callout> %}

## Které evidence na co odpovídají

Projekt si vede vlastní [katalog zdrojů](@/zdroje/_index.md), a je to první místo,
kam se dívat. U každé evidence je v něm napsané, **co dokládá**, **co
nedokládá** a **na jaké pasti se v ní už najelo** — tedy přesně to, co se
nedá odvodit z dat a co se jinak platí znovu a znovu.

{% <callout kind="varovani" title="Zdroj, který neumí odpovědět, se odmítá"> %}
Některé služby vrátí data i na dotaz, který neumějí zpracovat — filtr tiše
ignorují a pošlou nefiltrovanou stránku. Prezentovat to jako nález je
horší než přiznat, že se na otázku z téhle evidence odpovědět nedá.
{% </callout> %}

## Když doklad není

Není to selhání rešerše, je to její výsledek. Zaznamenejte:

- co přesně jste hledali (identifikátor, ne jméno),
- ve které evidenci,
- kdy,
- s jakým výsledkem.

Z toho vznikne mezera, která je zároveň zadáním pro dalšího člověka.

{% <kontrola otazka="Hledáte, kolik firma dostala z veřejných peněz. Najdete agregátor, který ukazuje součet 12 mil. Kč. Můžete ten součet publikovat?"> %}
Ne jako tvrzení o objemu veřejných peněz.

Ten součet je výsledek výpočtu nad daty, která agregátor sesbíral, s jeho
pravidly pro to, co se počítá a jak se párují subjekty. Neznáte hranice
toho výpočtu — jestli zahrnuje dceřiné firmy, jestli počítá smluvní nebo
proplacené částky, jestli mu nechybí záznamy.

Použitelné jsou dvě věci. Buď **jednotlivé smlouvy z primárního registru**,
u kterých doložíte částku a datum a součet si uděláte sami s uvedením
metody. Nebo tvrzení **o tom agregátoru**: „Podle [nástroj] k [datum]
činil evidovaný objem 12 mil. Kč“ — což je doložitelné a poctivé, protože
je z něj vidět, čí je to číslo.

Nikdy ne „firma dostala 12 milionů z veřejných peněz“ s odkazem na
agregátor. To tvrdí něco o světě na základě cizího výpočtu.
{% </kontrola> %}
