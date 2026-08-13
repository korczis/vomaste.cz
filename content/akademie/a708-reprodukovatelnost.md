+++
title = "A708 — Reprodukovatelnost"
description = "Kdo si repozitář naklonuje, musí dostat týž web. Co to vylučuje, proč je to podmínka forkovatelnosti a jak se to ověřuje."
template = "learning-lesson.html"
weight = 1708

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A708"
level = "governance"
estimated_minutes = 9
audience = ["maintainer", "vyvojar"]
objectives = [
  "Vyjmenujete, co sestavení nesmí potřebovat.",
  "Vysvětlíte souvislost mezi reprodukovatelností a kontrolovatelností.",
  "Ověříte reprodukovatelnost prakticky.",
]
prerequisites = ["A707"]
related_kb = ["koncepty/forkovatelnost.md", "koncepty/serverless.md", "koncepty/nezastavitelnost.md", "koncepty/duvera-bez-znacky.md"]
next_route = "@/prirucka/_index.md"
next_label = "Příručka — rychlé dohledání konkrétní věci"
+++

Reprodukovatelnost je poslední lekce Akademie schválně: je to podmínka,
na které stojí všechno předchozí.

## Co sestavení nesmí potřebovat

- externí platformu nebo službu,
- databázi,
- přihlašovací údaje nebo klíče,
- síť,
- nezdokumentovaný krok, který zná jen autor.

Kdo si repozitář naklonuje a spustí `npm run build`, musí dostat **týž
web**.

## Proč je to podmínka, ne vlastnost navíc

Projekt slibuje, že mu nemusíte věřit — že si můžete zkontrolovat data,
zdroje a historii. Ten slib platí jen tehdy, když si výsledek dokážete
postavit sami.

Kdyby sestavení potřebovalo něco, co má jen autor, byla by kontrola
podmíněná jeho ochotou. To není kontrolovatelnost, jen její vzhled.

Odtud plyne i to, proč se **výstup výzkumných nástrojů nikdy nepublikuje
jako doklad**: nástroj v repozitáři není a čtenář jeho výsledek
nezreprodukuje. Publikuje se ta veřejná evidence, na kterou nástroj
ukázal — tu si otevře kdokoli.

{% <callout kind="pravidlo" title="Čtyři nezávislé body selhání"> %}
Doména, hosting, provozovatel a repozitář. Kdo má klon, má všechno
potřebné k provozu — a to je celá myšlenka forkovatelnosti.

Každá závislost přidaná do sestavení z jednoho z těch bodů udělá podmínku
a myšlenku tím ruší.
{% </callout> %}

## Jak to ověřit

Naklonovat do prázdného adresáře, nainstalovat závislosti, spustit bránu.
Bez přenášení odvozených souborů z existující kopie a bez proměnných
prostředí.

Když to projde, je repozitář soběstačný. Když ne, právě jste našli skrytou
závislost.

{% <kontrola otazka="Chcete přidat krok, který při sestavení stáhne aktuální data z veřejného registru. Co je na tom špatně?"> %}
Sestavení by přestalo být deterministické a začalo záviset na síti.

Tři konkrétní důsledky:

1. **Dva lidé dostanou jiný web** ze stejného commitu, podle toho, kdy ho
   postavili. Zmizí tím možnost říct „tenhle commit vypadá takhle“.
2. **Sestavení může selhat kvůli cizímu výpadku** — nebo, hůř, projít
   s neúplnými daty.
3. **Zmizí provenance.** Údaj, který se stáhl při buildu, nemá datum
   pořízení ani doklad; nikdo pak neví, k jakému okamžiku platí.

Správné řešení je oddělit sběr od sestavení: data se stahují **samostatným
příkazem**, výsledek se s datem pořízení uloží do repozitáře, a build už
jen čte, co v něm je.

Přesně tak je udělaná archivace úředních podkladů: síťové obnovení je
ruční krok, deterministický build na síť nesahá.
{% </kontrola> %}
