+++
title = "07 — Podejte příspěvek"
description = "Šest typů podnětu a šest různých cest. Naučte se poznat, co vlastně máte v ruce, a poslat to tam, kde se to zpracuje."
template = "learning-lesson.html"
weight = 170

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "bootcamp"
lesson_id = "B07"
estimated_minutes = 10
audience = ["ctenar", "zdroje", "research"]
objectives = [
  "Zařadíte svůj podnět do jednoho ze šesti typů.",
  "Pošlete ho cestou, která k němu patří.",
  "Budete vědět, co se s ním stane a co se od vás ještě může chtít.",
]
prerequisites = ["B06"]
related_kb = ["koncepty/pravo-opravit.md", "koncepty/verzovano-v-gitu.md"]
next = "B08"
+++

Většina podnětů se zdrží proto, že je poslaná jako „něco je špatně“ bez
toho, co přesně a proti čemu. Zařazení podnětu je půlka práce.

## Šest typů

| Máte v ruce | Je to | Kam s tím |
|---|---|---|
| Chybné datum, jméno, číslo proti zdroji | **oprava** | hlášení chyby |
| Mrtvý odkaz na zdroj | **oprava** | hlášení chyby |
| Nový veřejný zdroj k existujícímu tvrzení | **zdroj** | návrh zdroje |
| Otázka, kterou zdroje neuzavírají | **mezera** | návrh mezery |
| Nové doložené téma u pokryté osoby | **tvrzení** | evidence packet |
| Nová osoba | **rozsah** | nejdřív test veřejného zájmu |
| Rozbitá stránka, překlep, špatné zobrazení | **technická vada** | technické hlášení |

Konkrétní formuláře a odkazy jsou na stránce
[Jak přispět](@/prispet/_index.md) — tahle lekce učí rozhodnout, do které
kolonky patříte.

{% <callout kind="pravidlo" title="Co platí u všech šesti"> %}
Podnět bez dohledatelného veřejného zdroje se nedá ověřit, a co se nedá
ověřit, to se nepublikuje. Není to nedůvěra k vám — je to totéž pravidlo,
které platí pro autora webu.
{% </callout> %}

## Co se s podnětem stane

1. Někdo si ho přečte a zařadí.
2. Otevře váš zdroj a porovná ho s tím, co tvrdíte.
3. Buď z toho vznikne změna dat, nebo se vás zeptá na doplnění, nebo
   vysvětlí, proč to takhle použít nejde.
4. Změna je viditelný rozdíl, který schvaluje ještě někdo další.
5. Po zveřejnění zůstává v historii dohledatelné, co se změnilo a kdy.

{% <callout kind="varovani" title="Neposílejte neveřejné materiály"> %}
Repozitář je veřejný a Git nezapomíná — smazaný soubor zůstává v historii.
Web nemá bezpečný kanál pro citlivé podněty a netvrdí, že ho má. Interní
dokumenty, screenshoty soukromé komunikace ani nic, co by mohlo
identifikovat zdroj, sem neposílejte.
{% </callout> %}

{% <kontrola otazka="Našli jste u zdroje na webu datum vydání 3. 5., ale na originálním článku je 5. 3. Jak takové hlášení napsat, aby se dalo vyřídit hned?"> %}
Tři věci a je hotovo:

1. **Adresa stránky**, kde je chyba, a identifikátor záznamu (`SRC-12`).
2. **Co je tam teď** a **co tam má být** — obojí doslova.
3. **Odkaz na zdroj**, kde je správné datum vidět.

Tedy: „Na /dossiers/…/sources/src-12/ je datum vydání 3. 5. 2026, na
originále je 5. 3. 2026 — viz [odkaz].“

Tohle se ověří za dvě minuty. Verze „máte tam špatně datum u jednoho
zdroje“ znamená, že to musí někdo dohledat, a leží to týden.
{% </kontrola> %}
