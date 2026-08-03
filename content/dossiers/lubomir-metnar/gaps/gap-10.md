+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "GAP-10 — Míra nezávislosti potvrzení je nižší, než naznačuje počet zdrojů."
description = "Blesk, Respekt i Deník N vycházejí z agenturního servisu, resp. z původní reportáže Seznam Zpráv; nejde tedy o plně nezávislé ověření, ale o"
template = "dossier-gap.html"
weight = 10

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/lubomir-metnar/gaps/GAP-10"
view_model = "generated/views/dossiers/lubomir-metnar/gaps/gap-10.json"
dossier = "lubomir-metnar"
record_type = "gap"
lang = "cs"
gap_id = "GAP-10"
+++
Míra nezávislosti potvrzení je nižší, než naznačuje počet zdrojů.

**Proč je to mezera**: Blesk, Respekt i Deník N vycházejí z agenturního servisu, resp. z původní reportáže Seznam Zpráv; nejde tedy o plně nezávislé ověření, ale o převzetí téhož primárního zjištění. Tato mezera **není** zjištěním žádným
směrem — zaznamenává jen, co se k datu kontroly nepodařilo doložit
otevřeným zdrojem.

**Oprava datové chyby k 2026-08-03**: přímým otevřením [SRC-03](@/dossiers/lubomir-metnar/sources/src-03.md), [SRC-04](@/dossiers/lubomir-metnar/sources/src-04.md) a [SRC-05](@/dossiers/lubomir-metnar/sources/src-05.md) potvrzeno, že všechny tři výslovně uvádějí Seznam Zprávy jako zdroj informace (Respekt navíc jako ČTK přebírku „Informační servis“). Přesto byly [CLM-05](@/dossiers/lubomir-metnar/claims/clm-05.md), [CLM-08](@/dossiers/lubomir-metnar/claims/clm-08.md), [CLM-12](@/dossiers/lubomir-metnar/claims/clm-12.md) a [CLM-18](@/dossiers/lubomir-metnar/claims/clm-18.md) chybně vedeny jako CORROBORATED, ačkoliv jejich vlastní text už nezávislost popíral. Opraveno: SRC-02/03/04/05 nyní sdílejí `sourceFamily: "seznam-zpravy-syndication"`, všechny čtyři tvrzení posunuta na status-single (1 ZDROJ). Mezera je tímto zodpovězena — šlo o skutečné zjištění, ne o zbývající otevřenou otázku.
