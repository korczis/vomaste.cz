+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/investigate — Jedno autorizované vyšetřování"
template = "tooling-command.html"
weight = 105
description = "Jedno autorizované vyšetřování: Provede jedno autorizované vyšetřování od začátku do konce: kontrola rozsahu, větev, manifest vyšetřování, zdrojovaná rešerše s předáním každého záznamu do postupu pro vstup do dossieru, a nakonec pull request, který musí schválit člověk.. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-investigate"
tooling_command = "skill-investigate"
view_model = "generated/tooling-catalog.json"
+++

Provede jedno autorizované vyšetřování od začátku do konce: kontrola rozsahu, větev, manifest vyšetřování, zdrojovaná rešerše s předáním každého záznamu do postupu pro vstup do dossieru, a nakonec pull request, který musí schválit člověk.

## Kdy ho spustit {#kdy}

Když má vzniknout ucelené vyšetřování k jednomu subjektu a tématu. Argument: id subjektu a konkrétní téma, které už je autorizované — nebo rozšíření rozsahu, které vlastník výslovně autorizuje v téhle konverzaci.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, editor, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano
- **Před použitím se ověřuje rozsah pokrytí** (autorizační log v `AGENTS.md`).

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nikdy nepublikuje sám. Obsahové změny z vyšetřování se NIKDY necommitují přímo na master, bez ohledu na roli.
- Krok 0 je tvrdá brána bez override: buď se dá ukázat na konkrétní datovanou podsekci autorizačního logu, nebo se nepokračuje. „Asi to schválí“ nestačí.
- Je to jedna skill, ne agentní framework: nezavádí nový roster agentů, nový datový formát, LLM router ani nic, co běží mimo existující nástroje.
- Manifest vyšetřování je provozní záznam, ne druhá kopie autorizace — odkazuje na id záznamu v AGENTS.md, aby rozsah byl definovaný právě na jednom místě.

