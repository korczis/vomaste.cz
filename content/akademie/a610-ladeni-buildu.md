+++
title = "A610 — Ladění spadlého buildu"
description = "Postup od chybové hlášky k příčině a katalog nejčastějších pádů — včetně těch, kde chyba není tam, kde se ohlásila."
template = "learning-lesson.html"
weight = 1610

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A610"
level = "engineering"
estimated_minutes = 12
audience = ["vyvojar", "maintainer"]
objectives = [
  "Zúžíte pád na konkrétní krok a spustíte ho samostatně.",
  "Poznáte pády, u kterých je příčina jinde než hláška.",
  "Vyhnete se opravování symptomu místo příčiny.",
]
prerequisites = ["A609"]
related_kb = ["koncepty/prubezne-overovani.md"]
next_route = "@/akademie/a701-model-autorizace.md"
next_label = "A701 — Model autorizace (úroveň Governance)"
+++

## Postup

1. **Najděte první chybu**, ne poslední. Pipeline se zastaví na prvním
   selhání, ale výpis bývá dlouhý.
2. **Zjistěte krok.** Každý běh je označený jménem kroku.
3. **Spusťte ten krok samostatně.** Kratší smyčka, čitelnější výpis.
4. **Přečtěte hlášku doslova.** Validátory tady píšou, co je špatně a
   často i jak to opravit.
5. **Opravte příčinu, ne symptom.**

## Katalog častých pádů

| Hláška | Skutečná příčina |
|---|---|
| Text tvrzení neodpovídá řádku tabulky | změna udělaná jen na jednom ze dvou míst |
| Stav neodpovídá zdrojům | dvojice zdrojů se neliší rodinou i vydavatelem |
| Neznámý typ stránky | nový `record_type` bez záznamu v konfiguraci metadat |
| Příkaz bez záznamu v katalogu | nový npm skript bez doprovodného záznamu |
| Rozbitá kotva | odkaz na `id`, které ve vydaném HTML není |
| Neznámý typ entity | typ bez popisku, nebo popisek bez použití |
| Chybí generovaný soubor | pouštíte generátor mimo pipeline, bez předchozích kroků |
| Komponenta se vykreslí prázdná | argument, který tělo komponenty nikdy nepřečte |

{% <callout kind="varovani" title="Pády, kde chyba není tam, kde se ohlásila"> %}
**Obousměrné brány** hlásí i mrtvé záznamy. „Neznámý typ“ může znamenat, že
typ chybí — nebo že zbyl po smazaných datech.

**Kontrola parity uvnitř brány** neohlásí ruční úpravu generované stránky,
protože ta se přepíše dřív. Když rozdíl v obsahu vypadá divně, pusťte
kontrolu samostatně.

**Chyby v generovaných souborech** se opravují ve zdroji. Oprava
v generovaném výstupu vydrží do dalšího sestavení.
{% </callout> %}

## Když je zeleno lokálně a červeno v CI

Pusťte lokálně přesně ten příkaz, který selhal. Když projde, je rozdíl
v prostředí: verze nástrojů, citlivost na velikost písmen v cestách,
časový limit, nebo odvozený soubor, který u vás zbyl z předchozího běhu a
v čerstvém klonu neexistuje.

{% <kontrola otazka="Build spadne na kontrole kotev: odkaz míří na `id`, které ve vydaném HTML není. Kde hledat?"> %}
Ve třech místech, v tomhle pořadí:

1. **Překlep v odkazu.** Nejčastější a nejrychleji vyloučitelný.
2. **Kotva zanikla.** Text, na který se odkazovalo, byl přepsán nebo
   smazán — a odkaz na něj zůstal. Typicky se stane při přeformulování
   tvrzení.
3. **Kotva se negeneruje.** Odkaz míří do generované stránky, jejíž
   struktura se změnila.

Co **neudělat**: smazat odkaz, aby brána zmlkla. Rozbitý odkaz je
příznakem toho, že se rozešly dvě části obsahu — a ta druhá část je pořád
rozešlá, jen o ní nikdo nebude vědět.

Tahle kontrola existuje proto, že běžný kontrolor odkazů ručně psané
`id` neověřuje. Je to jediná věc, která takový rozpad chytí.
{% </kontrola> %}
