+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run lint:hardcoded-records — Zákaz natvrdo psaných záznamů v šablonách"
template = "tooling-command.html"
weight = 8
description = "Zákaz natvrdo psaných záznamů v šablonách: Brána proti konstantám v šablonách. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/lint-hardcoded-records"
tooling_command = "lint-hardcoded-records"
view_model = "generated/tooling-catalog.json"
+++

Brána proti konstantám v šablonách. Šablona smí znát datový MODEL (že existuje tvrzení a má stav), ne KONKRÉTNÍ ZÁZNAMY — jakmile v ní stojí CLM-07 nebo slug, vznikla konstanta, kterou by musel někdo ručně přepočítat, zatímco build zůstane zelený.

## Kdy ho spustit {#kdy}

Po každé editaci šablon.

## Co shodí běh {#vynucuje}

- Identifikátor záznamu (CLM/SRC/CASE/GAP-##) v šabloně mimo komentář.
- Slug dossieru z kanonického registru v cestě `@/dossiers/<slug>/`.
- Slug dossieru jako řetězcový literál kdekoli v šabloně.
- Natvrdo zapsaný počet ve stat dlaždici (stat_tile(value=<číslo>)) — počet musí jít z dat.

## Co je potřeba vědět {#pozor}

- Jména osob se nekontrolují — v komentářích a příkladech jsou legitimní a regulární výraz by z toho udělal hlídače slovníku.

