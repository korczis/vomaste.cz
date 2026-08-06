+++
title = "Autonomní neznamená bez odpovědnosti"
description = "Automatizace smí kontrolovat strukturu, hledat rozbité odkazy a připravovat kandidátní záznamy. Nesmí sama rozhodnout, kdo je vinen, které tvrzení je pravdivé, nebo koho nově zařadit do dossieru — a nesmí to tiše publikovat."
template = "concept.html"
weight = 235

[extra]
lang = "cs"
seo_type = "WebPage"
group = "metodika"
icon = "M12 8v4l3 3 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
tile_title = "Autonomní neznamená bez odpovědnosti"
tile_summary = "Automatizace kontroluje strukturu a připravuje kandidáty. Vinu, pravdivost tvrzení a nové zařazení do dossieru rozhoduje vždy člověk s dohledatelnou stopou."
+++

Manifest, bod 13. Tenhle web je z velké části stavěný a udržovaný pomocí
AI agentů — takže tohle pravidlo není teoretická opatrnost, je to popis
skutečné hranice mezi tím, co automatizace na tomhle projektu dělá, a
co nikdy sama nedělá.

## Co automatizace smí

Kontrolovat strukturu (rozbité odkazy, chybějící kotvy, nekonzistentní
identifikátory), generovat registry ze surových dat, porovnávat verze a
publikovat výstup, který už prošel kontrolou. Smí taky objevovat,
normalizovat a deduplikovat kandidátní záznamy — připravit je k
posouzení, ne je rovnou zveřejnit.

## Co automatizace nesmí

Rozhodnout, že je někdo vinen. Rozhodnout, že nepotvrzené tvrzení je
pravdivé. Rozhodnout, že nový subjekt nebo nová kauza patří do veřejného
dossieru. A hlavně: nesmí kandidátní záznamy tiše sloučit do veřejných
kanonických dat, commitnout je, pushnout je nebo nasadit bez lidského
review diffu. Recenzní model dovoluje dávkové schválení — jeden
recenzent posoudí koherentní dávku najednou — ale pořád to je posouzení
**člověkem**, ne automatický průchod.

## Proč zrovna tahle hranice

Protože otázky, které automatizace nesmí rozhodovat, jsou přesně ty,
kde selhání nejvíc bolí: falešně obviněná osoba, falešně potvrzené
tvrzení nebo subjekt zařazený do veřejného záznamu bez skutečného
veřejného zájmu. Kontrola struktury (rozbitý odkaz, nekonzistentní
JSON) má jedno správné řešení, které jde ověřit mechanicky. Otázka
"je tohle tvrzení pravdivé" nemá — vyžaduje úsudek, který musí zůstat
dohledatelný k člověku, ne k modelu.

## Jak to vypadá v praxi

Multi-instance koordinace tohoto repozitáře (viz
[docs/coop/PROTOCOL.md](https://github.com/korczis/vomaste.cz/blob/master/docs/coop/PROTOCOL.md))
běží na stejném principu jedním patrem níž: jen jedna instance
(„ORCH", hlavní checkout) smí mergovat a pushovat do `master`; ostatní
instance pracují ve vlastních izolovaných worktreech a čekají na
review. Autonomie v provozu — validace, build, paralelní příprava
kandidátů — je vítaná a rychlá. Autorita nad tím, co se stane trvalou
součástí veřejného záznamu, zůstává jednobodová a dohledatelná.

## Rychlý autonomní systém není totéž co spolehlivý

Systém, který dokáže pracovat rychle bez zastavení, ale nemá bod, kde
se rozhodnutí o vině, pravdivosti nebo rozsahu zastaví u člověka, není
autonomní epistemická infrastruktura — je to jen rychlý způsob, jak
zesílit a zveřejnit cizí (nebo vlastní) chybu dřív, než ji někdo stihne
zkontrolovat. Rychlost provozu a pomalost odpovědnosti nejsou v
rozporu; jsou to dvě různé vrstvy téhož systému.
