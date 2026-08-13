---
name: test
description: Spustí nejmenší relevantní testovou sadu pro to, co se skutečně změnilo, a vysvětlí selhání — místo aby pouštěl všechno a čekal. Použij ho po úpravě skriptů, validátorů, šablon nebo dat, když někdo řekne „spusť testy", „proč to padá", „zkontroluj, jestli jsem něco nerozbil".
argument-hint: "[changed | data | dossier | ui | intake | prismatic | <cesta>]"
---

Cílené testování. Cílem je **rychlá zpětná vazba**, ne úplnost — tu
zajistí `npm run build`.

## Kdy ho použít

- Po změně skriptu, validátoru nebo dat, během práce.
- Když test padá a není jasné proč.
- Před `/quality`, aby se zjevné věci vyřešily dřív.

## Kdy ho NEPOUŽÍT

- **Místo `npm run build`.** Zelené testy nejsou hotovo. Build zahrnuje
  generátory, Zolu a kontroly nad postaveným webem.
- **Na obsahovou chybu.** Když validátor hlásí konkrétní pravidlo
  (S2, R8, T4), test na tom nic nezmění — čti hlášku.

## Postup

### 1. Zjisti, co se změnilo

```bash
git status --short
git diff --name-only
```

### 2. Vyber nejmenší sadu, která to pokryje

| Změna v | Spusť |
|---|---|
| `scripts/data/**` | `node --test scripts/data/*.test.mjs` |
| `scripts/dossier/**` | `node --test scripts/dossier/*.test.mjs` |
| `scripts/build/**` | `node --test scripts/build/*.test.mjs` |
| `scripts/lint/**` | `node --test scripts/lint/*.test.mjs` |
| `.claude/**` | `npm run validate:claude-tooling` + `node --test scripts/build/build-tooling-catalog.test.mjs` |
| `data/dossiers/**` | `npm run data:validate` |
| `data/tooling/**` | `npm run verify:tooling-catalog` |
| `templates/**`, `assets/**` | `npm run lint:component-reuse`, pak build |
| `scripts/intake/**` | `npm run test:intake` |
| nejasné | `npm test` |

Jména testových souborů si **ověř**, nevymýšlej je. Skutečný seznam je
v `package.json` ve skriptu `test`.

### 3. Když padá, vysvětli proč

Ne „test selhal". Konkrétně:

```
CO PADÁ:     <název testu>
OČEKÁVÁNO:   <co test čekal>
DOSTAL:      <co dostal>
PROČ:        <příčina, ne symptom>
OPRAVA:      <kód, nebo očekávání — a které z toho je správně>
```

Test, který padá proto, že se změnilo správné chování, se opravuje —
ale **napiš to nahlas**. Tiché srovnání očekávání s realitou je způsob,
jak se ztratí záruka.

### 4. Golden snapshot

Když padá snapshot, nejdřív se podívej **co se v něm změnilo**.
`npm run test:update-golden` je správný krok teprve tehdy, když je
změna zamýšlená.

## Výstup

```
ZMĚNĚNO:     <soubory>
SPUŠTĚNO:    <příkaz>
VÝSLEDEK:    <n pass, m fail>  exit <kód>
SELHÁNÍ:     <co a proč>
DALŠÍ KROK:  <oprava | npm run build>
```

## Co skill NEUDĚLÁ

- Neprohlásí práci za hotovou. To umí jen `npm run build` s exit 0.
- Neupraví test, aby prošel, bez vysvětlení proč.
- Nespustí E2E (Playwright) — ten není součástí buildu a spouští se
  cíleně.

## Příklady

**Základní.** Změna v `scripts/lint/` → `node --test scripts/lint/*.test.mjs`,
6 pass, exit 0, další krok `npm run build`.

**Realistický.** Změna ve `build-tooling-catalog.mjs` → padá test
„commitnutý výstup odpovídá datům". Příčina není v testu: generátor
změnil výstup a katalog se nepřegeneroval. Oprava je
`npm run build:tooling-catalog`, ne úprava testu.

**Selhání.** `npm test` projde, ale `npm run build` spadne na
`verify:jsonld`. To je správné chování obou: testy pokrývají skripty,
build kontroluje **postavený web**. Odpověď to musí říct, jinak vznikne
dojem, že testy lžou.

## Související

`/build` (plná brána), `/quality` (souhrn před PR),
`.claude/rules/testing.md`.
