+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just doctor — Kontrola prerekvizit"
template = "tooling-command.html"
weight = 119
description = "Kontrola prerekvizit: Ověří node, zola, node_modules a nastavení git hooků proti verzím, které deklaruje README. just recept, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-doctor"
tooling_command = "just-doctor"
view_model = "generated/tooling-catalog.json"
+++

Ověří node, zola, node_modules a nastavení git hooků proti verzím, které deklaruje README. Reportuje, nikdy neinstaluje.

## Kdy ho spustit {#kdy}

Dřív, než začneš vinit repozitář. Build může selhat z důvodů, které nejsou v obsahu.

## Co shodí běh {#vynucuje}

- Skončí nenulově, když node je starší než deklarovaná hlavní verze, zola neodpovídá deklarované vedlejší verzi, nebo chybí node_modules. Nenastavené git hooky se hlásí, ale exit kód neovlivňují.

## Co je potřeba vědět {#pozor}

- Verze se drží jako proměnné v justfile, aby se kontrolovalo proti jedné deklarované hodnotě místo čísla napsaného v próze.

