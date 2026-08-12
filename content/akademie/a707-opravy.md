+++
title = "A707 — Opravy"
description = "Sedm kroků od nahlášení po zveřejněnou opravu. Projekt postavený na kontrolovatelnosti musí mít mechanismus oprav lepší než ostatní."
template = "learning-lesson.html"
weight = 1707

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A707"
level = "governance"
estimated_minutes = 10
audience = ["maintainer", "editor"]
objectives = [
  "Provedete opravu celým řetězem od hlášení po záznam v historii.",
  "Rozhodnete, kdy oprava potřebuje viditelnou poznámku.",
  "Vysvětlíte, proč je dobrý mechanismus oprav podmínkou důvěryhodnosti.",
]
prerequisites = ["A706"]
related_kb = ["koncepty/pravo-opravit.md", "koncepty/verzovano-v-gitu.md", "koncepty/duvera-bez-znacky.md"]
next = "A708"
+++

Web, který slibuje kontrolovatelnost, musí mít **lepší** mechanismus oprav
než ten, kdo nic neslibuje. Jinak je ten slib jen tvrzením o sobě samém.

## Sedm kroků

1. **Hlášení** — formulář, pull request, nebo interní nález.
2. **Zařazení** — o jaký typ chyby jde a jak je závažná.
3. **Ověření** — někdo otevře zdroj a porovná. Nedá se přeskočit ani
   u zjevných věcí.
4. **Oprava** v kanonických datech, ne v generovaném výstupu.
5. **Brána** — validace, testy, sestavení.
6. **Zveřejnění.**
7. **Záznam** — co se změnilo a proč, dohledatelně v historii.

Sedmý krok není administrativa. Je to ta část, která z opravy dělá
doložitelný fakt místo tiché změny.

## Kdy je potřeba viditelná poznámka

**Věcná chyba v publikovaném tvrzení** — ano. Čtenář, který si text
uložil nebo na něj odkázal, se musí dozvědět, že se změnil.

**Chyba stavu** — ano, když se stav měnil směrem dolů. Tvrzení, které
vypadalo jako ověřené a není, je významná změna.

**Překlep, mrtvý odkaz, formulace** — ne. Historie stačí.

{% <callout kind="pravidlo" title="Oprava se nedělá přepsáním historie"> %}
Ani u vážné chyby. Zveřejněná chyba a její oprava jsou legitimní záznam;
přepsaná historie je ztráta jediné vlastnosti, kvůli které se dá webu
věřit bez důvěry k autorovi.

Je to totéž pravidlo, jaké platí pro autorizační log — a platí ze stejného
důvodu.
{% </callout> %}

{% <kontrola otazka="Přijde hlášení, že tvrzení je nepřesné. Po ověření zjistíte, že tvrzení sedí, ale zdroj mezitím článek opravil a teď říká něco jiného. Co s tím?"> %}
Tohle není chyba tvrzení, ale rozpad dokladu — a je to jeden
z nejzáludnějších případů.

Postup:

1. **Zaznamenat, že se zdroj změnil**, a doložit to: archivní kopie
   původního znění, pokud existuje, plus datum, kdy se změna zjistila.
2. **Rozhodnout o tvrzení.** Když je nové znění zdroje s tvrzením
   v rozporu, tvrzení už doložené není — buď se najde jiný doklad, nebo
   se stahuje a zůstává mezera.
3. **Posunout datum kontroly** a poznamenat k tomu, co se stalo.
4. **Zvážit, jestli nejde o opravu chyby na straně vydavatele.** Když
   vydavatel opravil svou chybu, je to informace o věci samé — a možná
   samostatné tvrzení.

Co **nedělat**: nechat tvrzení opřené o odkaz, na kterém už to nestojí.
Čtenář by klikl a našel něco jiného, což je horší než chybějící doklad —
vypadá to jako doložené a není.

Tenhle případ je zároveň nejlepší argument pro archivní kopie.
{% </kontrola> %}
