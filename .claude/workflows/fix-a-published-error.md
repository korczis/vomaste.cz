---
title: Oprava chyby v publikovaném obsahu
persona: editor
goal: Od nahlášení k ověřené, doložené a validované opravě — nebo k odůvodněnému odmítnutí.
skills: correction verify-source review-claim build commit
---

## Pro koho

Editor nebo přispěvatel, kterému někdo nahlásil chybu.

## Předpoklady

Nahlášení. **Doklad není předpoklad** — jeho zajištění je krok 2, a
když se nezajistí, oprava se neprovádí.

## Kroky

1. **`/correction`** — urči **typ** opravy. Faktická oprava, chybějící
   procesní rámování, metadata, mrtvý odkaz, stav tvrzení, formulace,
   překlep. Nároky se liší zásadně.
2. **Ověř sám.** `/verify-source` na dotčené zdroje, i na ty, které tam
   už jsou. Chyba často vznikla tím, že se zdroj změnil.
3. **Zjisti dosah.** Chyba je málokdy na jednom místě: ostatní zmínky
   téhož faktu, tabulka tvrzení, časová osa, vazby, jiné dossiery se
   sdílenou entitou.
4. **Oprav v `data/dossiers/**`.** Nikdy v `content/`.
5. **Zaznamenej stopu** — u podstatné změny záznam v `updates/`.
6. **`/review-claim`** na opravené tvrzení.
7. **`npm run build`**, pak `/commit`.

## Lidské checkpointy

- **Změna významu nebo stavu** rozhoduje člověk. Automaticky se
  dokončí jen překlep a formát.
- **Oprava, která tvrzení zostřuje**, má stejnou důkazní laťku jako
  nové tvrzení — protože to nové tvrzení je.
- **Odmítnutí je legitimní výsledek.** Když hlásící nemá pravdu, napiš
  proč, s odkazem na konkrétní pasáž.

## Co z toho vyleze

Buď opravený a validovaný záznam se stopou, nebo odůvodněné odmítnutí.
Obojí je hotová práce.

## Jak poznat, že je hotovo

Všechna místa z kroku 3 jsou opravená, `npm run build` je zelený,
a je dohledatelné, co se změnilo a proč.

## Když se to pokazí

Nahlášení nemá doklad („vím to") → oprava nezačíná, ale nahlášení se
nezahazuje. Zaznamenej ho a vysvětli, co by bylo potřeba.

Někdo chce záznam smazat, protože je nepohodlný → to není oprava.
