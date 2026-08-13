+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:navigation-metrics — Kontrola manifestu metrik"
template = "tooling-command.html"
weight = 67
description = "Kontrola manifestu metrik: Spočítá metriky znovu a porovná je s odevzdaným manifestem. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-navigation-metrics"
tooling_command = "validate-navigation-metrics"
view_model = "generated/tooling-catalog.json"
+++

Spočítá metriky znovu a porovná je s odevzdaným manifestem. Nic nezapisuje.

## Kdy ho spustit {#kdy}

V pipeline hned po data:metrics; v CI jako předbuildová kontrola.

## Co shodí běh {#vynucuje}

- Rozdíl mezi přepočítanými metrikami a data/generated/navigation-metrics.json — tedy zastaralý manifest.

