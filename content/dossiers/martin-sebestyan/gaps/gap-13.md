+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "GAP-13 — Řada dohledaných zpráv (ČeskéNoviny.cz, Aktuálně.cz, Echo24, ČT24, Ekolist.cz, části textu"
description = "Metodická poznámka k hodnocení: shoda mezi těmito vydavateli nemusí představovat nezávislé potvrzení, i když formálně jde o různé vydavatele"
template = "dossier-gap.html"
weight = 13

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/martin-sebestyan/gaps/GAP-13"
view_model = "generated/views/dossiers/martin-sebestyan/gaps/gap-13.json"
dossier = "martin-sebestyan"
record_type = "gap"
lang = "cs"
gap_id = "GAP-13"
+++
Řada dohledaných zpráv (ČeskéNoviny.cz, Aktuálně.cz, Echo24, ČT24, Ekolist.cz, části textu Ekonomického deníku) vychází ze společného zpravodajství ČTK.

**Proč je to mezera**: Metodická poznámka k hodnocení: shoda mezi těmito vydavateli nemusí představovat nezávislé potvrzení, i když formálně jde o různé vydavatele. Status corroborated u těchto tvrzení je proto třeba číst se zdrženlivostí. Tato mezera **není** zjištěním žádným směrem — zaznamenává jen, co se k datu kontroly nepodařilo doložit otevřeným zdrojem.

**Vyřešeno auditem 2026-08-03**: metodická obava se potvrdila jako reálná a byla opravena přímo v datech. Bylo přímo ověřeno bylinou/patičkou jedenácti zdrojových článků (SRC-08, SRC-09, SRC-10, SRC-11, SRC-14, SRC-15, SRC-21, SRC-25, SRC-32, SRC-33, SRC-35), že jde o zpravodajství ČTK (nyní označeno `sourceFamily: "ctk"`). Šest tvrzení, která se opírala výhradně o dva nebo tři takové ČTK zdroje současně (CLM-18, CLM-20, CLM-21, CLM-28, CLM-29, CLM-49), bylo vráceno ze CORROBORATED na 1 ZDROJ (ponechán vždy jeden, věcně nejpřesnější zdroj); nadbytečný nezávislý duplicitní záznam SRC-34 byl smazán, protože po opravě nedokládal žádné tvrzení. Ostatní zdroje z tohoto seznamu, které podpírají jiná tvrzení nezávislým (ne-ČTK) druhým zdrojem, zůstávají beze změny. Mezera je tímto obsahově vyřešena.

**Doplněno 6. 8. 2026**: metodická obava se v tomto kole potvrdila i opačným směrem — nová doložení pocházejí z primárních úředních zdrojů (NKÚ, SZIF, NSS, Poslanecká sněmovna), které do rodiny ČTK nespadají a mají vlastní vydavatelskou identitu. Tvrzení povýšená v tomto kole na CORROBORATED se proto neopírají o dvě ozvěny téže agenturní zprávy, ale o dvojici zpravodajství + primární dokument.
