+++
title = "C106 — Jak zkontrolovat, co Claude udělal"
description = "Hotovo neznamená správně. Tři nástroje, kterými se to dá ověřit i bez znalosti Gitu."
template = "learning-lesson.html"
weight = 1806

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C106"
level = "claude-code"
estimated_minutes = 9
audience = ["zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Necháte si vysvětlit změny bez znalosti Gitu.",
  "Rozeznáte funkční změnu od generovaného důsledku.",
  "Řeknete, co jediné znamená „hotovo“."
]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "C107"
+++

„Claude to udělal" a „je to správně" jsou dvě různá tvrzení. Druhé se
musí ověřit — a jde to, i když neumíte číst kód.

## 1. Nechte si vysvětlit změny

{% <prikaz kind="prompt"> %}
Vysvětli mi aktuální změny jako netechnickému recenzentovi. Rozliš funkční změnu, obsah, generované soubory, dokumentaci a rizika.
{% </prikaz> %}

Výsledek má rozdělit změny do kategorií. To je celý trik: diff se
čtyřiceti soubory vypadá hrozivě, dokud se neukáže, že třicet devět
z nich je **generovaný důsledek** jedné změny dat.

{% <callout kind="varovani" title="Jedna věc, která se v tom hledá vždycky"> %}
**Generovaný soubor bez odpovídající změny dat.** Když se přegeneroval
výstup, ale vstup se nezměnil, něco nesedí — buď se editovalo na špatném
místě, nebo se změnil generátor. Obojí je nález.
{% </callout> %}

## 2. Podívejte se, jestli tam není něco navíc

Do repozitáře nepatří lokální konfigurace, hesla, dočasné výstupy ani
osobní poznámky. Git nezapomíná: co se jednou commitne, zůstává
v historii, i když se to potom smaže.

{% <prikaz kind="prompt"> %}
Je v těch změnách něco, co tam nepatří?
{% </prikaz> %}

## 3. Spusťte bránu

{% <prikaz kind="terminal"  note="Trvá minuty. Je to jediná věc, která znamená „hotovo“."> %}
npm run build
{% </prikaz> %}

Ne testy. Ne „vypadá to dobře". Ne „prošlo to skoro celé". Brána
kvality skončí buď s nulou, nebo neskončila.

{% <prikaz kind="claude"  note="Totéž, ale s výkladem výsledku: který krok padl, co ta hláška znamená a co s ní."> %}
/build
{% </prikaz> %}

## Co když brána spadne

Padající brána **není překážka, je to informace**. Nejčastější případy:

| Padá na | Znamená obvykle |
|---|---|
| validaci dat | chyba v záznamu; hláška uvádí konkrétní pravidlo |
| paritě generovaného obsahu | někdo editoval výstup místo vstupu |
| katalogu | přibyla schopnost nebo příkaz bez záznamu |
| kotvách | odkaz vede na místo, které v hotovém webu není |
| v novém prostředí | vygenerované vstupy nikdy nevznikly |

Poslední řádek stojí za zapamatování: v čerstvě naklonovaném repozitáři
brána spadne na něčem, co jste neměnili. Není to rozbité — jen se ještě
nic nevygenerovalo.

{% <kontrola otazka="Claude řekne „hotovo, testy prošly“. Je to hotové?"> %}
Ne. Testy pokrývají skripty; brána kvality kontroluje **postavený web** —
kotvy, strojová data, metadata, responzivitu tabulek. Obojí může projít
nezávisle na tom druhém. Hotovo je až `npm run build` s nulou.
{% </kontrola> %}
