+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just expand ico *args — Rozbalení rejstříkového okolí"
template = "tooling-command.html"
weight = 167
description = "Rozbalení rejstříkového okolí: Přečte veřejný rejstřík k danému IČO a zapíše jeden KONTEXTOVÝ záznam entity na každou nalezenou právnickou osobu a každou zapsanou fyzickou osobu. just recept, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-expand"
tooling_command = "just-expand"
view_model = "generated/tooling-catalog.json"
+++

Přečte veřejný rejstřík k danému IČO a zapíše jeden KONTEXTOVÝ záznam entity na každou nalezenou právnickou osobu a každou zapsanou fyzickou osobu. Automatizovaná podoba toho, co redaktor jinak dělá ručně po dotazu do ARES.

## Kdy ho spustit {#kdy}

Po dotazu do ARES, když chceš mít okolí firmy jako kontextové entity. Výchozí je dry run; teprve `--write` zapisuje. Příklad: `just expand 28274318 --write`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nikdy nepřepisuje existující záznam a hlásí podezření na duplicitu pod jiným slugem.
- Všechno zapsané je publicationRole = "context", dossierEnabled = false, dossierStatus = "not_authorized" — proto to nevyžaduje autorizaci. Autorizace je potřeba, teprve když se má z kontextu stát subjekt.

