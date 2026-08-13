+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow fix-a-site-bug — Oprava chyby na webu"
template = "tooling-command.html"
weight = 159
description = "Oprava chyby na webu: Cesta vývojáře od nahlášeného projevu k opravené příčině: rozklad zadání, reprodukce, hledání příčiny (mrtvá kotva bývá důsledek přečíslování záznamu, ne chyba šablony), oprava tam, kde příčina je, UI a přístupnostní review, testy, build a vysvětlení změny.. Claude workflow, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-fix-a-site-bug"
tooling_command = "workflow-fix-a-site-bug"
view_model = "generated/tooling-catalog.json"
+++

Cesta vývojáře od nahlášeného projevu k opravené příčině: rozklad zadání, reprodukce, hledání příčiny (mrtvá kotva bývá důsledek přečíslování záznamu, ne chyba šablony), oprava tam, kde příčina je, UI a přístupnostní review, testy, build a vysvětlení změny.

## Kdy ho spustit {#kdy}

U technické chyby — rozbité zobrazení, mrtvý odkaz, nefunkční prvek. Ne u chyby v obsahu.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Když to nejde reprodukovat, oprava je odhad.
- Když je příčina v datech, oprava patří do data/, ne do šablony. Generovaný soubor se neopravuje.
- Oprava vyžadující nové pole není oprava chyby — je to změna datového kontraktu.

