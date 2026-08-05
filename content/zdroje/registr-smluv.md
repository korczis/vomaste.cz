+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Registr smluv (ISRS)"
template = "source-catalog-entry.html"
weight = 20
description = "Registr smluv (ISRS) — co dokládá, co nedokládá a jak v něm hledat. primární registr, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/registr-smluv"
catalog_entry = "registr-smluv"
view_model = "generated/source-catalog.json"
+++

Registr smluv je primární doklad peněžního vztahu mezi soukromým subjektem a veřejným rozpočtem, a proto zdroj s nejvyšší důkazní hodnotou pro otázku „kdo bere veřejné peníze".

Metodická poznámka: součet hodnot smluv **není** totéž co příjem subjektu. Smlouvy se mění dodatky, každý dodatek je samostatný záznam, a část záznamů uvádí hodnotu bez DPH, část s DPH, část v cizí měně. Agregovanou částku publikuj jen tehdy, když je jasně řečeno, co se sčítalo.

## Co dokládá {#doklada}

- Že mezi konkrétním veřejným zadavatelem a konkrétní protistranou byla uzavřena a zveřejněna smlouva, s předmětem, datem a hodnotou.
- Objem a četnost obchodního vztahu se státem v čase, protože zákon o registru smluv ukládá zveřejnění jako podmínku účinnosti.

## Co nedokládá {#nedoklada}

- Že plnění proběhlo, ani že bylo řádné. Registr eviduje smlouvy, ne jejich naplnění.
- Že šlo o cokoli nestandardního. Dodávat státním podnikům je legální, běžná a veřejně evidovaná činnost.
- Úplnost. Smlouvy pod zákonným limitem a zákonné výjimky se nezveřejňují, takže absence záznamu není důkaz absence vztahu.

## Pasti {#pasti}

### Parametr `format=json` se tiše ignoruje

Dotaz s `&format=json` vrátí HTTP 200 a HTML. Kdo výstup nezkontroluje, parsuje stránku jako data a dostane nulu výsledků bez jediné chybové hlášky.

### Stránkování nepřežije holý GET

Vyhledávání je formulářová aplikace na Nette. Stránkování jede přes signály `searchResultList-offset` / `searchResultList-limit` s `do=searchResultList-setOffset`, a ty potřebují kompletní sadu parametrů formuláře. Vlastní `&page=N` se **tiše ignoruje** a vrátí znovu první stránku — kdo si nehlídá duplicitu, stáhne tutéž stránku N-krát a vydá to za N-krát větší vzorek.

### Protistrana není publikující subjekt

`party_idnum` hledá IČO protistrany (typicky dodavatele), `subject_idnum` IČO zveřejňujícího subjektu (typicky úřadu). Záměna vrátí prázdný výsledek u firmy, která ve skutečnosti stovky smluv má.

## Jak v něm hledat {#jak-hledat}

Pro spolehlivý a opakovatelný odečet používej otevřená data — měsíční dávky v XML — ne scraping vyhledávacího formuláře. Formulář je dobrý na ověření jednotlivosti a na zjištění počtu záznamů, který stránka uvádí přímo („Počet nalezených záznamů"). Ten počet je citovatelný i tehdy, když se agregace hodnot nepodařila spočítat.

