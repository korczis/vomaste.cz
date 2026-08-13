+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/diagnose — Diagnostika prostředí"
template = "tooling-command.html"
weight = 107
description = "Diagnostika prostředí: Zjistí, jestli má prostředí šanci fungovat: git a větev, worktree a souběžné session, Node, npm, Zola, závislosti, nastavení git hooků, přítomnost vygenerovaných vstupů, stav co-op a načtení konfigurace .claude/. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-diagnose"
tooling_command = "skill-diagnose"
view_model = "generated/tooling-catalog.json"
+++

Zjistí, jestli má prostředí šanci fungovat: git a větev, worktree a souběžné session, Node, npm, Zola, závislosti, nastavení git hooků, přítomnost vygenerovaných vstupů, stav co-op a načtení konfigurace .claude/. Každé zjištění zařadí jako PASS, WARN nebo FAIL a přiloží konkrétní opravu. Sám neopravuje nic — diagnostikovat a opravit jsou dva různé úkony.

## Kdy ho spustit {#kdy}

Po naklonování repozitáře nebo založení worktree, a kdykoli něco nejde spustit nebo build padá na něčem, co nevypadá jako chyba v datech.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář, orchestrátor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Jmenuje se `diagnose`, a ne `doctor`, protože `/doctor` je vestavěný příkaz Claude Code a projektový skill toho jména by v interaktivní session nešlo spustit.
- Nejčastější skutečný nález je nový worktree: chybí v něm node_modules i vygenerované soubory a pre-commit na tom spadne dřív, než se stihne podivit. Pořadí opravy je `npm ci`, pak `npm run generate:all`.
- Chybějící Zola je FAIL jen částečný — datové validátory i generátory poběží, spadne až `zola build`. Hlásí se to takhle přesně, protože „build nefunguje“ by poslalo člověka hledat chybu jinam.
- Když všechno projde, výstup je jeden řádek. Diagnostika, která i při zdravém prostředí vypíše třicet řádků, se přestane číst.

