---
name: coop-status
description: Vysvětlí aktuální stav souběžné práce v repozitáři — kdo na čem pracuje, které worktree existují, jestli je build-lock volný a jestli tvoje zamýšlená práce nekoliduje s cizí. Použij ho na začátku session, před sáhnutím na sdílený soubor, nebo když někdo řekne „pracuje na tom někdo", „proč mi to hlásí konflikt".
argument-hint: "[co se chystáš dělat]"
---

Stav souběžné práce, srozumitelně. **Read-only.**

Rozdíl proti `scripts/coop/coop.sh status`: ten vypíše data. Tenhle
skill z nich udělá odpověď na otázku „můžu do toho jít".

## Kdy ho použít

- Na začátku session (SessionStart hook výpis vypíše, ale nevyloží).
- Než sáhneš na soubor, který je sdílený nebo generovaný.
- Když se objeví konflikt při rebase nebo mergi.

## Kdy ho NEPOUŽÍT

- **Když pracuješ sám** a žádný jiný worktree neexistuje.
- **K řešení konfliktu.** Recept na konflikty generovaných souborů je
  v `docs/coop/PROTOCOL.md`.

## Co načíst

```bash
scripts/coop/coop.sh status
git worktree list
git status --short --branch
```

## Jak to vyložit

### Role

| Kde jsi | Role | Co to znamená |
|---|---|---|
| hlavní checkout na `master` | **ORCH** | jediný, kdo edituje `docs/coop/TASKS.md`, merguje a pushuje. Commit = deploy |
| worktree `T-###` na `task/T-###` | **worker** | jeden úkol, merge se žádá, auto-push je no-op |
| hlavní checkout na jiné větvi | nestandardní | ostatní instance očekávají, že hlavní checkout je na `master` |

### Kolize

Projdi otevřené úkoly a aktivní worktree a zeptej se konkrétně:

- Dotýká se moje práce **stejného dossieru**?
- Dotýká se **stejného generovaného souboru**? (Golden snapshot,
  discovery log a reporty se rozcházejí nejčastěji.)
- Chystám se na `docs/coop/TASKS.md`, a nejsem ORCH?

Překryv se hlásí na sběrnici **před** začátkem práce, ne až u konfliktu.

### Build-lock

Obsazený lock znamená, že jiná instance staví. Souběžný build není
zakázaný, ale bude pomalý a může se prát o generované soubory.

## Výstup

```
KDE JSI:     <cesta> na větvi <název>
ROLE:        ORCH | worker T-### | nestandardní (<co s tím>)
AKTIVNÍ:     <n> worktree — <seznam s větvemi>
OTEVŘENÉ ÚKOLY: <ty, které se týkají toho, co chceš dělat>
BUILD-LOCK:  volný | obsazený (<kdo>)
KOLIZE:      žádná | <konkrétně s čím>
NEŽ ZAČNEŠ:  <co ohlásit nebo počkat>
```

Když je odpověď „žádná kolize", řekni to jednou větou. Rozbor
sedmi worktree, které se tě netýkají, se nečte.

## Co skill NEUDĚLÁ

- Nezmění `docs/coop/TASKS.md` — to smí jen ORCH.
- Neuvolní cizí build-lock.
- Nemerguje ani nepushuje.

## Příklady

**Základní.** Sám v hlavním checkoutu na `master`, žádný jiný worktree
→ „Jsi ORCH, nikdo jiný nepracuje, jdi do toho. Pozor: commit na
`master` nasazuje."

**Realistický.** Sedm worktree, chystáš se na dossier, na kterém pracuje
jiný úkol. Výstup musí říct **konkrétně**, který úkol a čeho se dotýká,
a doporučit ohlášení na sběrnici před začátkem — ne obecné „pozor na
konflikty".

**Selhání.** Jsi worker a chceš upravit `docs/coop/TASKS.md`. Skill to
odmítne vysvětlením single-writer pravidla a nabídne správnou cestu:
hlášení přes `coop.sh send`.

## Související

`/bootstrap` (volba role při startu), `/commit` (co commit dělá podle
role), `docs/coop/PROTOCOL.md` (protokol a recepty na konflikty).
