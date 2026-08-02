+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-57 — YouControl (výpis z ukrajinského jednotného státního registru, USREOU 41507625)"
description = "Registrový agregátor ukrajinského Jednotného státního registru právnických osob (USREOU) — výpis pro GMR GAS UA LLC, kód 41507625: stav, vlastnická struktura, statutární orgán."
template = "dossier-source.html"
weight = 57

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/macinka-turek/sources/SRC-57"
view_model = "generated/views/dossiers/macinka-turek/sources/src-57.json"
dossier = "macinka-turek"
record_type = "source"
lang = "cs"
src_id = "SRC-57"
+++
YouControl je komerční ukrajinský registrový agregátor, obdoba toho, jak
Hlídač státu strojově agreguje ARES — **není** to oficiální portál
ukrajinského státu samotného (na rozdíl od přímého programového dotazu
na ARES u [SRC-55](@/dossiers/macinka-turek/sources/src-55.md)), proto je
tu `sourceType` popsán jako agregátor, ne jako přímý primární registr.
Podle GAP-07 nebylo k oficiálnímu ukrajinskému registru k dispozici
použitelné veřejné programové rozhraní; YouControl je nejbližší dostupná
náhrada, sestavená z veřejných dat USREOU.

**Co dokládá** (stav záznamu k 2026-08-01, dohledáno 2026-08-02):

- **Stav společnosti**: „Registered" (zaregistrována, tj. formálně
  aktivní, nikoli v likvidaci nebo vymazaná).
- **Vlastnická struktura**: ТОВ „ГМР ГАЗ" (GMR GAS s.r.o., ČR) — 40 %;
  Мацінка Петро (Petr Macinka, ČR) — 20 %; Цабал Томаш (Tomáš Čábal,
  Ukrajina) — 40 %.
- **Statutární orgán / oprávněná osoba**: Tomáš Čábal, s omezením
  jednat samostatně u transakcí nad 50 000 EUR podle stanov.
- **Skutečný majitel (UBO)**: Tomáš Čábal, s přímým rozhodujícím vlivem
  (40 %).

**Nezávislost.** Vůči [SRC-17](@/dossiers/macinka-turek/sources/src-17.md)
(Investigace.cz) jde o zcela nezávislý zdroj jiné povahy — ukrajinský
registrový agregátor vs. česká investigativní redakce — proto se u
CLM-47 počítají jako dvě nezávislá potvrzení stejné vazby.

**Limity — co tento zdroj nedokládá.** „Registered" je formální
rejstříkový status, ne důkaz o operativní aktivitě firmy — nevyvrací ani
nepotvrzuje Macinkovo citované vyjádření, že firma „de facto
neexistuje" (viz [CLM-15](@/dossiers/macinka-turek/claims/clm-15.md));
jde o dva různé druhy tvrzení (formální stav vs. subjektivní popis
reálného provozu), dossier je proto uvádí vedle sebe, ne jako vzájemné
vyvrácení. Záznam dále neobsahuje žádný český identifikátor (IČO, datum
narození), který by Tomáše Čábala jednoznačně spároval s konkrétním
záznamem v ARES — viz zbývající otevřená otázka v
[GAP-07](@/dossiers/macinka-turek/gaps/gap-07.md). Adresa sídla v Kyjevě
je ve výpisu částečně skrytá; dossier ji z tohoto zdroje nepřebírá.

Zdroj byl načten automatizovaným nástrojem (ne ručním prohlížením); čísla
a jména výše odpovídají tomu, co nástroj z veřejně zobrazené stránky
extrahoval. Pokud se při budoucí ruční kontrole zjistí rozpor s tím, co
stránka skutečně zobrazuje, má přednost ruční kontrola a tento záznam se
opraví.
