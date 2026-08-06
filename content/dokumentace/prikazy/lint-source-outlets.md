+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run lint:source-outlets — Hygiena nezávislosti zdrojů"
template = "tooling-command.html"
weight = 9
description = "Hygiena nezávislosti zdrojů: Status „doloženo dvěma nezávislými“ znamená jedno: dva NEZÁVISLÍ vydavatelé referovali totéž. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/lint-source-outlets"
tooling_command = "lint-source-outlets"
view_model = "generated/tooling-catalog.json"
+++

Status „doloženo dvěma nezávislými“ znamená jedno: dva NEZÁVISLÍ vydavatelé referovali totéž. Tenhle lint chytá dva mechanismy, které ten slib tiše ruší, protože oba vypadají jako „dva zdroje“.

## Kdy ho spustit {#kdy}

Po přidání zdrojů, dřív než se tvrzení opře o dva zdroje jako o nezávislé.

## Co shodí běh {#vynucuje}

- Aliasing outletu: týž vydavatel zapsaný dvěma způsoby (například „ČT24“ vs „ČT24 (Česká televize)“) — jinak by tvrzení citující obojí vypadalo jako dvě nezávislé rodiny.

## Co je potřeba vědět {#pozor}

- Dvojí započtení téhož outletu (dva články jednoho vydavatele) se hlásí, ale build neshodí — jako evidence je to legitimní, jen to nesmí číst jako nezávislé potvrzení.
- Třetí riziko — přetištěná agenturní zpráva ve více médiích — se jen označí. Vyžaduje lidské přečtení každého článku, takže se mechanicky nevynucuje.

