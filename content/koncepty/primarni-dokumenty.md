+++
title = "Primární dokumenty"
description = "Nejsilnějším dokladem není článek, ale samotný záznam — hlasování Sněmovny, plné znění rozsudku, tisková zpráva soudu nebo úřadu. Kde se dokument a zpravodajství rozejdou, vyhrává dokument."
template = "concept.html"
weight = 170

[extra]
lang = "cs"
seo_type = "WebPage"
group = "evidence"
tile_title = "Záznam, ne článek o záznamu"
tile_summary = "Hlasování Sněmovny, plné znění rozsudku, tisková zpráva úřadu. Kde se primární dokument a zpravodajství rozejdou, vyhrává dokument — a rozdíl se zapíše."
bullets = [
  "Instituce vydává vlastní záznam: hlasování, rozsudek, usnesení, tiskovou zprávu.",
  "Rozpor mezi dokumentem a zpravodajstvím je sám o sobě informace — nepřepisuje se potichu.",
  "Primární dokument ale nenahradí připsání výroku ani sám o sobě nezakládá nezávislé potvrzení.",
]
+++

Většina [zdrojů](@/koncepty/registr-zdroju.md) na tomhle webu jsou články —
někdo si přečetl rozhodnutí, hlasování nebo tiskovou zprávu a napsal o tom.
U velké části tvrzení ale ten původní záznam existuje veřejně a dá se citovat
přímo: **stenografický zápis a výsledek hlasování Poslanecké sněmovny, plné
znění rozsudku, usnesení vlády, tisková zpráva soudu nebo úřadu.**

Kde takový záznam existuje, patří do registru zdrojů. Ne proto, že je
„oficiální", ale proto, že o něm článek referuje — a referování je krok,
ve kterém se ztrácejí detaily.

## Co se tím získá

**Přesnost.** Zpravodajství zaokrouhluje: datum, částku, rozsah. Při
porovnávání tvrzení s uloženými dokumenty se ukázalo, že rozsudek správního
soudu je datovaný o den dřív, než uvedla všechna média; že vlastní číslo
rozpočtové instituce je jiné než to citované; že období, které úřad ve svém
stanovisku vymezuje na den přesně, se v článcích scvrklo na dva letopočty;
a že rámcová smlouva pokrývá celou budovu na rok, ne jednu kancelář.

**Rozsah.** Jeden dokument obvykle dokládá víc než tvrzení, ke kterému byl
připojen: tisková zpráva soudu nese vedle výroku i právní kvalifikaci, plné
znění rozsudku i procesní historii, usnesení vlády i jméno funkce, která se
tím obsazuje. Proto se dokumenty procházejí zpětně — několik tvrzení se
podařilo doložit bez jediného nového hledání, jen připojením záznamu, který
už v datech byl.

## Rozpor se nepřepisuje potichu

Když se dokument a zpravodajství rozejdou, opraví se tvrzení podle dokumentu —
ale **reportovaná verze zůstane viditelná**. Rozdíl mezi tím, co je v záznamu,
a tím, co o něm napsala média, je sám o sobě informace o kvalitě doložení.
Tichá oprava by ji smazala a čtenář by nepoznal, že tu kdysi stálo něco
jiného; celá změna je navíc dohledatelná v
[historii verzí](@/koncepty/verzovano-v-gitu.md).

## Co primární dokument neumí

**Nenahradí připsání výroku.** Když tvrzení říká, že něco sdělil mluvčí
úřadu, nedoloží to dokument jiné instituce, i kdyby byl v meritu přesnější.
Takové tvrzení zůstává s [1 zdrojem](@/koncepty/stav-jeden-zdroj.md) a nález
se zapíše k němu.

**Nedokládá „skoro totéž".** Seznam, který dotčenou kategorii nejmenuje ani
nevylučuje; zpráva vydaná týden před událostí, kterou by měla dokládat;
rozhodnutí s jiným datem, než uvádí tvrzení — nic z toho není doložení.
Při plošném průchodu se takových částečných shod zamítla zhruba stovka, každá
s pojmenovaným chybějícím prvkem.

**Nezakládá sám o sobě nezávislé potvrzení.** Instituce je jeden vydavatel.
Vlastní záznam plus zpráva agentury o něm jsou dva hlasy jen tehdy, když se
liší vydavatel i původ materiálu — platí tu stejné pravidlo jako všude
jinde, viz [nezávislé doložení](@/koncepty/nezavisle-dolozeni.md). Dva
dokumenty dvou různých úřadů jsou dva vydavatelé; dva dokumenty téhož úřadu
jeden.

## Jak je poznáte v datech

Primární dokument se v registru zdrojů pozná podle vydavatele a přímého
odkazu na doménu instituce. Kolik takových záznamů dataset cituje a několik
konkrétních příkladů je na [úvodní stránce](@/_index.md); celý seznam se dá
projít v [registru zdrojů každého dossieru](@/dossiers/_index.md) nebo
dotazem nad [strojově čitelnými daty](@/koncepty/strojove-citelna-data.md).

Co v registru nikdy nebude: neveřejný dokument, interní materiál nebo
cokoli, co není publikované — z důvodů, které popisují
[bezpečnostní hranice](@/koncepty/bezpecnostni-hranice.md).
