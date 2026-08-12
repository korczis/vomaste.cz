+++
title = "A704 — Evoluce schémat"
description = "Jak přidat pole do datového modelu, aniž byste rozbili existující data — a proč jsou tři místa, která musí souhlasit."
template = "learning-lesson.html"
weight = 1704

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A704"
level = "governance"
estimated_minutes = 10
audience = ["maintainer", "vyvojar"]
objectives = [
  "Přidáte pole tak, aby prošlo všemi třemi místy kontraktu.",
  "Rozliší se vám změna zpětně kompatibilní od nekompatibilní.",
  "Víte, kdy změna vyžaduje novou verzi kontextu.",
]
prerequisites = ["A703"]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "A705"
+++

## Tři místa, která musí souhlasit

1. **Kanonické schéma.** Schémata mají zakázané neznámé klíče, takže nové
   pole bez záznamu neprojde. To je funkce, ne překážka.
2. **Sestavovač pohledových modelů**, aby se pole dostalo k šablonám.
3. **Konzument** — šablona nebo export, který pole opravdu použije.

Pole, které nikdo nečte, i pole v šabloně bez pokrytí ve schématu jsou
obojí **nedodělaná změna**.

## Kompatibilní a nekompatibilní

**Kompatibilní** — nepovinné pole s výchozí hodnotou, nová volitelná
hodnota v číselníku, upřesnění popisu. Existující data zůstávají platná.

**Nekompatibilní** — nové povinné pole, zúžení číselníku, změna významu
existujícího pole, přejmenování. Existující data přestanou být platná
nebo, což je horší, zůstanou platná a začnou znamenat něco jiného.

{% <callout kind="varovani" title="Nejhorší změna je tichá změna významu"> %}
Pole `retrieved` znamená „kdy byl zdroj otevřen“. Kdyby někdo začal
zapisovat „kdy byl záznam upraven“, schéma to nepozná — typ i formát sedí.

Rozejdou se jen data: část souborů bude znamenat jedno a část druhé, a
z toho se nedá zjistit, která je která.

Proto se u významových změn mění **název pole**, ne jeho obsah. Přejmenování
je nekompatibilní, a to je dobře — donutí projít existující data.
{% </callout> %}

## Postup nekompatibilní změny

1. Přidat nové pole jako nepovinné.
2. Naplnit ho ve všech existujících záznamech.
3. Teprve pak ho udělat povinným.
4. Odstranit staré, když ho nic nečte.

Každý krok je zeleně sestavitelný stav. Nikdy se nedělá 1 a 3 najednou.

{% <kontrola otazka="Chcete zúžit číselník stavů tvrzení — zrušit jednu hodnotu, protože se nepoužívá. Co ověřit dřív?"> %}
Že se opravdu nepoužívá — v datech, a to ve **všech** dossierech, ne jen
v těch, které máte otevřené.

Pak, a to se přehlíží nejčastěji, ověřit **konzumenty**: šablony
zobrazující popisek stavu, styly, exporty, cvičení ve vzdělávací vrstvě
a validátory, které se na ten stav odkazují.

A nakonec otázka, která je vlastně první: **je to jen odklizení, nebo
změna významu?** Když se hodnota nepoužívá, protože se přestala používat,
je to úklid. Když se nepoužívá, protože ji nahradila jiná, je to změna
taxonomie stavů — a ta se dotýká toho, co web o svých datech tvrdí.

Druhý případ není schématická úprava. Je to redakční rozhodnutí, které se
zapisuje, a promítá se i do konceptů a výuky.
{% </kontrola> %}
