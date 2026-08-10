+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Věstník veřejných zakázek (VVZ)"
template = "source-catalog-entry.html"
weight = 30
description = "Věstník veřejných zakázek (VVZ) — co dokládá, co nedokládá a jak v něm hledat. primární registr, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/vestnik-verejnych-zakazek"
catalog_entry = "vestnik-verejnych-zakazek"
view_model = "generated/source-catalog.json"
+++

Věstník je primární evidence zadávacích řízení. Jeho jednostránková aplikace stojí na veřejném, neautentizovaném JSON API, které lze číst přímo.

Tiché ignorování filtrů je nejnebezpečnější vlastnost tohoto zdroje: nevrací chybu, vrací data. Odpověď na otázku, kterou služba neumí zodpovědět, je proto nutné **odmítnout**, ne aproximovat — jinak se z nefiltrovaného výpisu stane „zjištění".

## Co dokládá {#doklada}

- Že byla zakázka zadavatelem oznámena, opravena, zadána nebo zrušena — každý úkon jako samostatný formulář s datem.
- Průběh zadávacího řízení v čase, protože jedna zakázka kumuluje více formulářů (oznámení, opravy, výsledek, zrušení).

## Co nedokládá {#nedoklada}

- Že zakázka byla plněna nebo zaplacena. K tomu slouží registr smluv.
- Že v řízení bylo cokoli závadného. Opravný formulář (F14) je běžná součást zadávacího procesu, ne indicie.

## Pasti {#pasti}

### Vyhledávací endpoint TIŠE IGNORUJE nepodporované filtry

Dotaz na zakázky jednoho zadavatele vrátí tutéž nefiltrovanou stránku jako dotaz bez filtru — a ta míchá zadavatele dohromady. Ověřeno proti živé službě. Filtr na dodavatele, zadavatele, CPV kód ani název tedy **nelze použít**: výsledek vypadá jako nález, ale je to náhodný výřez všeho. Fungují jen `data.evCisloZakazkyVvz`, `variableId`, `publicId` a `page`.

### Jedna zakázka není jeden záznam

Číslo zakázky (`Z2022-009997`) pojmenovává několik formulářů, číslo formuláře (`F2022-015377`) jeden. Kdo z čísla zakázky vezme první formulář, zahodí zbytek historie, aniž by to bylo vidět.

### Starý věstník už neexistuje

Doména `vestnikverejnychzakazek.cz` se nepřekládá. Kód, který na ni míří, hlásí poruchu navždy — a pokud má náhradní data, vydává za výsledek smyšlenku.

## Jak v něm hledat {#jak-hledat}

Vyhledávej podle čísla zakázky nebo formuláře. Chceš-li zakázky konkrétního dodavatele, jdi oklikou přes registr smluv a odtud na čísla zakázek; přímý filtr na dodavatele věstník neumí a bude tvářit, že ano.

