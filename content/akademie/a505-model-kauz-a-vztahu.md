+++
title = "A505 — Model kauz a vztahů"
description = "Kauza jako kotva v čase a vztah jako hrana grafu. Proč detail kauzy neduplikuje text a proč se hloubka grafu počítá, nikdy neukládá."
template = "learning-lesson.html"
weight = 1505

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A505"
level = "data"
estimated_minutes = 10
audience = ["vyvojar", "maintainer"]
objectives = [
  "Popíšete, proč záznam kauzy neobsahuje plný narativ.",
  "Vysvětlíte, co je a co není hrana ve vztahovém grafu.",
  "Zdůvodníte, proč se hloubka grafu počítá při sestavení.",
]
prerequisites = ["A504"]
related_kb = ["koncepty/registr-kauz.md", "koncepty/strojove-citelna-data.md"]
next = "A506"
+++

## Kauza

Záznam v `…/cases/case-NN.json` nese kotvu, období, název, stav, popisek,
krátké shrnutí a subjekty. **Nenese plný narativ.**

Detail kauzy odkazuje zpět na kanonickou prózu na hlavní stránce dossieru.
Důvod je věcný, ne úsporný: nejcitlivější texty — obvinění, procesní
výsledky — mají existovat na **jednom** editovatelném místě. Kdyby byly
dvakrát, jedna kopie by se dřív nebo později opravila a druhá ne.

## Vztah

Vztah je hrana mezi dvěma entitami, doložená stejně jako tvrzení: má
zdroje a je z ní vidět, o co se opírá.

{% <callout kind="pravidlo" title="Vazba není zjištění o jednání"> %}
Společný zaměstnavatel, společná adresa, účast na téže akci ani firemní
propojení samy o sobě nezakládají vliv, koordinaci ani odpovědnost.

Graf ukazuje **co je doloženo**, ne co z toho někdo vyvozuje. Formulace
hrany to musí respektovat — „jednatel firmy X“ ano, „napojený na“ ne.
{% </callout> %}

## Hloubka se počítá, neukládá

Vzdálenost uzlu od subjektu dossieru je **odvozená hodnota**: počítá se
při sestavení prohledáváním grafu do šířky ze subjektových uzlů.

Kdyby byla uložená v datech, byla by to čtvrtá reprezentace téhož, která
se rozejde při první změně hrany. Obecné pravidlo, které platí v celém
modelu: **co se dá spočítat, se počítá.** Uložené je jen to, co je
rozhodnutím — jako `subjects` u tvrzení.

Ze stejného důvodu se nikde neukládají počty záznamů, které vidíte na
dlaždicích.

{% <kontrola otazka="Chcete do grafu přidat hranu „byli spolu na jednání“. Co musíte doložit a jak ji pojmenovat?"> %}
Doložit musíte **totéž co u tvrzení**: jmenovaný, datovaný, otevřený
zdroj, ze kterého vyplývá, že se ta věc stala.

Pojmenování je ta těžší část. „Byli spolu na jednání“ je v pořádku, pokud
to zdroj takhle uvádí — je to popis události.

Co v pořádku není: přeložit tutéž hranu na „má vazby na“, „je napojen na“
nebo „spolupracuje s“. Ty formulace tvrdí trvalý vztah a nějakou míru
souhry, a to z jedné doložené schůzky neplyne.

Praktický test: **dala by se hrana pojmenovat tak, aby s ní souhlasily obě
strany?** Účast na jednání ano. „Napojení“ ne — a to je signál, že
formulace nese hodnocení, ne fakt.
{% </kontrola> %}
