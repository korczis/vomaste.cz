+++
title = "Třetí osoby a proporcionalita"
description = "Veřejný zájem opravňuje zkoumat veřejně činné osoby — ne kohokoli, kdo s nimi má cokoli společného. Nejmenované třetí osoby zůstávají nejmenované, pokud je samy důvěryhodné zdroje neidentifikují."
template = "concept.html"
weight = 355

[extra]
lang = "cs"
seo_type = "WebPage"
group = "metodika"
icon = "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"
tile_title = "Třetí osoby a proporcionalita"
tile_summary = "Veřejný zájem opravňuje zkoumat veřejně činné osoby — ne kohokoli, kdo s nimi má cokoli společného. Nejmenované zůstávají nejmenované."
+++

Manifest, bod 7: veřejný zájem není licence k bezbřehému sběru. Tahle
stránka rozvádí, kde přesně vede hranice mezi "osoba, kterou má smysl
zkoumat" a "osoba, která se do dossieru dostala jen proto, že byla
nablízku".

## Rozsah je o veřejné moci, ne o okolí veřejné osoby

[Standing scope](@/koncepty/autorizace.md) pokrývá veřejné funkcionáře,
politicky exponované osoby a subjekty materiálně napojené na veřejnou
moc nebo veřejné peníze. Nepokrývá automaticky nikoho, kdo je s takovou
osobou jen ve vztahu — rodinného příslušníka, souseda, spolužáka,
bývalého kolegu. Být blízko veřejné moci neznamená ztratit soukromí.

## Kontextová entita není dossier

Když se v registru objeví jméno — třeba spolumajitel firmy z veřejného
rejstříku — systém pro něj může vytvořit **kontextovou entitu**: záznam,
který jen potvrzuje, že vztah existuje v už citovaném zdroji nebo
veřejném rejstříku. Kontextová entita nemá vlastní tvrzení, není
dossierem a jejímu vzniku nepředchází žádná autorizace — protože
nezveřejňuje nic, co by nebylo triviálně dohledatelné v tom samém
rejstříku.

Rozdíl, na kterém tohle celé pravidlo stojí: **tvrzení o osobě, nebo
dossier na ni, pořád potřebuje vlastní datovanou autorizaci**. Kontextová
entita nikdy automaticky nezíská vlastní claim jen proto, že existuje.

## Co se z rejstříku nekopíruje

Datum narození a adresa bydliště se z veřejného rejstříku nekopírují
nikdy — ani u hlavního subjektu dossieru, natož u kontextové osoby v
jeho okolí. To není redakční zdrženlivost, je to vynucené v kódu: pokud
generátor entitu z rejstříku vytváří, tahle dvě pole prostě neopisuje.

## Jmenný konflikt se neřeší automaticky

Entita se stejným jménem jako už existující záznam (dvě různé osoby
jménem Jan Novák, jedna v dossieru, druhá jen v okolním rejstříku) se
nikdy automaticky nesloučí ani nepřepíše. Kolize jde k člověku k ručnímu
posouzení — přesně proto, aby se nestalo, že cizí rejstříkový záznam
omylem obohatí nesprávný dossier. Stejný problém řeší jinde na webu
[procesní výsledek](@/koncepty/procesni-vysledek.md): rozlišit dvě věci,
které vypadají stejně, je důležitější než rychlost.

## Nejmenovaná třetí osoba zůstává nejmenovaná

Pokud sama důvěryhodná citovaná reportáž osobu neidentifikuje jménem,
web ji nedoplní ani nenaznačí — ani v kontextu velmi veřejné kauzy.
Identifikace je oprávněná, jen když ji k pochopení doloženého veřejného
kontextu skutečně vyžaduje, ne jako doplňkový detail, který by dossier
udělal barvitější.

## Proč to je proporcionalita, ne cenzura

Rozsah, který by pokrýval kohokoli propojeného s veřejnou osobou, by
nebyl širší dossier — byl by stroj na výrobu vedlejších obětí, přesně
formulace z manifestu. Proporcionalita neznamená mlčet o nepříjemných
faktech o veřejně činných osobách; znamená netahat do veřejného záznamu
lidi, jejichž jediná "kvalifikace" je, že byli nablízku.
