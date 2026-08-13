+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:authorization — Autorizační brána dossierů"
template = "tooling-command.html"
weight = 12
description = "Autorizační brána dossierů: Vynucuje autorizační pravidlo z AGENTS.md: žádný dossier bez skutečného, datovaného autorizačního záznamu a žádná kontextová entita tiše vydávaná za subjekt hodný vlastního dossieru.. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-authorization"
tooling_command = "validate-authorization"
view_model = "generated/tooling-catalog.json"
+++

Vynucuje autorizační pravidlo z AGENTS.md: žádný dossier bez skutečného, datovaného autorizačního záznamu a žádná kontextová entita tiše vydávaná za subjekt hodný vlastního dossieru.

## Kdy ho spustit {#kdy}

V build pipeline. Ručně po každé změně autorizací nebo rolí entit.

## Co shodí běh {#vynucuje}

- Dossier odkazující na autorizační záznam, který v data/authorizations.toml neexistuje.
- Subjektová entita dossieru, která není publicationRole = "subject" a dossierEnabled = true.
- Kontextová entita označená jako dossierEnabled nebo authorized.
- Subjekt bez dossierStatus = "authorized"; kontext s coverageState ve stavu developing nebo full.
- Entita bez provenance.discoveredAt (chybí auditní stopa objevení).
- Dossier citující autorizační záznam, jehož subjekty se s jeho vlastními nepřekrývají.

## Co je potřeba vědět {#pozor}

- Dvojí jištění autorizační hranice se S5/S6 je záměrné — tahle pravidla se nikdy negrandfatherují.
- Jestli obsah dossieru zůstává uvnitř deklarovaného rozsahu, posoudí člověk. Skript chytá strukturální porušení hranice subjekt × kontext, ne text.

