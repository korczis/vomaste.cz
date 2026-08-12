+++
title = "Reference: rozložení repozitáře"
description = "Kde co bydlí, co je generované a co se verzuje. Mapa pro první orientaci v adresářové struktuře."
template = "learning-lesson.html"
weight = 2304

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "reference"
estimated_minutes = 4
audience = ["vyvojar", "maintainer"]
+++

```text
data/
  dossiers/<slug>/           kanonické záznamy dossieru
    dossier.json             identita, přehledová tabulka, graf
    claims/ sources/ cases/ gaps/ relations/ updates/
  dossiers/_shared/
    entities/                globální registr entit
    vocabularies/ context/   slovníky a lokální JSON-LD kontext
  *.toml                     konfigurace (navigace, typy, metadata, výuka)
  generated/                 ODVOZENÉ, mimo verzování

content/                     stránky pro generátor webu
  dossiers/ entities/        GENEROVANÉ adaptéry — needitovat
  koncepty/ dokumentace/     ručně psané
  start/ bootcamp/ akademie/ prirucka/ prispet/   ručně psané

templates/                   Tera šablony
  macros/ partials/ shortcodes/
scripts/                     validátory a generátory
schemas/canonical/           kanonická schémata
assets/ static/              zdroje frontendu
public/                      vydaný web — ODVOZENÝ
```

## Tři kategorie

**Zdroj pravdy** — `data/` (kromě `generated/`), `templates/`, `scripts/`,
`schemas/`, `assets/`, ručně psané části `content/`.

**Generované a verzované** — adaptéry pod `content/dossiers/`
a `content/entities/`, generované stránky dokumentace. Editují se
**nepřímo**, změnou zdroje.

**Odvozené a neverzované** — `data/generated/`, `public/`. Vznikají při
sestavení a po čerstvém klonu neexistují.

{% <callout kind="varovani" title="Jak poznat generovaný soubor"> %}
Nese v hlavičce příznak, že je generovaný, a ukazatel na zdroj. Když ho
v souboru vidíte, needitujete zdroj — vaše změna se při dalším sestavení
přepíše, a to bez chybové hlášky.
{% </callout> %}
