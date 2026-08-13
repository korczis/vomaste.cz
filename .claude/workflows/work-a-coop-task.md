---
title: Práce na co-op úkolu
persona: orchestrator
goal: Odpracovat úkol z boardu ve worktree tak, aby se nesrazil s ostatními instancemi.
skills: coop-status bootstrap task quality commit pr
---

## Pro koho

Instance pracující v repozitáři, kde běží souběžná práce. Platí
`docs/coop/PROTOCOL.md`.

## Předpoklady

Konkrétní úkol `T-###` z boardu.

## Kroky

1. **`/coop-status`** — kdo pracuje na čem, je build-lock volný,
   nekoliduje tvůj úkol s cizím?
2. **Worktree a větev.** `~/dev/vomaste-worktrees/T-###` na
   `task/T-###`. Jeden úkol, jedna instance, jedna větev.
3. **Prerekvizity ve worktree.** Nový worktree nemá `node_modules` ani
   vygenerované vstupy: `npm ci`, `npm run generate:all`. Bez toho
   spadne pre-commit dřív, než se stihne podivit.
4. **`/bootstrap T-###`**, **`/task`** — role a rozsah.
5. **Práce.** Překryv s cizím rozsahem se hlásí na sběrnici **před**
   začátkem, ne až u konfliktu.
6. **`/quality`** — merge se žádá jen s čistým `npm run build`.
7. **`/commit`**, pak **merge-request** na sběrnici. **Nemerguj sám.**

## Lidské checkpointy

- **`docs/coop/TASKS.md` edituje jen ORCH.** Worker hlásí přes
  sběrnici. Single-writer pravidlo je stejné jako u dat.
- **Merge a push dělá ORCH.** Push na `master` je deploy.
- **Konflikt v generovaném souboru** (golden snapshot, discovery log,
  reporty) není chyba — je to důsledek souběžnosti. Recept je
  v protokolu, ne v hlavě.

## Co z toho vyleze

Hotová větev `task/T-###` se zeleným buildem a merge-request na
sběrnici.

## Jak poznat, že je hotovo

Build ve worktree je exit 0 a ORCH má vše, co potřebuje k mergi.

## Když se to pokazí

Rebase konfliktuje na generovaných souborech → protokol, sekce
„Automatický push po commitu a mergi".

Někdo jiný sáhl na stejný dossier → sběrnice, ne tichý souboj commitů.
