+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run lint:generated-content — Lint generovaných content adaptérů"
template = "tooling-command.html"
weight = 48
description = "Lint generovaných content adaptérů: Hlídá, že content/** v pokrytém scope zůstává generovaným routing adaptérem kanonických dat a nikdo do něj nepropašoval doménová data ani ručně psanou stránku.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/lint-generated-content"
tooling_command = "lint-generated-content"
view_model = "generated/tooling-catalog.json"
+++

Hlídá, že content/** v pokrytém scope zůstává generovaným routing adaptérem kanonických dat a nikdo do něj nepropašoval doménová data ani ručně psanou stránku.

## Kdy ho spustit {#kdy}

V build pipeline po sync content.

## Co shodí běh {#vynucuje}

- L1 — soubor v generovaném scope bez `generated = true` v [extra] (ručně vytvořená stránka).
- L2 — front matter klíč mimo povolenou obálku; doménová pole (status, sources, subjects, depth…) žijí výhradně v kanonických datech a view modelech.
- L3 — chybějící povinná obálková pole (generated, view_model), bez kterých šablona nemá datový vstup.

## Co je potřeba vědět {#pozor}

- Mimo pokrytý scope (dokumentace, koncepty, kořenové _index.md, mapa, sekce typů entit, aux stránky dossierů) lint neběží — ty hlídají jiné brány.

