+++
title = "A703 — Redakční politika"
description = "Osm pravidel, která platí pro každý publikovaný záznam bez výjimky, a devět bran, kterými musí projít, než se stane veřejným."
template = "learning-lesson.html"
weight = 1703

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A703"
level = "governance"
estimated_minutes = 11
audience = ["maintainer", "editor"]
objectives = [
  "Vyjmenujete redakční pravidla platná bez výjimky.",
  "Ověříte záznam proti devíti publikačním bránám.",
  "Poznáte, kdy je pravidlo v konfliktu s atraktivnějším příběhem — a co pak.",
]
prerequisites = ["A702"]
related_kb = ["koncepty/zdrojovano.md", "koncepty/fakt-oddelene-od-nazoru.md", "koncepty/procesni-vysledek.md", "koncepty/tretiosoby.md"]
next = "A704"
+++

## Osm pravidel

1. **Každé faktické tvrzení má jmenovaný, důvěryhodný, nezávislý a
   datovaný zdroj s přímým odkazem.** Co se nedá doložit, se vypustí.
2. **Citace jsou označené a připsané** — nikdy přeformulované tak, že
   vyznějí jako vlastní hodnocení webu.
3. **Procesní výsledky se odlišují od věcných zjištění při každé
   zmínce**, ne jednou v poznámce.
4. **Komentář je označený jako komentář** a strukturálně oddělený od
   faktických tvrzení.
5. **Nejmenované třetí osoby zůstávají nejmenované** — vždy.
6. **Mezery v pokrytí se uvádějí výslovně**, místo aby se předstírala
   úplnost.
7. **Web nerozhoduje o vině** a nepřijímá tvrzení jedné strany za fakt
   jen proto, že je hlasitější nebo se lépe píše.
8. **Kde zdroje mlčí, nespekuluje se** — to patří do registru mezer.

## Devět publikačních bran

Jmenovaný doklad · provenance · věrný stav · žádná vina z grafu ·
nezávislost zdrojů · minimalizace údajů · přiměřenost vůči třetím osobám ·
přezkoumatelná změna · deterministické sestavení.

Podrobně jsou v [A308](@/akademie/a308-rozsah-a-autorizace.md).

{% <callout kind="pravidlo" title="Pravidla nemají výjimku pro lepší příběh"> %}
Nejsilnější tlak nepřichází zvenčí. Přichází ze situace, kdy je materiál
zajímavý, souvislost působí zjevně a chybí k ní jen kousek dokladu.

Odpověď je vždycky stejná: publikuje se doložená část, zbytek je mezera.
Ne proto, že je to opatrné — proto, že jinak by se pravidla vztahovala jen
na nudné případy, a tím by přestala platit.
{% </callout> %}

## Kde je co závazné

| Vrstva | Co vlastní |
|---|---|
| Pravidla repozitáře | závazné znění pro obsah a rozsah |
| Konstituce projektu | nepodkročitelné invarianty platformy |
| Koncepty | kanonické definice pojmů pro čtenáře |
| Akademie a Bootcamp | výuka a aplikace, žádné vlastní definice |

Když se výuka rozejde s pravidly, platí pravidla — a výuka je chyba
k opravě.

{% <kontrola otazka="Máte doložené, že dvě firmy mají stejnou sídelní adresu a stejného jednatele. Můžete napsat, že jsou propojené?"> %}
Můžete napsat **oba ty fakty**. „Propojené“ ne — a rozdíl není
stylistický.

Doložené je: obě firmy mají zapsané totéž sídlo a téhož jednatele. To jsou
dva evidenční údaje, oba ověřitelné.

„Propojené“ je závěr o povaze vztahu, který registr netvrdí. A hlavně
naráží na bránu **žádná vina z grafu**: společná adresa, společný
zaměstnavatel nebo firemní vazba samy o sobě nezakládají vliv, koordinaci
ani odpovědnost.

Napište obě fakta vedle sebe. Čtenář si všimne — a to je právě ten rozdíl:
souvislost, kterou si udělá čtenář z doložených fakt, je jeho úsudek.
Souvislost, kterou napíšete vy, je tvrzení webu, a to potřebuje doklad.
{% </kontrola> %}
