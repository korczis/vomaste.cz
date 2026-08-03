+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "GAP-05 — Články Hrot24 a Ekonomického deníku o škrtu vyšly týž den s totožnými čísly — nelze vylouč"
description = "Status 'corroborated' u rozpočtového tvrzení se opírá o dva vydavatele, ale jejich redakční nezávislost u této konkrétní zprávy není prokaza"
template = "dossier-gap.html"
weight = 5

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/jaromir-zuna/gaps/GAP-05"
view_model = "generated/views/dossiers/jaromir-zuna/gaps/gap-05.json"
dossier = "jaromir-zuna"
record_type = "gap"
lang = "cs"
gap_id = "GAP-05"
+++
Články Hrot24 a Ekonomického deníku o škrtu vyšly týž den s totožnými čísly — nelze vyloučit společný agenturní zdroj (ČTK).

**Proč je to mezera**: Status 'corroborated' u rozpočtového tvrzení se opírá o dva vydavatele, ale jejich redakční nezávislost u této konkrétní zprávy není prokazatelná. Tato mezera **není** zjištěním žádným směrem — zaznamenává jen, co se k datu kontroly nepodařilo doložit otevřeným zdrojem.

**Vyřešeno 2026-08-03**: podezření se potvrdilo jako oprávněné. Přímo ověřeny bylinky obou článků: SRC-03 (Hrot24.cz) i SRC-04 (Ekonomický deník) jsou shodně přebíráno zpravodajství ČTK (nyní `sourceFamily: "ctk"` u obou). [CLM-02](@/dossiers/jaromir-zuna/claims/clm-02.md) proto vráceno z CORROBORATED na 1 ZDROJ — oba zdroje zůstávají uvedeny (S1 povoluje víc zdrojů stejné rodiny u status-single), jen status odpovídá skutečné nezávislosti dokládání. Mezera je tímto vyřešena.
