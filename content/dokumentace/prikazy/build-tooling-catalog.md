+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:tooling-catalog — Generátor katalogu toolingu"
template = "tooling-command.html"
weight = 30
description = "Generátor katalogu toolingu: Staví katalog příkazů ze dvou záměrně oddělených vstupů: ručně psaných záznamů v data/tooling/*.json (co příkaz dělá, co vynucuje, kdy ho spustit) a SKUTEČNOSTI dopočítané z package.json, scripts/build/pipeline.mjs, .githooks/pre-commit, justfile a .claude/skills/**/SKILL.md.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-tooling-catalog"
tooling_command = "build-tooling-catalog"
view_model = "generated/tooling-catalog.json"
+++

Staví katalog příkazů ze dvou záměrně oddělených vstupů: ručně psaných záznamů v data/tooling/*.json (co příkaz dělá, co vynucuje, kdy ho spustit) a SKUTEČNOSTI dopočítané z package.json, scripts/build/pipeline.mjs, .githooks/pre-commit, justfile a .claude/skills/**/SKILL.md.

## Kdy ho spustit {#kdy}

Po přidání nebo přejmenování jakéhokoli npm skriptu, just receptu či skillu — a po každé editaci záznamu v data/tooling/.

## Co shodí běh {#vynucuje}

- G1–G6 stejně jako verify:tooling-catalog — audit běží v obou režimech, takže ani generátor nedoběhne nad katalogem, který neodpovídá repozitáři.
- Záznam v data/tooling/, který neodpovídá schematu tooling-command, nebo jehož identifier se liší od názvu souboru.

## Co je potřeba vědět {#pozor}

- Ručně se píše jen to, co se ze zdrojů odvodit nedá. Příkazová řádka, zařazení do pipeline, členství v pre-commitu, cíl just receptu ani frontmatter skillu se do dat nezapisují — dopočítávají se, aby katalog nemohl tvrdit něco jiného, než co repozitář spouští.
- Zápis je idempotentní: soubor se přepíše, jen když se jeho obsah liší.

