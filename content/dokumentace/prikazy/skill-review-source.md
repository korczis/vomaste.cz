+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/review-source — Review zdrojového záznamu"
template = "tooling-command.html"
weight = 121
description = "Review zdrojového záznamu: Zkontroluje devíti kontrolami existující SRC záznam: živost odkazu, změnu textu u vydavatele, metadata proti stránce, typ zdroje, zdrojovou rodinu podle původu, povinnou redakční poznámku (T7), obousměrné vazby (R8), skutečnou podporu každého tvrzení, u kterého je uvedený, a existenci lokálně hostovaného dokumentu.. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-review-source"
tooling_command = "skill-review-source"
view_model = "generated/tooling-catalog.json"
+++

Zkontroluje devíti kontrolami existující SRC záznam: živost odkazu, změnu textu u vydavatele, metadata proti stránce, typ zdroje, zdrojovou rodinu podle původu, povinnou redakční poznámku (T7), obousměrné vazby (R8), skutečnou podporu každého tvrzení, u kterého je uvedený, a existenci lokálně hostovaného dokumentu.

## Kdy ho spustit {#kdy}

Při revizi dossieru, po nahlášení mrtvého odkazu, po redakční opravě u vydavatele, a při přidávání tvrzení k existujícímu zdroji.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Mrtvý odkaz NENÍ důvod zdroj smazat — tvrzení by tím ztratilo doložení, aniž by se cokoli zjistilo. Hledá se archiv nebo primární registr.
- Nejčastěji přeskakovaná kontrola je osmá: zdroj se přidá k tvrzení, protože je „o tom samém“, ale konkrétní fakt v něm není.
- Zdroj se otevírá ZNOVU. Text u vydavatele se mění a doplněná oprava redakce je běžný nález.

