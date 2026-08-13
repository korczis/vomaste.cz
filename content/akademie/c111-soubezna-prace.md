+++
title = "C111 — Souběžná práce a worktree"
description = "Pokročilé: jak funguje repozitář, ve kterém pracuje víc lidí nebo instancí najednou."
template = "learning-lesson.html"
weight = 1811

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C111"
level = "claude-code"
estimated_minutes = 9
audience = ["vyvojar", "maintainer"]
objectives = [
  "Vysvětlíte, proč se pracuje ve worktree a ne na hlavní větvi.",
  "Popíšete pravidlo jednoho zapisovatele a co z něj plyne.",
  "Poznáte konflikt v generovaném souboru a víte, že to není chyba.",
]
related_kb = ["koncepty/verzovano-v-gitu.md"]
next = "C112"
+++

Když repozitář zpracovává víc lidí nebo víc instancí najednou, platí
navíc koordinační pravidla. Nejsou složitá, ale nedodržená se projeví
až konfliktem.

## Proč worktree

Git worktree je druhá pracovní kopie téhož repozitáře na jiné větvi.
Umožňuje pracovat na úkolu, aniž by se hlavní kopie přepnula jinam —
a hlavně: na větvi `task/…` **commit nenasazuje web**.

{% <prikaz kind="terminal"  note="Ukáže, kolik kopií je aktivních a na jakých větvích."> %}
git worktree list
{% </prikaz> %}

{% <callout kind="varovani" title="Nový worktree je skoro vždycky ta chybějící věc"> %}
Čerstvá pracovní kopie nemá nainstalované závislosti ani vygenerované
vstupy. Brána v ní spadne na něčem, co jste neměnili — a vypadá to jako
rozbitý repozitář, přestože chybí dva příkazy: instalace závislostí
a spuštění generátorů.
{% </callout> %}

## Jeden zapisovatel

Stejné pravidlo jako u dat: **sdílený soubor má jednoho vlastníka.**
Koordinační tabulku úkolů edituje jediná instance, ta samá, která
merguje a nasazuje. Ostatní hlásí přes sběrnici.

Není to hierarchie, je to prevence: dvě instance, které souběžně píšou
do stejného souboru, vyrobí konflikt, jehož vyřešení stojí víc než
celá koordinace.

{% <prikaz kind="skill"  note="Kdo pracuje na čem, a jestli to koliduje s tím, co chcete dělat."> %}
/coop-status
{% </prikaz> %}

## Konflikt v generovaném souboru

Když dvě větve změní data, oba buildy přegenerují stejné výstupy — a při
slučování se srazí. **To není chyba ani jedné z nich.** Řešení není
ruční slučování výstupu, ale přegenerování z už sloučených dat.

Poznáte to podle toho, že konfliktní soubor je snapshot, přehled nebo
katalog — něco, co nikdo nepsal rukou.

## Překryv se hlásí předem

Nejlevnější okamžik, kdy se dá kolize vyřešit, je **než se začne**.
Nejdražší je po dvou hodinách práce na tomtéž.

{% <kontrola otazka="Chcete upravit dossier, na kterém podle přehledu pracuje jiný úkol. Co uděláte?"> %}
Ohlásíte překryv na sběrnici a dohodnete se, kdo to vezme — než něco
změníte. Souběžná práce na jednom dossieru není zakázaná, ale tichá
souběžná práce končí konfliktem v datech, kde je slučování nejdražší.
{% </kontrola> %}
