+++
title = "ADR: import cizího agentního ekosystému (zamítnuto)"
description = "Měřené zamítnutí návrhu převzít 549 agentů a 234 příkazů z jiné platformy — a proč místo toho vznikl jeden skill. Zčásti překonáno pozdějším rozhodnutím."
template = "docs-viewer.html"
weight = 19

[extra]
lang = "cs"
source_file = "docs/adr/aiad-and-agent-tooling-import.md"
+++

**Co to je.** Záznam o tom, jak se v tomhle projektu zamítá. Padl návrh
převzít rozsáhlý agentní ekosystém jiné platformy — 549 agentů, 234
příkazů, 1 636 souborů — a odpověď zněla ne, s vypočítaným zdůvodněním:
takový aparát přidá udržovací plochu, kterou malý statický web neuživí,
a žádná změřená potřeba za ním nestála. Místo toho vznikl jeden skill,
který řešil skutečný problém.

**Je zčásti překonaný a nechává to vidět.** Zákaz volat druhou platformu
jako lokálního poskytovatele schopností vlastník webu 5. 8. 2026 zrušil
— viz [ADR o integraci Prismatic](@/dokumentace/adr-prismatic.md).
Naměřený závěr proti kopírování celého ekosystému platí dál.

**Proč tu překonaný záznam zůstává.** Protože smazané rozhodnutí je
rozhodnutí, které nikdo nemůže přezkoumat.
