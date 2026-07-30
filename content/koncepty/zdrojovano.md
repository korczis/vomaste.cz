+++
title = "Zdrojováno"
description = "Každé tvrzení cituje jmenovaný, nezávislý veřejný zdroj s přímým odkazem. Co nejde ozdrojovat, se nepublikuje — ani jako naznačení."
template = "concept.html"
weight = 210

[extra]
lang = "cs"
seo_type = "WebPage"
group = "metodika"
icon = "M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4 M14 3h7v7 M10 14 21 3"
tile_title = "Zdrojováno"
tile_summary = "Každé tvrzení cituje jmenovaný, nezávislý veřejný zdroj s přímým odkazem. Bez zdroje se tvrzení nepublikuje."
+++

První pravidlo: tvrzení bez jmenovaného, dohledatelného zdroje se
nepublikuje. Nesnižuje se mu jen důvěryhodnost — vypadne.

## Co je jmenovaný zdroj

Konkrétní publikovaný materiál konkrétního vydavatele s přímým odkazem a
datem. Ne „podle informací z okolí", ne „spekuluje se", ne odkaz na jiný
agregátor, který zdroj taky neuvádí. Anonymní tip nebo nepublikovaný dokument
zdrojem v tomhle smyslu není — a na tomhle webu se neobjeví, viz
[bezpečnostní hranice](@/koncepty/bezpecnostni-hranice.md).

## „Už to někde na internetu je" není odůvodnění

Že je něco dostupné, samo nezakládá veřejný zájem to zveřejnit tady. Každý
nepříznivý záznam musí navíc projít testem: jde o výkon veřejné funkce nebo
o veřejně dostupný zdroj, je rozsah přiměřený, a existuje méně invazivní
způsob, jak totéž doložit?

## Bez naznačování

Kde zdroje mlčí, web mlčí taky. Hypotéza formulovaná jako otázka („není
zvláštní, že…") je tvrzení bez zdroje v převleku. Patří do
[registru mezer](@/koncepty/registr-mezer.md) jako otevřená otázka, nebo
nikam.

## Jak si to ověřit sami

Nemusíte tomu věřit — je to zkontrolovatelné ze tří stran:

1. **Od tvrzení ke zdroji.** Každé tvrzení v registru vypisuje své
   `SRC-##`. Klikněte na ně: dostanete stránku zdroje s vydavatelem, datem
   vydání a přímým odkazem na původní článek.
2. **Od zdroje zpátky.** Stránka zdroje vypisuje, která tvrzení podpírá.
   Když někde sedí zdroj, ze kterého nic nevychází, je to chyba dat, ne
   dekorace — a build ji neprojde.
3. **Přes evidenci.** Registr evidence ukazuje celou síť najednou, takže je
   vidět, kde je doložení tenké.

## Co to vynucuje

`validate:dossier` shodí build, když tvrzení odkazuje na neexistující
`SRC-##`, když se seznam zdrojů u tvrzení a na stránce zdroje rozejde, nebo
když počet zdrojů neodpovídá deklarovanému stavu
([ověřeno více zdroji](@/koncepty/stav-overeno-vice-zdroji.md) vyžaduje
nejméně dva, [1 zdroj](@/koncepty/stav-jeden-zdroj.md) právě jeden).
`zola check` navíc kontroluje, že interní odkazy vedou někam, a
`verify:anchors` že sedí i kotvy v hotovém HTML.

Co tooling **nevynutí**: jestli je citovaný zdroj důvěryhodný a jestli text
tvrzení odpovídá tomu, co v článku doopravdy stojí. To zůstává redakční
odpovědností a kontroluje se čtením — proto je u každého tvrzení přímý
odkaz, ne jen jméno vydavatele.

## Když zdroj zmizí

Články mizí a přepisují se. Datum stažení u každého zdroje říká, k jakému
okamžiku odpovídá to, co web tvrdí, že zdroj obsahuje. Když se obsah na
druhé straně změní, tvrzení se nemaže potichu: mění se jeho stav a změna
zůstává v historii — viz
[průběžné ověřování](@/koncepty/prubezne-overovani.md) a
[verzováno v Gitu](@/koncepty/verzovano-v-gitu.md).
