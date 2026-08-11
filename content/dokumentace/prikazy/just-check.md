+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just check — Rychlá podmnožina z pre-commitu"
template = "tooling-command.html"
weight = 114
description = "Rychlá podmnožina z pre-commitu: Spustí PŘÍMO .githooks/pre-commit — referenční integrita a autorizační rozsah, bez balení CSS a JS, bez zola buildu a bez ověřování kotev a JSON-LD. just recept, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-check"
tooling_command = "just-check"
view_model = "generated/tooling-catalog.json"
+++

Spustí PŘÍMO .githooks/pre-commit — referenční integrita a autorizační rozsah, bez balení CSS a JS, bez zola buildu a bez ověřování kotev a JSON-LD. Nezaměňovat s `npm run check`, což je režim pipeline s jiným seznamem kroků.

## Kdy ho spustit {#kdy}

Když chceš vědět, jestli projde commit, aniž bys ho dělal.

## Co shodí běh {#vynucuje}

- Nenulový exit kteréhokoli rychlého validátoru z pre-commit hooku — přesně toho, který by zablokoval commit.

## Co je potřeba vědět {#pozor}

- Spouští se sám hook, ne jeho kopie seznamu — recept se tak od hooku nemůže rozejít.

