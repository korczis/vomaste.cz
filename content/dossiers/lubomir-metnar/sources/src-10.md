+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-10 — Echo24: Pavel vetoval novelu rozpočtových zákonů. Ohrožuje bezpečnost občanů, reaguje Babiš"
description = "Vlastní zpravodajství Echo24 z 22. 7. 2026 o prezidentském vetu novely rozpočtových zákonů, včetně doslovné citace Petra Pavla k dopadům novely na hospodaření nezávislých institucí."
template = "dossier-source.html"
weight = 10

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/lubomir-metnar/sources/SRC-10"
view_model = "generated/views/dossiers/lubomir-metnar/sources/src-10.json"
dossier = "lubomir-metnar"
record_type = "source"
lang = "cs"
src_id = "SRC-10"
+++
**Vlastní zpravodajství, otevřeno a přečteno 2026-08-05.**

**Co dokládá doslovně:** článek cituje prezidenta Petra Pavla:
„Umožňuje totiž, aby ministerstvo financí měnilo hospodaření některých
nezávislých institucí na základě tzv. dohody. Nepodezírám vládu, že jí jde
o další zásah do působení Ústavního soudu, veřejného ochránce práv,
Kanceláře prezidenta republiky, Nejvyššího kontrolního úřadu nebo Národní
rozpočtové rady. Ve skutečnosti si tu ale nejsou obě strany rovné a zákon
nově vytváří prostor pro to, aby ministerstvo financí o těchto změnách
rozhodovalo z výrazně silnější pozice.“ Tím je doloženo jádro
[CLM-25](@/dossiers/lubomir-metnar/claims/clm-25.md) — datum veta i to,
že mezi jmenovanými institucemi je NKÚ.

**Nezávislost:** dosavadní dva zdroje CLM-25 —
[SRC-06](@/dossiers/lubomir-metnar/sources/src-06.md) (Blesk.cz) a
[SRC-07](@/dossiers/lubomir-metnar/sources/src-07.md) (Hospodářské
noviny) — patří **oba** do rodiny `ctk`, takže dohromady tvořily jediné
doložení. Tenhle text je vlastní redakční práce Echo24: stránka nese
`<meta name="author" content="Jan Křovák">` a v celém HTML se řetězec
„ČTK“ nevyskytuje ani jednou — ověřeno stejným kritériem, jaké používá
detektor zdrojových rodin (`npm run sources:detect-family`): strojová
metadata, podpisový blok, patička. Přibývá tím druhá nezávislá rodina
a CLM-25 přechází na stav `CORROBORATED`.

**Limity:** článek dokládá, **že prezident tato slova řekl** a kdy zákon
vetoval — nedokládá a nemůže dokládat, že by novela takové dopady
skutečně měla. To je prezidentovo hodnocení, ne zjištění nezávislého
orgánu. Vztah k tématu tohoto dossieru je nepřímý: NKÚ zde vystupuje
jako jedna z jmenovaných institucí v jiném sporu, ne jako předmět
návrhu ministerstva vnitra.
