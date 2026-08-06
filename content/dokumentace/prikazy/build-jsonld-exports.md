+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:jsonld-exports — Veřejné JSON-LD exporty"
template = "tooling-command.html"
weight = 19
description = "Veřejné JSON-LD exporty: Emituje plnohloubkový @graph pro každý dossier, sjednocený graf celého webu a manifest {routa, sha256, bajty}, aby stažená kopie šla ověřit offline.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-jsonld-exports"
tooling_command = "build-jsonld-exports"
view_model = "generated/tooling-catalog.json"
+++

Emituje plnohloubkový @graph pro každý dossier, sjednocený graf celého webu a manifest {routa, sha256, bajty}, aby stažená kopie šla ověřit offline.

## Kdy ho spustit {#kdy}

V build i dev pipeline po grafových projekcích a před data:metrics, které exporty čtou.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Redakční omezení, která export dodržuje a verify:export je znovu kontroluje: žádný ClaimReview ani rating, žádná číselná jistota, schema.org Person jen pro autorizované subjekty dossieru.
- Slovník vomaste:* je záměrně minimální a obsahuje jen termíny, které se skutečně emitují. `supersedes`/`supersededBy` jsou rezervované, ale NEemitují se — deklarovat nepoužitou schopnost by bylo tvrzení bez krytí.

