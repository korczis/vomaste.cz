+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "GAP-03 — Sbírka listin nedostupná automatizovaně"
description = "Nezávislé (jiné než ARES/Podnikatel.cz) doložení rolí a podílů skrze listinné dokumenty ve Sbírce listin (or.justice.cz) nebylo v tomto kole technicky proveditelné."
template = "dossier-gap.html"
weight = 3

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/martin-pavlik/gaps/GAP-03"
view_model = "generated/views/dossiers/martin-pavlik/gaps/gap-03.json"
dossier = "martin-pavlik"
record_type = "gap"
lang = "cs"
gap_id = "GAP-03"
+++
Sbírka listin je jediný veřejný zdroj, který by mohl přinést doložení jiné povahy než sdílená rejstříková data ARES a Podnikatel.cz (viz `data/source-catalog/justice-sbirka-listin.json`) — zakladatelské listiny, smlouvy o převodu podílu nebo účetní závěrky. Vyhledávání na or.justice.cz je ale stavová formulářová aplikace bez přímo dotazovatelné URL podle IČO; dostupné nástroje tohoto kola (přímý HTTP fetch) narazily na chybové/vypršelé odkazy a nevrátily obsah.

Tato mezera není tvrzením o tom, co listiny obsahují nebo neobsahují — je to záznam, že pokus o silnější zdroj nebyl proveden, ne že by byl proveden a nic nenašel. Vyžaduje buď nástroj se skutečnou navigací formulářem (např. řízený prohlížeč), nebo jiný přístup k obsahu Sbírky listin, v budoucím kole.
