+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:routes — Manifest rout"
template = "tooling-command.html"
weight = 25
description = "Manifest rout: Staví jediný explicitní manifest id → routa napříč všemi dossiery, aby žádná šablona ani skript nemusely skládat URL z id na víc než jednom místě. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-routes"
tooling_command = "build-routes"
view_model = "generated/tooling-catalog.json"
+++

Staví jediný explicitní manifest id → routa napříč všemi dossiery, aby žádná šablona ani skript nemusely skládat URL z id na víc než jednom místě. Deterministické, bez sítě.

## Kdy ho spustit {#kdy}

V pipeline před vším, co routy čte (parita content, navigace, exporty).

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

