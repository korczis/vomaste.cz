---
name: task
description: Rozloží konkrétní zadání na personu, riziko, dotčené podsystémy, potřebné validátory a doporučený postup — než se začne pracovat. Použij ho, když uživatel popíše, co chce udělat, ale není jasné, čeho se to dotkne: „chci opravit stránku entity", „mám nový článek", „chci zlepšit mobilní navigaci", „je tam chyba v datech". Je to router a plánovač, sám práci neudělá.
argument-hint: "<co chceš udělat, vlastními slovy>"
---

Rozklad zadání. Odpovídá na otázku, kterou si má člověk položit **před**
první editací: čeho se to dotkne a co bude potřeba, aby to prošlo.

## Kdy ho použít

- Zadání je jasné jako cíl, ale ne jako rozsah.
- Změna se možná dotkne víc vrstev, než je na první pohled vidět.
- Před prací, u které hrozí, že skončí jako polovina (typicky: nové
  pole v záznamu, změna stavu tvrzení, zásah do generovaného obsahu).

## Kdy ho NEPOUŽÍT

- **Na triviální, jednoznačnou změnu.** Oprava překlepu v ručně psané
  stránce nepotřebuje plán.
- **Když už rozsah znáš.** Rozklad by byl obřad, ne pomoc.
- **Jako provedení.** Tenhle skill **nic nemění**. Když má práci někdo
  udělat, výstupem je doporučení, kterým postupem začít.

## Postup

### 1. Klasifikuj zadání

Zjisti pět věcí. Když některou nejde určit ze zadání, **zeptej se** —
odhad tady je horší než jedna otázka.

| Co | Možnosti |
|---|---|
| **Persona** | viz `.claude/rules/personas.md` |
| **Typ změny** | obsah · data · schéma · šablona · skript · dokumentace · tooling |
| **Riziko** | read-only · safe-write · review-required · maintainer · owner-authorization |
| **Rozsahová brána** | dotýká se to pokrytí konkrétní osoby? |
| **Kdo to schválí** | nikdo (read-only) · review · vlastník |

### 2. Urči dotčené podsystémy

Podle typu změny. Tabulka je zkratka, ne náhrada za přečtení pravidla:

| Zadání zní jako | Skutečně se dotkne |
|---|---|
| „oprav text tvrzení" | kanonický JSON **a** ručně psaná tabulka v `dossier.json` (parita T1–T8) |
| „přidej pole do zdroje" | schéma + builder view modelů + šablona/export — tři místa |
| „oprav stránku entity" | pravděpodobně **generovaný adaptér** → oprava patří do `data/`, ne do `content/` |
| „změň stav tvrzení" | záznam, tabulka, a vzdělávací vrstva (koncepty, příručka, bootcamp) |
| „uprav navigaci" | `data/navigation.toml` je kostra bez slugů; strom se generuje |
| „přidej příkaz" | `package.json` + `data/tooling/` (jinak build spadne) |
| „přidej skill" | `SKILL.md` + `data/tooling/` + persona a riziko |
| „uprav vzhled tabulky" | jediná komponenta `macros/table.html`, ne konkrétní šablona |
| „přidej obrázek k osobě" | licence, atribuce, ověření identity přes Wikidata, bajty do repa |

### 3. Vyjmenuj, co bude muset projít

Konkrétní příkazy, ne „testy". Vždycky včetně toho posledního:

```
npm run data:validate            # když se měnila data
npm run validate:claude-tooling  # když se měnil .claude/
npm run build                    # vždycky, a je to jediné „hotovo"
```

### 4. Doporuč vstupní bod

Jeden. Když v katalogu (`data/generated/tooling-catalog.json`) existuje
schopnost, která tenhle typ práce vede, doporuč ji. Když ne, řekni to
a popiš postup ručně.

## Výstup

```
ZADÁNÍ:      <parafráze jednou větou>
PERSONA:     <role>
TYP:         <obsah | data | schéma | šablona | skript | dokumentace | tooling>
RIZIKO:      <úroveň>
ROZSAH:      <netýká se pokrytí osob | týká se — ověř dřív, než napíšeš tvrzení>
DOTKNE SE:   <konkrétní cesty>
MUSÍ PROJÍT: <příkazy>
ZAČNI:       <jeden vstupní bod>
POZOR:       <past specifická pro tenhle typ, když nějaká je>
```

Řádek **POZOR** se nevyplňuje z povinnosti. Když past není, vynech ho.

## Časté pasti, které má rozklad odhalit

- **Oprava v `content/` místo v `data/`.** Sync uvnitř buildu ji tiše
  přepíše a build zůstane zelený. Nejčastější a nejhůř viditelná chyba
  v celém repozitáři.
- **Nové pole jen na jednom ze tří míst.** Schéma s
  `additionalProperties: false` to chytí, ale opačný směr — pole
  v šabloně bez pokrytí schématem — je taky nedodělaná změna.
- **Změna textu tvrzení bez tabulky.** Parita T1–T8 shodí build; je to
  záměr, ne obtěžování.
- **Povýšení stavu na CORROBORATED bez nového zdroje.** Přeštítkování
  nestačí a nesmí projít — potřeba je skutečně nezávislý hlas.
- **Commit na `master`.** Znamená okamžitý deploy. U čehokoli, co má
  někdo napřed vidět, patří práce do worktree na `task/T-###`.

## Příklady

**Základní.** „Chci opravit překlep ve jméně zdroje." → data,
safe-write, netýká se rozsahu, dotkne se jednoho JSON záznamu, musí
projít `data:validate` + `build`, začni přímo v souboru.

**Realistický.** „Chci na stránce entity zobrazovat počet smluv." →
Zadání zní jako šablona, ale je to **schéma**: nové pole potřebuje
záznam ve schématu, dopočet ve view modelu a teprve pak šablonu.
Riziko maintainer, protože se mění datový kontrakt. Pozor: pole, které
nikdo nečte, i šablonové pole bez schématu jsou obojí nedodělaná změna.

**Selhání.** „Chci přidat, že ten člověk je podle mě zapletený do
kauzy X." → Rozklad musí skončit **odmítnutím postupu, ne návrhem**:
„podle mě" není zdroj, tohle je tvrzení o člověku, řídí se rozsahem
a devíti branami. Doporučení je otevřít zdroj, nebo z toho udělat
mezeru (`GAP`) — ne hedge větu.

## Související

`/guide` (nevím, co dál vůbec), `/project-tour` (jak repozitář funguje),
`.claude/rules/personas.md` (role a rizika), `docs/TOOLING.md` (co který
příkaz dělá).
