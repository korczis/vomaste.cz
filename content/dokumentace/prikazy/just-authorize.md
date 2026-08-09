+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "just authorize entity — Zápis autorizace"
template = "tooling-command.html"
weight = 117
description = "Zápis autorizace: Zkratka na zápis nové autorizace pro entitu. just recept, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/just-authorize"
tooling_command = "just-authorize"
view_model = "generated/tooling-catalog.json"
+++

Zkratka na zápis nové autorizace pro entitu. INTERAKTIVNÍ ZÁMĚRNĚ: potřebuje skutečný terminál a člověka, který rozsah napíše vlastními slovy.

## Kdy ho spustit {#kdy}

Před založením nového dossieru, po rozhodnutí vlastníka.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Je to jediná věc, která smí zapisovat do autorizačního logu. Žádný přepínač to nepřeskočí.

