+++
title = "Reference: povinná pole záznamů"
description = "Co musí obsahovat záznam tvrzení, zdroje, mezery a entity. Závazný je vždy soubor schématu — tohle je rychlý přehled."
template = "learning-lesson.html"
weight = 2303

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "reference"
estimated_minutes = 5
audience = ["vyvojar", "maintainer", "research"]
+++

{% <callout kind="poznamka" title="Závazná jsou schémata"> %}
Kanonická schémata v `schemas/canonical/` jsou jediný závazný zdroj.
Mají zakázané neznámé klíče, takže se nedá přidat pole bez záznamu — a
tenhle přehled slouží k orientaci, ne k rozhodování.
{% </callout> %}

## Společné všem záznamům

`@context` · `@id` (globální) · `@type` · `recordType` · `identifier`
· `schemaVersion`

## Tvrzení

| Pole | Co to je |
|---|---|
| `text` | znění tvrzení; musí sedět s řádkem přehledové tabulky |
| `status` / `statusLabel` | stav a jeho popisek |
| `sources` | odkazy na zdroje (`@id`) |
| `subjects` | koho se tvrzení týká — redakční rozhodnutí |
| `dossier` | do kterého dossieru patří |

## Zdroj

| Pole | Co to je |
|---|---|
| `outlet` | vydavatel |
| `sourceType` | typ zdroje |
| `url` | přímý odkaz na originál |
| `retrieved` | datum, kdy byl zdroj otevřen |
| `claims` | tvrzení, která podpírá — musí souhlasit obousměrně |
| `sourceFamily` | původ materiálu — volitelné, ale rozhoduje o nezávislosti; když je původ neznámý, pole se **vynechá** (prázdný řetězec schéma odmítne) |
| `content` | **povinná redakční poznámka**, minimální délka |

## Mezera

`priority` (vysoká/nízká) · `checked` (datum poslední kontroly) ·
`claims` (kterých tvrzení se týká)

## Entita

| Pole | Co to je |
|---|---|
| `entityType` | typ; musí mít popisek v konfiguraci typů |
| `publicationRole` | `context`, nebo `subject` |
| `dossierEnabled` / `dossierStatus` | zda má vlastní dossier |
| `dossiers` | do kterých dossierů patří |
| `provenance` | kdy a přes co byla objevena |

{% <callout kind="varovani" title="Co v záznamu nikdy nebude"> %}
Datum narození, adresa bydliště, rodné číslo ani jiný osobní
identifikátor — bez ohledu na to, že jsou ve veřejném registru.
{% </callout> %}
