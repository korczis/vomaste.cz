+++
title = "Verzováno v Gitu"
description = "Každá publikovaná revize odpovídá konkrétnímu commitu ve veřejném repozitáři; podstatné změny navíc eviduje append-only historie aktualizací."
template = "concept.html"
weight = 310

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
tile_title = "Verzováno v Gitu"
tile_summary = "Každá publikovaná revize odpovídá konkrétnímu commitu ve veřejném repozitáři. Podstatné změny obsahu navíc eviduje append-only historie aktualizací — co bylo kdy skutečně ověřeno a změněno."
+++

Tenhle web není databáze, do které někdo tiše sahá. Je to statická stránka
generovaná z obsahu ve veřejném Git repozitáři: co je publikované, odpovídá
konkrétnímu commitu, a ten commit má autora, čas a diff.

## Co z toho čtenář reálně získá

Možnost položit otázku „co tady stálo minulý měsíc" a dostat odpověď, kterou
nemusí brát na dobré slovo. Každá změna tvrzení, stavu nebo zdroje je vidět
jako rozdíl mezi dvěma verzemi — včetně toho, co bylo odstraněno a kdy.

## Dvě vrstvy historie

Git drží technickou historii všeho. Nad ním je ještě redakční, append-only
historie aktualizací dossieru: stručný, čitelný záznam „k tomuhle datu bylo
zkontrolováno tohle a změnilo se to". Do ní se nezasahuje zpětně, ani kvůli
překlepu — viz [průběžné ověřování](@/koncepty/prubezne-overovani.md).

## Druhá strana téže vlastnosti

Git nezapomíná. Co se do něj jednou dostane, přežívá ve forcích, cache a
zrcadlech i po smazání — což je přesně důvod pro
[bezpečnostní hranice](@/koncepty/bezpecnostni-hranice.md) a pro to, že sem
nepatří žádný citlivý nepublikovaný materiál.

Repozitář: [github.com/korczis/vomaste.cz](https://github.com/korczis/vomaste.cz).
