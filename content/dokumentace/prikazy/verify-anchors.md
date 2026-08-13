+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:anchors — Kotvy v postaveném HTML"
template = "tooling-command.html"
weight = 64
description = "Kotvy v postaveném HTML: Post-build kontrola, že každá kotva odkazovaná z kanonických dat dossieru skutečně existuje v postaveném HTML — ne jen ve zdroji.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-anchors"
tooling_command = "verify-anchors"
view_model = "generated/tooling-catalog.json"
+++

Post-build kontrola, že každá kotva odkazovaná z kanonických dat dossieru skutečně existuje v postaveném HTML — ne jen ve zdroji.

## Kdy ho spustit {#kdy}

Až po zola build.

## Co shodí běh {#vynucuje}

- Kotva clm-## nebo gap-## zapsaná v kanonickém těle dossieru, která v postaveném HTML není.
- case.anchor nebo kotva položky časové osy, které v postavené stránce neexistují jako id.
- Odkaz na #clm-## / #gap-##, který se v postavené stránce na žádné id nerozřeší.

