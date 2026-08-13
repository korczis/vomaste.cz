+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-04 — Registr smluv: měsíční otevřená data, agregace pro IČO 04449461"
description = "Primární evidence smluv, tentokrát přes měsíční otevřená data registru (data.smlouvy.gov.cz), ne přes vyhledávací formulář — řeší GAP-02, protože formulář neumí spočítat souhrnnou hodnotu."
template = "dossier-source.html"
weight = 4

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/martin-pavlik/sources/SRC-04"
view_model = "generated/views/dossiers/martin-pavlik/sources/src-04.json"
dossier = "martin-pavlik"
record_type = "source"
lang = "cs"
src_id = "SRC-04"
+++
**Řeší GAP-02.** Vyhledávací formulář registru smluv (citovaný v [SRC-03](@/dossiers/martin-pavlik/sources/src-03.md)) neumí spočítat souhrnnou hodnotu smluv — tiše ignoruje vlastní stránkovací parametr a na jakoukoli stránku vrací první (viz past zdokumentovaná v katalogu zdrojů, `data/source-catalog/registr-smluv.json`). Jediná cesta k reprodukovatelnému součtu jsou měsíční otevřená data (`data.smlouvy.gov.cz/dump_RRRR_MM.xml`) — dokumentované strojové rozhraní registru.

**Postup**: projektový nástroj `scripts/osint/screen-public-money.mjs` stáhl a prošel všech 122 dostupných měsíčních dumpů (2016-07 až 2026-08, což je celé období, které registr eviduje — zákon vyžaduje zveřejnění smluv nad 50 000 Kč až od 1. 7. 2016), vyfiltroval záznamy s protistranou IČO 04449461 a sloučil verze/dodatky do unikátních smluv. Běh 2026-08-06 potvrzuje **stejný počet, jaký uvádí vyhledávací formulář (119)** — dvě různé cesty ke stejnému primárnímu registru dávají shodný výsledek, což zvyšuje důvěru v číslo, i když nejde o nezávislý zdroj v redakčním smyslu (stejná `sourceFamily: smlouvy-gov-cz`).

**Nově, oproti SRC-03**: skutečná souhrnná hodnota — **53 934 085 Kč**, a to jako **spodní odhad**, protože 18 z 119 smluv nemá v datech vyplněnou hodnotu (57 smluv je s DPH, 44 bez DPH, 18 neuvedeno). Deset objednatelů, seřazeno podle objemu: Povodí Odry, s. p. (8 smluv, 22 397 750 Kč), Státní pozemkový úřad (67 smluv, 14 790 083 Kč + 13 bez hodnoty), Lesy České republiky, s. p. (25 smluv, 8 574 900 Kč), Jihomoravský kraj (4 smlouvy, 3 397 680 Kč + 2 bez hodnoty), Povodí Labe, s. p. (4 smlouvy, 2 021 500 Kč), Město Vsetín (3 smlouvy, 838 893 Kč + 1 bez hodnoty), Ministerstvo obrany ČR (3 smlouvy, 698 170 Kč + 2 bez hodnoty), Výzkumný ústav veterinárního lékařství, v. v. i. (3 smlouvy, 453 000 Kč), město Otrokovice (1 smlouva, 439 109 Kč), Statutární město Olomouc (1 smlouva, 323 000 Kč).

**Co to dokládá a co ne**: dokládá zveřejněný smluvní vztah, jeho deklarovanou hodnotu (kde je vyplněná) a objednatele. Nedokládá, že plnění proběhlo nebo bylo řádné — registr eviduje smlouvy, ne jejich naplnění. Nedokládá úplnost — smlouvy pod zákonným limitem 50 000 Kč a zákonné výjimky se nezveřejňují. Dodávat státním podnikům, úřadům a krajům je legální, běžná a zákonem vyžadovaná zveřejněná činnost; objem sám o sobě není tvrzení o pochybení.

Interní přehled, ze kterého číslo vychází, je `reports/public-money-screening.md` a `data/generated/public-money-screening.json` — nejsou publikovány na webu, jsou to pracovní podklady tohoto zdroje.
