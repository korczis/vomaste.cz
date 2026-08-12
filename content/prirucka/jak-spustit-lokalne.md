+++
title = "Jak spustit projekt lokálně"
description = "Od klonu k běžícímu webu čtyřmi příkazy. Technický postup — pro příspěvek přes formulář ho nepotřebujete."
template = "learning-lesson.html"
weight = 2207

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "postup"
estimated_minutes = 4
audience = ["vyvojar"]
+++

{% <callout kind="poznamka" title="Technický postup"> %}
Tohle potřebujete, jen když měníte data, šablony nebo kód. Nahlásit chybu
nebo poslat zdroj jde formulářem v prohlížeči.
{% </callout> %}

## Předpoklady

Node (verzi drží `.tool-versions`) a Zola. Nic jiného — žádná databáze,
žádný backend.

## Postup

```bash
git clone <repozitář>
cd vomaste.cz
npm ci
npm run dev
```

Web běží na `http://127.0.0.1:1111`.

## Proč to napoprvé trvá

`npm run dev` není jen server. Nejdřív proběhne validace dat, sestavení
pohledových modelů, generování adaptérů, navigace, exportů, indexu
vyhledávání, CSS a JS — a teprve pak se pouští server.

Odvozené soubory nejsou ve verzování, takže po čerstvém klonu neexistují
a šablony je potřebují.

{% <callout kind="varovani" title="Přímé `zola serve` spadne"> %}
Bez předchozích generátorů chybí odvozená data a Zola si je nevyrobí —
o generátorech nic neví. Pouštějte `npm run dev`.
{% </callout> %}

{% <callout kind="varovani" title="Dev režim není brána"> %}
Vynechává testy, linty a kontroly po sestavení. Než něco označíte za
hotové, musí projít `npm run build`.
{% </callout> %}
