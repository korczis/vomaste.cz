+++
title = "Reference: identifikátory a adresy"
description = "Jak vypadají identifikátory záznamů, proč mají dvě podoby a jaký je vztah mezi lokálním číslem a globální identitou."
template = "learning-lesson.html"
weight = 2302

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "reference"
estimated_minutes = 4
audience = ["research", "vyvojar", "maintainer"]
+++

## Lokální identifikátory

| Prefix | Záznam |
|---|---|
| `CLM-##` | tvrzení |
| `SRC-##` | zdroj |
| `CASE-##` | kauza |
| `GAP-##` | mezera |

Číslují se **v rámci jednoho dossieru**. `CLM-01` proto existuje
v každém dossieru a je pokaždé jiné — odkazuje se celou adresou stránky,
nikdy samotným kódem.

Číslo je pořadí vzniku, ne hodnocení. `CLM-40` není méně důležité než
`CLM-01`.

## Globální identita

Skutečná identita záznamu je globální adresa ve tvaru:

```text
https://vomaste.cz/id/dossiers/<slug>/claims/CLM-01
https://vomaste.cz/id/dossiers/<slug>/sources/SRC-01
https://vomaste.cz/id/entities/<id>
```

Kolize napříč dossiery je tím mechanicky vyloučená. Cesta souboru
a globální identita musí souhlasit — hlídá to referenční integrita.

## Entity

Entity mají místo čísla **slug** (`ab-private-trusts`) a jsou globální —
bydlí mimo jednotlivé dossiery, protože jedna osoba může vystupovat ve
víc dossierech.

## Adresy stránek

```text
/dossiers/<slug>/                       hlavní stránka dossieru
/dossiers/<slug>/claims/clm-01/         jedno tvrzení
/dossiers/<slug>/sources/src-01/        jeden zdroj
/entities/<id>/                         entita
```

Staré adresy zůstávají funkční přes přesměrování — a to přenáší i kotvu,
takže odkaz na konkrétní tvrzení skončí na tom tvrzení.
