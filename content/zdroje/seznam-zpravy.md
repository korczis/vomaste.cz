+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Seznam Zprávy"
template = "source-catalog-entry.html"
weight = 200
description = "Seznam Zprávy — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/seznam-zpravy"
catalog_entry = "seznam-zpravy"
view_model = "generated/source-catalog.json"
+++

Redakce s vlastním zpravodajstvím. Právě proto je u ní kontrola kreditu důležitější než u čistého přebírajícího média: **část** produkce je vlastní a část přebraná, takže vydavatel sám o nezávislosti nevypovídá.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění, včetně vlastního investigativního zjištění, je-li tak článek podepsán.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není ověřen kredit u konkrétního článku.

## Pasti {#pasti}

### Byline rozhoduje o nezávislosti, ne logo

Tentýž web vydává vlastní zpravodajství i přebrané agenturní zprávy. O tom, zda jde o nezávislé doložení, rozhoduje kredit u konkrétního článku, ne vydavatel. Bez ověřeného kreditu je verdikt `unknown` a rodina se nevyplní — `unknown` NENÍ „vlastní zpravodajství".

## Jak v něm hledat {#jak-hledat}

Druhá nejcitovanější rodina v datasetu. U článku vždy zjisti, zda nese vlastní podpis, nebo přebírá ČTK — na tom stojí rozdíl mezi 1 ZDROJ a CORROBORATED.

