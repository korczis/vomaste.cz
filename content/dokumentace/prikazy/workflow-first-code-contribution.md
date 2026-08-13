+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow first-code-contribution — První technický příspěvek"
template = "tooling-command.html"
weight = 158
description = "První technický příspěvek: Cesta nového vývojáře od naklonovaného repozitáře k otevřenému pull requestu: bootstrap s personou, vlastní větev, rozklad zadání, malá změna, cílené testy, kontrola dopadu na dokumentaci, brána kvality a popis PR postavený na vysvětlení diffu.. Claude workflow, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-first-code-contribution"
tooling_command = "workflow-first-code-contribution"
view_model = "generated/tooling-catalog.json"
+++

Cesta nového vývojáře od naklonovaného repozitáře k otevřenému pull requestu: bootstrap s personou, vlastní větev, rozklad zadání, malá změna, cílené testy, kontrola dopadu na dokumentaci, brána kvality a popis PR postavený na vysvětlení diffu.

## Kdy ho spustit {#kdy}

Když někdo přispívá technicky poprvé.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Krok s vlastní větví se přeskakuje a nejvíc bolí: commit na master nasazuje během sekund a není pauza na rozmyšlenou.
- První příspěvek není místo na refaktor.
- Nečekaný soubor v diffu má přednost před zelenou bránou.

