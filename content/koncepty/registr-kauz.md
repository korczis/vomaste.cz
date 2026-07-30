+++
title = "Registr kauz (CASE)"
description = "Kauza je tematický celek s obdobím, stavem a vazbou na konkrétní tvrzení — s procesním výsledkem důsledně odděleným od meritorního rozhodnutí."
template = "concept.html"
weight = 30

[extra]
lang = "cs"
seo_type = "WebPage"
group = "model"
code = "CASE-##"
tile_title = "Registr kauz"
tile_summary = "Tematické celky s obdobím, stavem a vazbou na konkrétní tvrzení — včetně procesního stavu odděleného od merita."
+++

Kauza (*case*) drží pohromadě tvrzení, která patří k jednomu tématu: nese
identifikátor `CASE-##`, období, kterého se týká, stav a odkaz na kanonický
text v dossieru.

## Proč detailní stránka neduplikuje vyprávění

Stránka kauzy odkazuje na kanonický text v hlavním dossieru kotvou, místo aby
ho zkopírovala. Důvod je praktický i etický: nejcitlivější formulace — třeba
u případu domácího násilí — pak existují na jediném editovatelném místě.
Dvě kopie by se rozešly a jedna z nich by zůstala neopravená.

## Procesní výsledek ≠ rozhodnutí o vině

Odložení, promlčení, nepravomocné rozhodnutí, zastavení řízení: to všechno
jsou procesní důsledky, ne zjištění, že se něco stalo nebo nestalo. Tenhle web
je odlišuje **pokaždé**, když je zmíní — ne jednou v poznámce pod čarou.
Promlčení znamená, že trestní stíhání už není právně možné; neznamená, že
obvinění bylo pravdivé, ani že bylo vyvrácené.

## Co vynucuje tooling

Karty kauz v hlavní stránce dossieru a vygenerované detailní stránky musí
souhlasit 1:1; `validate:dossier` a `generate:stats` build shodí, když se
počty nebo texty rozejdou. `verify:anchors` navíc kontroluje, že každá kotva,
na kterou kauza odkazuje, v hotovém HTML skutečně existuje.

## Kauza není obvinění

Že je něco vedené jako kauza, znamená, že se o tom veřejně psalo a že to má
víc než jedno tvrzení — ne že se něco stalo. Uvnitř kauzy může být tvrzení
[ověřené více zdroji](@/koncepty/stav-overeno-vice-zdroji.md) vedle
[sporného](@/koncepty/stav-sporne.md) a vedle
[citace](@/koncepty/stav-citace.md); souhrnný stav kauzy proto nikdy
nenahrazuje čtení jednotlivých tvrzení.

## Období není totéž co „kdy se to stalo"

Období u kauzy říká, jaký časový úsek pokrývá **citované zpravodajství** —
od prvního článku po poslední doložený vývoj. Není to zjištění o tom, kdy
se co odehrálo, a nekončí tím, že věc skončila; končí tam, kam sahají
zdroje.

## Když se kauza pohne

Nový vývoj se přidá jako další tvrzení s vlastním zdrojem a stav kauzy se
upraví jen v rozsahu, který ten vývoj skutečně pokrývá. Uzavření jedné
větve neuzavírá kauzu jako celek a odložení z procesních důvodů se nikdy
nezapisuje jako konec věci — viz
[průběžné ověřování](@/koncepty/prubezne-overovani.md).

## Nejcitlivější texty na webu

Nejzávažnější kauzy — typicky ty, kde stojí obvinění proti popření — se
řídí přísnějším režimem: nikdy se nenaznačuje vina, procesní výsledek se
odlišuje pokaždé, popření se cituje doslova a nejmenovaná třetí strana
zůstává nejmenovaná i tady. Ta pravidla nejsou stylistická preference, jsou
zapsaná v redakčních pravidlech repozitáře a platí bez výjimky pro
atraktivnější příběh.
