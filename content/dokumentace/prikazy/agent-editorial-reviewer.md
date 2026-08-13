+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "agent editorial-reviewer — Redakční recenzent"
template = "tooling-command.html"
weight = 153
description = "Redakční recenzent: Posoudí dossier jako celek a najde to, co z jednoho záznamu vidět není: nekonzistentní procesní rámování napříč zmínkami, tichou eskalaci tónu bez nových zdrojů, chybějící reakce subjektu, třetí osoby čtoucí se jako subjekty, koncentraci zdrojů u jednoho vydavatele a shrnutí říkající víc než záznamy pod ním.. Claude subagent, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/agent-editorial-reviewer"
tooling_command = "agent-editorial-reviewer"
view_model = "generated/tooling-catalog.json"
+++

Posoudí dossier jako celek a najde to, co z jednoho záznamu vidět není: nekonzistentní procesní rámování napříč zmínkami, tichou eskalaci tónu bez nových zdrojů, chybějící reakce subjektu, třetí osoby čtoucí se jako subjekty, koncentraci zdrojů u jednoho vydavatele a shrnutí říkající víc než záznamy pod ním.

## Kdy ho spustit {#kdy}

Před merge obsahové změny a při periodické revizi dossieru.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nástroje: Read, Grep, Glob. Přednačtený skill: editorial-review. Žádný Write ani Edit.
- Řádek CELKOVÝ TÓN je povinný a nesmí být „v pořádku“ bez odůvodnění — je to jediné místo, kde se dossier posuzuje jako text.
- Nerozhoduje o publikaci; to je lidský checkpoint. Nenahrazuje npm run build.
- Netvrdí, že je něco pravda ani lež. Posuzuje, jestli text odpovídá tomu, co zdroje unesou.

