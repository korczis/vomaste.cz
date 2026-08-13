+++
title = "09 — Claude Code: orientace"
description = "Spusťte diagnostiku a rozcestník. Cílem není nic změnit — cílem je zjistit, kde jste a co smíte."
template = "learning-lesson.html"
weight = 190

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B09"
estimated_minutes = 10
audience = ["zdroje", "research", "editor", "vyvojar"]
prerequisites = ["B00"]
objectives = [
  "Zjistíte, jestli má vaše prostředí šanci fungovat.",
  "Necháte se nasměrovat, aniž byste znali názvy schopností.",
  "Poznáte na výstupu, které operace nic nemění.",
]
related_kb = ["koncepty/co-je-dossier.md"]
next = "B10"
+++

Tahle lekce se poprvé odehrává **v terminálu**, ne v prohlížeči.
Potřebujete naklonovaný repozitář a nainstalovaný Claude Code. Nic
z toho, co uděláte, nic nezmění.

## Krok 1 — spusťte diagnostiku

{% <prikaz kind="claude" note="Nic neopravuje. Jen zjišťuje a navrhuje."> %}
/diagnose
{% </prikaz> %}

Přečtěte si výstup a najděte v něm tři věci: **na jaké jste větvi**, jestli
něco **chybí**, a co je **další krok**.

{% <cviceni zadani="Výstup hlásí WARN „chybí vygenerované vstupy“. Je repozitář rozbitý?"> %}
Ne. Znamená to jen, že generátory ještě nikdy neběžely — typicky
v čerstvě naklonovaném repozitáři. Brána kvality by na tom spadla na
něčem, co jste neměnili, což vypadá jako porucha a není.

Oprava je jeden příkaz, který diagnostika sama uvádí.
{% </cviceni> %}

## Krok 2 — zeptejte se, aniž byste znali názvy

{% <prikaz kind="prompt" note="Bez lomítka. Tohle je legitimní způsob, jak s nástrojem mluvit."> %}
Nevím, co dál. Chci si jen prohlédnout, jak je projekt postavený.
{% </prikaz> %}

Odpověď má obsahovat **jednu doporučenou věc**, její **riziko**, a totéž
řečené přirozeně. Ne seznam čtyřiceti možností.

## Krok 3 — přečtěte si riziko

U doporučené schopnosti najděte úroveň rizika. Pro tuhle lekci má být
**jen čte**.

{% <callout kind="pravidlo" title="Proč se riziko čte předem"> %}
Není to formalita. „Jen čte" znamená, že to můžete pustit naslepo
a nejhorší, co se stane, je ztracená minuta. „Vyžaduje review" znamená,
že se něco změní v obsahu a bude to muset někdo posoudit.

Rozdíl se pozná **před** spuštěním, ne po něm.
{% </callout> %}

## Krok 4 — prohlídka

{% <prikaz kind="claude"> %}
/project-tour
{% </prikaz> %}

Najděte v odpovědi, **kde jsou kanonická data** a **kde jsou generované
stránky**. Ta dvojice je nejdůležitější věc z celého Bootcampu pro
technickou práci — a další lekce na ní stojí.

{% <kontrola otazka="Diagnostika hlásí FAIL a vy nevíte, co dál. Je to problém?"> %}
Ne. FAIL s uvedenou opravou je ta nejlepší možná odpověď — víte přesně,
co chybí. Problém by byl opačný případ: prostředí, které nefunguje,
a nástroj, který tvrdí, že je všechno v pořádku.
{% </kontrola> %}
