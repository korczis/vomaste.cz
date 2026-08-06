+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "skill bootstrap — Nastartování session"
template = "tooling-command.html"
weight = 102
description = "Nastartování session: Rychlá opakovatelná cesta k tomu být bezpečně v obraze: potvrdit pracovní adresář a větev, přečíst závazná pravidla v daném pořadí (AGENTS.md, konstituce, co-op protokol, CLAUDE.md), ověřit prerekvizity, podívat se, co v repozitáři právě běží, a teprve pak zvolit roli — přímá práce v hlavním checkoutu, nebo worker ve worktree pro konkrétní úkol.. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-bootstrap"
tooling_command = "skill-bootstrap"
view_model = "generated/tooling-catalog.json"
+++

Rychlá opakovatelná cesta k tomu být bezpečně v obraze: potvrdit pracovní adresář a větev, přečíst závazná pravidla v daném pořadí (AGENTS.md, konstituce, co-op protokol, CLAUDE.md), ověřit prerekvizity, podívat se, co v repozitáři právě běží, a teprve pak zvolit roli — přímá práce v hlavním checkoutu, nebo worker ve worktree pro konkrétní úkol.

## Kdy ho spustit {#kdy}

Jako první věc v každé nové session, dřív než se cokoli edituje. Volitelný argument je id úkolu (T-###).

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nenahrazuje zdrojové dokumenty — říká, které přečíst, v jakém pořadí a co ověřit před první editací.
- Prerekvizity se ověřují, ne předpokládají. Chybějící prerekvizitu neobcházej přeskočením kontrol, které umožňuje — sežeň prerekvizitu.
- Když strom úkolů ukazuje, že v repozitáři pracuje víc instancí, překryv rozsahu se hlásí na co-op sběrnici PŘED začátkem práce, ne až u konfliktu.
- Cokoli pod content/, templates/ nebo scripts/dossier/ není „drobná infra práce“ a nepatří do přímých commitů na master.

