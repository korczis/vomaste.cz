+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run data:check-generated — Parita generovaných artefaktů"
template = "tooling-command.html"
weight = 40
description = "Parita generovaných artefaktů: Ověřuje 1:1 pokrytí kanonického datasetu view modely a staging stuby. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/data-check-generated"
tooling_command = "data-check-generated"
view_model = "generated/tooling-catalog.json"
+++

Ověřuje 1:1 pokrytí kanonického datasetu view modely a staging stuby. Šest kontrol C1–C6; C6 (parita content/ se stagingem) běží jen s přepínačem --content.

## Kdy ho spustit {#kdy}

Po generátorech. V build pipeline běží varianta data:check-generated:content, tahle podoba je pro ruční ladění bez content parity.

## Co shodí běh {#vynucuje}

- C1 — kanonický záznam s routou bez právě jednoho staging stubu a právě jednoho view modelu; chybějící strukturální _index stuby a souhrnné view modely.
- C2 — sirotčí soubor: staging stub nebo view model, kterému neodpovídá záznam ani očekávaný strukturální soubor.
- C3 — stub bez extra.generated = true, s record_id ≠ @id záznamu nebo s view_model ukazujícím na neexistující soubor.
- C4 — routa staging stubu, která se neshoduje s dnešním data/generated/routes.json (rozdíly se vypisují oběma směry).
- C5 — top-level alias content souboru, který v odpovídajícím stubu chybí.

