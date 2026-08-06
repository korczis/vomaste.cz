+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-39 — Registr lobbování, veřejné vyhledávání vykázaných kontaktů"
description = "Veřejné rozšířené vyhledávání kontaktů v Registru lobbování přes všechna vykazovací období — kdo kontakt vykázal, přes kterého zprostředkovatele, k jakému předmětu a v čí zájem."
template = "dossier-source.html"
weight = 39

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/karel-havlicek/sources/SRC-39"
view_model = "generated/views/dossiers/karel-havlicek/sources/src-39.json"
dossier = "karel-havlicek"
record_type = "source"
lang = "cs"
src_id = "SRC-39"
+++
Primární veřejný registr vedený podle zákona č. 168/2025 Sb.,
o regulaci lobbování. Údaje pocházejí z veřejného rozšířeného
vyhledávání kontaktů, dotázaného programově 5. 8. 2026 přes veřejné
rozhraní registru (`/api/app/search-lobbyist-contact/advanced`) se
všemi vykazovacími obdobími a všemi čtyřmi typy předmětu vlivu —
tedy bez jakéhokoli zúžení. Dotaz lze zopakovat i ručně ve formuláři
na uvedené adrese; registr je živý, takže výsledek je stav k okamžiku
dotazu.

**Co dokládá.** K 5. 8. 2026 obsahoval registr celkem 986 vykázaných
kontaktů a 2 496 osob zapsaných jako lobbované. Kontaktů, u nichž je
mezi lobbovanými uveden Karel Havlíček, bylo **90** (36 za období
2025-2, 54 za období 2026-1). Vykázalo je 43 různých lobbistů, všech
43 zapsaných jako právnické osoby; nejvíce Hospodářská komora ČR (13),
Lobbio, z.s. (9), Svoboda zvířat, z.s. (7), Svaz průmyslu a dopravy ČR
(6), Svaz energetiky ČR (5) a Hnutí DUHA (4). U 89 z 90 kontaktů je
uveden aspoň jeden zprostředkovatel (celkem 81 různých osob), u 15
kontaktů i to, v čí zájem kontakt proběhl. Předmětem bylo v 76
případech „právní předpis“, v 9 „koncepční dokument“ a v 5 „opatření
obecné povahy“.

**Vztah k SRC-38.** Jde o týž registr viděný jiným veřejným rozhraním,
ne o nezávislý druhý zdroj — obě citace se proto počítají jako jeden
hlas a všechna tvrzení této kauzy nesou stav „1 ZDROJ“.

**Limity — co tento zdroj nedokládá.** Vyhledávání vrací jen ohlášené
kontakty. Neobsahuje obsah jednání, jeho výsledek ani cokoli o vlivu na
rozhodování; deklarovaný cíl a popis kontaktu vyplňuje sám lobbista.
Jeden záznam může vykazovat kontakt vůči stovkám lobbovaných osob
najednou, takže počet kontaktů není počtem jednání. Podrobně
v [GAP-12](@/dossiers/karel-havlicek/gaps/gap-12.md).
