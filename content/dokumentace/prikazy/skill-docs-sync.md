+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/docs-sync — Dopad změny na dokumentaci"
template = "tooling-command.html"
weight = 112
description = "Dopad změny na dokumentaci: Zjistí, kterou dokumentaci, lekci nebo referenci provedená změna zasáhla, a odděluje přitom generované soubory (ty se nepíšou, ty se generují) od těch k ručnímu projití. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-docs-sync"
tooling_command = "skill-docs-sync"
view_model = "generated/tooling-catalog.json"
+++

Zjistí, kterou dokumentaci, lekci nebo referenci provedená změna zasáhla, a odděluje přitom generované soubory (ty se nepíšou, ty se generují) od těch k ručnímu projití. Nese mapu dopadů pro stav tvrzení, schéma, npm příkaz, redakční pravidlo, autorizační model, architekturu, novou schopnost, UI doktrínu a Claude Code capability.

## Kdy ho spustit {#kdy}

Po změně, která se dotkla něčeho popsaného jinde, a před /quality — dokumentační drift je běžný nález.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, editor, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Zastaralá technická lekce je horší než žádná: čtenář podle ní pracuje a neví, že popisuje neplatný stav.
- Katalog příkazů se NEOPISUJE do lekcí ani do README. Odkazuje se na něj.
- Když se mění význam pojmu, mění se v content/koncepty. Ostatní místa ho jen aplikují.
- ADR a implementační reporty se nepřepisují. Historické rozhodnutí zůstává a doplní se odkaz na aktuální stav.

