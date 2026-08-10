+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Informační systém datových schránek (ISDS)"
template = "source-catalog-entry.html"
weight = 80
description = "Informační systém datových schránek (ISDS) — co dokládá, co nedokládá a jak v něm hledat. primární registr, omezený přístup."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/datove-schranky"
catalog_entry = "datove-schranky"
view_model = "generated/source-catalog.json"
+++

Záznam existuje hlavně proto, aby zabránil opakovanému hledání neexistující služby. Adaptér, který sliboval vyhledání schránky podle jména, mířil na API, které nikdy neexistovalo.

## Co dokládá {#doklada}

- Že subjekt má zřízenou datovou schránku, pokud jeho identifikátor znáš předem.

## Co nedokládá {#nedoklada}

- Nic o obsahu komunikace. Ta je ze zákona neveřejná.

## Pasti {#pasti}

### Zpětné vyhledání neexistuje

Veřejná služba, která by k IČO vrátila ID schránky, není k dispozici. Údaj o schránce se získává jako součást rejstříkového výpisu (ARES ROS), ne samostatným dotazem.

### Osmimístné ID schránky se plete s IČO

Obojí je osmiznakový řetězec. Kdo rozlišuje regulárním výrazem podle délky, pošle IČO do větve pro ID schránky a zpět dostane nesmysl.

## Jak v něm hledat {#jak-hledat}

Neptej se ISDS. Zeptej se ARES na sub-registr ROS a údaj o schránce si přečti z výpisu subjektu.

