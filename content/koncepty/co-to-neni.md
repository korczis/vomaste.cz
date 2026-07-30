+++
title = "Co vomaste.cz není"
description = "Ne drbárna, ne černá listina, ne investigativní redakce s nárokem na rozsudek — a rozhodně ne důvěrná schránka pro citlivé podněty."
template = "concept.html"
weight = 420

[extra]
lang = "cs"
seo_type = "WebPage"
group = "identita"
tile_title = "Není to"
bullets = [
  "Drbárna, černá listina ani skladiště podezření — „šedá“ nebo „černá“ vazba tu nikdy není verdikt.",
  "Investigativní redakce ani orgán, který by sám vyšetřoval nebo vynášel rozsudek o vině.",
  "Místo, kde se tvrzení jedné strany bere jako fakt jen proto, že je hlasitější — a kde se opakování téhož článku počítá jako nezávislé potvrzení.",
  "Důvěrná schránka: jediný kanál projektu jsou veřejné GitHub issues a pull requesty. Projekt nemá bezpečný intake pro citlivé podněty a nepředstírá opak.",
]
+++

## Ne černá listina

Zaznamenaný vztah není rozsudek. Sporné tvrzení není poloviční obvinění a
otevřená mezera není naznačení. Nikde tady nevzniká skóre důvěryhodnosti,
žebříček „nejhorších" ani gamifikace obvinění — a záznam o veřejné osobě se
nikdy nerozšiřuje na její okolí, děti nebo soukromé kontakty.

## Ne vyšetřovací orgán

Web nevyšetřuje, nevyslýchá, nezískává neveřejné dokumenty a **nerozhoduje o
vině ani nevině**. Pracuje výhradně s tím, co už jmenované, nezávislé zdroje
publikovaly. Kde skončí zdroje, skončí i web.

## Ne echo hlasitější strany

Že je jedna verze častěji opakovaná, jí nepřidává na doloženosti. Pět přetisků
téže agenturní zprávy je jeden zdroj — viz
[registr zdrojů](@/koncepty/registr-zdroju.md) a vydavatelské rodiny.

## Ne důvěrná schránka

Tohle je nejtvrdší hranice celého projektu: neexistuje bezpečný kanál pro
citlivé podněty, anonymita není garantovaná a všechno, co sem přijde, je
veřejné a trvalé. Podrobně:
[bezpečnostní hranice](@/koncepty/bezpecnostni-hranice.md).

Pozitivní vymezení najdeš na [co vomaste.cz je](@/koncepty/co-to-je.md).

## Proč se to vymezuje takhle tvrdě

Protože ke všem čtyřem věcem výše má takový web přirozený sklon. Registr
kauz se snadno čte jako seznam viníků; graf vazeb vypadá jako důkaz; SQL
konzole svádí spočítat „kdo má nejvíc tvrzení" a vydávat to za měřítko
provinění. Nic z toho pravidla nezakazují náhodou — zakazují to proto, že
by to vzniklo samo, kdyby se nepojmenovalo.

Většina těch hranic je i vynucená: autorizační brána nepustí nový subjekt
bez záznamu na řádku, validátor odmítne stav, který neodpovídá počtu
zdrojů, a `verify:jsonld` shodí build, kdyby se do strukturovaných dat
dostalo hodnocení pravdivosti.

## Není to ani hotová věc

Přehled je neúplný z principu — pokrývá jen to, co vyšlo ve jmenovaných
zdrojích, a co chybí, je vypsané v
[registru mezer](@/koncepty/registr-mezer.md). Části platformy, které
neexistují (JSON-LD exportní routy, příspěvkové CLI, fork starter kit),
jsou přiznané, ne inzerované jako „připravujeme".

## Když s něčím nesouhlasíte

Věcnou chybu — špatný zdroj, překroucené tvrzení, chybějící kontext — jde
nahlásit jako [veřejnou issue](https://github.com/korczis/vomaste.cz/issues/new)
a oprava zůstane dohledatelná v historii. Když nesouhlasíte s výběrem
témat nebo s celým přístupem, je legitimní odpověď fork: kód i data jsou
[public domain](@/koncepty/public-domain.md) právě proto, aby nesouhlas
nemusel končit hádkou o tenhle web.
