+++
title = "03 — Nezávislost a rodiny zdrojů"
description = "Čtyři zdroje, jedna past. Naučte se počítat nezávislé linie evidence místo odkazů — nejdůležitější dovednost celého kurzu."
template = "learning-lesson.html"
weight = 130

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B03"
estimated_minutes = 15
audience = ["zdroje", "research", "editor"]
objectives = [
  "Spočítáte nezávislé linie evidence v grafu zdrojů, ne odkazy.",
  "Poznáte podle textu, že jde o přetisk agenturní zprávy.",
  "Vysvětlíte, proč dva texty jedné redakce nejsou dva hlasy.",
]
prerequisites = ["B02"]
related_kb = ["koncepty/nezavisle-dolozeni.md", "koncepty/stav-overeno-vice-zdroji.md"]
next = "B04"
+++

Tohle je nejdůležitější lekce v Bootcampu. Když si z celého kurzu
odnesete jen ji, bude to stát za to.

## Past

Informace se šíří kopírováním. Jedna tisková zpráva se během dvou hodin
objeví na patnácti webech. Kdo počítá odkazy, napočítá patnáct potvrzení.
Ve skutečnosti má **jedno**, jen patnáctkrát opsané.

Web tomu říká **rodina zdrojů**: skupina textů, které mají společný původ.
Pojmenovává se podle původu, ne podle vydavatele — agenturní zpráva
přetištěná pěti deníky patří pořád do rodiny té agentury.

## Úloha

{% <cvicna_data> %}
```text
SRC-A   tisková zpráva města Bukov              (2026-03-02)
   │
   ├──> SRC-B   Bukovský deník                  (2026-03-02)   přebírá SRC-A
   └──> SRC-C   Zpravodaj Podhůří               (2026-03-03)   přebírá SRC-A

SRC-D   Redakce Přehled — vlastní zjištění
        z veřejného registru smluv              (2026-04-11)
```
{% </cvicna_data> %}

{% <cviceni zadani="Kolik nezávislých linií evidence tady je? A stačí to na stav „ověřeno více zdroji“?"> %}
**Dvě linie.**

- `SRC-A`, `SRC-B` a `SRC-C` jsou **jedna** — tisková zpráva a dva její
  přetisky. Tři adresy, tři vydavatelé, jeden původ.
- `SRC-D` je **druhá** — vlastní dohledání primárního dokumentu, na
  tiskové zprávě nezávislé.

Na stav „ověřeno více zdroji“ to **stačí**, protože existuje dvojice, která
se liší původem i vydavatelem: `SRC-A` (nebo kterýkoli jeho přetisk) a
`SRC-D`.

Kdyby `SRC-D` neexistoval, byly by tam pořád tři zdroje — a stav by musel
zůstat „1 zdroj“. Počet odkazů se stavu vůbec netýká.
{% </cviceni> %}

{% <callout kind="pravidlo" title="Vynucené strojově, ne kázní"> %}
Tohle nehlídá jen redakční svědomí. Validátor při buildu odmítne označit
tvrzení za ověřené více zdroji, dokud mezi jeho zdroji nenajde dvojici,
která se liší **rodinou i vydavatelem**. Dva texty téže redakce jsou jeden
hlas, i kdyby měly různé autory a různé rodiny.
{% </callout> %}

## Jak převzatý text poznat

- **Věta „Zdroj: ČTK“** nebo obdobná v patičce.
- **Doslovně shodné odstavce** ve dvou článcích.
- **Stejné formulace jako v tiskové zprávě**, včetně přívlastků.
- **Žádná vlastní citace** — nikdo si nikoho nezavolal.
- **Publikováno v řádu minut** po jiném textu.

{% <kontrola otazka="Dva články o téže věci vyšly ve stejné redakci, jeden v pondělí, druhý ve čtvrtek. Druhý přidává nová zjištění a nové citace. Jsou to dva nezávislé hlasy?"> %}
Ne. Nezávislost se posuzuje i podle **vydavatele**, a ten je stejný.

Zní to přísně, protože ta čtvrteční práce byla skutečná. Důvod je ale
praktický: když se redakce v pondělí splete, ve čtvrtek na tom nejspíš
staví dál. Chyba se uvnitř jednoho domu neopraví sama — a přesně proti
tomuhle riziku má nezávislé potvrzení chránit.

Čtvrteční článek je pořád cenný: přidává detail, citace a čas. Jen z něj
nevzniká druhá nezávislá linie.
{% </kontrola> %}
