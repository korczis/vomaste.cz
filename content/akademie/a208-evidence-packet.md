+++
title = "A208 — Evidence packet"
description = "Výstup rešerše v podobě, kterou editor převezme bez dohadování. Co v něm musí být, co bývá vynechané a jak vypadá hotový příklad."
template = "learning-lesson.html"
weight = 1208

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A208"
level = "research"
estimated_minutes = 14
audience = ["zdroje", "research", "editor"]
objectives = [
  "Sestavíte packet, který editor zpracuje bez doptávání.",
  "Vyplníte i pole o hranicích vlastní práce.",
  "Odevzdáte návrh stavu i s odůvodněním, ne jen tvrzení.",
]
prerequisites = ["A207"]
related_kb = ["koncepty/zdrojovano.md", "koncepty/nezavisle-dolozeni.md", "koncepty/registr-mezer.md"]
next_route = "@/akademie/a301-neutralni-formulace.md"
next_label = "A301 — Neutrální formulace (úroveň Redakční práce)"
+++

Evidence packet je **výstup rešerše v podobě, kterou jde převzít**. Rozdíl
proti hromadě odkazů: editor po jeho přečtení ví, co je doložené, jak
silně a co chybí — a nemusí vaši práci dělat znovu.

Šablona je v [Bootcampu 06](@/bootcamp/06-evidence-packet.md); tahle lekce
je o tom, co v ní bývá špatně.

## Tři pole, na kterých to stojí

**„Co přesně zdroj dokládá.“** Ne parafráze tvrzení. Doslovný obsah:
*„Článek uvádí, že ministerstvo obdrželo auditní zprávu v roce 2019, s
odvoláním na nejmenovaný zdroj.“*

**„Co nedokládá.“** Explicitní hranice. *„Neuvádí, kdo zprávu obdržel ani
zda na ni bylo reagováno.“*

**„Co stále nevíme.“** Kandidát na mezeru, formulovaný jako otázka, na
kterou by šlo odpovědět dalším hledáním.

## Hotový příklad

{% <cvicna_data> %}
```text
TVRZENÍ
Smluvní cena rekonstrukce byla 40 000 000 Kč.

NAVRHOVANÝ STAV
1 zdroj — doklad je jeden primární dokument, druhá nezávislá linie chybí.

ZDROJ
  Vydavatel:   registr smluv (fiktivní cvičná evidence)
  Titulek:     Smlouva o dílo, Bukov / firma X
  URL:         https://registr.example/smlouvy/2026-0413
  Vydáno:      2026-03-14 (datum zveřejnění záznamu)
  Pořízeno:    2026-05-03

CO DOKLÁDÁ
Že v evidenci je k uvedenému dni zveřejněna smlouva se smluvní cenou
40 000 000 Kč a datem podpisu 2026-03-02.

CO NEDOKLÁDÁ
Skutečně proplacenou částku. Neuvádí vícepráce ani dodatky.

PŘÍMÁ CITACE
Ne.

PŘEVZATÉ ODJINUD
Ne — primární záznam.

DRUHÝ NEZÁVISLÝ ZDROJ
Nenašel jsem. Zpravodajské texty o zakázce vycházejí z tiskové zprávy
města (rodina „tisková zpráva“), takže druhý hlas netvoří.

CO STÁLE NEVÍME
Zda byly uzavřeny dodatky měnící cenu; jaká částka byla proplacena.

TŘETÍ OSOBY
Ve smlouvě je podepsaný jednatel. Pro tvrzení o ceně není jeho jméno
potřeba — nepřebírám ho.
```
{% </cvicna_data> %}

{% <callout kind="poznamka" title="Proč je poslední pole důležité"> %}
Podepsaný jednatel je ve veřejném dokumentu a dohledá se za dvacet vteřin.
Přesto se nepřebírá — protože k dokládanému tvrzení o ceně není potřeba.
Publikuje se minimum, které tvrzení unese.
{% </callout> %}

{% <kontrola otazka="Editor vám packet vrátí s poznámkou „stav navrhuješ 1 zdroj, ale máš tam tři odkazy“. Co je nejspíš špatně a co s tím?"> %}
Nejspíš **nic** — a odpověď je v samotném packetu.

Stav se neurčuje počtem odkazů, ale počtem nezávislých linií. Když jsou ty
tři odkazy přetisky jedné tiskové zprávy, je „1 zdroj“ správně a
„ověřeno“ by bylo nepravdivé.

Co z toho plyne pro vás: **pole o rodinách zdrojů a o druhém nezávislém
hlasu musí být vyplněné tak, aby se editor nemusel ptát.** Když u každého
z těch tří odkazů stojí, odkud pochází, otázka nevznikne.

A pokud jste to nevyplnili, editor se ptá právem — a ta výtka nemíří na
stav, ale na packet.
{% </kontrola> %}
