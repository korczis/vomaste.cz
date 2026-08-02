+++
title = "ADR: rozšíření JSON-LD o provenance"
description = "Návrh pro T-010 — co se přejímá z prismatic-platform (content-hash citace, manifest) a co se vědomě odmítá (numerické confidence skóre) a proč."
template = "docs-viewer.html"
weight = 10

[extra]
lang = "cs"
source_file = "docs/adr/dossier-jsonld-provenance-extension.md"
+++

**Co to je.** Návrh rozšíření strukturovaných dat o provenance —
content-hash citace a manifest datasetu — jako podklad pro úlohu T-010.

**Je to návrh, ne stav.** Nic z toho zatím nasazené není:
[strojově čitelná data](@/koncepty/strojove-citelna-data.md) dnes existují
jako JSON-LD vložené v HTML a ploché JSON exporty na `/data/`, ale
samostatné `/data/*.jsonld` routy ani checksumy ne.

**Nejzajímavější část je odmítnutí.** Záznam vědomě zahazuje numerické
confidence skóre převzatelné z jiné platformy: číselná „míra jistoty" u
tvrzení o člověku je přesně ten druh hodnocení, které si tenhle web
zakázal — stavy popisují zdrojování, ne pravdivost.
