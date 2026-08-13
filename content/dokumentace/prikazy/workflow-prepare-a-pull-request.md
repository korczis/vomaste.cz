+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow prepare-a-pull-request — Příprava pull requestu"
template = "tooling-command.html"
weight = 165
description = "Příprava pull requestu: Závěrečná cesta před odesláním: kontrola větve a nečekaných souborů, dopad na dokumentaci, redakční review u obsahové změny, brána kvality, vysvětlení diffu jako podklad pro popis, commit a otevření PR.. Claude workflow, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-prepare-a-pull-request"
tooling_command = "workflow-prepare-a-pull-request"
view_model = "generated/tooling-catalog.json"
+++

Závěrečná cesta před odesláním: kontrola větve a nečekaných souborů, dopad na dokumentaci, redakční review u obsahové změny, brána kvality, vysvětlení diffu jako podklad pro popis, commit a otevření PR.

## Kdy ho spustit {#kdy}

Když je práce hotová. Ne „skoro“.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, editor, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Obsahová změna bez redakčního review není připravená, i když je brána zelená.
- Recenzent nemá nic dohledávat, aby mohl začít.
- Na master v hlavním checkoutu nemá PR co otevřít — commit tam rovnou nasazuje.

