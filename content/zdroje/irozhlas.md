+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "iROZHLAS / Český rozhlas"
template = "source-catalog-entry.html"
weight = 220
description = "iROZHLAS / Český rozhlas — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/irozhlas"
catalog_entry = "irozhlas"
view_model = "generated/source-catalog.json"
+++

Veřejnoprávní médium. Jeho výhodou pro rešerši je otevřenost — text i kredit jsou dostupné bez předplatného, takže rodinu lze ověřit strojově, ne odhadem.

## Co dokládá {#doklada}

- Že veřejnoprávní rozhlas k danému datu zveřejnil text nebo reportáž daného znění.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není ověřen kredit u konkrétního článku.

## Pasti {#pasti}

### Byline rozhoduje o nezávislosti, ne logo

Tentýž web vydává vlastní zpravodajství i přebrané agenturní zprávy. O tom, zda jde o nezávislé doložení, rozhoduje kredit u konkrétního článku, ne vydavatel. Bez ověřeného kreditu je verdikt `unknown` a rodina se nevyplní — `unknown` NENÍ „vlastní zpravodajství".

## Jak v něm hledat {#jak-hledat}

Veřejnoprávní médium bez paywallu, takže kredit u článku je zpravidla strojově ověřitelný. Použitelné jako doplněk k ČTK, ale jen po ověření, že článek není jejím převzetím.

