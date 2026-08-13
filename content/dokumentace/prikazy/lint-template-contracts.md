+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run lint:template-contracts — Kontrakt komponent"
template = "tooling-command.html"
weight = 11
description = "Kontrakt komponent: Staticky kontroluje, že komponenta skutečně vypíše to, co jí volající předá. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/lint-template-contracts"
tooling_command = "lint-template-contracts"
view_model = "generated/tooling-catalog.json"
+++

Staticky kontroluje, že komponenta skutečně vypíše to, co jí volající předá. Hlídá tři tvary jedné chyby: filtr `safe` použitý na jméno, které komponenta nezná (vypíná kontrolu nedefinované proměnné, takže se stránka postaví prázdná), parametr deklarovaný a nikde nepřečtený, a podmínku ptající se na jiné pole objektu, než jaké tělo renderuje. Běží bez buildu, takže funguje i v čerstvém worktree, kde public/ ještě není.

## Kdy ho spustit {#kdy}

Po změně kterékoli komponenty nebo šablony. Je součástí build i check pipeline a pre-commit hooku, takže obvykle nemusíte spouštět ručně.

## Co shodí běh {#vynucuje}

- TC1 — filtr `safe` na jméně, které není deklarovaný parametr ani lokální proměnná; u `body` navíc jen tam, kde se komponenta nikde nevolá párově
- TC2 — parametr deklarovaný v hlavičce komponenty a nikde v těle nepřečtený
- TC3 — podmínka na `x.a`, jejíž tělo čte rozvětvenou verzi téhož pole (`x.aResolved`) a `x.a` ani jednou

## Co je potřeba vědět {#pozor}

- Vznikl reakcí na dvě živé chyby z 2026-08-13, které žádná ze 47 bran nezachytila: 98 stránek s prázdným tělem calloutu a 2728 stránek tisknoucích doslovné -1. Obojí se našlo auditem, ne branou — a obojí má společné, že build byl zelený a HTML validní.
- Kontroluje PŘÍČINU staticky, ne následek v public/. Najde konkrétní řádek konkrétní komponenty o dvě minuty dřív než jakákoli kontrola nad postaveným webem.
- TC1 rozhoduje o legitimitě `body` podle toho, jak se komponenta VOLÁ, ne jak je definovaná. V komponentě volané párově je v pořádku; v komponentě volané výhradně bez těla je vždycky prázdné.
- TC3 je heuristika laděná na pozorovaný tvar chyby, ne důkaz. Záměrně nehlásí podmínku na příznak s jiným obsahem — podmíněný atribut a příznak řídící obsah jsou legitimní vzory. První verze je hlásila a vyrobila 29 falešných poplachů na 31 nálezů; kontrola, která takhle křičí, se vypne a pak nehlídá nic.
- Nekontroluje generovaná data. Pole prázdné v JSON, které šablona čte přes filtr `default`, tahle brána nevidí — `default` reaguje jen na chybějící klíč, ne na prázdnou hodnotu, a to je datová vrstva.
- PAST PŘI PSANÍ ZÁZNAMU: próza katalogu se vypisuje do generované stránky, takže doslovná Tera syntaxe v ní shodí build té stránky. Vlastní záznam téhle brány to udělal hned napoprvé. Syntaxi popisuj slovy, ne ukázkou.

