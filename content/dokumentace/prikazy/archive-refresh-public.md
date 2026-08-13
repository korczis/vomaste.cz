+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run archive:refresh-public — Síťový refresh veřejné Zone A"
template = "tooling-command.html"
weight = 79
description = "Síťový refresh veřejné Zone A: Stáhne nové základní ARES snapshoty, uloží raw Justice odpovědi mimo Git, vytvoří sanitizované Justice indexy, provede docket-only dotazy soudních vývěsek a nakonec spustí offline archivní bránu.. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/archive-refresh-public"
tooling_command = "archive-refresh-public"
view_model = "generated/tooling-catalog.json"
+++

Stáhne nové základní ARES snapshoty, uloží raw Justice odpovědi mimo Git, vytvoří sanitizované Justice indexy, provede docket-only dotazy soudních vývěsek a nakonec spustí offline archivní bránu.

## Kdy ho spustit {#kdy}

Po přidání či změně entity s IČO a pravidelně týdně přes review workflow; vyžaduje síť.

## Co shodí běh {#vynucuje}

- Neúspěšný síťový dotaz, neočekávaný tvar odpovědi, neprázdnou soudní vývěsku bez individuálního review nebo následně červenou offline archivní bránu.

## Co je potřeba vědět {#pozor}

- Naplánovaný GitHub workflow smí commitnout jen veřejné Zone A deriváty do review větve; Zone B se nikdy neuploaduje.
- Neprázdná odpověď vývěsky se nejprve uchová v lokální Zone B a pak běh zastaví, aby nemohla být automaticky zveřejněna.

