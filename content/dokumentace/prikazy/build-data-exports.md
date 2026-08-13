+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:data-exports — Ploché JSON exporty registrů"
template = "tooling-command.html"
weight = 19
description = "Ploché JSON exporty registrů: Ploché JSON exporty každého registru pro SQL konzoli v prohlížeči i pro kohokoli, kdo chce prostě data — stabilní URL, čitelné curlem a jq, bez WASM.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-data-exports"
tooling_command = "build-data-exports"
view_model = "generated/tooling-catalog.json"
+++

Ploché JSON exporty každého registru pro SQL konzoli v prohlížeči i pro kohokoli, kdo chce prostě data — stabilní URL, čitelné curlem a jq, bez WASM.

## Kdy ho spustit {#kdy}

V build i dev pipeline po build:navigation a před grafovými projekcemi, které exporty čtou.

## Co shodí běh {#vynucuje}

- Tvar exportu proti schematům schemas/*.schema.json — brána běží uvnitř tohohle kroku (lib/export-schemas.mjs), aby se tvar veřejných exportů nemohl změnit bez vědomé úpravy schématu.

## Co je potřeba vědět {#pozor}

- Odvozené, nikdy psané ručně: žádný status, skóre ani pořadí se tu nepočítá — export je projekce, ne druhý zdroj pravdy.
- Řádky staví lib/record-tables.mjs sdílený s build:jsonld-exports, aby obě rodiny exportů byly projekcí JEDNOHO modelu.

