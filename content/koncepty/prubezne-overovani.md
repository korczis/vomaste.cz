+++
title = "Průběžně ověřováno"
description = "Otevřené otázky se vedou jako otevřené a přehled se aktualizuje podle nového zpravodajství — s datem, kdy byla která část skutečně znovu zkontrolována."
template = "concept.html"
weight = 230

[extra]
lang = "cs"
seo_type = "WebPage"
group = "metodika"
icon = "M21 12a9 9 0 1 1-2.64-6.36 M21 3v6h-6"
tile_title = "Průběžně ověřováno"
tile_summary = "Otevřené otázky jsou vedeny jako otevřené, ne jako uzavřené. Přehled se aktualizuje podle nového zpravodajství."
+++

Kauzy se hýbou. Přehled, který se jednou napsal a pak zůstal stát, tvrdí o
současnosti něco, co už neplatí — proto je poslední kontrola u dossieru i
u každé [mezery](@/koncepty/registr-mezer.md) uvedená datem.

## Datum kontroly se nezvedá naslepo

Datum `reviewed_at` se posouvá jen tehdy, když někdo obsah skutečně znovu
porovnal s aktuálním zpravodajstvím. Zvednout ho „pro pořádek" by z něj udělalo
ozdobu a čtenář by podle něj nemohl nic poznat.

## Změny se nepřepisují potichu

Podstatné změny obsahu se zapisují do append-only historie aktualizací: co
bylo kdy zkontrolováno a co se změnilo. Nad tím je ještě
[Git](@/koncepty/verzovano-v-gitu.md), ze kterého jde přečíst každou revizi
včetně toho, co v ní zmizelo. Veřejná data se na tomhle webu nemají měnit
potichu.

## Co se nemění časem samo

Nic. Zestárnutí tvrzení mu nezvyšuje ani nesnižuje doloženost — stav se mění
jen novým zdrojem. A odložený případ nezmizí ze stránky jen proto, že přestal
být aktuální: zůstává, i s procesním vysvětlením.
