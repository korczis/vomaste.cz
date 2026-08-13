+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just scaffold slug title subject auth_record_id — Scaffold dossier balíčku"
template = "tooling-command.html"
weight = 160
description = "Scaffold dossier balíčku: Zkratka na scaffold kanonického balíčku se čtyřmi povinnými parametry: slug, titul, subjekt a id autorizačního záznamu.. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-scaffold"
tooling_command = "just-scaffold"
view_model = "generated/tooling-catalog.json"
+++

Zkratka na scaffold kanonického balíčku se čtyřmi povinnými parametry: slug, titul, subjekt a id autorizačního záznamu.

## Kdy ho spustit {#kdy}

Po zapsání autorizace. Příklad: `just scaffold jana-novakova "Jana Nováková" novakova AUTH-2026-08-01-X`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Odmítne subjekt bez odpovídajícího záznamu v data/authorizations.toml.

