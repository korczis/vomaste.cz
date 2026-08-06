+++
title = "ADR: JSON-first kanonický datový model"
description = "Rozhodnutí, kterým se jediným zdrojem pravdy stala kanonická JSON/JSON-LD data a Markdown pod content/ se změnil v generovaný adaptér. Jádro dnešní architektury webu."
template = "docs-viewer.html"
weight = 10

[extra]
lang = "cs"
source_file = "docs/adr/json-first-canonical-data-model.md"
+++

**Co to je.** Nejdůležitější architektonické rozhodnutí tohoto webu.
Dřív byl zdrojem pravdy Markdown s front matter; dnes je jím výhradně
kanonický JSON, který je zároveň platný JSON-LD, a stránky pod
`content/` jsou generované routovací obálky, které se ručně needitují.

**Co to prakticky znamená.** Tvrzení, zdroj ani vztah nemůže existovat
ve dvou verzích, které se rozejdou — stránka, tabulka, export i
strukturovaná data vznikají z jednoho zkompilovaného modelu. Jediné
místo, kde jsou záměrně dvě reprezentace téhož, je přehledová tabulka
tvrzení, a tam build shodí kontrola parity, jakmile se liší byť o bajt.

**Proč to stálo za tu práci.** Odstranilo to celou třídu chyb, které se
nedají uhlídat kázní: dvě čísla na dvou stránkách, tři definice téhož
stavu, export, který nesouhlasí s webem.
