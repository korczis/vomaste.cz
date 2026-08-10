+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run check — Validace bez generování"
template = "tooling-command.html"
weight = 99
description = "Validace bez generování: Režim pipeline, který spouští jen kroky, které nic nezapisují a nepotřebují vygenerované artefakty: kanonickou bránu, autorizaci, typy dossierů, koncepty, typy entit, čtyři linty a paritu CI workflow.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/check"
tooling_command = "check"
view_model = "generated/tooling-catalog.json"
+++

Režim pipeline, který spouští jen kroky, které nic nezapisují a nepotřebují vygenerované artefakty: kanonickou bránu, autorizaci, typy dossierů, koncepty, typy entit, čtyři linty a paritu CI workflow.

## Kdy ho spustit {#kdy}

Když chceš rychlou zpětnou vazbu k datům a šablonám bez stavění webu.

## Co shodí běh {#vynucuje}

- Nenulový exit kteréhokoli z jeho kroků. Post-build brány sem nepatří — potřebují public/.

