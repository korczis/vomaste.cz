+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:validate — Kanonická brána datasetu"
template = "tooling-command.html"
weight = 3
description = "Kanonická brána datasetu: Zvaliduje tvar všech kanonických souborů proti schemas/canonical/ (AJV 2020-12, strict), pak nad celým datasetem referenční integritu, sémantiku a JSON-LD expanzi. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-validate"
tooling_command = "data-validate"
view_model = "generated/tooling-catalog.json"
+++

Zvaliduje tvar všech kanonických souborů proti schemas/canonical/ (AJV 2020-12, strict), pak nad celým datasetem referenční integritu, sémantiku a JSON-LD expanzi. S `-- --file <cesta>` zkontroluje TVAR jednoho záznamu — rychlá smyčka při editaci; referenční a sémantická pravidla v tomhle režimu záměrně neběží a skript to říká.

## Kdy ho spustit {#kdy}

Po každé editaci čehokoli pod data/dossiers/**. Je to první krok všech tří režimů pipeline (build, dev, check) — nevalidní data musí zastavit běh dřív, než cokoli vygeneruje.

## Co shodí běh {#vynucuje}

- Kanonický soubor, který neodpovídá schématu podle svého recordType (včetně pole navíc — schémata mají additionalProperties: false).
- R1–R8: unikátnost @id, unikátnost identifieru v dossieru, soulad cesty souboru s @id, existence cílů všech referencí uvnitř téhož dossieru, existence entit vztahů, ≥1 existující zdroj u tvrzení mimo status-opinion, integrita kurátorované grafové vrstvy, obousměrnost vazby claim↔source.
- S1–S10: doložení tvrzení (single/corroborated přes nezávislé rodiny zdrojů), autorizační pravidla S5/S6, subjektové uzly grafu S7, souvislost grafu S8, a S10 — týž vydavatel nikdy nezakládá nezávislé doložení.
- T1–T8: parita ručně psané tabulky „Registr tvrzení“ s kanonickými claim záznamy (kotvy, 1:1 množiny, byte-verná shoda textu/statusu/zdrojů, uzavřený slovník statusů, dedup URL u corroborated, plnostránková doktrína zdroje).
- Neplatná JSON-LD expanze datasetu.

## Co je potřeba vědět {#pozor}

- Prázdný dataset (0 dossier balíčků) je legitimní stav a projde s explicitní hláškou — brána existuje dřív než data.

