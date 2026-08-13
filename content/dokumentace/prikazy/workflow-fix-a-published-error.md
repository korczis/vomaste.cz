+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow fix-a-published-error — Oprava publikovaného obsahu"
template = "tooling-command.html"
weight = 163
description = "Oprava publikovaného obsahu: Cesta od nahlášení k ověřené, doložené a validované opravě — nebo k odůvodněnému odmítnutí. Claude workflow, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-fix-a-published-error"
tooling_command = "workflow-fix-a-published-error"
view_model = "generated/tooling-catalog.json"
+++

Cesta od nahlášení k ověřené, doložené a validované opravě — nebo k odůvodněnému odmítnutí. Určí typ opravy, ověří nahlášení nezávisle, zjistí dosah napříč dossierem, opraví v kanonických datech, zanechá stopu a projde branami.

## Kdy ho spustit {#kdy}

Když někdo nahlásí chybu v publikovaném obsahu nebo když review vrátil nález.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** editor, přispěvatel zdrojem, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Doklad není předpoklad cesty, je to její druhý krok. Bez něj se oprava neprovádí, ale nahlášení se nezahazuje.
- Oprava zostřující tvrzení má stejnou důkazní laťku jako nové tvrzení.
- Odmítnutí s odůvodněním je hotová práce, ne selhání.

