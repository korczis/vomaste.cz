+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run dossier:next-id — Další volné ID záznamu, ověřené i proti originu"
template = "tooling-command.html"
weight = 88
description = "Další volné ID záznamu, ověřené i proti originu: Vrátí další volné CLM/SRC/CASE/GAP číslo pro registr jednoho dossieru a hlásí, když se lokální working tree a origin/master neshodnou — ID kolize při souběžné práci tím přestává být otázkou toho, jestli si někdo vzpomněl fetchnout.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/dossier-next-id"
tooling_command = "dossier-next-id"
view_model = "generated/tooling-catalog.json"
+++

Vrátí další volné CLM/SRC/CASE/GAP číslo pro registr jednoho dossieru a hlásí, když se lokální working tree a origin/master neshodnou — ID kolize při souběžné práci tím přestává být otázkou toho, jestli si někdo vzpomněl fetchnout.

## Kdy ho spustit {#kdy}

Před založením nového kanonického záznamu, zvlášť když na dossieru pracuje víc instancí naráz.

## Co shodí běh {#vynucuje}

- Rozdíl mezi nejvyšším ID v lokálním working tree a na origin/master se ohlásí, ne přejde.

## Co je potřeba vědět {#pozor}

- Vzniklo po kolizi 5. 8. 2026, kdy dvě souběžné session spočítaly totéž „další volné“ ID a přepsaly si zdroje navzájem.

