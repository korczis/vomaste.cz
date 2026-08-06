+++
title = "ADR: Prismatic Platform jako upstream poskytovatel"
description = "Rozhodnutí povolit volání druhé platformy jako lokálního zdroje schopností — s výslovným, datovaným soupisem toho, co je hotové a co zatím ne."
template = "docs-viewer.html"
weight = 20

[extra]
lang = "cs"
source_file = "docs/adr/prismatic-platform-integration.md"
+++

**Co to je.** Novější rozhodnutí, které ruší tu část staršího záznamu,
jež zakazovala volat druhou platformu přímo. Nahrazuje ji ale úzce
vymezeným rozsahem, ne volnou rukou.

**Čím je tenhle záznam užitečný.** Nese datovanou sekci „stav
implementace", která jmenovitě odděluje, co je opravdu hotové a
otestované, od toho, co je zatím jen navržené. To je pravidlo, které
platí pro celý web: dokumentace nesmí inzerovat schopnost, která
neexistuje — a stejně tak nesmí zamlčet tu, která existuje.

**Souvislost.** Starší, zčásti překonaný záznam:
[import agentního ekosystému](@/dokumentace/adr-agentni-tooling.md).
