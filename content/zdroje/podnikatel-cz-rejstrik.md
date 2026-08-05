+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Podnikatel.cz — rejstříkové profily"
template = "source-catalog-entry.html"
weight = 70
description = "Podnikatel.cz — rejstříkové profily — co dokládá, co nedokládá a jak v něm hledat. agregátor, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/podnikatel-cz-rejstrik"
catalog_entry = "podnikatel-cz-rejstrik"
view_model = "generated/source-catalog.json"
+++

Sekundární rejstříkový agregátor. V tomto projektu se objevuje jako **výchozí kotva** u nových subjektů: ukáže, kde hledat, a tam se doložení pořizuje znovu z primárního rejstříku.

## Co dokládá {#doklada}

- Že profil k danému jménu na uvedené adrese existuje a jaké role zobrazuje.

## Co nedokládá {#nedoklada}

- Skutečný rozsah rolí. Agregátor přebírá data z rejstříků se zpožděním a bez záruky úplnosti.
- Totožnost osoby. Profil slučuje záznamy podle jména; jmenovci splývají.

## Pasti {#pasti}

### Profil může mísit jmenovce

Jediná stránka může nést role několika různých lidí téhož jména. Před převzetím role ji ověř v ARES podle IČO subjektu.

## Jak v něm hledat {#jak-hledat}

Použitelný jako identitní kotva a rychlý přehled vazeb, odkud se skáče do ARES a Sbírky listin. Sám o sobě nese stav 1 ZDROJ.

