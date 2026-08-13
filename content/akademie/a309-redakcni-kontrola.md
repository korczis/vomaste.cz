+++
title = "A309 — Redakční kontrolní seznam"
description = "Kanonický seznam, kterým prochází každý záznam před publikací — a čtyři důvody, pro které se materiál odmítá bez diskuse."
template = "learning-lesson.html"
weight = 1309

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A309"
level = "editorial"
estimated_minutes = 10
audience = ["editor"]
objectives = [
  "Projdete záznam podle kontrolního seznamu ve stálém pořadí.",
  "Odmítnete materiál ze čtyř jasných důvodů bez dohadování.",
  "Rozliší se vám, co kontroluje stroj a co musí člověk.",
]
prerequisites = ["A308"]
related_kb = ["koncepty/zdrojovano.md", "koncepty/procesni-vysledek.md", "koncepty/tretiosoby.md"]
next_route = "@/akademie/a401-nahlaste-chybu.md"
next_label = "A401 — Nahlaste chybu (úroveň Příspěvky)"
+++

Kontrola má pevné pořadí, protože nejdražší chyby se dělají na konci. Když
se první tři body nesplní, zbytek nemá smysl řešit.

{% <seznam id="editor" nadpis="Než to jde ven"> %}
Tvrzení je atomické — jeden ověřitelný fakt
Tvrzení je v rozsahu, který subjekt unese testem veřejného zájmu
Zdroj byl otevřen a přečten, ne převzat z výtahu vyhledávače
Zdroj skutečně dokládá to, co tvrzení říká — ne víc
Datum vydání i datum pořízení jsou vyplněná a správná
Atribuce sedí: kdo co tvrdí, je v textu, ne v trpném rodě
Citace je doslovná; zkrácení je označené a nemění smysl
Nezávislost zdrojů byla ověřena podle původu i vydavatele
Stav odpovídá struktuře dokladů, ne přesvědčivosti tvrzení
Procesní výsledek není podán jako věcné zjištění — u každé zmínky
Třetí osoby: publikuje se minimum, nejmenovaní zůstávají nejmenovaní
Data narození, adresy a soukromé detaily se nepřebírají
Nejistota je viditelná — sporné je sporné, mezera je mezera
Kde doklad nestačí, je mezera, ne opatrná formulace
Validace a build procházejí
{% </seznam> %}

## Čtyři důvody k odmítnutí bez diskuse

1. **Zdroj nebyl otevřen.** Výtah z vyhledávače, druhá ruka nebo výstup
   nástroje bez dohledání původní evidence.
2. **Tvrzení říká víc než doklad.** Nejde o formulační spor — jde o
   nedoložené tvrzení.
3. **Mimo rozsah.** Nová osoba, která neprošla testem veřejného zájmu.
4. **Nepřiměřený osobní údaj.** Datum narození, adresa, rodinné poměry.

U žádného z nich se nevyjednává o míře. Buď se to opraví, nebo to
nejde ven.

{% <callout kind="poznamka" title="Co dělá stroj a co člověk"> %}
Validátor při buildu pochytá mechanické věci: chybějící pole, rozbité
vazby, stav neodpovídající struktuře zdrojů, tabulku rozcházející se se
záznamy, chybějící archivní pokrytí.

Nepozná posun významu ve zkrácené citaci, společného informátora dvou
redakcí, nepřiměřenost osobního údaje ani to, že tvrzení sahá dál než
doklad. **Zelený build proto neznamená, že je záznam v pořádku** — znamená,
že v něm nejsou ty chyby, které jde najít strojem.
{% </callout> %}

{% <kontrola otazka="Přijde příspěvek: dobře doložený, přesně formulovaný, v rozsahu — ale je v něm jméno oznamovatelky, kterou citované zpravodajství nejmenuje. Přispěvatel argumentuje, že je to dohledatelné jinde. Co uděláte?"> %}
Jméno vypustíte a zbytek přijmete.

Argument „je to dohledatelné jinde“ míjí podstatu. Zveřejněním by tenhle
web její jméno **spojil s kauzou na jednom místě** — tedy udělal přesně to,
co citované redakce vědomě neudělaly. Že si to někdo dokáže složit sám,
neznamená, že to má někdo složit za něj.

Postup: jméno pryč, ostatní zůstává, přispěvateli se vysvětlí proč. Ta
oprava je mechanická a nezmenšuje hodnotu příspěvku — v tom je ten případ
snadný.

Těžší je odolat tomu, když je jméno pro pochopení věci zdánlivě
podstatné. I tam platí: pokud ho citované zpravodajství nejmenuje,
nejmenuje ho ani tenhle web.
{% </kontrola> %}
