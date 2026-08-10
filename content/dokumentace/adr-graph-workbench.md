+++
title = "ADR: grafová projekce a build-time layout"
description = "Jak se graf vztahů dostane do prohlížeče: přenosový formát, rozvržení počítané při buildu a líné načítání. Navazuje na přijetí Sigma.js, tu volbu nerevidovala."
template = "docs-viewer.html"
weight = 15

[extra]
lang = "cs"
source_file = "docs/adr/graph-workbench-and-data-projection.md"
+++

**Co to je.** Doplnění dřívějšího rozhodnutí o rendereru grafu o to, co
tehdy zůstalo otevřené — v jakém formátu se graf posílá do prohlížeče,
kdy se počítá rozvržení a co se načítá až na vyžádání.

**Proč se rozvržení počítá při buildu.** Aby prohlížeč nemusel dopočítat
pozice uzlů pokaždé znovu; graf se pak otevře i na slabším zařízení a
vypadá při každém načtení stejně.

**Historická poznámka.** Dokument vznikl před přechodem na JSON-first
datový model a sám se k tomu hlásí hned v prvním řádku. Popisované
rozhodnutí platí, cesty a názvy souborů v něm ale odpovídají starší
podobě repozitáře.
