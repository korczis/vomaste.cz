+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/coop-status — Stav souběžné práce"
template = "tooling-command.html"
weight = 136
description = "Stav souběžné práce: Vyloží výstup co-op sběrnice jako odpověď na otázku „můžu do toho jít“: kde jsi a jakou máš roli, které worktree jsou aktivní, které otevřené úkoly se týkají tvé práce, jestli je build-lock volný a jestli hrozí kolize na stejném dossieru nebo generovaném souboru.. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-coop-status"
tooling_command = "skill-coop-status"
view_model = "generated/tooling-catalog.json"
+++

Vyloží výstup co-op sběrnice jako odpověď na otázku „můžu do toho jít“: kde jsi a jakou máš roli, které worktree jsou aktivní, které otevřené úkoly se týkají tvé práce, jestli je build-lock volný a jestli hrozí kolize na stejném dossieru nebo generovaném souboru.

## Kdy ho spustit {#kdy}

Na začátku session, než sáhneš na sdílený nebo generovaný soubor, a když se objeví konflikt při rebase nebo mergi.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, editor, údržbář, orchestrátor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- docs/coop/TASKS.md edituje, merguje a pushuje jen ORCH. Worker hlásí přes sběrnici.
- Překryv se hlásí PŘED začátkem práce, ne až u konfliktu.
- Když kolize není, řekne se to jednou větou. Rozbor sedmi worktree, které se tě netýkají, se nečte.
- Golden snapshot, discovery log a reporty se rozcházejí nejčastěji.

