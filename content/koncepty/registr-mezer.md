+++
title = "Registr mezer (GAP)"
description = "Otevřená otázka, u které dostupné zdroje neumožňují závěr — s prioritou a datem poslední kontroly. Být vedená jako otevřená není zjištění v žádném směru."
template = "concept.html"
weight = 40

[extra]
lang = "cs"
seo_type = "WebPage"
group = "model"
code = "GAP-##"
tile_title = "Registr mezer"
tile_summary = "Otevřené otázky, u kterých dostupné zdroje zatím neumožňují jednoznačný závěr — s prioritou a datem poslední kontroly."
+++

Mezera (*gap*) je otevřená otázka: něco, co by k pochopení kauzy patřilo, ale
citované zdroje na to zatím neodpovídají. Nese identifikátor `GAP-##`,
prioritu, datum poslední kontroly a vazbu na tvrzení, kterých se týká.

## Proč se mezery publikují

Přehled, který ukazuje jen to, co se podařilo doložit, působí úplnější než je.
Registr mezer je opakem: explicitní seznam toho, co tenhle web **neví** —
a co si tedy čtenář nemá domýšlet z toho, co tu je.

## Co mezera neznamená

Otevřená mezera není obvinění ani jeho vyvrácení. Neznamená „tady se něco
skrývá" ani „tohle se neděje". Znamená přesně jedno: k tomuhle bodu zatím
neexistuje citovatelný veřejný zdroj, který by umožnil závěr. Spekulace patří
sem, ne mezi tvrzení — a i tady jen jako formulovaná otázka, ne jako hypotéza
s naznačenou odpovědí.

## Datum poslední kontroly

U každé mezery je datum, kdy se naposledy skutečně hledalo. Bez toho by
starý, nikdy neprověřený seznam vypadal stejně jako aktivně sledovaná otázka.

Mezery každého dossieru najdeš v jeho vlastním registru; přehled dossierů je
v [registru dossierů](@/dossiers/_index.md).

## Jak mezera vzniká

Nejčastěji při psaní tvrzení: zdroj odpoví na část otázky a zbytek nechá
otevřený. Ten zbytek se nezamlčí ani nedomyslí — dostane `GAP-##`, prioritu
a vazbu na tvrzení, ze kterého vypadl. Druhý zdroj mezer je kontrolní kolo:
když se při ověřování ukáže, že něco nejde doložit, je to nález, ne
neúspěch ([průběžné ověřování](@/koncepty/prubezne-overovani.md)).

## Priorita není závažnost obvinění

`vysoká` znamená, že bez odpovědi zůstává přehled neúplný v podstatné věci
— typicky tam, kde chybějící informace mění výklad už doložených tvrzení.
`nízká` znamená, že jde o doplňující detail. Priorita popisuje **hodnotu
odpovědi pro pochopení**, ne jak vážné by to bylo, kdyby odpověď zněla
nepříznivě.

## Jak se mezera uzavírá

Jen doložením: vznikne nové tvrzení s citovaným zdrojem a mezera se odepíše
s odkazem na ně. Neuzavírá ji čas, mlčení dotčené strany ani to, že se
o věci přestalo psát. Když se odpověď nenajde, přepíše se datum kontroly
a mezera zůstává otevřená — i po letech.

## Proč to není seznam podezření

Otázka „kdo zaplatil X" je otevřená mezera. Věta „není jasné, kdo zaplatil
X, což vyvolává otázky" je totéž obvinění v převleku. Rozdíl je v tom, že
mezera se ptá a nenaznačuje odpověď — a proto se formuluje jako otázka, ne
jako podezření s otazníkem na konci.
