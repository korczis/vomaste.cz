---
title: Redakční review dossieru
persona: editor
goal: Posoudit dossier nebo balík obsahových změn dřív, než se cokoli publikuje.
skills: editorial-review review-claim review-source review-gap build
agents: editorial-reviewer claim-reviewer
---

## Pro koho

Editor nebo recenzent před merge.

## Předpoklady

Dossier nebo sada změn. Zelený `npm run build` **není** předpoklad —
mechanické brány a redakční review jsou dvě různé věci a dělají se
souběžně.

## Kroky

1. **`/editorial-review <slug|changed>`** — deset kontrol viditelných
   až v celku. Deleguj `editorial-reviewer`, když je dossier větší než
   pár záznamů.
2. Atomické kontroly u toho, co review označilo: **`/review-claim`**,
   **`/review-source`**, **`/review-gap`**.
3. **`npm run build`** — mechanické brány. Parita tabulky, reference,
   JSON-LD, kotvy.
4. Sepiš nálezy s prioritou. Slučuj: dvacetkrát stejná chyba je jeden
   nález s dvaceti výskyty.

## Lidské checkpointy

- **BLOCKER se nepublikuje.** Bez výjimky.
- **HIGH je rozhodnutí člověka** — ale vědomé, ne přehlédnuté.
- **Celkový tón** je povinný závěr: je dossier v celku přesnější, nebo
  ostřejší, než jeho zdroje? Nejčastější reálný nález celého projektu
  je shrnutí, které říká víc než záznamy pod ním.

## Co z toho vyleze

Nálezy s prioritou, výčet toho, co drží, a doporučení: publikovat,
opravit a znovu, nebo rozhodnutí u HIGH.

## Jak poznat, že je hotovo

Žádný BLOCKER, každý HIGH má vědomé rozhodnutí, a `npm run build`
skončil exit 0.

## Když se to pokazí

Nálezů je hodně a jsou stejné → je to jedna systémová chyba. Oprav
příčinu, ne dvacet výskytů.

Review se přetahuje s autorem o formulace → nálezy jsou o tom, co
zdroje unesou, ne o slohu. Když se to nedá rozhodnout ze zdrojů, je to
LOW, ne HIGH.
