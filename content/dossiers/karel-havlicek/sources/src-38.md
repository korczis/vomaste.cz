+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-38 — Registr lobbování, veřejná stránka lobbovaného Karla Havlíčka"
description = "Veřejný záznam osoby v Registru lobbování (RELOB): evidenční číslo, datum zápisu, obě evidované veřejné funkce a seznam vykázaných kontaktů po vykazovacích obdobích."
template = "dossier-source.html"
weight = 38

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/karel-havlicek/sources/SRC-38"
view_model = "generated/views/dossiers/karel-havlicek/sources/src-38.json"
dossier = "karel-havlicek"
record_type = "source"
lang = "cs"
src_id = "SRC-38"
+++
Primární veřejný registr vedený podle zákona č. 168/2025 Sb.,
o regulaci lobbování — ne rešerše přes žurnalistiku. Registr je živý
systém bez data vydání; uvedené „ověřeno“ je datum dotazu, ne datum
platnosti údajů.

**Co dokládá.** Karel Havlíček je v registru veden jako **lobbovaný**
pod evidenčním číslem **RL5830385158**, se zápisem role lobbovaného
od **3. 7. 2025**. Registr u něj eviduje dvě veřejné funkce zároveň —
poslanec (Kancelář Poslanecké sněmovny) a ministr průmyslu a obchodu
(Ministerstvo průmyslu a obchodu) — a vede u něj jediný seznam
vykázaných kontaktů, rozdělený jen podle pololetních vykazovacích
období: 36 kontaktů za období 2025-2 a 53 za období 2026-1 (stav
k dotazu 5. 8. 2026). U probíhajícího období 2026-2 nebyl k témuž datu
vykázán žádný kontakt.

**Ověřitelnost.** Stránka je veřejně přístupná bez přihlášení; totéž
vrací i veřejné rozhraní registru na `/api/app/person/{id}/detail`.
Identifikátor osoby v URL je bezvýznamový identifikátor registru.

**Limity — co tento zdroj nedokládá.** Registr obsahuje jen kontakty,
které lobbista sám ohlásil, a jen za období od účinnosti zákona
(1. 7. 2025). Neříká nic o obsahu jednání, o tom, zda kontakt cokoli
ovlivnil, ani o tom, zda byl v čemkoli nepatřičný. Registr se navíc
v čase mění: při dotazu 5. 8. 2026 vracelo hromadné vyhledávání
kontaktů ([SRC-39](@/dossiers/karel-havlicek/sources/src-39.md)) o jeden
kontakt více (90, z toho 54 za období 2026-1) než stránka osoby později
téhož dne (89, z toho 53). Rozdíl se týkal jediného záznamu a nedotkl se
žádného z odvozených údajů této kauzy. Plný výčet omezení registru je
v [GAP-12](@/dossiers/karel-havlicek/gaps/gap-12.md).

Registr u fyzických osob zveřejňuje jméno, roli a evidenční číslo.
Žádné další osobní údaje se odsud do tohoto dossieru nepřebírají.
