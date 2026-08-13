+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run build:rules-catalog — Generátor katalogu pravidel"
template = "tooling-command.html"
weight = 27
description = "Generátor katalogu pravidel: Vytáhne pravidla, která brány doopravdy vynucují, z hlaviček samotných validátorů a postaví z nich katalog a stránku /pravidla/. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/build-rules-catalog"
tooling_command = "build-rules-catalog"
view_model = "generated/tooling-catalog.json"
+++

Vytáhne pravidla, která brány doopravdy vynucují, z hlaviček samotných validátorů a postaví z nich katalog a stránku /pravidla/. Dokumentace tak nemůže popisovat pravidlo, které žádný modul nevlastní.

## Kdy ho spustit {#kdy}

V build i dev pipeline; ručně po změně hlavičky validátoru — jinak spadne verify:rules-catalog.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Popis pravidla se nikdy nepíše do stránky ručně; jediným zdrojem je hlavička modulu, který pravidlo vynucuje.
- Zápis je idempotentní: soubor se přepíše jen tehdy, když se obsah liší.

