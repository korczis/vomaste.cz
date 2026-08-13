+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/schema-change — Změna datového kontraktu"
template = "tooling-command.html"
weight = 144
description = "Změna datového kontraktu: Provede změnu kanonického schématu se všemi třinácti místy, která z ní plynou: schéma, existující data, view modely, šablony, exporty, JSON-LD kontext, validátory, testy, golden snapshot, migrace, datový kontrakt, vzdělávací vrstva a SEO konfigurace. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-schema-change"
tooling_command = "skill-schema-change"
view_model = "generated/tooling-catalog.json"
+++

Provede změnu kanonického schématu se všemi třinácti místy, která z ní plynou: schéma, existující data, view modely, šablony, exporty, JSON-LD kontext, validátory, testy, golden snapshot, migrace, datový kontrakt, vzdělávací vrstva a SEO konfigurace. U každého řádku vyžaduje buď „hotovo“, nebo explicitní „netýká se, protože“.

## Kdy ho spustit {#kdy}

Při přidání, přejmenování nebo odebrání pole v typu záznamu, a při změně enumu, povinnosti nebo formátu.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, údržbář
- **Riziko:** údržbář
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Poloviční implementace pole je selhání, ne rozpracovanost — a brána ho nemusí odhalit v obou směrech.
- Nejpodceňovanější kroky jsou existující data a migrace. Povinné pole bez migrace shodí build na každém existujícím záznamu, což je správně, ale musí to být plán, ne překvapení.
- Nejlevnější pole je to, které nevzniklo. Hloubka v grafu se počítá, ne ukládá — a to je vzor, ne výjimka.
- Skóre důvěryhodnosti jako pole skill odmítá: hodnotilo by pravdu, ne doloženost, a truth-rating značky verify:jsonld zakazuje.

