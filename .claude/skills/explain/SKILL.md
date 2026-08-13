---
name: explain
description: Vysvětlí jednu konkrétní věc — záznam, soubor, pojem, chybovou hlášku — srozumitelně a bez žargonu, ve výchozím nastavení netechnicky. Použij ho, když se někdo ptá „co znamená", „co je to", „co dělá tenhle soubor", „proč to hlásí tuhle chybu", „vysvětli mi CLM-12".
argument-hint: "<co vysvětlit> [--technicky]"
---

Vysvětlení jedné věci. **Read-only.**

Výchozí režim je **netechnický**: čtenář nemusí znát Git, JSON ani
strukturu repozitáře. `--technicky` režim předpokládá vývojáře.

## Kdy ho použít

- Někdo narazil na pojem, záznam nebo hlášku a nerozumí jí.
- Vysvětluje se něco konkrétního, ne celý systém.

## Kdy ho NEPOUŽÍT

- **Na celý projekt.** To je `/project-tour`.
- **Na posouzení kvality.** „Je tohle tvrzení dobré" je review, ne
  vysvětlení.
- **Na to, co se má udělat.** To je `/task`.

## Postup

### 1. Zjisti, co to je

| Vypadá jako | Načti |
|---|---|
| `CLM-##`, `SRC-##`, `GAP-##`, `CASE-##` | kanonický záznam + jeho vazby |
| cesta k souboru | soubor, hlavně jeho hlavičkový komentář |
| název příkazu | `docs/TOOLING.md` (generovaný katalog) |
| pojem („zdrojová rodina", „mezera") | `content/koncepty/*` — **kanonická definice** |
| chybová hláška | validátor, který ji vydává |
| stav tvrzení | `content/koncepty/stav-*.md` |

### 2. Kanonické definice neopisuj podruhé

Pojem vlastní `content/koncepty/*`. Vysvětlení ho **aplikuje** —
řekne, co to znamená v konkrétním případě, na který se člověk ptá.
Pět míst s pěti definicemi téhož je přesně ten drift, kterému datový
model brání jinde.

### 3. Vysvětluj v tomhle pořadí

```
1. Co to je     — jednou větou, bez odborných slov
2. K čemu       — proč to existuje
3. V tomhle případě — konkrétně to, na co se ptali
4. Na co pozor  — past, když nějaká je
5. Kde je víc   — odkaz na kanonický zdroj
```

### 4. Netechnicky znamená netechnicky

Ne „je to JSON záznam s referenční integritou vůči SRC uzlům".
Ale „je to jedno tvrzení a seznam zdrojů, které ho dokládají; web
hlídá, že každý ten odkaz vede na zdroj, který v evidenci opravdu je".

Odborný termín smí zaznít, když se hned vysvětlí. Termín bez vysvětlení
je pro toho, kdo se ptá, jen další neznámé slovo.

## Výstup

Souvislý text, ne tabulka. Ale vždycky obsahuje:

```
CO TO JE:      <jedna věta>
K ČEMU:        <proč existuje>
TADY KONKRÉTNĚ: <odpověď na položenou otázku>
POZOR NA:      <past, nebo vynech>
VÍC:           <kanonický zdroj>
```

## Co skill NEUDĚLÁ

- Nezmění nic.
- Nevymyslí definici, kterou koncepty neobsahují — když pojem
  definovaný není, řekne to.
- Neposoudí, jestli je vysvětlovaná věc správně.

## Příklady

**Základní.** „Co znamená 1 ZDROJ?" → že tvrzení citované zdroje
nedokládají dvěma nezávislými hlasy. **Ne** že je nepravdivé. Tři
odkazy na tutéž agenturní zprávu jsou jeden hlas, a proto tam ten stav
může být i u tvrzení se třemi odkazy.

**Realistický.** „Proč mi to hlásí S2?" → S2 je pravidlo o nezávislé
dvojici. Konkrétně: tvrzení je označené jako ověřené více zdroji, ale
oba citované zdroje mají stejného vydavatele. Oprava je buď najít
nezávislý zdroj, nebo stav opravit — ne pravidlo obejít.

**Selhání.** „Vysvětli mi, co je špatně na tom člověku." → To není
otázka na vysvětlení. Odpověď říká, že web nehodnotí lidi, eviduje
doložená tvrzení, a nabídne vysvětlit konkrétní záznam.

## Související

`/project-tour` (celý projekt), `/diff-explain` (změny),
`content/koncepty/` (kanonické definice), `docs/TOOLING.md`.
