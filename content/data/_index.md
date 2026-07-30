+++
title = "Data a SQL konzole"
description = "Dotazujte se na celý dataset vomaste.cz přímo v prohlížeči — SQL nad tvrzeními, zdroji, kauzami, mezerami, vztahy a entitami. Data jsou ke stažení i jako prosté JSON."
template = "data-console.html"

[extra]
lang = "cs"
seo_type = "CollectionPage"
+++

Ústřední slib tohohle webu zní „nevěřte autorovi, zkontrolujte data".
Tahle stránka ho bere doslova: dataset si můžete **sami dotazovat**, místo
abyste věřili souhrnným číslům na dlaždicích.

SQL běží celý ve vašem prohlížeči (DuckDB-Wasm). Nikam se neposílá dotaz
ani výsledek — server o tom, co hledáte, neví nic, protože žádný takový
server neexistuje. Tabulky se načítají z týchž generovaných JSON souborů,
které si můžete stáhnout i bez konzole.

Co tady **není**: hodnocení pravdivosti, skóre závažnosti ani pořadí osob.
Sloupec `status` popisuje, jak silně je tvrzení doložené — viz
[stavy tvrzení](@/koncepty/_index.md), ne rozhodnutí o vině.
