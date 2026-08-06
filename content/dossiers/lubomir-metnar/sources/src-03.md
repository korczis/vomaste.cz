+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-03 — Blesk.cz"
description = "„Tlak na nesmyslné úspory.“ NKÚ má přijít o ochranku, její šéf mluví o „vyhladovění“"
template = "dossier-source.html"
weight = 3

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/lubomir-metnar/sources/SRC-03"
view_model = "generated/views/dossiers/lubomir-metnar/sources/src-03.json"
dossier = "lubomir-metnar"
record_type = "source"
lang = "cs"
src_id = "SRC-03"
+++
**„Tlak na nesmyslné úspory.“ NKÚ má přijít o ochranku, její šéf mluví o „vyhladovění“**

Agenturní zpracování kauzy s doslovnými citacemi obou stran. Obsahuje nejúplnější verzi Metnarova zdůvodnění (odkaz na bezpečnostní analýzu Policie ČR a aktuální vyhodnocení ochrany státních objektů) i dvě klíčové citace Miloslava Kaly. Doplňuje kontext: NKÚ jako nezávislá ústavní instituce, dlouhodobě napjatý vztah Kaly a premiéra Babiše, nový úkol kontrolovat ČT a ČRo, převedení policejní ochrany na ČNB.

**Doplněno 2026-08-03**: článek výslovně uvádí kanál Metnarova zdůvodnění: „Ministr vnitra Lubomír Metnar na síti X uvedl, že návrh nevychází z politického rozhodnutí, ale z bezpečnostní analýzy policie.“

**Nezávislost (oprava 2026-08-03)**: článek výslovně uvádí, že o kauze „dnes informoval server Seznam Zprávy“ — jde o převzetí téže původní reportáže ([SRC-02](@/dossiers/lubomir-metnar/sources/src-02.md)), ne o nezávislé potvrzení. Proto stejná `sourceFamily` jako SRC-02.

Zdroj otevřen a přečten 2026-07-30, doplňkově znovu 2026-08-03. Dokládá znění citovaného zpravodajství k datu otevření, ne nezávislé potvrzení jinými zdroji.

**Dvojí původ — pozor při párování.** Článek je podepsán „Autor: ČTK" a v patičce nese „Zdroj: ČTK / Blesk Zprávy", zároveň ale přejímá zjištění Seznam Zpráv. Má tedy dvě linie původu, které pole `sourceFamily` neumí zachytit současně. Hodnota je nastavena na `seznam-zpravy`, protože to je původ zjištění; z toho ale neplyne, že by byl nezávislý na ČTK — **nesmí se párovat ani se zdrojem rodiny `ctk`, ani se Seznam Zprávami** jako druhý nezávislý hlas. Ověřeno otevřením článku 2026-08-06.
