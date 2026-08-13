+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/quality — Kontrola připravenosti"
template = "tooling-command.html"
weight = 117
description = "Kontrola připravenosti: Souhrn před odesláním: stav gitu a nečekané soubory, rozpis změn po kategoriích, rychlé validátory, drift generovaných souborů, dopad na dokumentaci, redakční review u obsahové změny a plná brána. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-quality"
tooling_command = "skill-quality"
view_model = "generated/tooling-catalog.json"
+++

Souhrn před odesláním: stav gitu a nečekané soubory, rozpis změn po kategoriích, rychlé validátory, drift generovaných souborů, dopad na dokumentaci, redakční review u obsahové změny a plná brána. Vrací verdikt READY nebo NENÍ READY s tím, co konkrétně chybí.

## Kdy ho spustit {#kdy}

Těsně před /pr nebo před žádostí o merge. Není to průběžná kontrola.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** editor, vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- disable-model-invocation: true. Spouští plnou bránu a jeho verdikt se čte jako záruka.
- READY se nesmí vyslovit, dokud npm run build neproběhl a neskončil exit 0 — ani když všechno ostatní vyšlo.
- Generované soubory v diffu jsou v pořádku, když odpovídají změně dat. Generovaný soubor bez odpovídající změny dat je nález.
- Zelená brána neznamená, že je změna dobrá. Redakční kvalitu mechanická brána neposoudí.

