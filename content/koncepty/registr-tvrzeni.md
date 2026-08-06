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
člověk) a jako vygenerovaná detailní stránka. `npm run data:validate` shodí
build (parita tabulky T1–T8), pokud se text, stav nebo seznam zdrojů liší byť
o jediný znak, a taky pokud některé ID chybí, je duplicitní nebo odkazuje na
neexistující zdroj. Stav `CORROBORATED` navíc vyžaduje aspoň jednu
[nezávislou dvojici](@/koncepty/nezavisle-dolozeni.md) zdrojů (S2), stav
`1 ZDROJ` naopak žádnou (S1) — počítají se nezávislé hlasy, ne citace.

Přehled všech stavů a co znamenají: [stavy tvrzení](../#stav).
Tvrzení najdeš v registru každého [publikovaného dossieru](@/dossiers/_index.md).

## Co všechno u tvrzení stojí

| pole | k čemu je |
|---|---|
| `CLM-##` | trvalý identifikátor; odkazuje se na něj z kauz, mezer i hran grafu |
| text | jedna věta, doslova stejná v tabulce i na detailní stránce |
| stav | jak silně je doložená — [pět stavů](../#stav) |
| zdroje | seznam `SRC-##`, každý s přímým odkazem na původní materiál |

Nic víc. Není tu pole pro „závažnost", „skóre" ani „hodnocení" — takové
pole by z registru udělalo žebříček obvinění, což je přesně to, čím tenhle
web není.

## Dvě reprezentace, jeden zdroj pravdy

Tvrzení je vidět na dvou místech: jako řádek v přehledové tabulce dossieru
a jako samostatná stránka s vlastní URL. Editor mění tabulku, stránky se
z ní generují — a `npm run data:validate` build shodí, když se rozejdou byť
o jediný znak. Bez té brány by web postupem času tvrdil dvě různé věci
podle toho, kam čtenář klikl.

## Proč má každé tvrzení vlastní URL

Aby se dalo citovat samostatně. Odkaz na dossier znamená „někde v tomhle
přehledu"; odkaz na `CLM-##` znamená přesně jednu větu, u které je vidět
stav, zdroje a [historie změn](@/koncepty/verzovano-v-gitu.md). To je
rozdíl mezi tvrzením, o kterém se dá věcně diskutovat, a dojmem z článku.

## Jak se tvrzení mění

Nikdy tichým přepsáním. Změna textu, stavu nebo seznamu zdrojů je vidět
v Gitu; podstatné změny navíc popisuje append-only historie aktualizací.
Tvrzení, které se ukázalo jako neudržitelné, se přeznačí nebo odstraní se
záznamem — ne potichu, jako by nikdy nebylo.
