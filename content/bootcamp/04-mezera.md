+++
title = "04 — Mezera, nebo tvrzení?"
description = "„Nevíme“ je legitimní výsledek. Naučte se rozhodnout mezi tvrzením, otevřenou mezerou a tím, co se nepublikuje vůbec."
template = "learning-lesson.html"
weight = 140

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B04"
estimated_minutes = 10
audience = ["research", "editor"]
objectives = [
  "Rozhodnete mezi tvrzením, mezerou a nepublikováním.",
  "Přeformulujete domýšlející větu na poctivou.",
  "Vysvětlíte, proč mezera není selhání projektu.",
]
prerequisites = ["B03"]
related_kb = ["koncepty/registr-mezer.md", "koncepty/zdrojovano.md"]
next = "B05"
+++

Největší tlak při rešerši není napsat nepravdu. Je to **napsat závěr**.
Text bez závěru působí nedodělaně a autor má nutkání ho doplnit — obvykle
slovem „pravděpodobně“, „zřejmě“ nebo „podle všeho“.

Přesně tyhle věty se čtou jako fakt a nejsou ničím doložené.

{% <callout kind="protipriklad" title="Takhle vzniká nedoložené tvrzení"> %}
*„Zakázka byla pravděpodobně předražená, protože konečná cena zdaleka
převýšila původní odhad.“*

Doložený je odhad a doložená je konečná cena. „Předražená“ je závěr,
který v žádném zdroji není — a slovo „pravděpodobně“ ho neruší, jen mu
dává alibi.
{% </callout> %}

{% <callout kind="priklad" title="Totéž poctivě"> %}
Tvrzení: *„Konečná cena byla X, původní předpokládaná hodnota Y.“*
(doloženo registrem)

Mezera: *„Dostupné zdroje neuvádějí, čím byl rozdíl mezi předpokládanou
a konečnou cenou zdůvodněn.“*

Čtenář vidí totéž, co jste viděli vy — a navíc přesně ví, kde vaše
znalost končí.
{% </callout> %}

## Úloha

Tři situace, tři různá rozhodnutí.

{% <cvicna_data> %}
**G1** — Chcete napsat, kolik rekonstrukce nakonec stála. Máte jen původní
předpokládanou cenu z tiskové zprávy.

**G2** — Smlouva ve veřejném registru uvádí konkrétní částku a datum
podpisu.

**G3** — Anonymní příspěvek tvrdí, že peníze skončily u známého starostky.
Nic dalšího k tomu není.
{% </cvicna_data> %}

{% <cviceni zadani="U každé rozhodněte: tvrzení, mezera, nebo nepublikovat?"> %}
**G1 → mezera.** Předpokládaná cena není konečná cena. Napsat „stála
přibližně tolik“ by domýšlelo. Do registru mezer patří otázka „jaká byla
konečná cena“ — a ta je zároveň zadáním pro další rešerši.

**G2 → tvrzení.** Primární dokument dokládá, co je v něm napsáno.
Formulace ale musí sedět přesně: dokládá **smluvní** částku, ne skutečně
proplacenou. To jsou dvě různá čísla a plete se to běžně.

**G3 → nepublikovat.** Tohle není ani mezera. Mezera je otevřená otázka
opřená o něco doloženého; tady je nedoložené obvinění, které navíc
zatahuje třetí osobu. Nezaloží se kvůli němu ani záznam „prověřit“ —
takový záznam by v repozitáři žil dál a byl by dohledatelný.
{% </cviceni> %}

{% <kontrola otazka="Někdo webu vyčte: „Máte tam patnáct otevřených mezer, to je nedodělaná práce.“ Co na to?"> %}
Že to je popis metody, ne vada.

Alternativa k patnácti přiznaným mezerám nejsou žádné mezery — je to
patnáct míst, kde by někdo něco domyslel a čtenář by nepoznal která.
Přiznaná mezera je informace navíc: říká, co web netvrdí.

Mezery jsou zároveň nejužitečnější seznam pro každého, kdo chce pomoct.
Je to konkrétní zadání: tuhle otázku dostupné zdroje neuzavírají, najdi
zdroj, který ji uzavře.
{% </kontrola> %}
