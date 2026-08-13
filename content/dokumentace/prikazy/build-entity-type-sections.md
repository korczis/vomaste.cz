+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:entity-type-sections — Sekce podle typu entity"
template = "tooling-command.html"
weight = 20
description = "Sekce podle typu entity: Generuje jednu sekci na typ entity, takže každý typ má skutečnou routu místo pohledu existujícího jen v JavaScriptu.. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-entity-type-sections"
tooling_command = "build-entity-type-sections"
view_model = "generated/tooling-catalog.json"
+++

Generuje jednu sekci na typ entity, takže každý typ má skutečnou routu místo pohledu existujícího jen v JavaScriptu.

## Kdy ho spustit {#kdy}

V build i dev pipeline před build:routes.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Sekce jsou filtrované pohledy nad jedním registrem, nikdy druhá kopie záznamů — entita si drží jednu kanonickou stránku, URL a @id.
- Sekci dostane každý typ přítomný v datech, i typ s jedinou entitou. Práh by byl nezdokumentovaná mezera: čtenář, který jde za „9 typů“ a najde 6 rout, byl uveden v omyl.
- Idempotentní: sekce typů, které v datech už nejsou, se odstraní.

