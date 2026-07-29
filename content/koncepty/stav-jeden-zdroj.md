+++
title = "Stav: 1 zdroj"
description = "Faktické tvrzení doložené právě jedním citovaným zdrojem, přiznaně označené jako jednozdrojové místo aby se vydávalo za potvrzené."
template = "concept.html"
weight = 120

[extra]
lang = "cs"
seo_type = "WebPage"
group = "stav"
badge_class = "status-single"
badge_label = "1 zdroj"
tile_title = "1 zdroj"
tile_summary = "doloženo jedním citovaným zdrojem"
+++

Tvrzení, které stojí na jediném citovaném zdroji. Není proto nepravdivé — je
slabší, a web to říká nahlas, místo aby jednozdrojovou informaci vydával za
potvrzenou.

## Proč vlastní stav, a ne jen poznámka

Kdyby se jednozdrojová a vícezdrojová tvrzení označovala stejně, čtenář by
neměl jak poznat rozdíl — a přesně tímhle způsobem se z jedné zprávy stane
„je to potvrzené". Vlastní stav ten rozdíl drží viditelný v tabulce i na
stránce tvrzení.

## Jak se stav mění

Jedinou legitimní cestou k
[ověřeno více zdroji](@/koncepty/stav-overeno-vice-zdroji.md) je najít druhý,
skutečně nezávislý zdroj (ne přetisk téhož). Když se naopak zdroj ukáže jako
nespolehlivý nebo článek zmizí, tvrzení se nemaže potichu: mění se stav a
změna zůstává v [historii verzí](@/koncepty/verzovano-v-gitu.md).

## Co vynucuje tooling

`validate:dossier` shodí build, pokud tvrzení s tímto stavem cituje jiný počet
zdrojů než právě jeden.
