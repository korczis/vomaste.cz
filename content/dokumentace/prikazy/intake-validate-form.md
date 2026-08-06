+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run intake:validate-form — Strukturální kontrola issue formulářů"
template = "tooling-command.html"
weight = 4
description = "Strukturální kontrola issue formulářů: Kontroluje malou množinu strukturálních vlastností .github/ISSUE_TEMPLATE/*.yml a config.yml, které by jinak tiše rozbily skutečné odeslání. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/intake-validate-form"
tooling_command = "intake-validate-form"
view_model = "generated/tooling-catalog.json"
+++

Kontroluje malou množinu strukturálních vlastností .github/ISSUE_TEMPLATE/*.yml a config.yml, které by jinak tiše rozbily skutečné odeslání. Není to reimplementace celého GitHub schema validátoru — to by bylo znovuvynalezení existujícího nástroje.

## Kdy ho spustit {#kdy}

Po editaci issue šablon. Do `npm test` je zapojený přes vlastní test soubor, takže vlastní krok pipeline nepotřebuje.

## Co shodí běh {#vynucuje}

- Nevalidní YAML nebo tabulátory v šabloně.
- Neunikátní id polí.
- Pole bez atributů, které jeho typ vyžaduje.
- Vadný tvar config.yml.

## Co je potřeba vědět {#pozor}

- Hlubší kontrakt formulář ↔ parser („parsuje výstup tohohle formuláře doopravdy?“) vlastní scripts/intake/issue-form-compatibility.test.mjs, ne tenhle skript.

