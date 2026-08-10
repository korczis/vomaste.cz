+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Deník N"
template = "source-catalog-entry.html"
weight = 210
description = "Deník N — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/denik-n"
catalog_entry = "denik-n"
view_model = "generated/source-catalog.json"
+++

Předplatitelské médium s vlastní redakcí. Pro tenhle projekt je podstatné, že paywall neblokuje jen čtení, ale i strojové ověření původu — a nezjištěný původ se nesmí nahradit domněnkou.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není ověřen kredit u konkrétního článku.
- Ověřitelnost pro čtenáře bez předplatného — text je za paywallem.

## Pasti {#pasti}

### Byline rozhoduje o nezávislosti, ne logo

Tentýž web vydává vlastní zpravodajství i přebrané agenturní zprávy. O tom, zda jde o nezávislé doložení, rozhoduje kredit u konkrétního článku, ne vydavatel. Bez ověřeného kreditu je verdikt `unknown` a rodina se nevyplní — `unknown` NENÍ „vlastní zpravodajství".

### Paywall brání ověření kreditu

Detektor rodin skončí na uzavřeném textu verdiktem `unknown`. To není důvod rodinu odhadnout; je to důvod ji nevyplnit a tvrzení nepovyšovat.

## Jak v něm hledat {#jak-hledat}

U textů za paywallem ověř kredit z veřejně dostupné perexu nebo metadat. Nejde-li to, rodina zůstává nevyplněná.

