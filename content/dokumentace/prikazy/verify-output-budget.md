+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:output-budget — Velikost vydaného webu a opakovaný obal stránky"
template = "tooling-command.html"
weight = 74
description = "Velikost vydaného webu a opakovaný obal stránky: Post-build brána nad public/: celková velikost, 95. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-output-budget"
tooling_command = "verify-output-budget"
view_model = "generated/tooling-catalog.json"
+++

Post-build brána nad public/: celková velikost, 95. percentil velikosti HTML stránky a největší opakovaný obal stránky (postranní navigace, noscript, JSON-LD navigace) proti limitům z data/output-budget.toml. Vypíše naměřené hodnoty i nejtěžší stránky.

## Kdy ho spustit {#kdy}

Až po zola build, nad public/ — poslední krok npm run build.

## Co shodí běh {#vynucuje}

- Celková velikost public/ nad total_bytes_max.
- 95. percentil velikosti HTML stránky nad html_page_bytes_p95_max (aliasové přesměrovací stuby se nepočítají).
- Opakovaný obal některé stránky (aside#sidebar + <noscript> + uzly SiteNavigationElement) nad shell_bytes_max — třída chyby, která 2026-08-14 nafoukla public/ na 10 GB.
- Prázdný vydaný strom (žádná HTML stránka) a chybějící, nekladný či neznámý limit v data/output-budget.toml.

## Co je potřeba vědět {#pozor}

- Neměří síť, kompresi, JS ani rychlost vykreslení a nedokazuje soulad s žádným limitem GitHub Pages kromě hodnot zapsaných v data/output-budget.toml. Velikost JSON-LD navigace je velikost re-serializace uzlů (přibližná, ale stabilní mezi buildy).

