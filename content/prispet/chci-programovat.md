+++
title = "Chci programovat"
description = "Technická cesta od klonu po nasazení, se skutečnými příkazy repozitáře — a sada bezpečných začátečnických úkolů."
template = "learning-lesson.html"
weight = 3050

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prispet"
estimated_minutes = 5
audience = ["vyvojar"]
objectives = [
  "Projdete cestu od klonu po pull request skutečnými příkazy.",
  "Vyberete si první úkol, který nic nerozbije.",
]
next_route = "@/prispet/cesta-prispevatele.md"
next_label = "Cesta přispěvatele"
+++

**Co potřebujete:** Node (verzi drží `.tool-versions`) a Zola. Žádnou
databázi, žádný backend.

## Celý postup

```bash
git clone <repozitář>
cd vomaste.cz
npm ci                 # nainstaluje závislosti a zapojí git hooky
npm run dev            # web na http://127.0.0.1:1111

# … úprava …

npm run data:validate  # rychlá kontrola kanonických dat
npm run data:build     # přegeneruje modely a adaptéry
npm run build          # KANONICKÁ BRÁNA — musí skončit s kódem 0
npm run test:e2e       # prohlížečové testy nad hotovým webem (volitelně)
```

Pak větev, commit a pull request. Automatizace pustí tutéž bránu; při
úspěchu se web nasazuje z hlavní větve.

Úplný katalog příkazů je generovaný z repozitáře:
[/dokumentace/prikazy/](@/dokumentace/prikazy/_index.md).

## Bezpečné první úkoly

- oprava překlepu v ručně psané stránce,
- rozbitý vnitřní odkaz,
- zlepšení hlášky validátoru, aby říkala i **jak** to opravit,
- doplnění testu k existujícímu validátoru,
- přístupnostní vylepšení nalezené prohlížečovými testy,
- nesoulad mezi dokumentací a skutečným chováním.

{% <callout kind="varovani" title="Co NENÍ začátečnický úkol"> %}
Přidání nové kauzy, nového subjektu nebo nového tvrzení. To nejsou
technické úkoly — jsou to publikační rozhodnutí a řídí se testem
veřejného zájmu.
{% </callout> %}

## Dvě věci, které překvapí

**Generované soubory se needitují.** Stránky dossierů a entit jsou
adaptéry; ruční změna se při dalším sestavení tiše přepíše. Zdroj je
`data/dossiers/**`.

**Commit na hlavní větvi nasazuje.** Mezi commitem a produkcí prakticky
není pauza — potvrzení se získává **před** commitem.

Podrobně: [A601](@/akademie/a601-architektura.md) až
[A610](@/akademie/a610-ladeni-buildu.md).
