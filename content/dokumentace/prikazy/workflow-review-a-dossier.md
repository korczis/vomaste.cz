+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow review-a-dossier — Redakční review dossieru"
template = "tooling-command.html"
weight = 157
description = "Redakční review dossieru: Cesta editora před publikací: review v celku, atomické kontroly u označených záznamů, mechanické brány z buildu a sloučené nálezy s prioritou. Claude workflow, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-review-a-dossier"
tooling_command = "workflow-review-a-dossier"
view_model = "generated/tooling-catalog.json"
+++

Cesta editora před publikací: review v celku, atomické kontroly u označených záznamů, mechanické brány z buildu a sloučené nálezy s prioritou. Mechanická brána a redakční review jsou dvě různé věci a dělají se souběžně.

## Kdy ho spustit {#kdy}

Před merge obsahové změny a při periodické revizi dossieru.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- BLOCKER se nepublikuje bez výjimky. HIGH je rozhodnutí člověka, ale vědomé.
- Dvacetkrát stejná chyba je jedna systémová chyba. Opravuje se příčina, ne dvacet výskytů.
- Nálezy jsou o tom, co zdroje unesou, ne o slohu. Co se nedá rozhodnout ze zdrojů, je LOW.

