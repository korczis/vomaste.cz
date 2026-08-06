+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:navigation-counts — Počty v postaveném HTML"
template = "tooling-command.html"
weight = 64
description = "Počty v postaveném HTML: Post-build kontrola: každý navigační počet v postaveném HTML se musí rovnat hodnotě v manifestu metrik a žádná položka nesmí nést odznak, pro který metriku nikdy nedostala.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-navigation-counts"
tooling_command = "verify-navigation-counts"
view_model = "generated/tooling-catalog.json"
+++

Post-build kontrola: každý navigační počet v postaveném HTML se musí rovnat hodnotě v manifestu metrik a žádná položka nesmí nést odznak, pro který metriku nikdy nedostala.

## Kdy ho spustit {#kdy}

Po zola build. Předbuildová kontrola dokáže jen to, že metrika je spočitatelná — ne že ji šablona vykreslila.

## Co shodí běh {#vynucuje}

- Odznak v HTML s jinou hodnotou, než jakou nese data/generated/navigation-metrics.json.
- Odznak u navigační položky, která nemá přiřazenou metriku.

## Co je potřeba vědět {#pozor}

- HTML je minifikované — uvozovky atributů zmizí a pořadí se nezachová. Skript proto atributy tokenizuje, místo aby na ně pouštěl regulární výraz s pevným uvozováním; první pokus o ověření právě na tomhle hlásil chybějící odznaky, které tam byly a byly správné.

