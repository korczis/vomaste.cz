+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "ARES — Administrativní registr ekonomických subjektů"
template = "source-catalog-entry.html"
weight = 10
description = "ARES — Administrativní registr ekonomických subjektů — co dokládá, co nedokládá a jak v něm hledat. primární registr, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/ares"
catalog_entry = "ares"
view_model = "generated/source-catalog.json"
+++

ARES je pro tenhle projekt výchozí primární zdroj rejstříkových vazeb. Je zdarma, bez autentizace a bez captchy, a jako jediný veřejný přístupový bod nabízí deset sub-registrů pod jedním IČO.

Co z něj tento web nepřebírá: **datum narození a adresu bydliště fyzických osob**, přestože je odpovědi obsahují. Pro evidenci rejstříkové vazby nejsou potřebné a jejich publikace by z administrativního faktu udělala zásah do soukromí.

## Co dokládá {#doklada}

- Že subjekt s daným IČO je v konkrétním veřejném rejstříku zapsán, a s jakými údaji k datu výpisu.
- Obsazení statutárního orgánu a společníků včetně dat zápisu a výmazu (sub-registr VR).
- Předmět podnikání a živnostenská oprávnění (sub-registr RŽP).

## Co nedokládá {#nedoklada}

- Skutečný rozsah činnosti, faktické rozhodování ani jakékoli pochybení. Zápis do orgánu je administrativní fakt, ne indicie.
- Totožnost osoby napříč subjekty. ARES vrací jméno, ne identifikátor osoby; shoda jména není shoda osoby.
- Aktuálnost k dnešku u záznamů, které rejstřík zveřejňuje se zpožděním po zápisu soudem.

## Pasti {#pasti}

### Dva různé významy odpovědi 404

`{"kod":"NENALEZENO","subKod":"VYSTUP_SUBJEKT_NENALEZEN"}` znamená, že subjekt v tomto sub-registru zapsán není — je to řádná odpověď, ne porucha. Naproti tomu `{"status":404,"error":"Not Found","path":…}` znamená, že neexistuje sám endpoint. Sloučení obojího do „nenalezeno" vede k závěru, že sub-registr neexistuje, ačkoli jen daný subjekt v něm není zapsán.

### Dva různé významy odpovědi 400

`VYSTUP_PRILIS_MNOHO_VYSLEDKU` znamená přes tisíc výsledků, tedy „zpřesni dotaz". `VSTUP_PRAZDNY` znamená, že se na dané pole vůbec neindexuje. První je obchodní odpověď, druhý konstrukční omezení dotazu.

### Desetinný oddělovač je středník

Částky přicházejí jako `"390000000;00"`, tisíce oddělené nezlomitelnou mezerou (U+00A0) nebo úzkou nezlomitelnou mezerou (U+202F). Naivní `parseFloat` vrátí řádově jinou hodnotu.

### Dvojí časová platnost ve VR

`datumZapisu`/`datumVymazu` je platnost ZÁZNAMU, `clenstvi.vznikClenstvi`/`zanikClenstvi` je platnost ČLENSTVÍ. Přeregistrace vytvoří nový záznam, aniž by členství skončilo — kdo počítá záznamy, napočítá víc funkčních období, než jich bylo.

### „Nenastaveno" je prázdný objekt

Sub-registr ROS zanořuje skaláry jako `%{"hodnota" => …}`, data jako `%{"datum" => …}` a pro nevyplněné pole vrací `{}`, ne `null`.

## Jak v něm hledat {#jak-hledat}

Vyhledávání podle IČO je adresné a levné. Podle jména existuje, ale vrací nejvýše tisíc výsledků a u běžných jmen je nepoužitelné — používej ho k potvrzení, ne k objevování. Pole `seznamRegistraci` v odpovědi říká předem, ve kterých sub-registrech subjekt záznam má; ušetří to slepé dotazy.

