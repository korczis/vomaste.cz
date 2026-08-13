---
title: Oprava chyby na webu
persona: developer
goal: Od nahlášeného projevu k opravené příčině, ověřené a projité branami.
skills: task diagnose ui-review a11y-review test build diff-explain commit
agents: repository-explorer ui-reviewer
---

## Pro koho

Vývojář. Technická chyba — rozbité zobrazení, mrtvý odkaz, nefunkční
prvek. **Ne** chyba v obsahu.

## Předpoklady

Konkrétní projev: co, kde, na čem. „Je to rozbité" není zadání.

## Kroky

1. **`/task <popis>`** — čeho se to dotkne. Zvlášť: je to opravdu
   šablona, nebo je to data?
2. **Reprodukuj.** Když to nejde reprodukovat, oprava je odhad.
3. **Najdi příčinu** — `repository-explorer`, když není jasné kde.
   Rozliš projev od příčiny: mrtvá kotva bývá důsledek přečíslování
   záznamu, ne chyba v šabloně.
4. **Oprav příčinu.** Když je příčina v datech, oprava patří do
   `data/`, ne do šablony.
5. **`/ui-review`**, u interaktivního prvku i **`/a11y-review`**.
6. **`/test changed`**, pak **`npm run build`**.
7. **`/diff-explain`**, **`/commit`**.

## Lidské checkpointy

- **Před krokem 4**: opravuješ příčinu, nebo přemalováváš projev?
- **Po kroku 5**: co se nepodařilo ověřit bez prohlížeče? Řekni to;
  netvrď, že to vypadá dobře, když jsi to neviděl.

## Co z toho vyleze

Opravená příčina, zelené brány, a vysvětlení pro toho, kdo to bude
posuzovat.

## Jak poznat, že je hotovo

Původní projev zmizel, `npm run build` je exit 0, a je jasné, proč to
bylo rozbité.

## Když se to pokazí

Oprava vyžaduje nové pole → to není oprava chyby, to je
`change-a-schema`.

Chyba je v generovaném souboru → generovaný soubor se neopravuje.
Oprav vstup a přegeneruj.
