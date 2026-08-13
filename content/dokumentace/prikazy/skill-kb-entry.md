+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/kb-entry — Referenční záznam"
template = "tooling-command.html"
weight = 141
description = "Referenční záznam: Vytvoří nebo aktualizuje referenční záznam na správném místě: kanonický koncept, stránku příručky, záznam v katalogu zdrojů nebo path-scoped pravidlo. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-kb-entry"
tooling_command = "skill-kb-entry"
view_model = "generated/tooling-catalog.json"
+++

Vytvoří nebo aktualizuje referenční záznam na správném místě: kanonický koncept, stránku příručky, záznam v katalogu zdrojů nebo path-scoped pravidlo. Nejdůležitější rozhodnutí není co napsat, ale kam to patří — špatné umístění je horší než chybějící záznam, protože vyrobí druhou definici, která se rozejde s první.

## Kdy ho spustit {#kdy}

Když se v projektu používá pojem, který nikde není definovaný, když se někdo potřetí ptá na totéž, nebo když rešerše narazila na past v registru.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** rešeršista, editor, vývojář, údržbář
- **Riziko:** vyžaduje review
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nejčastější chyba je založit něco, co už existuje. Nejdřív se hledá.
- Katalog zdrojů jsou DATA — docs/osint/SOURCE_CATALOG.md a /zdroje/ se generují a needitují ručně.
- Nová past v registru patří do katalogu, ne do commit zprávy, kde ji najde jen ten, kdo ví, že ji má hledat.
- Postup o víc krocích není referenční záznam, je to skill. Odpověď je odkaz, ne kopie.

