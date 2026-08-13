---
title: První technický příspěvek
persona: developer
goal: Od naklonovaného repozitáře k otevřenému pull requestu, který někdo může posoudit.
skills: diagnose bootstrap task test docs-sync quality diff-explain commit pr
---

## Pro koho

Vývojář, který v repozitáři ještě nepřispíval.

## Předpoklady

Prošlá cesta `first-session`, nebo aspoň zelený `/diagnose`.

## Kroky

1. **`/bootstrap developer`** — role, souběžná práce, tři doporučené
   kroky.
2. **Vlastní větev.** Ne `master` — tam commit rovnou nasazuje.
   Ve worktree na `task/T-###` je auto-push no-op.
3. **`/task <co chceš udělat>`** — persona, riziko, dotčené
   podsystémy, příkazy, které budou muset projít, jeden vstupní bod.
4. **Změna.** Malá. První příspěvek není místo na refaktor.
5. **`/test changed`** — nejmenší relevantní sada.
6. **`/docs-sync`** — zasáhla změna něco popsaného jinde?
7. **`/quality`** — souhrn a plná brána. **READY, nebo nic.**
8. **`/diff-explain`** — podklad pro popis PR.
9. **`/commit`**, **`/pr`**.

## Lidské checkpointy

- **Krok 2** je ten, který se přeskakuje a nejvíc bolí. Commit na
  `master` nasazuje během sekund; není pauza na rozmyšlenou.
- **Krok 7**: `/quality` nesmí říct READY bez exit 0. Když to řekne
  něco jiného, věř bráně.
- **Nečekaný soubor v diffu** (`.claude/settings.local.json`, `.env`,
  dočasný výstup) má přednost před zelenou bránou.

## Co z toho vyleze

Pull request s popisem, ze kterého recenzent pozná, co posuzuje a jak
to ověřit — včetně oddílů „na co se zaměřit" a „co jsem neudělal".

## Jak poznat, že je hotovo

PR je otevřený, brána byla zelená **před** jeho otevřením, a popis
nikoho nenutí číst celý diff, aby pochopil, o co jde.

## Když se to pokazí

Build padá na něčem, co jsi neměnil → nejspíš chybí vygenerované vstupy
(`npm run generate:all`), zvlášť v novém worktree. `/diagnose` to pozná.

Diff má 40 generovaných souborů → v pořádku, pokud odpovídají změně
dat. Vysvětli to v popisu, ať se recenzent nezdrží.
