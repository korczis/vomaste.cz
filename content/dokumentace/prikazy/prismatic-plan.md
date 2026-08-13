+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run prismatic:plan — Plán obohacovacích úloh"
template = "tooling-command.html"
weight = 85
description = "Plán obohacovacích úloh: Staví deterministický, vysvětlitelný plán úloh proti vlastnímu compiled kanonickému modelu vomaste. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/prismatic-plan"
tooling_command = "prismatic-plan"
view_model = "generated/tooling-catalog.json"
+++

Staví deterministický, vysvětlitelný plán úloh proti vlastnímu compiled kanonickému modelu vomaste. Žádné volání Prismatic tu neprobíhá — rozhoduje se jen, co by se dalo naplánovat a proč.

## Kdy ho spustit {#kdy}

Když chceš vidět, kde by obohacení mohlo pomoct: `-- [--all | --entity=<id> | --dossier=<slug>] [--max-records=N] [--json]`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Záměrně omezené na JEDINOU schopnost, kterou audit označil za přímo použitelnou se skutečným, otestovaným kódem: dohledání firmy v ARES pro entity typu company/organization bez stabilního IČO.
- Ostatní schopnosti (nemovitosti, sankce, instituce EU…) se neplánují — audit je našel jako vymyšlené, rozbité nebo neověřené, a naplánovat proti nim úlohu by naznačovalo, že je bezpečné je spustit.

