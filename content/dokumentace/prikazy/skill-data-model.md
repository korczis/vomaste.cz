+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/data-model — Průvodce datovým modelem"
template = "tooling-command.html"
weight = 140
description = "Průvodce datovým modelem: Odpoví na otázky o kanonickém datovém modelu ze schématu, validátorů a skutečných záznamů — jaká pole typ má, co je povinné, jaké enumy jsou uzavřené, kdo pole vynucuje nad rámec tvaru a kdo ho čte. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-data-model"
tooling_command = "skill-data-model"
view_model = "generated/tooling-catalog.json"
+++

Odpoví na otázky o kanonickém datovém modelu ze schématu, validátorů a skutečných záznamů — jaká pole typ má, co je povinné, jaké enumy jsou uzavřené, kdo pole vynucuje nad rámec tvaru a kdo ho čte. Při rozporu mezi schématem a dokumentací vyhrává schéma a rozpor je nález.

## Kdy ho spustit {#kdy}

Před přidáním nebo změnou pole, při ručním psaní záznamu, a když není jasné, co které pole znamená.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, editor, vývojář, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Pole, které nikdo nečte, i šablonové pole bez pokrytí schématem jsou obojí nedodělaná změna.
- Přidat záznam je čistě datová operace; přidat pole se dotýká tří míst. Na druhé je /schema-change.
- additionalProperties: false není překážka, je to brána — neuvedené pole shodí build záměrně.

