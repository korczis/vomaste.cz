+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Hlídač státu"
template = "source-catalog-entry.html"
weight = 60
description = "Hlídač státu — co dokládá, co nedokládá a jak v něm hledat. agregátor, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/hlidac-statu"
catalog_entry = "hlidac-statu"
view_model = "generated/source-catalog.json"
+++

Hlídač státu je v tomto katalogu veden jako **rozcestník, ne jako doklad**. Jeho hodnota je v tom, že rychle ukáže, ve kterých veřejných databázích má subjekt stopu; hodnota důkazní patří vždy až primárnímu registru.

## Co dokládá {#doklada}

- Že v jím indexovaných veřejných databázích existuje záznam odpovídající dotazu, a v jaké souhrnné podobě.

## Co nedokládá {#nedoklada}

- Nic sám o sobě. Je to agregátor primárních registrů; doklad je vždy až ten primární záznam, na který odkazuje.
- Úplnost ani aktuálnost svých indexů.

## Pasti {#pasti}

### Webové API vyžaduje token

Neautentizované volání vrací 404, ne 401 — vypadá to jako neexistující endpoint, ne jako chybějící oprávnění.

### Shoda jména není shoda osoby

Agregované profily spojují záznamy podle jména. U běžných jmen slučují víc osob dohromady; použij je jako stopu, ne jako doklad.

## Jak v něm hledat {#jak-hledat}

Dobrý vstupní bod pro orientaci, kde vůbec hledat. Každé zjištění pak dohledej v primárním registru a cituj ten.

