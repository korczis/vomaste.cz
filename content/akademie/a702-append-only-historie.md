+++
title = "A702 — Append-only historie"
description = "Autorizační log se nikdy neupravuje, jen doplňuje. Proč je to nepřekročitelné a co to znamená pro opravy a překlepy."
template = "learning-lesson.html"
weight = 1702

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A702"
level = "governance"
estimated_minutes = 9
audience = ["maintainer"]
objectives = [
  "Vysvětlíte, proč se existující záznam neupravuje ani kvůli překlepu.",
  "Popíšete, jak se zaznamená změna rozhodnutí.",
  "Víte, že append-only je i strojově kontrolované.",
]
prerequisites = ["A701"]
related_kb = ["koncepty/verzovano-v-gitu.md", "koncepty/autorizace.md"]
next = "A703"
+++

Autorizační log je chronologický záznam toho, co bylo kdy schváleno.
Existující záznam se **neupravuje, nepřepisuje, nepřesouvá ani nemaže** —
ani kvůli překlepu, ani kvůli „ujasnění formulace“.

## Proč tak přísně

Log není dokumentace aktuálního stavu. Je to **záznam rozhodnutí v čase**.

Když se upraví starý záznam, aby odpovídal dnešní praxi, zmizí informace,
že se praxe změnila — a zůstane dojem, že to tak bylo vždycky. Přesně
takový záznam pak neplní jedinou funkci, kterou má: doložit, co bylo
schváleno **tehdy**.

Překlep ve starém záznamu je nesrovnatelně menší problém než záznam,
u kterého se neví, jestli ho někdo nezměnil.

## Jak se mění rozhodnutí

**Novým datovaným záznamem na konci.** Ten může předchozí rozhodnutí
zúžit, rozšířit i zrušit — a je z něj vidět, kdy a proč se to stalo.

Ruší-li nové rozhodnutí staré, zůstávají obě. Historie je posloupnost, ne
aktuální stav.

{% <callout kind="pravidlo" title="Kontrolované strojově"> %}
Append-only není jen zvyk: samostatná kontrola v bráně hlásí upravený nebo
odstraněný dřívější záznam.

Poctivá poznámka o jejích hranicích — chytá změnu existujícího záznamu.
Nenahrazuje pravidlo, že se nový záznam přidává jen na základě skutečného
rozhodnutí, ani úsudek o tom, co do něj patří.
{% </callout> %}

{% <kontrola otazka="Ve dva měsíce starém autorizačním záznamu je věcná chyba — je v něm špatné datum události. Co s tím?"> %}
Nechat, přidat nový záznam.

Původní záznam dokládá, **co bylo schváleno a v jakém znění**. To zůstává
pravda i s tou chybou: rozhodnutí padlo na základě té formulace, ne té
opravené.

Přidá se nový datovaný záznam, který uvádí správné datum a odkazuje na
původní. Čtenář pak vidí obojí — rozhodnutí i jeho opravu — a v jakém
pořadí to bylo.

Zní to formalisticky, ale zvažte alternativu: kdyby se staré záznamy
opravovaly, nikdo by nemohl tvrdit, že log ukazuje, co bylo schváleno.
A jediná hodnota toho logu je, že to tvrdit může.

Totéž pravidlo platí pro publikované chyby: opravují se novou změnou, ne
přepsáním historie.
{% </kontrola> %}
