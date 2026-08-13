---
name: kb-entry
description: Vytvoří nebo aktualizuje referenční záznam — kanonický koncept, stránku příručky nebo záznam v katalogu zdrojů — na správném místě a bez duplikace existující definice. Použij ho, když je potřeba někam zapsat, co pojem znamená, jak se něco dělá, nebo na jakou past se u zdroje najelo.
argument-hint: "<pojem nebo téma> [koncept | prirucka | zdroj]"
---

Zápis do referenční vrstvy. **Riziko: review-required.**

Nejdůležitější rozhodnutí je **kam to patří** — ne co napsat.

## Kdy ho použít

- Vznikl pojem, který se v projektu používá a není nikde definovaný.
- Někdo se potřetí ptá na totéž.
- Při rešerši se narazilo na past v registru, kterou nikdo nezapsal.

## Kdy ho NEPOUŽÍT

- **Když už to někde je.** Nejčastější chyba. Nejdřív hledej.
- **Na postup o víc krocích.** To je skill, ne referenční záznam.
- **Na výuku.** Referenční záznam odpovídá na otázku; lekce učí. Na
  lekci je `/academy-lesson`.

## Kam co patří

| Co to je | Kam | Poznámka |
|---|---|---|
| **definice pojmu** | `content/koncepty/<slug>.md` | **kanonické znění.** Vše ostatní na něj odkazuje |
| **jak se něco dělá** | `content/prirucka/<slug>.md` | lookup, ne výklad |
| **co který registr unese** | `data/source-catalog/<id>.json` | stránky a markdown se **generují** |
| **pravidlo pro část stromu** | `.claude/rules/<téma>.md` | path-scoped |
| **fakt platný vždy** | `CLAUDE.md` | jen když opravdu platí vždy |
| **rozhodnutí a jeho důvod** | `docs/adr/` | přes `/adr` |

Špatné umístění je horší než chybějící záznam: vznikne druhá definice,
která se rozejde s první.

## Kanonický koncept

Koncept je **jediné** místo, kde se pojem definuje. Musí mít, co
potřebuje jeho dlaždice na rozcestníku (`extra.tile_title`,
`tile_summary`, `bullets`, plus `code` / `badge_*` / `icon` podle
skupiny) — `npm run validate:concepts` shodí build, když pole chybí,
skupina je neznámá nebo je prázdná.

Definice má být **použitelná**, ne akademická: co to je, k čemu to
v tomhle projektu slouží, a kde se to plete.

## Záznam v katalogu zdrojů

Tenhle typ je jiný: **záznamy jsou data, výstupy se generují.**
`docs/osint/SOURCE_CATALOG.md` a `/zdroje/` se needitují ručně.

Záznam odpovídá na to, co se nedá odvodit a co někdo musel zjistit,
obvykle nepříjemně:

```
proves        — co z odpovědi lze citovat
doesNotProve  — co se z ní běžně vyvozuje a neplyne
traps         — na co se najelo
howToSearch   — jak se ptát, aby zdroj odpověděl
```

Po zápisu: `npm run build:source-catalog`, kontrola driftu
`npm run verify:source-catalog`.

## Postup

1. **Hledej, jestli to už není.** `grep` napříč `content/koncepty/`,
   `content/prirucka/`, `data/source-catalog/`, `.claude/rules/`.
2. **Rozhodni umístění** podle tabulky.
3. **Napiš to, co se nedá odvodit.** Co jde vyčíst ze schématu nebo
   z kódu, patří odkazem, ne opisem.
4. **Propoj obousměrně** — z lekcí a příručky na koncept, z konceptu
   na související.
5. **Ověř**: `npm run validate:concepts`, `npm run validate:learning`,
   `npm run verify:source-catalog`, pak `npm run build`.

## Výstup

```
ZÁZNAM:      <pojem nebo téma>
UMÍSTĚNÍ:    <cesta> — <proč sem a ne jinam>
UŽ EXISTUJE: ne | ano (<kde> — pak se rozšiřuje, ne zakládá)
OBSAH:       <co záznam říká, ve zkratce>
ODKAZY SEM:  <odkud se na něj dá dostat>
GENEROVANÉ:  <co se přegeneruje>
VALIDACE:    <příkazy a výsledky>
```

## Co skill NEUDĚLÁ

- Nezaloží druhou definici existujícího pojmu.
- Neupraví generovaný výstup katalogu ručně.
- Nenapíše referenční záznam o postupu, který se má stát skillem.

## Příklady

**Základní.** Pojem „zdrojová rodina" — hledání ukáže, že koncept už
existuje. Skill nezakládá nový, ale doplní do stávajícího past, která
chyběla, a přidá odkaz z příručky.

**Realistický.** Rešerše zjistila, že vyhledávání ve věstníku zakázek
tiše ignoruje filtr a vrací nefiltrovanou stránku. Patří to do
`data/source-catalog/` jako `trap`, ne do commit zprávy, kde to najde
jen ten, kdo ví, že to má hledat. Po zápisu se katalog přegeneruje.

**Selhání.** Návrh napsat do příručky stránku „jak ověřit zdroj" se
sedmi kroky. To není referenční záznam, to je postup — a už existuje
jako `/verify-source`. Správná odpověď je odkaz, ne kopie.

## Související

`/academy-lesson` (výuka), `/docs-sync` (co ještě projít),
`/adr` (rozhodnutí), `.claude/rules/documentation.md`.
