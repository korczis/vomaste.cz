+++
title = "A204 — Nezávislé potvrzení"
description = "Kdy je druhý zdroj skutečně druhým hlasem. Test nezávislosti, typické falešné dvojice a co dělat, když druhý hlas prostě není."
template = "learning-lesson.html"
weight = 1204

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A204"
level = "research"
estimated_minutes = 12
audience = ["zdroje", "research", "editor"]
objectives = [
  "Aplikujete test nezávislosti na dvojici zdrojů.",
  "Rozpoznáte tři typické falešné dvojice.",
  "Přijmete stav „1 zdroj“ jako legitimní výsledek místo hledání záminky.",
]
prerequisites = ["A203"]
related_kb = ["koncepty/nezavisle-dolozeni.md", "koncepty/stav-overeno-vice-zdroji.md"]
next = "A205"
+++

## Test

Pro dvojici zdrojů si položte jednu otázku:

> **Kdyby se první z nich mýlil, poznalo by se to z druhého?**

Když ano, jsou nezávislé. Když ne, je to jeden hlas se dvěma adresami.

## Tři falešné dvojice

**Přetisk.** Agenturní zpráva a její převzetí. Chyba se šíří beze změny.

**Společný informátor.** Dvě redakce, jeden zdroj uvnitř instituce. Vypadá
to jako dvě zjištění, ale je to jeden člověk — a pozná se to obvykle jen
podle toho, že obě mají tytéž detaily ve stejném pořadí.

**Kruh.** Redakce A napíše zjištění, redakce B ho převezme, redakce A pak
cituje B jako potvrzení. Vzniká dojem dvou nezávislých linií tam, kde je
jedna, která se vrátila.

{% <callout kind="pravidlo" title="Co vynucuje stroj"> %}
Validátor projektu požaduje pro stav „ověřeno více zdroji“ dvojici, která
se liší **rodinou zdrojů i registrovanou doménou vydavatele**. Společného
informátora ani kruh nepozná — na to je člověk. Stroj chytá to
mechanické: přetisky a texty jedné redakce.
{% </callout> %}

## Když druhý hlas není

Tvrzení zůstane na „1 zdroj“. To je legitimní obsah, ne provizorium.

Co se **nesmí** stát: dohledat druhý odkaz, o kterém víte, že je to
přetisk, a použít ho jako druhý hlas. Tím se z poctivého „1 zdroj“ stane
nepravdivé „ověřeno“ — a je to nepravdivé tvrzení webu o vlastní evidenci,
což je horší než nedoložené tvrzení o někom třetím.

{% <kontrola otazka="Dvě redakce popisují tutéž věc s odlišnými detaily a obě uvádějí „podle zdroje obeznámeného s vyšetřováním“. Nezávislé, nebo ne?"> %}
**Nevíte to** — a to je celá odpověď.

Odlišné detaily napovídají, že si každá redakce mluvila s někým jiným nebo
si přidala vlastní ověřování. Stejná anonymní formulace ale připouští, že
je to tentýž člověk, který obvolal dvě redakce.

Postup: **nepovyšovat**. Stav zůstane „1 zdroj“ a do redakční poznámky
u zdroje se napíše, co přesně je nejasné — že obě redakce se odvolávají na
nejmenovaný zdroj a nezávislost proto nelze ověřit.

Tohle je typický případ, kdy poznámka u zdroje udělá víc práce než stav:
příště nikdo neztratí čtvrt hodiny znovuobjevováním téhož.
{% </kontrola> %}
