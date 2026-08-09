+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run hooks:install — Instalace git hooků"
template = "tooling-command.html"
weight = 96
description = "Instalace git hooků: Nasměruje git hooky tohohle checkoutu na .githooks/, aby se rychlé pre-commit validátory spouštěly samy.. npm skript, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/hooks-install"
tooling_command = "hooks-install"
view_model = "generated/tooling-catalog.json"
+++

Nasměruje git hooky tohohle checkoutu na .githooks/, aby se rychlé pre-commit validátory spouštěly samy.

## Kdy ho spustit {#kdy}

Běží automaticky jako `postinstall` při `npm ci` / `npm install`. Ručně, když `git config core.hooksPath` neukazuje na .githooks.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Best-effort a tiché při selhání: nikdy nesmí rozbít `npm ci` (běží i v CI, v zahazovaném checkoutu, který nikdy necommituje) ani zablokovat někoho bez gitu.
- Fork dostane hooky zadarmo, bez zvláštního kroku — to je požadavek invariantu forkovatelnosti v konstituci.

