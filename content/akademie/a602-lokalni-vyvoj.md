+++
title = "A602 — Lokální vývoj"
description = "Od klonu po běžící web: co potřebujete nainstalovat, které příkazy existují a proč první spuštění trvá minuty."
template = "learning-lesson.html"
weight = 1602

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A602"
level = "engineering"
estimated_minutes = 10
audience = ["vyvojar"]
objectives = [
  "Rozběhnete web lokálně z čistého klonu.",
  "Vyberete správný příkaz podle toho, co potřebujete ověřit.",
  "Budete vědět, proč přípravná fáze trvá a co v ní běží.",
]
prerequisites = ["A601"]
related_kb = ["koncepty/forkovatelnost.md", "koncepty/serverless.md"]
next = "A603"
+++

## Co je potřeba

Node (verzi drží `.tool-versions`) a Zola v řadě, kterou očekává
`just doctor` — na starší řadě build spadne. Nic dalšího — žádná databáze,
žádný běžící backend.

```bash
git clone <repozitář>
cd vomaste.cz
npm ci
npm run dev
```

Web pak běží na `http://127.0.0.1:1111`.

## Proč první spuštění trvá

`npm run dev` není jen spuštění serveru. Před ním proběhne řada kroků:
validace kanonických dat, sestavení pohledových modelů, generování
adaptérů, navigace, exporty, projekce grafu, index vyhledávání, CSS a JS.
Teprve pak se pouští server.

Je to schválně: `data/generated/**` není ve verzování, takže po čerstvém
klonu neexistuje — a šablony ho potřebují. Bez té přípravy by web spadl
nesrozumitelnou chybou.

{% <callout kind="varovani" title="Dev režim není brána"> %}
`npm run dev` vynechává testy, linty a všechny kontroly po sestavení. Je
to vývojová smyčka, ne ověření.

Než něco označíte za hotové, musí projít `npm run build`.
{% </callout> %}

## Které příkazy k čemu

| Příkaz | Kdy |
|---|---|
| `npm run dev` | psaní obsahu, práce se šablonami |
| `npm run data:validate` | rychlá kontrola kanonických dat |
| `npm run data:validate -- --file <cesta>` | jeden záznam během psaní |
| `npm run data:build` | přegenerování modelů a adaptérů |
| `npm run check` | kontroly bez generování a bez sestavení |
| `npm run build` | **kanonická brána** — musí skončit s kódem 0 |

## Katalog příkazů

Úplný seznam je generovaný z repozitáře a publikovaný na
[/dokumentace/prikazy/](@/dokumentace/prikazy/_index.md). Nevede se ručně:
příkaz bez záznamu shodí build, takže dokumentace nemůže zaostat za kódem.

{% <kontrola otazka="`zola serve` spustíte přímo, bez npm. Web spadne na chybě o chybějícím souboru. Proč?"> %}
Protože šablonám chybí `data/generated/**` — pohledové modely, navigace a
metriky, ze kterých se stránky skládají.

Ten adresář je **odvozený a záměrně mimo verzování**: je to výstup
generátorů, ne zdroj. Po čerstvém klonu tedy neexistuje a Zola si ho
nevyrobí, protože o něm nic neví.

Řešení je pustit generátory před serverem — přesně to dělá `npm run dev`.

Repozitář na to má i kontrolu: seznam požadovaných souborů se **odvozuje
z toho, co si šablony opravdu načítají**, ne z ručního výčtu. Nová šablona,
která si sáhne po dalším generovaném souboru, se do kontroly zařadí sama.
{% </kontrola> %}
