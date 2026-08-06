+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run dossier:next-id — Další volné ID registru"
template = "tooling-command.html"
weight = 68
description = "Další volné ID registru: Spočítá další volné ID pro claim, source, case nebo gap v daném dossieru — a to jak z lokálního pracovního stromu, tak z `origin/master`. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/dossier-next-id"
tooling_command = "dossier-next-id"
view_model = "generated/tooling-catalog.json"
+++

Spočítá další volné ID pro claim, source, case nebo gap v daném dossieru — a to jak z lokálního pracovního stromu, tak z `origin/master`. Když se obě čísla liší, ohlásí to.

## Kdy ho spustit {#kdy}

Před založením nového záznamu v registru, zejména když na dossieru pracuje víc session současně.

## Co shodí běh {#vynucuje}

- Nevynucuje nic; je to pomůcka před zápisem, ne brána.

## Co je potřeba vědět {#pozor}

- Vzniklo po kolizi 5. 8. 2026, kdy dvě souběžné session spočítaly totéž „další volné“ ID a přepsaly si zdroje navzájem.

