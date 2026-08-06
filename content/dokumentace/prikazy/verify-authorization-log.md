+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:authorization-log — Append-only autorizační log"
template = "tooling-command.html"
weight = 14
description = "Append-only autorizační log: Mechanicky vynucuje nejkritičtější pravidlo AGENTS.md: sekce „Content about real parties“ je append-only. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-authorization-log"
tooling_command = "verify-authorization-log"
view_model = "generated/tooling-catalog.json"
+++

Mechanicky vynucuje nejkritičtější pravidlo AGENTS.md: sekce „Content about real parties“ je append-only. Každý existující datovaný záznam musí přežít byte-verně; přidávat lze jen nové.

## Kdy ho spustit {#kdy}

V build pipeline a v pre-commit. Po přidání nové autorizace nejdřív spusť authorization:anchor, jinak tahle brána build zastaví.

## Co shodí běh {#vynucuje}

- Editace nebo smazání existujícího záznamu logu proti merge-base s origin/master (fallback origin/main, pak HEAD).
- Ukotvený záznam, který v AGENTS.md už není byte-verně přítomen (hash-kotva data/authorizations-log-anchor.json).
- Záznam v logu, který v kotvě není — nový záznam vyžaduje vědomé ukotvení přes authorization:anchor (fail-closed).
- Neznámý tvar ### nadpisu v území logu (tiché ignorování je zakázané).

## Co je potřeba vědět {#pozor}

- První verze porovnávala jen s `git show HEAD:AGENTS.md` — v CI to byl no-op a po jediném commitu se editace stala novým baseline. Proto dnes dva nezávislé mechanismy: git baseline a commitnutá hash-kotva.

