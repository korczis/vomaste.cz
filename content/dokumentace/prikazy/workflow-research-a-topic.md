+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow research-a-topic — Rešerše tématu"
template = "tooling-command.html"
weight = 158
description = "Rešerše tématu: Cesta rešeršisty od širokého zadání k doloženým záznamům nebo poctivým mezerám: kontrola rozsahu jako PRVNÍ krok, zúžení otázky, hledání kandidátů v pořadí registr → zpravodajství → agregátor, ověření, posouzení nezávislosti, důkazní balíček a teprve pak zápis.. Claude workflow, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-research-a-topic"
tooling_command = "workflow-research-a-topic"
view_model = "generated/tooling-catalog.json"
+++

Cesta rešeršisty od širokého zadání k doloženým záznamům nebo poctivým mezerám: kontrola rozsahu jako PRVNÍ krok, zúžení otázky, hledání kandidátů v pořadí registr → zpravodajství → agregátor, ověření, posouzení nezávislosti, důkazní balíček a teprve pak zápis.

## Kdy ho spustit {#kdy}

Když je téma a subjekt, ale ne konkrétní otázka. Zúžení je první krok, ne předpoklad.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, editor
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano
- **Před použitím se ověřuje rozsah pokrytí** (autorizační log v `AGENTS.md`).

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Kontrola rozsahu je první, ne poslední. Rešerše mimo rozsah je práce, která nemůže skončit publikací.
- Mezera je výsledek, ne neúspěch. Hedge věta není kompromis mezi tvrzením a mezerou — je to nedoložené tvrzení.
- Když se rešerše rozlézá, vrací se k zúžení. To není jednorázový krok.

