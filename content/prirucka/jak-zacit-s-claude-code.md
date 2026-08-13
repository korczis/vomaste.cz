+++
title = "Jak začít s Claude Code"
description = "Od naklonovaného repozitáře k první bezpečné práci: co nainstalovat, co spustit a jak poznat, že je prostředí v pořádku."
template = "learning-lesson.html"
weight = 2410

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "postup"
estimated_minutes = 6
audience = ["zdroje", "research", "editor", "vyvojar"]
+++

Nejkratší cesta od nuly k tomu, že vás repozitář sám navede.

## Co je potřeba

Git, Node a Claude Code. Nic dalšího si předem nestahujte — co bude
chybět, řekne diagnostika.

## Postup

**1. Naklonujte repozitář a nainstalujte závislosti.**

{% <prikaz kind="terminal"> %}
npm ci
{% </prikaz> %}

**2. Vygenerujte vstupy.** Čerstvý klon je nemá — nejsou v Gitu, protože
vznikají z dat.

{% <prikaz kind="terminal" note="Bez tohohle spadne brána na něčem, co jste neměnili."> %}
npm run generate:all
{% </prikaz> %}

**3. Spusťte Claude Code** v adresáři repozitáře.

{% <prikaz kind="terminal"> %}
claude
{% </prikaz> %}

**4. Ověřte prostředí.**

{% <prikaz kind="claude" note="Nic nemění. Vypíše PASS / WARN / FAIL a u každého problému konkrétní opravu."> %}
/diagnose
{% </prikaz> %}

**5. Nechte se nasměrovat.**

{% <prikaz kind="claude" note="Určí roli, přečte závazná pravidla a skončí třemi konkrétními kroky a jedním bezpečným úkolem."> %}
/bootstrap
{% </prikaz> %}

## Když nevíte, co dál

{% <prikaz kind="claude"> %}
/guide
{% </prikaz> %}

Nebo prostě popište, co chcete — názvy schopností znát nemusíte:

{% <prikaz kind="prompt"> %}
Mám článek a nevím, co s ním.
{% </prikaz> %}

## Časté zádrhely

| Projev | Co to znamená |
|---|---|
| brána padá na něčem, co jste neměnili | chybí vygenerované vstupy — krok 2 |
| „příkaz neexistuje" | ověřte ho v katalogu příkazů; nevymýšlejte variantu |
| změna po buildu zmizela | editoval se generovaný soubor místo kanonického |
| Claude se ptá na povolení | rozhodujete vy; u zápisu se vyplatí nejdřív plán |

## Co si zapamatovat

**Hotovo znamená jednu věc:** `npm run build` skončí s návratovým kódem
nula. Ne „testy prošly", ne „vypadá to dobře".

A **výstup Claude Code není zdroj.** Může najít, otevřít, porovnat
a uspořádat — citace pak míří na původní materiál, ne na nástroj.
