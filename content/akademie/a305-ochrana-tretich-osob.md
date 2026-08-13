+++
title = "A305 — Ochrana třetích osob"
description = "Kdo se ve zdroji objeví, nestává se tím subjektem. Pravidla minimalizace údajů a proč dohledatelnost není důvod ke zveřejnění."
template = "learning-lesson.html"
weight = 1305

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A305"
level = "editorial"
estimated_minutes = 12
audience = ["editor", "research"]
objectives = [
  "Rozliší se vám subjekt, kontextová entita a osoba, která se neuvádí vůbec.",
  "Publikujete minimum údajů, které tvrzení unese.",
  "Odoláte argumentu „vždyť je to dohledatelné“.",
]
prerequisites = ["A304"]
related_kb = ["koncepty/tretiosoby.md", "koncepty/bezpecnostni-hranice.md", "koncepty/autorizace.md"]
next = "A306"
+++

## Tři různé role

**Subjekt** — osoba, o které web vede dossier. Prošla testem veřejného
zájmu **sama za sebe**.

**Kontextová entita** — osoba nebo firma, u které je zaznamenáno, že vazba
existuje. Nenese jediné tvrzení. Vzniká z veřejné evidence nebo z citovaného
zpravodajství a nepotřebuje k tomu zvláštní rozhodnutí.

**Neuváděná osoba** — někdo, jehož jméno k dokládanému tvrzení není
potřeba. Neuvádí se, i když je ve zdroji.

Hranice mezi první a druhou rolí je nejdůležitější v celém projektu.
Povýšení kontextové entity na subjekt je publikační rozhodnutí, ne
technický krok — hlídá to i validátor.

## Minimalizace

Publikuje se **minimum, které tvrzení dokládá**. Konkrétně se nikdy
nepřebírá:

- datum narození,
- adresa bydliště,
- rodné číslo a podobné identifikátory,
- informace o dětech a soukromém rodinném životě,
- zdravotní údaje,
- cokoli, co by mohlo identifikovat zdroj informace.

To, že jsou tyhle údaje ve veřejném rejstříku, znamená jen, že jsou
v rejstříku.

{% <callout kind="varovani" title="„Vždyť je to dohledatelné“"> %}
Nejčastější argument a nejslabší. Rozdíl mezi „dá se to najít, když víte
kde“ a „je to na jedné stránce vedle jména a kauzy“ je celý rozdíl mezi
evidencí a profilem.

Publikováním se údaj **agreguje** a **kontextualizuje** — a to je nový
zásah, ne zopakování starého.
{% </callout> %}

## Nejmenovaní ve zdroji

Když citované zpravodajství někoho nejmenuje, tenhle web ho nejmenuje
také. Nikdy se neskládá identita z víc zdrojů proto, že to jde.

Platí to i tehdy, kdy je jméno „veřejným tajemstvím“. Rozdíl mezi tím, co
se ví, a tím, co je napsané vedle obvinění, je pořád rozdíl.

{% <kontrola otazka="Ve smlouvě, kterou citujete kvůli částce, je podepsaný jednatel dodavatele. Uvedete jeho jméno?"> %}
Ne, pokud tvrzení mluví o částce.

Test je jednoduchý: **je ten údaj potřeba k tomu, co dokládáte?** U tvrzení
o smluvní ceně jméno podepisujícího potřeba není.

Kdy by to bylo jinak: kdyby tvrzení bylo o tom, **kdo** smlouvu uzavřel —
třeba proto, že jeho role je předmětem pokrývané kauzy. Pak je jméno
součástí dokládaného faktu a uvádí se, ale jako kontextová entita: záznam
vazby, ne tvrzení o něm.

Rozdíl je v tom, co čtenář uvidí. „Smlouvu za dodavatele podepsal Y“ vedle
kauzy se čte jako Y-je-v-tom-namočený, i když je to jen evidenční fakt.
Když ten fakt k ničemu neslouží, nepatří tam.
{% </kontrola> %}
