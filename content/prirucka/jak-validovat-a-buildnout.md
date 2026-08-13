+++
title = "Jak validovat a sestavit"
description = "Který příkaz kdy: rychlá kontrola jednoho záznamu, kontrola bez sestavení, a kanonická brána, která musí projít před odesláním."
template = "learning-lesson.html"
weight = 2208

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "postup"
estimated_minutes = 4
audience = ["vyvojar", "maintainer"]
+++

## Podle toho, co potřebujete

| Potřebuji | Příkaz |
|---|---|
| ověřit jeden záznam během psaní | `npm run data:validate -- --file <cesta>` |
| ověřit všechna kanonická data | `npm run data:validate` |
| přegenerovat modely a adaptéry | `npm run data:build` |
| kontroly bez generování a sestavení | `npm run check` |
| **kanonická brána** | `npm run build` |
| prohlížečové testy nad hotovým webem | `npm run test:e2e` |

## Smyčka při změně dat

```bash
$EDITOR data/dossiers/<slug>/…
npm run data:validate
npm run data:build
npm run build
```

## Co která vrstva hlídá

`data:validate` — tvar záznamů, referenční integritu, redakční sémantiku,
paritu přehledové tabulky, expanzi strojových dat.

`npm run build` — všechno předchozí, plus testy, linty, generátory,
sestavení a kontroly nad hotovým HTML (odkazy, kotvy, strukturovaná data,
metadata, responzivita tabulek, integrita exportů).

{% <callout kind="varovani" title="Zelená brána ≠ správný obsah"> %}
Validátory nepoznají posun významu ve zkrácené citaci, nepřiměřený osobní
údaj ani tvrzení, které říká víc než doklad. Na to je redakční kontrola.
{% </callout> %}

Úplný katalog příkazů je generovaný z repozitáře:
[/dokumentace/prikazy/](@/dokumentace/prikazy/_index.md).
