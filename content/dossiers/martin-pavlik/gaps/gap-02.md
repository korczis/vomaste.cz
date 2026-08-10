+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "GAP-02 — Souhrnný objem smluv nespočten"
description = "Počet smluv je doložen, jejich celková hodnota nikoli. Agregace vyžaduje otevřená data registru, ne vyhledávací formulář."
template = "dossier-gap.html"
weight = 2

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/martin-pavlik/gaps/GAP-02"
view_model = "generated/views/dossiers/martin-pavlik/gaps/gap-02.json"
dossier = "martin-pavlik"
record_type = "gap"
lang = "cs"
gap_id = "GAP-02"
+++
**Uzavřeno 2026-08-06.** Vyhledávací formulář registru smluv tiše ignoruje vlastní stránkovací parametr a na jakoukoli stránku vrací první. Pokus o součet přes stránky proto nejprve vrátil patnáctkrát tutéž desítku záznamů — 150 „smluv" místo 119, a součet o řád jinde. Chyba se projevila jen díky kontrole, že se stránky mezi sebou liší.

Správnou cestou k reprodukovatelnému součtu byla měsíční otevřená data registru (`data.smlouvy.gov.cz`), ne vyhledávací formulář — viz [SRC-04](@/dossiers/martin-pavlik/sources/src-04.md) a [CLM-08](@/dossiers/martin-pavlik/claims/clm-08.md): 119 unikátních smluv, souhrnná hodnota nejméně 53 934 085 Kč (18 smluv bez vyplněné hodnoty), deset objednatelů. Mezera zůstává jako záznam metodické pasti pro budoucí rešerše nad stejným zdrojem, ne jako otevřená otázka.
