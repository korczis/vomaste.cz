+++
title = "00 — Orientace"
description = "Najděte na skutečném dossieru tvrzení, zdroj a mezeru. První lekce nemá teorii — má vás naučit, kde co je."
template = "learning-lesson.html"
weight = 100

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B00"
estimated_minutes = 8
audience = ["ctenar", "zdroje", "research"]
objectives = [
  "Najdete na stránce dossieru tvrzení, jeho zdroje a související mezeru.",
  "Řeknete vlastními slovy, co znamená CLM, SRC a GAP.",
  "Poznáte, že identifikátor je adresa, ne hodnocení.",
]
related_kb = ["koncepty/co-je-dossier.md", "koncepty/registr-tvrzeni.md", "koncepty/registr-zdroju.md", "koncepty/registr-mezer.md"]
next = "B01"
+++

Tahle lekce je orientační běh. Otevřete si vedle libovolný dossier ze
[seznamu](@/dossiers/_index.md) a hledejte.

## Tři věci, které hledáte

| Zkratka | Česky | Co to je |
|---|---|---|
| `CLM-##` | tvrzení | Jedna konkrétní věta o tom, co se stalo nebo co kdo řekl |
| `SRC-##` | zdroj | Konkrétní publikovaný text nebo dokument, ze kterého to víme |
| `GAP-##` | mezera | Otázka, na kterou dostupné zdroje neodpovídají |

Číslo za zkratkou je **adresa v rámci jednoho dossieru**, nic víc. `CLM-01`
není důležitější než `CLM-40` a `SRC-02` není lepší zdroj než `SRC-19`.
Pořadí je historické, ne hodnotící.

{% <callout kind="poznamka" title="Proč vůbec zkratky"> %}
Aby se dalo přesně odkázat. „To tvrzení o té zakázce“ se dá vyložit
pěti způsoby; `CLM-14` jedním. Bez toho by nešlo napsat, že zdroj `SRC-03`
podpírá právě `CLM-14` a nic jiného.
{% </callout> %}

## Úloha

{% <cviceni zadani="Otevřete kterýkoli dossier a najděte: (1) tabulku tvrzení, (2) detail jednoho tvrzení, (3) stránku jednoho zdroje, který to tvrzení podpírá, (4) registr mezer. U zdroje si všimněte dvou dat — vydání a poslední kontroly."> %}
Cesta je vždycky stejná, ať jde o kterýkoli dossier:

1. Hlavní stránka dossieru → **přehledová tabulka tvrzení**. Každý řádek má
   svoje `CLM-##`.
2. Klik na identifikátor → **detail tvrzení**: plný text, stav, seznam
   zdrojů, kontext kauzy a vztahy, které se o tvrzení opírají.
3. Klik na `SRC-##` → **stránka zdroje**: vydavatel, datum vydání, datum
   kontroly, odkaz na originál a redakční poznámka.
4. Dlaždice s počty nahoře → **registr mezer**.

Když jste u zdroje našli obě data, všimli jste si nejdůležitější věci
v celém dossieru: **datum vydání** říká, kdy to někdo napsal, **datum
kontroly** kdy se naposledy někdo díval, jestli to ještě platí a jestli
odkaz vůbec žije.
{% </cviceni> %}

{% <kontrola otazka="Kamarád vám pošle odkaz s tím, že „na vomaste.cz je CLM-03, že ten člověk lhal“. Co je na té větě špatně?"> %}
Dvě věci.

Za prvé: `CLM-03` bez uvedení dossieru neznamená nic. Identifikátory jsou
číslované **v rámci jednoho dossieru**, takže `CLM-03` existuje v každém
z nich a pokaždé je to jiné tvrzení. Odkazuje se celou adresou stránky.

Za druhé, a podstatněji: web nikde netvrdí, že někdo lhal. To by byl závěr
o vině. Nanejvýš může mít doložené tvrzení o tom, co dotyčný řekl (stav
citace) a vedle něj jiné doložené tvrzení, které říká něco jiného — a
nechat čtenáře, ať si toho všimne.
{% </kontrola> %}
