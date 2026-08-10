+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run report:evidence-plan — Evidenční plán práce"
template = "tooling-command.html"
weight = 37
description = "Evidenční plán práce: Generovaný přehled stavu evidence per dossier: kde je zdrojování nejslabší a co ho konkrétně posílí. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/report-evidence-plan"
tooling_command = "report-evidence-plan"
view_model = "generated/tooling-catalog.json"
+++

Generovaný přehled stavu evidence per dossier: kde je zdrojování nejslabší a co ho konkrétně posílí. Čistá projekce kanonického modelu — nic si nepamatuje a nic nedopočítává mimo data.

## Kdy ho spustit {#kdy}

Automaticky v data:build i v build. Ručně, když chceš aktuální plán práce; `--json` vypíše na stdout a nic nezapíše.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Není hodnocení osob. Vysoké skóre znamená, že TENHLE web má u daného dossieru nejvíc nedodělané zdrojovací práce — je to metrika naší evidence, ne jednání subjektu.
- Report neobsahuje čas běhu: stáří mezer se měří proti nejnovějšímu datu v datasetu, takže dva běhy nad stejnými daty dají bajt po bajtu stejný soubor. Horizont lze přepsat `--as-of=RRRR-MM-DD`.
- Výstupy jdou do reports/ a data/generated/, nikdy do content/ — neroutují se a žádná stránka z nich nevzniká.

