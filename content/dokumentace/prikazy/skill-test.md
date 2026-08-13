+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/test — Cílené spuštění testů"
template = "tooling-command.html"
weight = 119
description = "Cílené spuštění testů: Zjistí, co se změnilo, vybere nejmenší testovou sadu, která to pokryje, a při selhání vysvětlí příčinu místo symptomu — co test čekal, co dostal a jestli je správně kód, nebo očekávání. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-test"
tooling_command = "skill-test"
view_model = "generated/tooling-catalog.json"
+++

Zjistí, co se změnilo, vybere nejmenší testovou sadu, která to pokryje, a při selhání vysvětlí příčinu místo symptomu — co test čekal, co dostal a jestli je správně kód, nebo očekávání. U golden snapshotu vyžaduje podívat se, CO se změnilo, dřív než se přegeneruje.

## Kdy ho spustit {#kdy}

Během práce po změně skriptu, validátoru nebo dat. Před /quality, aby se zjevné vyřešilo dřív.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Zelené testy nejsou hotovo. Testy pokrývají skripty; npm run build kontroluje postavený web, a rozdíl mezi tím není chyba ani jednoho.
- Test upravený tak, aby prošel, bez vysvětlení proč, je způsob, jak se ztratí záruka.
- E2E (Playwright) není součástí buildu a spouští se cíleně.

