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

## Proč jednozdrojové tvrzení vůbec zůstává

Protože vynechat ho není neutrální. Kdyby web publikoval jen to, co potvrdily
dvě redakce, tichým důsledkem by bylo, že cokoli popsané jedním médiem
neexistuje — a to je taky tvrzení, jen nevyslovené. Řešením je přiznaný
štítek, ne mlčení.

Opačný extrém je stejně špatný: publikovat to bez rozlišení. Proto má stav
vlastní barvu i vlastní stránku a proto se u něj nikdy nepíše „bylo
prokázáno".

## Jak jednozdrojové tvrzení číst

- **Kdo to napsal.** U zdroje je vydavatel a typ materiálu; zpravodajská
  reportáž a komentář nemají stejnou váhu, i když jsou obojí „jeden zdroj".
- **Kdy.** Datum vydání a datum stažení ukazují, jak čerstvá informace to
  je a kdy ji web naposledy viděl na místě.
- **Reagoval někdo?** Když dotyčný informaci popřel, je to samostatné
  tvrzení se stavem [citace](@/koncepty/stav-citace.md) — hledejte ho
  v registru vedle.
- **Není to spíš sporné?** Pokud existuje doložený protiklad, tvrzení patří
  do [sporných](@/koncepty/stav-sporne.md), ne sem.

## Co to znamená pro důvěru v celý web

Podíl jednozdrojových tvrzení je sám o sobě údaj: ukazuje, kolik z přehledu
stojí na jediné redakci. Registr evidence u každého dossieru tenhle poměr
zobrazuje — je to jedna z mála metrik, kterou tenhle web o sobě zveřejňuje,
a nejde ji vylepšit jinak než dohledáním dalších zdrojů.
