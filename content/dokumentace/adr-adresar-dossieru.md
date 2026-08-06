+++
title = "ADR: adresář dossierů ve třech projekcích"
description = "Proč jeden dataset vykresluje tabulku, seznam i dlaždice — a proč se filtr promítá do URL, aby šel konkrétní pohled poslat odkazem."
template = "docs-viewer.html"
weight = 16

[extra]
lang = "cs"
source_file = "docs/adr/dossier-directory-multi-view.md"
+++

**Co to je.** Rozhodnutí, že adresář dossierů nabídne tři pohledy na
**jedna** data — tabulku, hustý seznam a dlaždice — místo aby se vybral
jeden kompromis. Filtrování a řazení řídí jedna sdílená kolekce, takže
se projekce nemůžou rozejít.

**Detail, který stojí za zmínku.** Zvolený pohled i filtr žijí v URL,
takže konkrétní výřez dat jde poslat odkazem a tlačítko zpět ho vrátí.
Bez JavaScriptu zůstává výchozí projekce plně použitelná.

**Historická poznámka.** Dokument vznikl před přechodem na JSON-first
datový model a sám to v úvodu přiznává; rozhodnutí platí, konkrétní
cesty v textu odpovídají starší podobě repozitáře.
