+++
title = "ADR: DuckDB-Wasm a Sigma.js"
description = "Proč byl dřívější zamítavý záznam přebit — a za jakou cenu: měřená velikost payloadu, opt-in načítání a hranice, které to nesmí porušit."
template = "docs-viewer.html"
weight = 10

[extra]
lang = "cs"
source_file = "docs/adr/duckdb-wasm-and-sigma.md"
+++

**Co to je.** Rozhodnutí přijmout dvě technologie, které
[předchozí záznam](@/dokumentace/adr-graph-renderer.md) dvakrát odmítl:
Sigma.js jako renderer grafu a DuckDB-Wasm pro
[SQL konzoli](@/data/_index.md) v prohlížeči.

**Proč je zajímavý.** Nepředstírá, že se změřená čísla změnila. Graf má
pořád 23 uzlů a dataset necelých 200 záznamů — změnil se cíl: konzole tu
není kvůli rychlosti, ale aby si čtenář mohl data ověřit sám, místo aby
věřil souhrnným dlaždicím.

**Cena je vyčíslená, ne odbytá.** 6,2 MB brotli (34 MB rozbaleno), načítané
**až po kliknutí** — měřeno na hotové stránce: `/data/` při načtení
neposílá na CDN jediný požadavek. Záznam zároveň drží hranice, které to
nesmí porušit: graf zůstává progressive enhancement, konzole se nesmí stát
druhým zdrojem pravdy a žádná hodnoticí metrika z ní vzniknout nesmí.
