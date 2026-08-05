+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-02 — ARES, rejstříkový (VR) výpis: IČO 04449461, 01529820, 26228548, 02922703"
description = "Primární výpis z veřejného rejstříku (ARES, větev VR) pro čtyři subjekty, v nichž je Martin Pavlík zapsán: HYDROPROGRESS, s.r.o., MEDIA PROJECT CZ s.r.o., Nadační fond FIDUCIA a Bydlíme v Králově Poli, z.s. Doloženy zapsané funkce i velikosti obchodních podílů."
template = "dossier-source.html"
weight = 2

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/martin-pavlik/sources/SRC-02"
view_model = "generated/views/dossiers/martin-pavlik/sources/src-02.json"
dossier = "martin-pavlik"
record_type = "source"
lang = "cs"
src_id = "SRC-02"
+++
**Primární rejstříkový zdroj**, otevřen přímo 2026-08-05 nástrojem
tohoto projektu (`scripts/osint/expand-entity.mjs`, režim dry run) proti
rejstříkové (VR) větvi ARES. Uvedená URL je záznam HYDROPROGRESSu;
totožným dotazem byly otevřeny i výpisy IČO 01529820, 26228548
a 02922703.

**Co dokládá:** zapsané funkce Martina Pavlíka ve všech čtyřech
subjektech a — u obou společností s ručením omezeným — velikost jeho
obchodního podílu: HYDROPROGRESS, s.r.o. „jednatel; společník (podíl
80,00)", MEDIA PROJECT CZ s.r.o. „jednatel; společník (podíl 50,00)",
Nadační fond FIDUCIA „člen orgánu", Bydlíme v Králově Poli, z.s.
„1. místopředseda".

**Nezávislost — žádná tu není.** Rejstříkový agregátor
[SRC-01](@/dossiers/martin-pavlik/sources/src-01.md) (Podnikatel.cz) je
odvozeným přehledem právě těchto rejstříkových dat. Odvozený přehled
nemůže svému zdroji odporovat: kdyby byl zápis chybný, agregátor by
tutéž chybu přetiskl. Že registr vede stát a agregátor soukromá firma,
nezakládá nezávislost, když je datový podklad tentýž — nezávislost
znamená, že druhý zdroj mohl dojít k jinému výsledku.

Oba proto sdílejí source family `cz-verejny-rejstrik` a tvrzení opřená pouze o ně
nesou stav 1 ZDROJ. Nezávislé potvrzení by musel přinést zdroj jiné
povahy — sbírka listin, smluvní dokument nebo redakční zjištění.

**Co tento záznam vědomě NEpřebírá:** datum narození ani adresu
bydliště. Rejstřík obojí obsahuje; nástroj to odstraňuje v kódu
(`stripPersonalData()`), ne konvencí, a tento dossier to nepřebírá ani
nepřímo. Veřejnost rejstříku nedělá ze zveřejnění bydliště přiměřený
krok.

**Co NEdokládá:** nic o kvalitě podnikání, o plnění veřejných zakázek
ani o jakémkoli pochybení. Zápis funkce nebo podílu je evidenční fakt,
ne podezření. Rejstřík také nedokládá totožnost napříč subjekty nad
rámec shody zapsaného jména — proto
[GAP-01](@/dossiers/martin-pavlik/gaps/gap-01.md) zůstává otevřená.
