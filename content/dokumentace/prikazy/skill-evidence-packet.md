+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/evidence-packet — Důkazní balíček"
template = "tooling-command.html"
weight = 125
description = "Důkazní balíček: Vede člověka sedmi otázkami od ověřených zdrojů ke strukturovanému podkladu, který může někdo jiný posoudit a zapsat: tvrzení, doklady s doslovnými pasážemi, typ zdroje, počet nezávislých hlasů, rozpory mezi zdroji, otevřené otázky a jmenované třetí osoby. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-evidence-packet"
tooling_command = "skill-evidence-packet"
view_model = "generated/tooling-catalog.json"
+++

Vede člověka sedmi otázkami od ověřených zdrojů ke strukturovanému podkladu, který může někdo jiný posoudit a zapsat: tvrzení, doklady s doslovnými pasážemi, typ zdroje, počet nezávislých hlasů, rozpory mezi zdroji, otevřené otázky a jmenované třetí osoby. Umožňuje přispět bez znalosti kanonického datového modelu.

## Kdy ho spustit {#kdy}

Když má někdo ověřené zdroje a chce z nich udělat použitelný podklad — typicky netechnický přispěvatel před tím, než se záznam vůbec zapíše.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** přispěvatel zdrojem, rešeršista, editor
- **Riziko:** bezpečný zápis
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Balíček NIKDY nepublikuje. Mezi ním a webem stojí kontrola rozsahu, redakční posouzení, zápis, build a review diffu.
- Pole „co tomu odporuje“ je povinné. Rozpor mezi zdroji se dokumentuje, ne zprůměruje — a bývá to nejcennější část balíčku.
- Chybějící údaj se nechá prázdný a označí. Vymyšlená hodnota je horší než mezera, protože se tváří jako zjištění.
- Neveřejný materiál a materiál identifikující zdroj do repozitáře nesmí ani jako podklad.

