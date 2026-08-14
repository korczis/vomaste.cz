+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow verify-a-claim — Ověření existujícího tvrzení"
template = "tooling-command.html"
weight = 159
description = "Ověření existujícího tvrzení: Cesta ověřovatele: dvanáct kontrol tvrzení, otevření každého citovaného zdroje, posouzení počtu nezávislých hlasů a kontrola navázaných mezer. Claude workflow, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-verify-a-claim"
tooling_command = "workflow-verify-a-claim"
view_model = "generated/tooling-catalog.json"
+++

Cesta ověřovatele: dvanáct kontrol tvrzení, otevření každého citovaného zdroje, posouzení počtu nezávislých hlasů a kontrola navázaných mezer. U většího počtu tvrzení deleguje claim-reviewerovi a source-verifierovi, aby se hlavní kontext neutopil ve zdrojích.

## Kdy ho spustit {#kdy}

Když je potřeba zjistit, jestli konkrétní tvrzení sedí se zdroji, které cituje.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, editor, recenzent
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Lidský checkpoint u sporné nezávislosti: když nejde z textu rozhodnout, důsledek je jeden hlas a rozhodnutí patří člověku. Předstíraná jistota vyrábí falešné CORROBORATED.
- Zdroj, který nejde otevřít, je nález, ne slepá ulička.
- Cesta nic neopravuje. Nález typu BLOCKER jde na review, ne do tiché opravy.

