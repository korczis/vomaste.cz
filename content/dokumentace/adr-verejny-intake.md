+++
title = "ADR: veřejný dossier-intake"
description = "Návrh řízeného vstupu pro veřejné podněty — a proč žádný strojový krok nikdy nekončí zveřejněním ani autorizací. Včetně poctivého stavu implementace."
template = "docs-viewer.html"
weight = 18

[extra]
lang = "cs"
source_file = "docs/adr/ADR-public-dossier-intake.md"
+++

**Co to je.** Návrh, jak může kdokoli navrhnout téma nebo entitu, aniž by
tím cokoli publikoval. Automat podnět zpracuje, porovná s datasetem a
vrátí čitelný report — **nikdy z něj neudělá dossier ani tvrzení**. Ta
hranice je v návrhu zapsaná jako pravidlo, ne jako doporučení: žádný
strojový přechod nekončí ve stavu „autorizováno" ani „publikováno".

**Poctivý stav.** Dokument je návrh Fáze 1 a jeho text se nemění; fáze
2–6 jsou od 2. 8. 2026 implementované (procesor, párování entit,
riziková klasifikace, kontrola URL, formuláře, workflow), fáze 7 a dál
nikoli. Datovaná poznámka o stavu implementace je hned v úvodu.

**Co to není.** Důvěrný kanál. Podání je veřejná GitHub issue — okamžitě
viditelná, trvale dohledatelná, bez záruky anonymity. Kdo má citlivé
podklady vyžadující ochranu zdroje, sem je posílat nemá; viz
[Veřejný podnět](@/dokumentace/verejny-podnet.md).
