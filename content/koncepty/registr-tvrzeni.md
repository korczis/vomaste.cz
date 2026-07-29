+++
title = "Registr tvrzení (CLM)"
description = "Atomické, ozdrojované tvrzení se stavem ověřenosti. Každé má vlastní stránku, vlastní ID a validátorem vynucenou shodu s přehledovou tabulkou dossieru."
template = "concept.html"
weight = 10

[extra]
lang = "cs"
seo_type = "WebPage"
group = "model"
code = "CLM-##"
tile_title = "Registr tvrzení"
tile_summary = "Každé tvrzení má stav ověřenosti a odkaz na zdroj, který ho podkládá."
+++

Tvrzení (*claim*) je nejmenší jednotka, se kterou tenhle web pracuje: jedna
konkrétní, ověřitelná věta o veřejném jednání veřejné osoby — ne odstavec, ne
příběh, ne charakteristika člověka. Nese vlastní identifikátor `CLM-##`, stav
ověřenosti a výčet zdrojů, které ho podkládají.

## Proč atomicky

Souvětí se nedá ověřit. Když je tvrzení rozsekané na samostatné výroky, jde u
každého říct, čím přesně je doložený a jak silně — a co z toho naopak
doložené není. Proto má každé tvrzení vlastní stránku s vlastní URL: dá se na
ni odkázat, citovat ji a sledovat její historii, ne jen ukázat na dossier jako
celek.

## Co vynucuje tooling

Tvrzení žije dvakrát: jako řádek v přehledové tabulce dossieru (to edituje
člověk) a jako vygenerovaná detailní stránka. `validate:dossier` shodí build,
pokud se text, stav nebo seznam zdrojů liší byť o jediný znak, a taky pokud
některé ID chybí, je duplicitní nebo odkazuje na neexistující zdroj. Stav
`CORROBORATED` navíc vyžaduje nejméně dva různé citované zdroje, stav
`1 ZDROJ` právě jeden.

Přehled všech stavů a co znamenají: [stavy tvrzení](@/koncepty/_index.md).
Tvrzení najdeš v registru každého [publikovaného dossieru](@/dossiers/_index.md).
