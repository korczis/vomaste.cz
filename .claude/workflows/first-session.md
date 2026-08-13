---
title: První session v repozitáři
persona: reader
goal: Od naklonovaného repozitáře k prvnímu bezpečnému úkolu, bez vedení autora.
skills: diagnose bootstrap guide project-tour explain
---

## Pro koho

Kdokoli, kdo je tu poprvé. Nepředpokládá znalost Gitu, JSONu ani
struktury projektu.

## Předpoklady

Nainstalovaný Git, Node a Claude Code. Naklonovaný repozitář. Nic víc —
a když něco z toho chybí, zjistí to hned první krok.

## Kroky

1. **`/diagnose`** — má prostředí šanci fungovat? Nejčastější nález
   u čerstvého klonu je chybějící `node_modules` (`npm ci`) a chybějící
   vygenerované vstupy (`npm run generate:all`). Dokud tohle nesedí,
   nemá smysl pokračovat.
2. **`/bootstrap`** — přečte závazná pravidla v pořadí, zkontroluje
   souběžnou práci, určí roli a **personu**, a skončí třemi
   doporučenými kroky a jedním bezpečným úkolem.
3. **`/project-tour`** — jak to tady funguje. Šest vrstev od
   kanonických dat po bránu kvality, plus dvě netechnické nad nimi:
   rozsah pokrytí a devět publikačních bran.
4. **`/explain <cokoli>`** — na první věc, které nerozumíš. Typicky
   stav tvrzení nebo rozdíl mezi kanonickým a generovaným souborem.
5. **`/guide`** — až budeš chtít něco udělat a nebudeš vědět čím začít.

## Lidské checkpointy

- **Po kroku 2**: rozumíš tomu, co tvoje persona smí a nesmí? Zvlášť:
  žádná persona nerozšiřuje rozsah pokrytí osob.
- **Před první změnou**: víš, jestli editovaný soubor je kanonický,
  nebo generovaný? Když ne, zeptej se — je to nejčastější a nejhůř
  viditelná chyba tady.

## Co z toho vyleze

Funkční prostředí, zvolená persona, hrubá představa o architektuře
a jeden konkrétní bezpečný úkol.

## Jak poznat, že je hotovo

Umíš odpovědět na tři otázky: co tenhle projekt dělá, co v něm smíš
dělat ty, a co se stane, když uděláš změnu.

## Když se to pokazí

`/diagnose` hlásí FAIL a nevíš dál → to je odpověď, ne překážka;
oprava je v jeho výstupu. Cokoli jiného → `/guide`.
