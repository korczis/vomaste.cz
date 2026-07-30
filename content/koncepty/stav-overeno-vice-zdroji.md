+++
title = "Stav: ověřeno více zdroji (CORROBORATED)"
description = "Tvrzení potvrzené nezávisle nejméně dvěma různými redakcemi. Validátor počet zdrojů vynucuje; zdroje téhož vydavatele se jako nezávislé nepočítají."
template = "concept.html"
weight = 110

[extra]
lang = "cs"
seo_type = "WebPage"
group = "stav"
badge_class = "status-corroborated"
badge_label = "Ověřeno více zdroji"
tile_title = "Ověřeno více zdroji"
tile_summary = "potvrzeno nezávisle více médii"
+++

Nejsilnější stav, který tenhle web tvrzení dává: obsah výroku nezávisle
doložily nejméně dvě různé redakce.

## Co „nezávisle" znamená

Ne dvě URL. Dvě **redakce**. Přebraná agenturní zpráva, přetisk a shrnutí
téhož článku jsou jeden zdroj informace, i když mají tři adresy — proto
[registr zdrojů](@/koncepty/registr-zdroju.md) vede vydavatelské rodiny a
index je vypisuje otevřeně.

## Co tento stav netvrdí

Že je věc pravdivá v absolutním smyslu, ani že o ní bylo rozhodnuto. Znamená,
že o ní shodně informovaly nezávislé zdroje — tedy že jde o doložený veřejný
fakt v novinářském smyslu, ne o rozsudek. Tenhle web nikdy nerozhoduje o vině
ani o nevině.

## Co vynucuje tooling

`validate:dossier` shodí build, pokud tvrzení s tímto stavem cituje méně než
dva různé zdroje. Povýšení z [1 zdroje](@/koncepty/stav-jeden-zdroj.md)
vyžaduje přidat skutečně nezávislý druhý zdroj — nikdy jen přeznačení stavu.

Počet je ale jediné, co jde zkontrolovat strojově. Jestli jsou ty dvě
redakce doopravdy nezávislé, rozhoduje člověk podle vydavatelských rodin
v [registru zdrojů](@/koncepty/registr-zdroju.md) — validátor nepozná, že
dvě různé domény patří témuž vydavateli, dokud to někdo nezaznamená.

## Jak se do tohoto stavu dostane a jak z něj vypadne

| změna | co ji smí způsobit |
|---|---|
| 1 zdroj → ověřeno více zdroji | přibyl druhý, skutečně nezávislý zdroj |
| sporné → ověřeno více zdroji | rozpor se vysvětlil a shodly se nezávislé redakce |
| ověřeno více zdroji → 1 zdroj | jeden ze zdrojů se ukázal jako přetisk, nebo zmizel |
| ověřeno více zdroji → sporné | objevil se doložený rozpor |

Sestup je stejně legitimní jako vzestup a děje se veřejně: změna stavu je
vidět v [historii](@/koncepty/verzovano-v-gitu.md) i v záznamu aktualizací.
Tvrzení se kvůli oslabení doložení nemaže.

## Časté nedorozumění

„Ověřeno" tady neznamená, že to ověřil tenhle web vlastním šetřením. Web
nevyšetřuje — konstatuje, že o věci shodně informovaly nezávislé redakce.
Rozdíl je podstatný u výroků: dvě redakce potvrzující, že někdo něco řekl,
dokládají **výrok**, ne jeho obsah; takové tvrzení proto nese
[citaci](@/koncepty/stav-citace.md), ne tento stav.
