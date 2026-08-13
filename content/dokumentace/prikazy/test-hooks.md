+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:hooks — Test guardu automatického nasazení"
template = "tooling-command.html"
weight = 54
description = "Test guardu automatického nasazení: Ověřuje rozhodovací guard sdílené rutiny, kterou volají post-commit i post-merge hook — tedy to, co rozhoduje, jestli se commit na master sám postaví a pushne. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-hooks"
tooling_command = "test-hooks"
view_model = "generated/tooling-catalog.json"
+++

Ověřuje rozhodovací guard sdílené rutiny, kterou volají post-commit i post-merge hook — tedy to, co rozhoduje, jestli se commit na master sám postaví a pushne. Staví dočasné repozitáře přes mktemp, nikdy nesáhne na síť ani na tenhle repozitář.

## Kdy ho spustit {#kdy}

Po zásahu do .githooks/ nebo do sdílené rutiny auto-push. Je součástí build i check pipeline.

## Co shodí běh {#vynucuje}

- Po úspěšném mergi bez fast-forward se hook nezastaví — dřív se zastavoval a merge na master se tvářil jako nasazený, ačkoli push nikdy neproběhl.
- Rozdělaný rebase, cherry-pick, bisect i rozpracované řešení konfliktu hook zastaví — a nově to vypíše, místo aby mlčel.
- Mimo větev master zůstává hook tichý no-op.

## Co je potřeba vědět {#pozor}

- Nespouští push ani build. Zastaví rutinu hned za guardem přes COOP_NO_AUTOPUSH a rozhodnutí čte z toho, která hláška padne — proto může běžet v každé pipeline bez rizika, že něco zveřejní.
- První kontrola neměří náš kód, ale chování gitu: že MERGE_HEAD při běhu post-merge ještě existuje. Celý guard na tom faktu stojí, a právě jeho záměna za „merge probíhá“ byla ta chyba.
- Tichý návrat je u nasazovacího mechanismu horší než hlasitý odmítnutý push: nic se nevypsalo se čte jako proběhlo to. Proto je hlášku vidět i tam, kde se stejně nic nenasadí.

