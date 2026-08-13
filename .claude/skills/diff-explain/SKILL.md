---
name: diff-explain
description: Převede aktuální změny v repozitáři na srozumitelné shrnutí pro netechnického recenzenta — co se změnilo, proč, co je generovaný důsledek, co je riziko a jak to ověřit. Použij ho před review, před odesláním příspěvku, nebo když někdo řekne „co jsem to vlastně změnil", „vysvětli mi ten diff", „je to bezpečné".
argument-hint: "[--technicky | <cesta>]"
---

Vysvětlení změn. **Read-only.** Bez Git žargonu tam, kde není nutný.

## Kdy ho použít

- Před tím, než změnu někdo posoudí.
- Když člověk, který změnu nedělal, potřebuje vědět, co obsahuje.
- Po delší práci, kdy se ztratil přehled.

## Kdy ho NEPOUŽÍT

- **K posouzení kvality.** Vysvětlení není review.
- **U jednořádkové změny.** Pak stačí říct, co se změnilo.

## Postup

```bash
git status --short --branch
git diff --stat
git diff
```

### Rozděl změny do pěti kategorií

Tohle je celý přínos skillu — bez rozdělení vypadá diff se čtyřiceti
soubory hrozivě, i když je to jedna změna.

| Kategorie | Co to je | Jak číst |
|---|---|---|
| **Funkční** | kód, který něco dělá jinak | tady je riziko |
| **Obsah / data** | kanonická data dossierů | tady je redakční odpovědnost |
| **Generované** | výstup generátorů | **není to rozhodnutí**, je to důsledek |
| **Dokumentace** | texty a pravidla | riziko nízké, dopad na lidi vysoký |
| **Testy a brány** | co se nově hlídá | zlepšení záruky |

**Generovaný soubor bez odpovídající změny dat je nález**, ne šum.
A naopak: čtyřicet generovaných souborů po jedné změně dat je
očekávané.

### Vysvětluj bez žargonu

Ne „přejmenován symbol ve view-model builderu". Ale „změnil se název
údaje, který se ukazuje na stránce zdroje; proto se přegenerovaly
všechny stránky zdrojů".

## Výstup

```
SHRNUTÍ:     <dvě věty: co se změnilo a proč>

FUNKČNÍ ZMĚNY (<n> souborů)
  — <co teď funguje jinak, lidsky>

OBSAH A DATA (<n>)
  — <která tvrzení/zdroje/mezery, a co se u nich změnilo>

GENEROVANÉ (<n>)
  — důsledek: <které změny dat je způsobily>

DOKUMENTACE (<n>)
TESTY A BRÁNY (<n>)

RIZIKA:      <co se může pokazit, nebo „žádné zjevné">
NEČEKANÉ:    <soubory, které tam nepatří, nebo „—">
JAK OVĚŘIT:  <konkrétní příkazy a co má být vidět>
```

Řádek **JAK OVĚŘIT** je povinný. Vysvětlení bez způsobu, jak si to
ověřit, je žádost o důvěru.

## Co skill NEUDĚLÁ

- Nezmění nic, necommitne.
- Neřekne, že je změna správná — to je review.
- Nezamlčí soubor proto, že „je to jen generované".

## Příklady

**Základní.** Tři soubory, jeden skript a jeho test. Shrnutí dvě věty,
riziko nízké, ověření `node --test`.

**Realistický.** 44 souborů: 2 datové, 40 generovaných, 1 test,
1 dokumentace. Shrnutí musí začít tím, že **jde o jednu změnu dat**,
a teprve pak vyjmenovat důsledky. Bez toho reviewer utopí čtvrt hodiny
v generovaném diffu.

**Selhání.** V diffu je `.claude/settings.local.json`. To je NEČEKANÉ
a vysvětlení to musí uvést nahoře, ne v seznamu: lokální konfigurace se
necommituje a v public repozitáři může nést cesty nebo tokeny.

## Související

`/quality` (připravenost k odeslání), `/explain` (jedna věc),
`/review-pr` (posouzení cizí změny), `/pr` (odeslání).
