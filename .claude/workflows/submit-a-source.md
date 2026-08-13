---
title: Podání zdroje nebo opravy
persona: source-contributor
goal: Předat ověřený zdroj tak, aby ho někdo mohl posoudit a zapsat — bez znalosti datového modelu.
skills: verify-source source-family evidence-packet authorization-check
agents: source-verifier
---

## Pro koho

Kdokoli, kdo umí najít a přečíst zdroj. **Nepotřebuje** umět JSON, Git
ani strukturu repozitáře.

## Předpoklady

Konkrétní zdroj s URL, kterou jde otevřít. Výsledek vyhledávání
nestačí — to je kandidát, ne zdroj.

## Kroky

1. **`/verify-source <URL>`** — co doopravdy dokládá a co ne. Tohle je
   ta část, kterou nikdo jiný neudělá líp než ten, kdo zdroj přinesl.
2. **`/source-family`**, když máš zdrojů víc — kolik hlasů to je.
3. **`/authorization-check <subjekt>`** — spadá téma vůbec do rozsahu,
   který web smí pokrývat? Když ne, dál se nepokračuje a je to
   v pořádku.
4. **`/evidence-packet`** — sedm otázek, na konci strukturovaný
   podklad. Pole „co tomu odporuje" je povinné: rozpor mezi zdroji se
   dokumentuje, ne zprůměruje, a bývá to nejcennější část.
5. Předej balíček k posouzení.

## Lidské checkpointy

- **Před krokem 4**: rozumíš tomu, že balíček **nic nepublikuje**? Mezi
  ním a webem stojí kontrola rozsahu, redakční posouzení, zápis, build
  a review diffu.
- **Chybějící údaj se nedoplňuje odhadem.** Prázdné pole s poznámkou je
  poctivější než vymyšlené datum.

## Co z toho vyleze

Markdown balíček: tvrzení, zdroje s doslovnými pasážemi, počet
nezávislých hlasů, rozpory, otevřené otázky, jmenované třetí osoby.

## Jak poznat, že je hotovo

Někdo jiný by z balíčku dokázal záznam zapsat, aniž by musel zdroje
otevírat znovu.

## Když se to pokazí

Zdroj je komentář nebo satira → nepoužívá se jako doklad faktu, ani
„opatrně". Tenhle repozitář už jednou kvůli tomu vyřadil celé téma.

Materiál je neveřejný (soukromá konverzace, screenshot) → balíček
nevzniká vůbec. Do repozitáře takový materiál nesmí ani jako podklad.
