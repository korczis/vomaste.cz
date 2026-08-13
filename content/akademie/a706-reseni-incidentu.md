+++
title = "A706 — Řešení incidentu"
description = "Když je publikované něco, co tam nemělo být: postup podle závažnosti, a proč se nikdy nepřepisuje historie."
template = "learning-lesson.html"
weight = 1706

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A706"
level = "governance"
estimated_minutes = 11
audience = ["maintainer", "editor"]
objectives = [
  "Zařadíte incident podle závažnosti a zvolíte odpovídající rychlost.",
  "Odstraníte problematický obsah, aniž byste zahladili stopu.",
  "Poznáte incident, který nejde plně napravit, a co s ním.",
]
prerequisites = ["A705"]
related_kb = ["koncepty/pravo-opravit.md", "koncepty/bezpecnostni-hranice.md", "koncepty/verzovano-v-gitu.md"]
next = "A707"
+++

## Tři stupně

**Vysoký** — publikované nedoložené tvrzení o konkrétním člověku,
nepřiměřený osobní údaj, jmenovaná osoba, kterou zdroje nejmenují, nebo
materiál, který se do veřejného repozitáře neměl dostat vůbec.
→ **Odstranit hned**, analyzovat potom.

**Střední** — věcná chyba v doloženém tvrzení, špatný stav, procesní
výsledek podaný jako věcný závěr.
→ Opravit v běžném rytmu, ale přednostně.

**Nízký** — mrtvý odkaz, překlep, formulační nepřesnost.
→ Běžná fronta.

## Postup u vysokého stupně

1. **Odstranit** problematický obsah z kanonických dat a nasadit.
2. **Zaznamenat**, co se stalo a kdy — ne mazat stopu.
3. **Zjistit, jak to prošlo.** Která brána to měla chytit a proč
   nechytila.
4. **Doplnit kontrolu**, pokud šlo o chybu, kterou lze najít strojem.
5. **Zapsat poučení**, pokud šlo o věc, na kterou stroj nestačí.

{% <callout kind="varovani" title="Některý incident nejde vzít zpět"> %}
Když se do veřejného repozitáře dostane materiál, který tam neměl být,
odstranění ze současného stavu **nestačí** — zůstává v historii a
v klonech, které si mezitím někdo udělal.

To je důvod, proč je pravidlo o nevkládání citlivého materiálu
kategorické a proč se neřeší až při revizi. Neexistuje k němu opravný
postup, jen prevence.
{% </callout> %}

## Co se nedělá nikdy

**Nepřepisuje se historie.** Ani u incidentu. Projekt stojí na tom, že
historie je dohledatelná; přepsaná historie znamená, že to už neplatí —
a to je větší škoda než původní chyba.

**Nemlčí se o opravě.** Oprava je legitimní záznam. Tichá změna vypadá
jako by chyba nikdy nebyla, a to je forma nepravdy.

{% <kontrola otazka="Zjistíte, že publikované tvrzení jmenuje osobu, kterou citovaný zdroj nejmenuje. Co uděláte v prvních deseti minutách?"> %}
Odstraníte jméno a nasadíte. Analýza počká.

Konkrétně: úprava kanonického záznamu (a přehledové tabulky, jde-li
o tvrzení), brána, nasazení. Tvrzení samo nejspíš zůstane — jen bez toho
jména, protože bez něj je pořád doložené.

Až potom tři otázky:

1. **Jak se to jméno do záznamu dostalo?** Nejčastěji tak, že ho uváděl
   jiný zdroj a někdo identitu složil ze dvou míst. To je vlastní
   pojmenovaná chyba, ne nepozornost.
2. **Není stejná chyba jinde?** Zkontrolovat záznamy ze stejné dávky.
3. **Šlo by to chytit strojem?** Většinou ne — je to posouzení obsahu.
   Pak je správným výstupem záznam poučení a položka v redakční kontrole,
   ne nová brána, která nic nezachytí.

Co se neděje: diskuse o tom, jestli je jméno „stejně dohledatelné“. To
není kritérium a odpověď je vždycky stejná — když ho zdroje neuvádějí,
neuvádí ho ani tenhle web.
{% </kontrola> %}
