+++
title = "Autorizace rozsahu"
description = "Výchozí stav je nepokrývat nikoho. Kdo/co smí web pokrýt, určuje append-only autorizační log v AGENTS.md — a od 2026-08-05 standing-scope pravidlo pro veřejně činné osoby, které nahrazuje dřívější jmenné schvalování, ale ne devět publikačních bran."
template = "concept.html"
weight = 345

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
tile_title = "Autorizace rozsahu"
tile_summary = "Výchozí stav je nepokrývat nikoho. Kdo smí být pokryt a proč, je append-only log — ne redakční rozmar."
+++

Manifest, bod 8: rozsah musí být autorizovaný a dohledatelný. Tahle
stránka rozvádí, co to konkrétně znamená a jak se to od 2026-08-05
změnilo, aniž by se změnilo, co smí být publikováno.

## Výchozí stav: nikdo

Dokud pro osobu, organizaci nebo téma neexistuje autorizační záznam, web
o nich nic nepublikuje — bez ohledu na to, jak veřejně zajímavé by to
bylo. „Je to veřejně zajímavé" ani „už to někde vyšlo" samo o sobě důvod
není.

## Standing scope — co se změnilo 2026-08-05

Do 2026-08-05 potřebovala každá nová osoba nebo téma samostatné, datované
schválení vlastníka projektu — jmenovaný rozhovor, jeden záznam v logu za
druhým. Záznam `AUTH-2026-08-05-PLATFORM-SCOPE` tuhle jednotlivou
schvalovací ceremonii nahradil **stojícím rozsahem** (standing scope) pro
veřejně činné osoby: veřejní funkcionáři a politicky exponované osoby,
kandidáti na veřejné funkce, firmy a instituce materiálně napojené na
veřejné peníze, veřejnou moc nebo regulovanou činnost, a další subjekty,
kde důvěryhodné zdroje samy zakládají konkrétní a přiměřený veřejný
zájem.

Starší, jednotlivě schválené záznamy se tím **neruší ani nepřepisují** —
zůstávají trvalým historickým dokladem toho, co bylo schváleno podle
tehdejšího modelu. Standing scope řeší jen to, **kdo smí být zkoumán**;
neřeší a nesnižuje to, **co smí být publikováno**.

## Devět publikačních bran platí bez výjimky

Rozšířený rozsah zkoumání neznamená rozšířená volnost publikace. Než
záznam smí vstoupit do veřejného datasetu, musí projít devíti branami:
jmenovaný a skutečně otevřený zdroj, zaznamenaná provenience, věrný stav
(citace zůstává citací, sporné zůstává sporné, procesní výsledek se
nepřepisuje na věcný — viz
[procesní výsledek](@/koncepty/procesni-vysledek.md)), žádná vina podle
grafu vztahů, nezávislost zdrojových rodin (viz
[zdrojováno](@/koncepty/zdrojovano.md)), minimalizace osobních dat,
proporcionalita vůči nejmenovaným třetím osobám, revidovatelná změna (viz
[verzováno v Gitu](@/koncepty/verzovano-v-gitu.md)) a deterministický
veřejný build bez závislosti na privátní infrastruktuře. Chybí-li
kterákoli z nich, záznam do datasetu nepatří — bez ohledu na to, jak
široký je rozsah zkoumání.

## Mechanická brána zaostává za politikou úmyslně

Standing scope je redakční politika. Sama o sobě zatím neobchází
mechanickou kontrolu: `scripts/dossier/validate-authorization.mjs` a
`npm run dossier:scaffold` dodnes vyžadují odpovídající záznam v
`data/authorizations.toml`, dokud validátor nebude přepsán tak, aby
uznával i standing-scope záznam samotný. To je vědomé rozhodnutí, ne
mezera — podle vlastní konstituce projektu (§8) pravidlo, které nic
nevynucuje, se nepočítá za implementované. Zapsání autorizačního záznamu
pro subjekt ve stojícím rozsahu je tedy pořád povinný, ale čistě
mechanický/auditní krok — ne nová schvalovací ceremonie.

## Recenzní model nahrazuje schvalování jméno po jménu

Namísto schvalování každého subjektu zvlášť teď funguje dávkové review:
lidský recenzent schválí koherentní dávku kandidátních záznamů po
kontrole jejich diffu, pokud každý propagovaný záznam sám splňuje všech
devět bran výše. Automatizace smí objevovat, normalizovat, deduplikovat
a připravovat kandidátní záznamy bez schválení jednotlivě po entitách —
nesmí je ale tiše sloučit do veřejných kanonických dat, commitnout,
pushnout nebo nasadit.

## Proč to musí zanechávat stopu

Moc rozhodnout, koho systém začne sledovat, je sama o sobě mocí, kterou
je potřeba mít pod kontrolou — proto autorizační log v
[AGENTS.md](@/dokumentace/agents.md) je append-only a historické záznamy
se nemažou ani nepřepisují, ani když je pravidlo, podle kterého vznikly,
později nahrazeno novým.
