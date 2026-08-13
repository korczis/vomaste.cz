+++
title = "A501 — Model entity"
description = "Entita je globální záznam osoby, firmy nebo instituce. Pole, která rozhodují o tom, jestli je to subjekt, nebo jen zaznamenaná vazba."
template = "learning-lesson.html"
weight = 1501

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A501"
level = "data"
estimated_minutes = 11
audience = ["vyvojar", "maintainer", "editor"]
objectives = [
  "Popíšete, kde entity fyzicky žijí a proč jsou globální.",
  "Vysvětlíte, co znamenají pole publicationRole, dossierEnabled a dossierStatus.",
  "Poznáte v datech rozdíl mezi subjektem a kontextovou entitou.",
]
related_kb = ["koncepty/tretiosoby.md", "koncepty/autorizace.md", "koncepty/strojove-citelna-data.md"]
next = "A502"
+++

Entity jsou **globální**: bydlí v `data/dossiers/_shared/entities/<id>.json`,
ne uvnitř jednotlivých dossierů. Jedna osoba je jeden záznam, i když
vystupuje ve třech dossierech — pole `dossiers` říká, ke kterým patří.

## Tvar záznamu

```json
{
  "@id": "https://vomaste.cz/id/entities/ab-private-trusts",
  "@type": "vomaste:Entity",
  "recordType": "entity",
  "identifier": "ab-private-trusts",
  "title": "AB private trust I a II",
  "entityType": "organization",
  "publicationRole": "context",
  "dossierEnabled": false,
  "dossierStatus": "not_authorized",
  "coverageState": "contextual",
  "dossiers": ["andrej-babis"],
  "provenance": {
    "discoveredAt": "2026-08-01",
    "claimRefs": ["CLM-16"],
    "sourceRefs": ["SRC-06", "SRC-28"],
    "depth": 1
  }
}
```

## Pole, na kterých záleží nejvíc

**`publicationRole`** — `context` nebo `subject`. Kontextová entita
zaznamenává jen to, že vazba existuje, a nenese žádné tvrzení.

**`dossierEnabled` / `dossierStatus`** — jestli má entita vlastní dossier a
zda je pokrytí povolené. Přepnutí kontextové entity na subjekt je
publikační rozhodnutí; hlídá ho validátor autorizací.

**`entityType`** — člověk, firma, instituce, událost, řízení, strana…
Každý použitý typ musí mít popisek v `data/entity-types.toml`, a to
obousměrně: typ bez popisku i popisek bez použití shodí build.

**`provenance`** — kdy byla entita objevena, přes které hrany, o která
tvrzení a zdroje se opírá a v jaké je vzdálenosti od subjektu.

{% <callout kind="pravidlo" title="Co v entitě nikdy nebude"> %}
Datum narození, adresa bydliště ani jiný osobní identifikátor. Registry
je běžně obsahují; do kanonických dat se nepřebírají.
{% </callout> %}

{% <callout kind="varovani" title="Generátor nikdy nepřepíše existující entitu"> %}
Když automatický objev narazí na slug, který už existuje, **neslučuje** —
ohlásí kolizi k lidské kontrole. Je to ochrana proti jmenovcům: sloučení
dvou lidí stejného jména je chyba, která se veřejně opravuje mnohem hůř,
než se dělá.
{% </callout> %}

{% <kontrola otazka="Máte entitu vedenou jako kontextovou a chcete jí přidat jedno doložené tvrzení. Co se musí stát?"> %}
Musí se z ní stát subjekt — a to je publikační rozhodnutí, ne úprava pole.

Kontextová entita je **definována** tím, že nenese tvrzení. Přidat jí
jedno znamená říct, že o té osobě web něco tvrdí, a to smí jen tehdy,
když projde testem veřejného zájmu **sama za sebe**. Ne proto, že je
zmíněná v kauze někoho jiného.

Prakticky to znamená změnit `publicationRole` na `subject`, nastavit
`dossierEnabled` a `dossierStatus` a mít pro to zaznamenaný důvod.
Validátor autorizací build shodí, pokud se pole přepnou bez toho —
právě proto, aby k povýšení nemohlo dojít jako k vedlejšímu efektu jiné
změny.

A pokud test veřejného zájmu neprojde, tvrzení se nepíše. Vazba zůstane
zaznamenaná, člověk zůstane kontextem.
{% </kontrola> %}
