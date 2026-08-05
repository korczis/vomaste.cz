+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "SRC-01 — Hlídač státu"
description = "Veřejný rejstřík sponzoringu: u Richarda Chlada evidováno celkem 638 864 Kč darů straně Motoristé sobě v roce 2025, položkově rozepsaných."
template = "dossier-source.html"
weight = 1

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/richard-chlad/sources/SRC-01"
view_model = "generated/views/dossiers/richard-chlad/sources/src-01.json"
dossier = "richard-chlad"
record_type = "source"
lang = "cs"
src_id = "SRC-01"
+++
Hlídač státu eviduje u podnikatele Richarda Chlada tyto dary straně
Motoristé sobě v roce 2025:

- 140 000 Kč — půjčení sportovních automobilů
- 200 000 Kč — propůjčení vozů Bugatti
- 59 313 Kč — výroba a instalace billboardu
- 54 550 Kč — demontáž billboardu
- 185 001 Kč — uspořádání akce

**Celkem 638 864 Kč** za rok 2025 — a je podstatné, že tato částka
**už zahrnuje nepeněžní plnění**, ne jen převedené peníze.

**Poznámka k procesní přesnosti a hranicím**: jde o **veřejný rejstřík
darů**, tedy o údaj o tom, co bylo vykázáno. Darovat politické straně je
**legální** a evidence daru není zjištěním o ničem nepřípustném. Tento
údaj slouží jako referenční, oficiálně vykázaná částka, proti níž stojí
Chladovy vlastní veřejné údaje (SRC-02, SRC-03). Rozdíl mezi čísly je
sám o sobě zaznamenaným faktem — **není obviněním z protiprávnosti** a
čísla navíc nejsou přímo porovnatelná (viz GAP-01).

**Doplněno 2026-08-05 — dohledán primární dokument a opravena rodina
zdroje**: dohledána a otevřena **výroční finanční zpráva hnutí Motoristé
sobě za rok 2025** podaná Úřadu pro dohled
([SRC-04](@/dossiers/richard-chlad/sources/src-04.md)). Obsahuje tytéž
položky, tytéž částky a **doslovně tytéž popisy** („půjčení sportovních
automobilů na akce", „propůjčení vozů Bugatti na akci", „výroba a
instalace Billboardu, pronájem rekl.plochy") — tento rejstřík tedy úřední
evidenci **přebírá**, nikoli nezávisle zjišťuje. Pole `sourceFamily` bylo
proto opraveno z `hlidac-statu` na `udhpsh`: rodina se pojmenovává podle
**původu**, ne podle vydavatele, a Hlídač státu s Úřadem se počítají jako
**jedno nezávislé doložení**. Tvrzení
[CLM-01](@/dossiers/richard-chlad/claims/clm-01.md) je nově formulováno
podle primárního dokumentu a zůstává ve stavu **1 ZDROJ** — přesně proto,
že dva odkazy na tutéž evidenci nejsou dvě redakce.

**Terminologický rozdíl, který primární dokument ukázal**: tento rejstřík
vede položky pod nadpisem „Přehled jednotlivých darů politickým stranám";
úřední zpráva je u všech pěti položek označuje jako **bezúplatná plnění**
(nepeněžitá) a **žádný peněžitý dar** od této osoby za rok 2025 neuvádí.
Dřívější znění CLM-01 mluvilo o „darech", jejichž součet „již zahrnuje
nepeněžní plnění" — podle dokumentu jde o nepeněžitá plnění **v celé
výši**.
