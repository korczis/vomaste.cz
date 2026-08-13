+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/build — Kanonická brána kvality"
template = "tooling-command.html"
weight = 109
description = "Kanonická brána kvality: Spustí npm run build a vyloží výsledek strukturovaně: který krok padl, co ta hláška znamená a co s ní. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-build"
tooling_command = "skill-build"
view_model = "generated/tooling-catalog.json"
+++

Spustí npm run build a vyloží výsledek strukturovaně: který krok padl, co ta hláška znamená a co s ní. Nese tabulku typických selhání — od chyby v datech přes ruční editaci generované stránky až po chybějící záznam v katalogu toolingu — a rozlišuje je od stavu čerstvého worktree, kde vygenerované vstupy prostě nikdy nevznikly.

## Kdy ho spustit {#kdy}

Než se cokoli ohlásí jako hotové, před merge a před review-requestem. Ne během rychlé iterace — trvá minuty.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** editor, vývojář, recenzent, údržbář, orchestrátor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- disable-model-invocation: true. Trvá minuty a v hlavním checkoutu na master navazuje na auto-push; spouští ho člověk.
- Čte se PRVNÍ selhání, ne poslední. Kroky na sebe navazují a pozdější chyby bývají následek.
- Nikdy nehlásit hotovo bez exit 0, ani „prošlo to skoro celé“.
- Build patří PŘED commit: na master hook po commitu pushuje a nasazuje.

