---
name: quality
description: Souhrn před odesláním příspěvku — stav gitu, co se změnilo, rychlé validátory, drift generovaných souborů, dopad na dokumentaci a výsledek plné brány. Použij ho těsně před /pr nebo před žádostí o merge, nebo když se někdo ptá „je to připravené", „můžu to poslat".
argument-hint: ""
disable-model-invocation: true
---

Kontrola připravenosti. Odpovídá na jednu otázku: **může tohle jít
někomu na review?**

> `disable-model-invocation: true`: spouští plnou bránu a jeho verdikt
> se čte jako záruka. Patří člověku.

## Kdy ho použít

- Před `/pr` nebo před žádostí o merge.
- Před tím, než někomu řekneš, že je práce hotová.

## Kdy ho NEPOUŽÍT

- **Během práce.** Je to závěrečná kontrola, ne průběžná.
- **Místo review.** Zelená brána neznamená, že je změna dobrá — jen že
  neporušuje mechanická pravidla.

## Co projít

Postupně, a **nic nepřeskakovat mlčky**.

### 1. Stav gitu

```bash
git status --short --branch
git diff --stat
```

Hledej: soubory, které tam nemají co dělat (`.env`, `node_modules`,
dočasné výstupy, osobní poznámky), a rozsah změny — sedí s tím, co se
mělo dělat?

### 2. Co se změnilo, po kategoriích

```
funkční kód · kanonická data · generované soubory · šablony ·
dokumentace · tooling · testy
```

Generované soubory v diffu jsou v pořádku, když odpovídají změně dat.
Generovaný soubor **bez** odpovídající změny dat je nález.

### 3. Rychlé validátory podle toho, co se změnilo

Viz `/test`. Cíl je odchytit zjevné dřív, než se pustí plná brána.

### 4. Drift generovaných souborů

```bash
npm run data:check-generated:content
npm run verify:tooling-catalog
npm run verify:source-catalog
```

První z nich je jediné místo, kde se pozná ruční editace generované
stránky — uvnitř buildu se tiše přepíše.

### 5. Dopad na dokumentaci

Zasáhla změna něco, co je popsané jinde? Tabulka „co při jaké změně
projít" je v `.claude/rules/learning.md` a v `AGENTS.md`.

### 6. Obsahová změna → redakční review

Když se měnila `data/dossiers/**`, patří sem `/editorial-review`.
Mechanická brána redakční kvalitu neposoudí.

### 7. Plná brána

```bash
npm run build
```

**Bez exit 0 není READY.** Ani „padá to jen na jedné kontrole".

## Výstup

```
VĚTEV:       <název>  (<n> commitů před origin)
ZMĚNĚNO:     <n> souborů — <rozpis po kategoriích>
NEČEKANÉ:    <soubory, které tam nepatří, nebo „—">
VALIDÁTORY:  <příkaz → výsledek>
DRIFT:       žádný | <co je rozejité>
DOKUMENTACE: <co bylo potřeba projít, a jestli se to udělalo>
REDAKČNÍ:    <n/a | výsledek /editorial-review>
PLNÁ BRÁNA:  npm run build → exit <kód>
VERDIKT:     READY | NENÍ READY (<co chybí>)
```

## Co skill NEUDĚLÁ

- **Neřekne READY, dokud plná brána neproběhla a neskončila exit 0.**
  Ani když všechno ostatní vyšlo.
- Necommitne, nepushne, neotevře PR.
- Neposoudí redakční kvalitu obsahu.

## Příklady

**Základní.** Změna v jednom skriptu a jeho testu → 2 soubory, žádné
nečekané, testy zelené, build exit 0, READY.

**Realistický.** Změna dat plus 40 generovaných souborů. Verdikt je
READY, ale výstup musí říct, že těch 40 souborů je **očekávaný důsledek**
`npm run data:build`, ne šum — jinak to reviewera zdrží.

**Selhání.** Všechno zelené, ale `git status` ukazuje
`.claude/settings.local.json`. To je NENÍ READY: lokální konfigurace se
necommituje. Nález má přednost před zelenou bránou.

## Související

`/test` (rychlá smyčka), `/build` (plná brána), `/diff-explain`
(vysvětlení změn), `/editorial-review` (obsah), `/pr` (odeslání).
