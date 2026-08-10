+++
title = "Důvěra nemá vyžadovat značku"
description = "vomaste.cz nechce, aby mu lidé věřili proto, že se jmenuje vomaste.cz. Chce, aby si každé tvrzení, citaci a zdroj mohli ověřit sami — a nezáviselo to na jméně, které pod tím stojí."
template = "concept.html"
weight = 225

[extra]
lang = "cs"
seo_type = "WebPage"
group = "metodika"
icon = "M9 12l2 2 4-4 M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4Z"
tile_title = "Důvěra nemá vyžadovat značku"
tile_summary = "Autorita bez možnosti ověření je jen uhlazenější forma požadavku na poslušnost. Web je důvěryhodný jen do té míry, do jaké umožňuje vlastní kontrolu."
+++

Manifest, bod 15. Osm otázek z manifestu není rétorická ozdoba — každá
má na tomhle webu konkrétní, ověřitelnou odpověď. Tahle stránka je
spojuje s mechanismem, který na ně odpovídá.

## Osm otázek, osm mechanismů

**Odkud tvrzení pochází.** Každé faktické tvrzení vede ke jmenovanému
zdroji — [zdrojováno](@/koncepty/zdrojovano.md).

**Zda je citace přesná.** Přímý výrok zůstává citací, ne parafrází —
[stav: citace](@/koncepty/stav-citace.md).

**Zda zdroj skutečně existuje.** Zdroj musí být skutečně otevřený a
čtený, ne snippet z vyhledávače — vynucuje to publikační brána č. 1,
viz [autorizace rozsahu](@/koncepty/autorizace.md).

**Zda dva zdroje nejsou jedna redakce v jiném kabátě.** Pravidlo
nezávislosti zdrojových rodin (S2/S10) — rozvedeno v
[zdrojováno](@/koncepty/zdrojovano.md) a
[nezávislé doložení](@/koncepty/nezavisle-dolozeni.md).

**Zda nebyl procesní výsledek zaměněn za věcný.** Vlastní, striktně
vynucené rozlišení —
[procesní výsledek není věcný závěr](@/koncepty/procesni-vysledek.md).

**Zda jsou sporná tvrzení označena jako sporná.** Vlastní stav s
vizuálním odlišením, ne splynutí s doloženými fakty —
[stav: sporné](@/koncepty/stav-sporne.md).

**Zda změny zanechaly auditní stopu.** Každá revize je commit,
append-only historie aktualizací —
[verzováno v Gitu](@/koncepty/verzovano-v-gitu.md).

**Zda lze stejný výstup vytvořit ze stejných dat.** Deterministický
build z verzovaných vstupů, žádné kritické tajemství —
[strojově čitelná data](@/koncepty/strojove-citelna-data.md) a
[serverless jako vlastnost](@/koncepty/serverless.md).

## Proč je tenhle bod jiný než ostatní

Ostatní body manifestu popisují, jak se má chovat obsah. Tenhle popisuje,
proč nemá stačit **věřit**, že se ostatní body dodržují — proč musí jít
každý z nich zvlášť zkontrolovat, ne přijmout na základě jména projektu
nebo dobrého úmyslu.

## Autorita bez ověření

Web, který by řekl "věřte nám, ověřujeme si zdroje pečlivě" a
neumožnil to zkontrolovat, by dělal přesně to, co manifest v úvodu
popisuje jako poruchu veřejné paměti — jen s lepším designem. Rozdíl
mezi autoritou a důvěryhodností je přesně tady: autorita žádá, aby jí
někdo věřil; důvěryhodnost umožňuje, aby to nikdo věřit nemusel a
přesto mohl dojít ke stejnému závěru.
