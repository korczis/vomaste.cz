+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-05 — Registr smluv: měsíční otevřená data, kontrola IČO 01529820, 02922703 a 26228548 — bez záznamu"
description = "Primární evidence smluv (data.smlouvy.gov.cz) pro zbylé tři subjekty z autorizace — dokládá úplný přepočet objemu smluv za všechny čtyři entity, jak autorizace 2026-08-06 vyžadovala, ne jen jednu."
template = "dossier-source.html"
weight = 5

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/martin-pavlik/sources/SRC-05"
view_model = "generated/views/dossiers/martin-pavlik/sources/src-05.json"
dossier = "martin-pavlik"
record_type = "source"
lang = "cs"
src_id = "SRC-05"
+++
**Doplňuje SRC-04.** Autorizace 2026-08-06 vyžaduje „řádně dopočítaný objem a předmět smluv v Registru smluv za všechny čtyři již uvedené subjekty" — SRC-04 to dosud pokrýval jen pro HYDROPROGRESS, s.r.o. (IČO 04449461). Tento zdroj doplňuje zbylé tři: MEDIA PROJECT CZ s.r.o. (IČO 01529820), Bydlíme v Králově Poli, z.s. (IČO 02922703) a Nadační fond FIDUCIA (IČO 26228548).

**Postup**: stejný nástroj a metoda jako SRC-04 (`scripts/osint/screen-public-money.mjs`) — měsíční otevřená data registru smluv, celé pokryté období **2016-07 až 2026-08** (122 dumpů, všechny z cache), filtrováno na tyto tři IČO jako protistranu.

**Výsledek**: pro všechny tři subjekty **0 zveřejněných smluv** v celém pokrytém období. Interní report `reports/public-money-screening.md` (regenerace 2026-08-08).

**Co to dokládá a co ne**: dokládá, že v registru smluv k datu kontroly nefiguruje žádná smlouva, ve které by tyto tři subjekty vystupovaly jako smluvní strana. Nedokládá, že tyto subjekty veřejné prostředky nikdy nezískaly (registr eviduje smlouvy nad 50 000 Kč až od 1. 7. 2016, se zákonnými výjimkami — např. dotace mimo smluvní vztah, granty, nebo smlouvy pod limitem se v registru vůbec neobjeví). Nulový nález je zde zjištěním o obsahu registru za dané období, ne o subjektu samotném. V kontrastu s 119 smlouvami a nejméně 53 934 085 Kč u HYDROPROGRESS (SRC-04) jde o viditelný rozdíl v měřítku veřejnoprávní stopy mezi jednotlivými subjekty stejné osoby.
