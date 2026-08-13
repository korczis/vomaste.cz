+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:jsonld — JSON-LD postaveného webu"
template = "tooling-command.html"
weight = 70
description = "JSON-LD postaveného webu: Post-build kontrola strukturovaných dat emitovaných šablonou. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-jsonld"
tooling_command = "verify-jsonld"
view_model = "generated/tooling-catalog.json"
+++

Post-build kontrola strukturovaných dat emitovaných šablonou. Pět úloh: platnost JSON, zákaz markupu soudícího pravdivost, pokrytí a tvar uzlů, identita citací a pokrytí stránek.

## Kdy ho spustit {#kdy}

Až po zola build. Volitelně nad libovolným postaveným stromem přes `--dir`.

## Co shodí běh {#vynucuje}

- Blok application/ld+json, který neparsuje jako JSON.
- Jakýkoli ClaimReview, Rating/AggregateRating nebo klíč reviewRating/ratingValue — mechanická podoba redakčních pravidel 3 a 7: statusy webu popisují zdrojování, ne rozsouzenou pravdu.
- Stránka tvrzení bez Claim uzlu s neprázdným `appearance`; hlavní stránka entitního dossieru bez právě jednoho Person uzlu; Person na agregátním dossieru; chybějící povinná pole podle @type.
- `appearance` tvrzení, které neodpovídá přesně zdrojům deklarovaným tímtéž tvrzením uvnitř jeho vlastního dossieru — cizí záznam je chyba.
- Postavená stránka bez jediného JSON-LD bloku (jedinou výjimkou jsou alias přesměrování).

## Co je potřeba vědět {#pozor}

- Úloha 5 slibuje, že každá stránka je strojově čitelná JAKO STRÁNKA — ne že každý typ záznamu má uzel popisující ZÁZNAM. Strojová podoba kauz, mezer, vztahů a entit žije v /data/*.jsonld exportech.
- Úloha 4 vznikla proto, že úloha 3 nestačila: tvrzení citující SRC-01 kdysi posbíralo SRC-01 všech dossierů — 17 606 vložených citací, z toho jen 1 114 vlastních.

