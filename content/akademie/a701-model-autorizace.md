+++
title = "A701 — Model autorizace"
description = "Jak se rozhoduje, koho projekt smí pokrývat: stálý rozsah, test veřejného zájmu a hranice, kterou hlídá i stroj."
template = "learning-lesson.html"
weight = 1701

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A701"
level = "governance"
estimated_minutes = 12
audience = ["maintainer", "editor"]
objectives = [
  "Popíšete, co pokrývá stálý rozsah a co z něj vypadává.",
  "Vysvětlíte, proč se objevování a publikování řídí jinak.",
  "Poznáte, kterou část hranice hlídá stroj a kterou člověk.",
]
related_kb = ["koncepty/autorizace.md", "koncepty/tretiosoby.md", "koncepty/bezpecnostni-hranice.md"]
next = "A702"
+++

## Stálý rozsah

Dřív potřeboval každý subjekt vlastní schvalovací kolo. Dnes platí stálý
rozsah, který pokrývá:

- veřejné funkcionáře a politicky exponované osoby v souvislosti s jejich
  veřejnou rolí,
- kandidáty na veřejné funkce a vysoké úředníky, jejichž rozhodnutí,
  jmenování, veřejné peníze nebo regulační pravomoc zakládají veřejný
  zájem,
- právnické osoby napojené na veřejné peníze, zakázky, veřejnou moc,
  regulovanou činnost nebo už pokrývanou kauzu,
- ostatní osoby **jen tam**, kde konkrétní veřejný zájem doloží
  publikovaná reportáž, úřední záznam nebo primární dokument.

Rozšířený rozsah mění, **koho lze zpracovat**. Nemění, **co lze
publikovat** — publikační brány platí beze změny.

## Rekurze a její zastavovací podmínka

Z pokrytého subjektu se dá jít po doložených vazbách dál a objevený uzel
povýšit na samostatný subjekt, a z něj pokračovat. Zastavuje to test
veřejného zájmu: **subjektem se stává jen uzel, který jím projde sám za
sebe.**

Soukromé osoby, jmenovci a třetí strany zůstávají kontextem.

{% <callout kind="pravidlo" title="Objevování je volné, publikování ne"> %}
Zaznamenat, že vazba existuje v registru nebo v už citovaném zdroji, je
volné a nepotřebuje rozhodnutí. Vzniká z toho kontextová entita bez
jediného tvrzení.

Napsat o někom tvrzení nebo mu otevřít dossier je publikační akt.

Když si nejste jisti, ve které z těch dvou činností jste, jste ve druhé.
{% </callout> %}

## Co hlídá stroj

Strukturální pojistku, ne úsudek: kontextová entita nesmí potichu získat
roli subjektu, povolený dossier ani stav „autorizováno“. Povýšení je
viditelná změna, ne vedlejší efekt.

Test veřejného zájmu stroj nedělá a dělat nemůže. Ten je na člověku.

{% <callout kind="varovani" title="Zamítnutí je taky rozhodnutí a zůstává zapsané"> %}
Když se rozhodne, že někdo subjektem nebude, zapíše se to i s důvodem.
Jinak by se táž otázka otevírala znovu a jednou by prošla — ne proto, že
by se změnily důvody, ale proto, že by si na ně nikdo nevzpomněl.
{% </callout> %}

{% <kontrola otazka="Automatický běh najde patnáct firem navázaných na pokrytý subjekt. Které z nich smí dostat vlastní dossier?"> %}
Bez dalšího posouzení **žádná**.

Nález zakládá patnáct **kontextových entit**: vazba z rejstříku je
evidenční fakt a ten se zaznamenat smí. Žádná z nich tím ale neprošla
testem veřejného zájmu.

Vlastní dossier smí dostat ta, u které se doloží konkrétní veřejný zájem
— veřejné peníze, veřejná zakázka, regulovaná činnost, veřejná moc. To je
rozhodnutí, které dělá člověk nad konkrétním případem, ne pravidlo, které
by šlo aplikovat na celou dávku.

A i pak platí, že **automatika nesmí povýšení provést sama**: smí
připravit kandidáty, ale mezi kandidátem a publikací stojí přezkoumatelný
rozdíl, který někdo schválí. To je poslední pojistka celého modelu.
{% </kontrola> %}
