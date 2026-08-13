+++
title = "06 — Sestavte evidence packet"
description = "První velká praktická úloha: připravte podklad, který někdo jiný dokáže ověřit, aniž by musel vaši rešerši dělat znovu."
template = "learning-lesson.html"
weight = 160

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B06"
estimated_minutes = 20
audience = ["zdroje", "research"]
objectives = [
  "Sestavíte podklad k jednomu tvrzení podle jednotné šablony.",
  "Oddělíte, co zdroj dokládá, od toho, co si myslíte vy.",
  "Napíšete si sami, co ve vašem podkladu chybí.",
]
prerequisites = ["B05"]
related_kb = ["koncepty/zdrojovano.md", "koncepty/nezavisle-dolozeni.md", "koncepty/registr-mezer.md"]
next = "B07"
+++

Evidence packet je podklad k **jednomu** tvrzení, sestavený tak, aby ho
někdo další mohl ověřit, aniž by musel vaši práci opakovat.

Není to formalita. Bez něj vypadá příspěvek jako „tady je odkaz, něco
s tím udělejte“ — a ten, kdo to má ověřit, začíná od nuly.

## Šablona

Zkopírujte si ji a vyplňte. Prázdné pole je taky odpověď.

```text
TVRZENÍ (jedna věta, jeden fakt)
...

STAV, KTERÝ NAVRHUJI
... (ověřeno více zdroji / 1 zdroj / citace / sporné / názor)

ZDROJ
  Vydavatel:
  Autor:
  Titulek:
  URL:
  Datum vydání:
  Datum, kdy jsem to otevřel:

CO PŘESNĚ TENHLE ZDROJ DOKLÁDÁ
... (co v něm doslova je, ne co z toho plyne)

CO NEDOKLÁDÁ
...

JE TO PŘÍMÁ CITACE?
... (ano/ne; pokud ano, doslovné znění)

JE TEXT PŘEVZATÝ ODJINUD?
... (agentura, tisková zpráva, jiná redakce — nebo vlastní zjištění)

DRUHÝ NEZÁVISLÝ ZDROJ
... (jiný původ I jiný vydavatel; nebo „nenašel jsem“)

CO STÁLE NEVÍME
... (kandidát na mezeru)

TÝKÁ SE NĚKOHO DALŠÍHO?
... (třetí osoby jmenované ve zdroji — a jestli je nutné je jmenovat)
```

{% <callout kind="varovani" title="Dvě pole, která se vyplňují nejhůř"> %}
**„Co nedokládá“** a **„Co stále nevíme“**. Je proti přirozenosti psát,
kde má vlastní práce hranice — a přesně ta dvě pole odliší použitelný
podklad od odkazu s domněnkou.
{% </callout> %}

## Úloha

{% <cviceni zadani="Vyplňte šablonu pro tohle tvrzení: „Město Bukov zahájilo rekonstrukci.“ Máte k dispozici SRC-A (tisková zpráva města) a SRC-B (Bukovský deník, přebírá SRC-A). Kde skončíte?"> %}
Podstatné body vyplněné šablony:

- **Stav:** *1 zdroj*. Dva odkazy, jeden původ.
- **Co zdroj dokládá:** že město zahájení rekonstrukce **oznámilo**
  k danému datu. Ne že práce toho dne fyzicky začaly.
- **Co nedokládá:** skutečné zahájení prací, rozsah, cenu ani dodavatele.
- **Je text převzatý:** `SRC-B` ano, ze `SRC-A`.
- **Druhý nezávislý zdroj:** nenašel jsem.
- **Co stále nevíme:** zda a kdy práce skutečně začaly; kdo je dodavatel.

Nejčastější chyba je formulovat tvrzení jako „rekonstrukce byla zahájena“.
Doložené je **oznámení**, ne skutek. Rozdíl mezi „město oznámilo, že
zahájilo“ a „město zahájilo“ je celý rozdíl mezi doloženým a nedoloženým.
{% </cviceni> %}

{% <kontrola otazka="Ve vaší šabloně vyjde „druhý nezávislý zdroj: nenašel jsem“. Má smysl takový podklad vůbec posílat?"> %}
Rozhodně ano — pokud to tam takhle stojí.

Tvrzení s jedním zdrojem je legitimní obsah; jen se tak označí. Škodlivá
je ta druhá varianta: poslat dva odkazy stejného původu a nechat editora,
ať si sám zjistí, že je to jeden hlas. To stojí čas a někdy to projde.

Podklad, který sám přiznává, že druhý hlas chybí, se dá zpracovat za pár
minut. Přesně proto ta dvě „nepříjemná“ pole v šabloně jsou.
{% </kontrola> %}
