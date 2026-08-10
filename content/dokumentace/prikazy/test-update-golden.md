+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run test:update-golden — Přegenerování golden snapshotu"
template = "tooling-command.html"
weight = 104
description = "Přegenerování golden snapshotu: Jediný podporovaný způsob, jak změnit golden počty: přegeneruje scripts/data/compiled-golden.snapshot.json z aktuálního compiled modelu.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/test-update-golden"
tooling_command = "test-update-golden"
view_model = "generated/tooling-catalog.json"
+++

Jediný podporovaný způsob, jak změnit golden počty: přegeneruje scripts/data/compiled-golden.snapshot.json z aktuálního compiled modelu.

## Kdy ho spustit {#kdy}

Když golden test hlásí jiná čísla proto, že se legitimně změnila data — a po konfliktu na snapshotu při rebase.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Golden počty nikdy needituj ručně — ani v .mjs testu, ani v JSON souboru.
- Řešení konfliktu: `git checkout --theirs scripts/data/compiled-golden.snapshot.json` (nebo ours, nezáleží), pak tenhle příkaz a `git add`.

