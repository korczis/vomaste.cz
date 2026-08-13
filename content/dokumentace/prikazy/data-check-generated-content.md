+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:check-generated:content — Parita content/ se stagingem"
template = "tooling-command.html"
weight = 42
description = "Parita content/ se stagingem: Totéž co data:check-generated, navíc kontrola C6: každá synchronizovaná cesta je v content/ byte-identická se stagingem a v pokrytém scope neleží žádný .md bez staging protějšku.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-check-generated-content"
tooling_command = "data-check-generated-content"
view_model = "generated/tooling-catalog.json"
+++

Totéž co data:check-generated, navíc kontrola C6: každá synchronizovaná cesta je v content/ byte-identická se stagingem a v pokrytém scope neleží žádný .md bez staging protějšku.

## Kdy ho spustit {#kdy}

V build pipeline běží až po build:routes — C4 čte data/generated/routes.json a před prvním build:routes by neexistoval (čerstvý klon) nebo byl zastaralý.

## Co shodí běh {#vynucuje}

- C1–C5 stejně jako data:check-generated.
- C6 — ruční drift content/**: soubor v pokrytém scope, který se liší od stagingu, nebo který ve stagingu nemá protějšek. Content je pro tyhle cesty generovaný artefakt, ruční edit je chyba brány.

