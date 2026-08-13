+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/prismatic-bootstrap — Příprava integrace s Prismatic"
template = "tooling-command.html"
weight = 126
description = "Příprava integrace s Prismatic: Zkontroluje oba repozitáře, vyřeší cestu k prismatic-platform, zaznamená commit SHA, ověří exportní kontrakt a řekne, jestli je bezpečné začít lokální integrační běh.. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-prismatic-bootstrap"
tooling_command = "skill-prismatic-bootstrap"
view_model = "generated/tooling-catalog.json"
+++

Zkontroluje oba repozitáře, vyřeší cestu k prismatic-platform, zaznamená commit SHA, ověří exportní kontrakt a řekne, jestli je bezpečné začít lokální integrační běh.

## Kdy ho spustit {#kdy}

Jako první, dřív než cokoli dalšího z Prismatic vrstvy — kdykoli se úkol dotýká rešerše nebo obohacení ze strany Prismatic.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Skutečné a otestované je dnes rozřešení konfigurace, kontrola driftu proti auditu a exportní kontrakt (parsování NDJSON, validace záznamů proti schématu, tvrdé odmítnutí neznámé hlavní verze).
- Nepostavené je všechno, co skutečně VOLÁ nějakou schopnost Prismatic. Prismatic sám zatím nemá odpovídající exportér, takže tahle skill nemůže spustit skutečný běh, ať konfigurace říká cokoli.
- Nedostupný prismatic-platform je normální, správně reportovaný stav — ne porucha.
- Výsledky se mají skutečně spustit a přečíst, ne odhadovat nebo si pamatovat z minula.

