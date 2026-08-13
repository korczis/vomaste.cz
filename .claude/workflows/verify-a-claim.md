---
title: Ověření existujícího tvrzení
persona: verifier
goal: Zjistit, jestli konkrétní tvrzení na webu sedí se zdroji, které cituje.
skills: review-claim verify-source source-family review-gap
agents: claim-reviewer source-verifier
---

## Pro koho

Ověřovatel. Nic nemění — výstupem je zjištění.

## Předpoklady

Konkrétní tvrzení (`CLM-##`) nebo stránka, na které je. Nic víc.

## Kroky

1. **`/review-claim CLM-##`** — dvanáct kontrol proti zdrojům. Když je
   tvrzení víc než dvě, deleguj `claim-reviewer`: přečte je u sebe
   a vrátí nálezy místo padesáti souborů.
2. **`/verify-source`** na každý citovaný zdroj — otevři ho. Rubrika se
   hledá na stránce, ne v URL; komentář a satira vypadají ve výsledku
   vyhledávání jako zpravodajství.
3. **`/source-family`**, když je zdrojů víc — kolik je to **hlasů**, ne
   odkazů. Tři přetisky jedné agenturní zprávy jsou jeden.
4. **`/review-gap`** na navázané mezery — nejsou napsané tak, že místo
   otevřené otázky nechávají stín?
5. Sepiš, co drží a co ne.

## Lidské checkpointy

- **Sporná nezávislost.** Když nejde z textu rozhodnout, jestli jsou
  dva zdroje nezávislé, důsledek je jeden hlas a rozhodnutí patří
  člověku. Předstíraná jistota vyrábí falešné CORROBORATED.
- **Nález typu BLOCKER.** Nedoložené tvrzení o člověku, chybějící
  procesní rámování nebo jmenovaná třetí osoba se neřeší tichou
  opravou — jde to na review.

## Co z toho vyleze

Seznam nálezů s prioritou a výčet toho, co bylo prověřeno a drží.
Ne oprava.

## Jak poznat, že je hotovo

Každý citovaný zdroj byl **otevřen**, a u každého je jasné, co dokládá
a co ne.

## Když se to pokazí

Zdroj nejde otevřít (403, paywall, 404) → to je nález, ne slepá ulička.
Zaznamenej to a hledej archiv nebo primární registr.

Našel jsi chybu → `fix-a-published-error`.
