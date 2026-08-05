+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "ÚDHPSH — Úřad pro dohled nad hospodařením politických stran a politických hnutí"
template = "source-catalog-entry.html"
weight = 90
description = "ÚDHPSH — Úřad pro dohled nad hospodařením politických stran a politických hnutí — co dokládá, co nedokládá a jak v něm hledat. primární registr, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/udhpsh"
catalog_entry = "udhpsh"
view_model = "generated/source-catalog.json"
+++

Primární registr, ne médium. Zprávy o hospodaření stran a o financování kampaní tu leží v podobě, v jaké je subjekty Úřadu předložily — což je zároveň jejich hlavní mez: **registr dokládá vykázané, ne skutečné**.

Pro tenhle projekt je ÚDHPSH ukázkou dvou samostatných pastí naráz. Úřední slovník („úplná") svádí ke čtení, které úřad sám na téže stránce vylučuje. A agregátor, který registr přebírá, vypadá jako druhý zdroj, přestože je to totéž číslo přečtené podruhé.

Webové sídlo úřadu je [udhpsh.cz](https://udhpsh.cz/); citovatelné dokumenty jsou na portálu zpráv.

## Co dokládá {#doklada}

- Že strana nebo hnutí předložilo Úřadu zprávu daného znění k danému datu a jaké položky v ní vykázalo. Jde o primární úřední dokument, ne o zpravodajství o něm.
- Jak je plnění zařazeno v samotné zprávě. Část V. („Dary") a část VI. („Ostatní bezúplatná plnění") jsou různé kategorie a zpráva mezi nimi rozlišuje — u vykázané položky tedy dokládá i to, zda šlo o peněžitý dar, nebo o bezúplatné plnění.
- Že k datu otevření registr sankcí u daného subjektu eviduje, nebo neeviduje záznam k určité agendě a období.

## Co nedokládá {#nedoklada}

- Věcnou správnost vykázaných údajů. Stav „zpráva je úplná" se týká formálních náležitostí a předepsaného formuláře; Úřad k němu sám připojuje vysvětlivku, že nejde o výsledek kontroly správnosti údajů.
- Úplnost skutečného financování. Zpráva dokládá, co subjekt vykázal, ne co přijal.
- Totožnost dárce. Registr vede jméno, titul a datum narození, ne identifikátor osoby — shoda jména není shoda osoby.
- Že se nic nestalo. Prázdný záznam v registru sankcí dokládá jen to, že k datu otevření není evidována sankce; nedokládá, že řízení neprobíhá ani že je vykázané v pořádku.

## Pasti {#pasti}

### „Úplná" není „zkontrolovaná"

Přehled zpráv uvádí u každého subjektu řádek „výsledek kontroly: zpráva je úplná *". Slovo „kontrola" je v označení řádku, ale hvězdička odkazuje na vysvětlivku Úřadu na téže stránce: „Výroční finanční zpráva je dle zákona úplná, obsahuje-li všechny požadované náležitosti a je-li předložena na předepsaném formuláři s přílohami. **Nejedná se o výsledek kontroly správnosti údajů.**" Přečteno obráceně by z formální kompletnosti vzniklo doložení věcné správnosti, které úřad výslovně odmítá. Doloženo v `richard-chlad/SRC-07`.

### Hlídač státu registr reprodukuje, nepotvrzuje ho

Profil sponzoringu na Hlídači státu přebírá položky z výroční finanční zprávy včetně jejich vlastního znění („propůjčení vozů Bugatti na akci", „výroba a instalace Billboardu, pronájem rekl.plochy"). Registr a jeho zrcadlo proto nejsou dva nezávislé hlasy — právě proto nese `richard-chlad/SRC-01` rodinu `udhpsh`, přestože jeho outlet je Hlídač státu. Navíc agregátor zobrazuje obě kategorie pod nadpisem „Přehled jednotlivých darů", zatímco zpráva tytéž položky vede jako bezúplatná plnění. Citovat se má registr, ne zrcadlo.

### Jmenovci se liší jen ročníkem narození

Ve zprávě za rok 2024 jsou u hnutí Motoristé sobě vedeny dva peněžité dary po 50 000 Kč od dárce „Chlad, Richard 27.05.1992", zatímco pětice bezúplatných plnění ve zprávě za rok 2025 patří Ing. Richardu Chladovi s ročníkem 1962. Bez porovnání data narození by se dvě různé osoby slily do jedné a součet by vznikl napříč nimi. Doloženo v `richard-chlad/SRC-06`.

## Jak v něm hledat {#jak-hledat}

Adresace je per subjekt a rok: `/zpravy/vfz<rok>` je přehled všech podaných výročních zpráv, `/zprava/vfz<rok>/<slug-subjektu>` konkrétní zpráva, `/zprava/ps<rok>/<slug-subjektu>` zpráva o financování volební kampaně, `/sankce` registr sankcí. Přehledy nabízejí i strojová data (CSV / XLS / JSON). U jmenovaného dárce vždy porovnej datum narození, ne jen jméno; u částky vždy uveď, ze které části zprávy pochází.

