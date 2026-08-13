+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:export — Offline ověření exportů"
template = "tooling-command.html"
weight = 67
description = "Offline ověření exportů: Ověří stažené /data/*.jsonld exporty proti manifestu. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-export"
tooling_command = "verify-export"
view_model = "generated/tooling-catalog.json"
+++

Ověří stažené /data/*.jsonld exporty proti manifestu. Kdokoli — fork, čtenář, novinář — může spustit `node scripts/dossier/verify-export.mjs --dir <kořen stažené kopie>` a potvrdit, že se s daty po exportu nemanipulovalo.

## Kdy ho spustit {#kdy}

Poslední krok build pipeline (výchozí --dir je public/). Mimo repozitář kdykoli nad staženou kopií webu.

## Co shodí běh {#vynucuje}

- Export z manifestu, který neexistuje nebo jehož bajty se nehašují na zapsanou sha256.
- Export, který neparsuje jako JSON nebo nenese @context a @graph.
- Uzel s markupem soudícím pravdivost (ClaimReview, Rating, reviewRating…).
- Claim uzel s prázdným `appearance`; duplicitní @id uvnitř dokumentu.
- vomaste:citationFingerprint, který se nepřepočítá z viditelných polí uzlu (url + vomaste:retrieved + publisher.name).

