+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "workflow first-session — První session v repozitáři"
template = "tooling-command.html"
weight = 158
description = "První session v repozitáři: Cesta od naklonovaného repozitáře k prvnímu bezpečnému úkolu bez vedení autora: diagnostika prostředí, nastartování session s volbou persony, prohlídka architektury, vysvětlení první nesrozumitelné věci a rozcestník pro další krok.. Claude workflow, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/workflow-first-session"
tooling_command = "workflow-first-session"
view_model = "generated/tooling-catalog.json"
+++

Cesta od naklonovaného repozitáře k prvnímu bezpečnému úkolu bez vedení autora: diagnostika prostředí, nastartování session s volbou persony, prohlídka architektury, vysvětlení první nesrozumitelné věci a rozcestník pro další krok.

## Kdy ho spustit {#kdy}

Když je někdo v repozitáři poprvé. Nepředpokládá znalost Gitu, JSONu ani struktury projektu.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář, orchestrátor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Lidský checkpoint před první změnou: víš, jestli je editovaný soubor kanonický, nebo generovaný? Když ne, zeptej se — je to nejčastější a nejhůř viditelná chyba tady.
- Dokud /diagnose nesedí, nemá smysl pokračovat. U čerstvého klonu chybí node_modules a vygenerované vstupy.

