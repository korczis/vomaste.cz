+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run lint:component-reuse — Znovupoužití UI komponent"
template = "tooling-command.html"
weight = 7
description = "Znovupoužití UI komponent: Vynucuje vlastní konvenci webu: obsahová šablona nesmí ručně psát markup, pro který už existuje sdílená komponenta.. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/lint-component-reuse"
tooling_command = "lint-component-reuse"
view_model = "generated/tooling-catalog.json"
+++

Vynucuje vlastní konvenci webu: obsahová šablona nesmí ručně psát markup, pro který už existuje sdílená komponenta.

## Kdy ho spustit {#kdy}

Po každé nové nebo přepsané šabloně.

## Co shodí běh {#vynucuje}

- Obsahová top-level šablona, která nezavolá žádnou sdílenou komponentu ui_* (ui_page_header, ui_breadcrumb, ui_stat_tile, ui_empty_state, ui_back_link_footer…).
- Šablona s vlastním <table> mimo macros/table.html, která nepoužije párovou komponentu table_advanced_table.

## Co je potřeba vědět {#pozor}

- Není to kontrola proti externí specifikaci. Odkazovaná dokumentace Flowbite byla přečtena přímo a neobsahuje žádná konkrétní strojově kontrolovatelná pravidla — je to rozcestník, ne conformance checklist. Skript proto vynucuje konvenci tohohle repozitáře a jmenuje se podle toho, co skutečně kontroluje.
- Výjimky jsou vždy per-soubor s napsaným odůvodněním, nikdy plošné.

