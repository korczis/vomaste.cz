+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run sources:detect-family — Detektor zdrojových rodin"
template = "tooling-command.html"
weight = 87
description = "Detektor zdrojových rodin: Opakovatelná náhrada ručního čtení podpisů: stáhne stránku zdroje a hledá doslovný kredit původu ve třech ukotvených oblastech — strojová metadata, podpisový element, patička „Zdroj: …“. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/sources-detect-family"
tooling_command = "sources-detect-family"
view_model = "generated/tooling-catalog.json"
+++

Opakovatelná náhrada ručního čtení podpisů: stáhne stránku zdroje a hledá doslovný kredit původu ve třech ukotvených oblastech — strojová metadata, podpisový element, patička „Zdroj: …“. Evidence se vždy ukládá jako doslovný úryvek, který rozhodl.

## Kdy ho spustit {#kdy}

Po přidání zdrojů, když je potřeba vědět, jestli nejde o převzatou agenturní zprávu. `--dossier=`/`--limit=`/`--rate=`/`--timeout=`/`--json`/`--no-cache`; zápis až samostatným `--apply <proposals.json>`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Hádání je zakázáno: rodina se nikdy neodvozuje z outletu, z domény ani z podobnosti titulků. Zmínka „řekl ČTK“ uprostřed textu verdikt ovlivnit NESMÍ, proto se tělo článku neprohledává.
- NEDOKLÁDÁ obsahovou totožnost dvou článků — rodina „ctk“ říká „původ je agenturní zpráva“, ne „tyhle články jsou identické“.
- Stránka za paywallem, 403 nebo bez podpisu končí verdiktem `unknown`. To NENÍ „vlastní zpravodajství“, je to přiznané „nezjištěno“ a rodina se nevyplní.
- Detekce a zápis jsou dva vědomě oddělené kroky. `--apply` zapisuje jen verdikt `ctk` a jen tam, kde je pole prázdné — nikdy nepřepisuje ani nemaže; ostatní verdikty patří člověku.
- Proč to existuje: ruční revize prokázala, že problém není teoretický — 55 tvrzení muselo spadnout ze stavu „doloženo dvěma nezávislými“ na jeden zdroj.

