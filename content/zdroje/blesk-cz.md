+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Blesk.cz"
template = "source-catalog-entry.html"
weight = 310
description = "Blesk.cz — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/blesk-cz"
catalog_entry = "blesk-cz"
view_model = "generated/source-catalog.json"
+++

Celostátní bulvární deník. „Bulvár" je tu **označení typu zdroje**, ne úsudek o pravdivosti: co takový text spolehlivě doloží, je že výrok padl a že se něco stalo — kdo, kdy, kde, a co k tomu řekl.

Co nedoloží, je právě to, kvůli čemu se na něj v dossierech sahá nejčastěji: **jak se věc jmenuje právně a v jaké fázi řízení je**. A protože většina zdejších záznamů jsou přetisky ČTK, není jeho druhá věta o téže události druhým hlasem.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- Že výrok daného znění zazněl, je-li citován doslova a s uvedením mluvčího a příležitosti — včetně výroků, které jinde nezazněly (vyjádření na místě, bezprostřední reakce).
- Že se událost stala, v rozsahu data, místa a účastníků, opírá-li se text o citované úřední vyjádření (například stanovisko policejní mluvčí).

## Co nedokládá {#nedoklada}

- Kvalifikaci jednání. „Podvod", „vina" nebo „porušení zákona" v textu je popis, ne právní hodnocení; to náleží rozhodnutí orgánu.
- Procesní stav. Formulace typu „hrozí pokuta" nebo „čelí obvinění" nedokládá, v jaké fázi řízení věc je; procesní stav dokládá až úkon orgánu nebo jeho tisková zpráva.
- Přesná čísla. Částky a termíny se citují z primárního dokladu; text dokládá, že je někdo zveřejnil, ne jejich správnost.
- Nezávislost na jiném zdroji. Většina záznamů z tohoto vydavatele v datasetu nese rodinu `ctk` — jde tedy o přetisk téže agenturní zprávy, ne o samostatné zjištění.
- Nezávislé potvrzení dvěma vlastními texty. Dva články Blesk.cz jsou jeden vydavatel, tedy jeden hlas (pravidlo S10).

## Pasti {#pasti}

### První `<meta name="author">` je vydavatel

Stránka nese dvě značky `<meta name="author">`: nejprve `CZECH NEWS CENTER a. s.`, teprve pak skutečný podpis — `ČTK` u `igor-cerveny/SRC-02`, `Tomáš Belica,Magdalena Škapová` u `boris-stastny/SRC-08`. Rozhoduje druhá značka, respektive `article:author`. Kredit bývá i smíšený (`ČTK,Jaroslav Šimáček`, `Magdalena Škapová,ČTK`) — jedno jméno v podpisu tedy nevylučuje agenturní původ.

### JSON-LD označuje za autora sám web

I u textu, jehož metadata uvádějí autora `ČTK`, obsahuje JSON-LD uzel `"author":{"@type":"NewsMediaOrganization","name":"BLESK.cz"}`. Kdo čte jen JSON-LD, dostane vydavatele a agenturní původ mu unikne. Patička článku přitom rozdíl přiznává: „Zdroj: ČTK / Blesk Zprávy" u přebírky proti „Zdroj: Vera Renovica/Blesk" u vlastního textu.

### Formát není důvod zdroj vyřadit ani povýšit

Dossiery vedou tento zdroj jako **tabloid** — je to typ zdroje, ne hodnocení. Doslovná citace úředního vyjádření z něj má tutéž důkazní hodnotu jako odjinud (`macinka-turek/SRC-19`, stanovisko policejní mluvčí). Zároveň se ale nepočítá jako další redakční potvrzení téže kvality jako vlastní zpravodajství jiné redakce (`macinka-turek/SRC-04`). Past je v obou směrech: vyřadit ho kvůli formátu, nebo ho započítat jako plnohodnotné druhé ověření.

## Jak v něm hledat {#jak-hledat}

Rozhoduje druhá značka `<meta name="author">` nebo `article:author` a patička „Zdroj: …"; JSON-LD zde původ nerozliší. U smíšeného podpisu (`ČTK,<jméno>`) je text agenturního původu. Výrok cituj s příležitostí, při níž padl — tentýž mluvčí říká totéž opakovaně a jde pak o jeden hlas, ne o dva.

