+++
title = "Registr zdrojů (SRC)"
description = "Každý citovaný zdroj má vlastní stránku: vydavatel, typ, přímý odkaz, datum vydání i stažení — a vydavatelské rodiny, které se nepočítají jako nezávislé potvrzení."
template = "concept.html"
weight = 20

[extra]
lang = "cs"
seo_type = "WebPage"
group = "model"
code = "SRC-##"
tile_title = "Registr zdrojů"
tile_summary = "Vydavatel, typ, přímý odkaz, data — a „vydavatelské rodiny“: zdroje téhož vydavatele se nepočítají jako nezávislé potvrzení."
+++

Zdroj (*source*) je konkrétní publikovaný materiál, na který se tvrzení
odvolává — článek, reportáž, úřední dokument, komentář. Nese identifikátor
`SRC-##` a v registru u něj stojí vydavatel, typ, přímý odkaz, datum vydání a
datum, kdy byl obsah naposledy stažen a zkontrolován.

## Datum stažení není formalita

Odkazy hnijí a články se přepisují. Datum stažení říká, k jakému okamžiku
odpovídá to, co web tvrdí, že zdroj obsahuje — a umožňuje rozpor dohledat
zpětně, když se obsah na druhé straně změní.

## Vydavatelské rodiny

Pět přebraných agenturních zpráv téhož obsahu není pět nezávislých potvrzení.
Registr zdrojů proto vede, které zdroje spadají do stejné vydavatelské rodiny,
a index to vypisuje otevřeně. Pro povýšení tvrzení na
[ověřeno více zdroji](@/koncepty/stav-overeno-vice-zdroji.md) musí být zdroje
skutečně nezávislé — dvě URL téhož vydavatele nestačí.

## Co vynucuje tooling

Vazba tvrzení ↔ zdroj je dvousměrná a `validate:dossier` shodí build, když
odkaz vede na neexistující záznam nebo když seznam zdrojů u tvrzení
neodpovídá tomu, co je na stránce zdroje. Zdroj bez jediného podporovaného
tvrzení je taky chyba, ne dekorace.

## Typ zdroje mění jeho váhu

Zpravodajská reportáž, rozhovor, komentář, tisková zpráva a úřední dokument
nejsou zaměnitelné. Typ je proto samostatné pole a projeví se v tom, co
zdroj smí podpírat: komentář nikdy nedokládá skutkový stav, jen existenci
[názoru](@/koncepty/stav-nazor.md); rozhovor dokládá, že výrok padl, tedy
[citaci](@/koncepty/stav-citace.md).

## Přímý odkaz, ne jen jméno vydavatele

U každého zdroje je URL na konkrétní materiál. „Podle ČT" bez odkazu je
nedohledatelné tvrzení o zdroji — čtenář musí mít možnost jít na originál
a porovnat, co v něm doopravdy stojí. Právě tenhle krok tooling nezastane
a je to hlavní věc, kterou si čtenář může na webu zkontrolovat sám.

## Když článek zmizí nebo se změní

Datum stažení říká, k jakému okamžiku odpovídá to, co web o zdroji tvrdí.
Když se materiál přepíše nebo zmizí, nemaže se potichu: to, co z něj
vycházelo, se přehodnotí a změna zůstane v
[historii](@/koncepty/verzovano-v-gitu.md). Web neprovozuje vlastní archiv
cizích článků — nemá na to práva ani infrastrukturu a netvrdí opak.

## Co v registru nikdy nebude

Neveřejný dokument, anonymní tip ani materiál, který někdo poslal „jen pro
informaci". Zdroj je z definice něco už publikovaného — a proč to platí
i pro doručování, popisují
[bezpečnostní hranice](@/koncepty/bezpecnostni-hranice.md).
