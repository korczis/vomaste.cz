+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "skill adr — Architektonické rozhodnutí (ADR)"
template = "tooling-command.html"
weight = 101
description = "Architektonické rozhodnutí (ADR): Postup pro napsání záznamu architektonického rozhodnutí do docs/adr/ podle šablony, kterou repozitář už používá: měřeno, ne odhadnuto. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-adr"
tooling_command = "skill-adr"
view_model = "generated/tooling-catalog.json"
+++

Postup pro napsání záznamu architektonického rozhodnutí do docs/adr/ podle šablony, kterou repozitář už používá: měřeno, ne odhadnuto. Předepisuje disciplínu i strukturu výsledného souboru.

## Kdy ho spustit {#kdy}

Když je rozhodnutí zároveň VÝZNAMNÉ (nová závislost, změna datového modelu, výměna knihovny) a SPORNÉ (rozumný člověk může argumentovat oběma směry). Malé zjevně správné změny ADR nepotřebují.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Měř, neodhaduj. ADR, které tvrdí „mohlo by to být pomalé ve velkém“, aniž by uvedlo změřený současný rozsah, není hotové.
- Řekni, co bylo skutečně rozbité. Návrhy na větší stack často začínají u reálného symptomu, jehož skutečná příčina je mnohem menší — najít a opravit ten skutečný problém bývá celé řešení.
- Zvaž konkrétní údržbovou cenu přijetí, ne jen nepřijetí. Druhý zdroj pravdy je nové riziko duplikace, ne jeho snížení.
- Dej ČÍSELNÝ práh pro přehodnocení, ne „později“ nebo „až to poroste“ — to je rozdíl mezi „teď ne“ a „ne“.
- ADR nikdy nepřebíjí AGENTS.md: dokumentuje technické rozhodnutí, ne rozhodnutí o rozsahu. Rozsah se mění výhradně zápisem do append-only autorizačního logu.

