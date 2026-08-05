+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Sbírka listin veřejného rejstříku"
template = "source-catalog-entry.html"
weight = 40
description = "Sbírka listin veřejného rejstříku — co dokládá, co nedokládá a jak v něm hledat. primární listina, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/justice-sbirka-listin"
catalog_entry = "justice-sbirka-listin"
view_model = "generated/source-catalog.json"
+++

Sbírka listin je nejvyšší stupeň důkazu, který má tenhle projekt bez žádosti podle zákona o svobodném přístupu k informacím k dispozici. Kde rejstříkový výpis říká „je zapsán", listina říká „takto to bylo podepsáno a kým".

Používá se zejména k **rozlišení osob stejného jména**. Dokud identita napříč subjekty nestojí na listině, zůstává evidovaná jako mezera, ne jako tvrzení.

## Co dokládá {#doklada}

- Znění zakladatelských dokumentů, účetních závěrek a rozhodnutí valné hromady tak, jak byly soudu skutečně založeny.
- Totožnost osoby napříč subjekty, protože listiny nesou rodné číslo nebo datum narození, které rejstříkový výpis v agregátorech neukazuje.

## Co nedokládá {#nedoklada}

- Aktuálnost. Zakládání listin má zákonné lhůty a část subjektů je nedodržuje; chybějící závěrka není důkaz o hospodaření.
- Nic o osobách, které v listinách nefigurují.

## Pasti {#pasti}

### Listiny jsou skeny, ne data

Většina dokumentů je PDF sken bez textové vrstvy. Strojové čtení vyžaduje OCR a jeho výstup je nutné před citací ověřit okem.

### Osobní údaje v listinách

Listiny běžně obsahují rodná čísla a adresy bydliště. Slouží k rozlišení osob při rešerši; do publikovaného dossieru se nepřebírají.

## Jak v něm hledat {#jak-hledat}

Najdi subjekt podle IČO, otevři oddíl Sbírka listin a jdi po zakladatelských dokumentech a smlouvách o převodu podílu. Tohle je jediný veřejný zdroj, který spolehlivě odliší jmenovce.

