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
Vyhledávací formulář registru smluv tiše ignoruje vlastní stránkovací parametr a na jakoukoli stránku vrací první. Pokus o součet přes stránky proto vrátil patnáctkrát tutéž desítku záznamů — 150 „smluv" místo 119, a součet o řád jinde. Chyba se projevila jen díky kontrole, že se stránky mezi sebou liší.

Dokud objem nespočte průchod otevřenými daty registru, zůstává neuvedený. Číslo, které se nedá zopakovat, sem nepatří ani jako odhad.
