+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "agent source-verifier — Ověřovatel zdrojů"
template = "tooling-command.html"
weight = 152
description = "Ověřovatel zdrojů: Otevře zadané zdroje a vrátí evidence summary: vydavatel, autor, datum vydání i pořízení, rubrika hledaná na stránce (ne v URL), primární versus převzatý původ, kandidát na zdrojovou rodinu, doslovné citace, jmenované třetí osoby, a hlavně konkrétně co dokládá a co nedokládá. Claude subagent, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/agent-source-verifier"
tooling_command = "agent-source-verifier"
view_model = "generated/tooling-catalog.json"
+++

Otevře zadané zdroje a vrátí evidence summary: vydavatel, autor, datum vydání i pořízení, rubrika hledaná na stránce (ne v URL), primární versus převzatý původ, kandidát na zdrojovou rodinu, doslovné citace, jmenované třetí osoby, a hlavně konkrétně co dokládá a co nedokládá. Na konci počet nezávislých hlasů.

## Kdy ho spustit {#kdy}

Když je zdrojů víc než jeden nebo jsou dlouhé — pět článků v hlavním kontextu zbyde jako kaše, ze které se použije pár vět.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, přispěvatel zdrojem, rešeršista, editor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nástroje: Read, Grep, Glob, WebFetch, WebSearch. Žádný Write ani Edit.
- Zdroj musí být OTEVŘENÝ. Nedostupná stránka je výsledek, ne překážka k odhadu obsahu.
- Jeho výstup NENÍ zdroj — je to shrnutí zdrojů. Citace vždy míří na původní materiál.
- Nepřebírá z registrů data narození ani adresy, ani do poznámky. Nejistota o nezávislosti se řeší dolů.

