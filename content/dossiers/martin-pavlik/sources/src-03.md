+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-03 — Registr smluv: záznamy s protistranou IČO 04449461"
description = "Primární evidence smluv uzavřených s veřejnými zadavateli, dotaz na IČO protistrany."
template = "dossier-source.html"
weight = 3

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/martin-pavlik/sources/SRC-03"
view_model = "generated/views/dossiers/martin-pavlik/sources/src-03.json"
dossier = "martin-pavlik"
record_type = "source"
lang = "cs"
src_id = "SRC-03"
+++
Dotaz na `party_idnum` (IČO protistrany) k 5. 8. 2026. Přebírá se **počet záznamů, který registr sám uvádí**, a názvy zveřejňujících subjektů odečtené přímo z výsledků.

**Co se nepřebírá a proč**: souhrnná hodnota smluv. Stránkování výsledků jede přes signály formuláře a vlastní parametr `page` se tiše ignoruje — první pokus o agregaci proto patnáctkrát stáhl tutéž stránku a vydal by 150 „smluv" a 352 mil. Kč tam, kde jich registr hlásí 119. Chyba byla zachycena kontrolou duplicity stránek. Dokud agregace neproběhne přes otevřená data, zůstává objem evidovaný jako mezera, ne jako číslo.
