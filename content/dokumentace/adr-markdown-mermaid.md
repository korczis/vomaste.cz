+++
title = "ADR: vykreslení Markdownu a Mermaid.js"
description = "Proč se řídicí dokumenty vykreslují build-time přes Zolu (žádný nový JS) a proč Mermaid.js zatím není adoptován."
template = "docs-viewer.html"
weight = 9

[extra]
lang = "cs"
source_file = "docs/adr/markdown-and-mermaid-rendering.md"
+++

**Co to je.** Proč se řídicí dokumenty vykreslují při buildu Zolou (žádný
klientský JavaScript navíc) a proč Mermaid.js zatím adoptovaný není.

**Proč to čtete právě tady.** Tahle stránka je sama důsledkem toho
rozhodnutí: text, který vidíte níž, vznikl build-time renderem téhož
markdownu, jaký je v repozitáři — jedna kopie, žádná synchronizace.

**Co z toho platí obecně.** Nová knihovna se v tomhle projektu neadoptuje
proto, že by se hodila, ale proto, že řeší doložený problém. Když nastane,
záznam se přepíše — jako u
[rendereru grafu](@/dokumentace/adr-graph-renderer.md).
