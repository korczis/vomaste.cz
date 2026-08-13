+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:generate-content — Generátor Zola content adaptérů"
template = "tooling-command.html"
weight = 30
description = "Generátor Zola content adaptérů: Z compiled modelu generuje do stagingu minimální routing obálky pro Zolu — front matter s title/template/weight/description a [extra] s generated/record_id/view_model/dossier/record_type/lang. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-generate-content"
tooling_command = "data-generate-content"
view_model = "generated/tooling-catalog.json"
+++

Z compiled modelu generuje do stagingu minimální routing obálky pro Zolu — front matter s title/template/weight/description a [extra] s generated/record_id/view_model/dossier/record_type/lang. Doménová pole ve front matter nežijí; šablony čtou view modely.

## Kdy ho spustit {#kdy}

Automaticky v pipeline po data:views. Ručně po změně tvaru obálky nebo šablony, která obálku čte.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Tělo detailních záznamů a dossier _index je markdown blok kanonického záznamu přenesený byte-verně — kotvy {#…}, interní @/ odkazy i poznámky pod čarou fungují beze změny.

