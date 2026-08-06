+++
title = "ADR: renderer grafu vztahů"
description = "Měřené rozhodnutí o rendereru grafu z 2026-07-29 — dnes částečně překonané (Sigma a DuckDB byly později přijaty), zbytek zamítnutého stacku platí dál."
template = "docs-viewer.html"
weight = 11

[extra]
lang = "cs"
source_file = "docs/adr/graph-renderer.md"
+++

**Co to je.** Rozhodovací záznam o rendereru grafu vztahů — a ukázka toho,
jak se v tomhle projektu rozhoduje o závislostech: proti **naměřeným**
číslům konkrétního datasetu, ne proti hypotetické budoucí velikosti.

**Pozor, je částečně překonaný.** Sigma.js a DuckDB-Wasm, které tenhle
záznam odmítl, byly 30. 7. 2026 přijaty rozhodnutím vlastníka webu — viz
[ADR o DuckDB a Sigmě](@/dokumentace/adr-duckdb-sigma.md). Nový záznam
nepředstírá, že se měření změnilo; říká, že se změnil cíl. Zbytek
technologií, které tenhle ADR odmítá, odmítnutý zůstává.

**Proč ho tu necháváme.** Protože překonané rozhodnutí se nemaže — jinak by
z historie zmizelo, že projekt jednou tenhle stack zamítl a proč.
