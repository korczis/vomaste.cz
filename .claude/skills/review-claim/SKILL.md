---
name: review-claim
description: Projde jedno tvrzení proti jeho zdrojům a redakčním pravidlům — atomicita, neutralita, stav versus doloženost, nezávislost, procesní rámování, citace, třetí osoby, mezery. Použij ho, když se má posoudit konkrétní CLM záznam: „sedí tohle tvrzení", „je ten stav správně", „zkontroluj mi CLM-12", nebo při revizi po přidání zdroje.
argument-hint: "<CLM-## [slug dossieru]> nebo text tvrzení"
---

Review jednoho tvrzení. **Read-only** — nálezy, ne opravy.

## Kdy ho použít

- Před zápisem nového tvrzení nebo hned po něm.
- Po přidání zdroje k existujícímu tvrzení (stav se mohl změnit).
- Při periodické revizi dossieru.
- Když někdo namítne, že tvrzení říká víc, než zdroje unesou.

## Kdy ho NEPOUŽÍT

- **Na celý dossier.** Na to je `/editorial-review`.
- **Na zdroj samotný.** Na to je `/verify-source`.
- **K opravě.** Tenhle skill nález popíše; opravu provede člověk nebo
  `/correction`.

## Co si načíst

```bash
cat data/dossiers/<slug>/claims/clm-NN.json
```

a k tomu **každý** zdroj, na který se odkazuje
(`data/dossiers/<slug>/sources/src-NN.json`), plus řádek téhož tvrzení
v ručně psané tabulce v `dossier.json`.

## Dvanáct kontrol

Projdi je všechny. U každé napiš OK, nebo konkrétní nález.

| # | Kontrola | Co hledáš |
|---|---|---|
| 1 | **Atomicita** | jeden fakt, ne „a zároveň". Složené tvrzení nejde doložit po částech |
| 2 | **Neutralita** | hodnotící přívlastky („skandální", „účelově"), které v žádném zdroji nejsou |
| 3 | **Doloženost** | plyne text SKUTEČNĚ z citovaných pasáží, nebo je to o krok dál? |
| 4 | **Stav vs. zdroje** | `1 ZDROJ` × `CORROBORATED` — existuje nezávislá dvojice? (S2/S10) |
| 5 | **Zdrojová rodina** | nejsou dva „nezávislé" zdroje jeden agenturní přetisk? |
| 6 | **Procesní rámování** | zastavené stíhání, promlčení, nepravomocnost, odvolání — je to u TÉHLE zmínky? |
| 7 | **Citace** | doslovnost, atribuce, označené zkrácení |
| 8 | **Data** | datum vydání i pořízení u každého zdroje; je odkaz živý? |
| 9 | **Třetí osoby** | jmenuje tvrzení někoho, kdo měl zůstat nejmenovaný? |
| 10 | **Osobní údaje** | datum narození, adresa, rodina, zdraví — nic z toho sem nepatří |
| 11 | **Vazby** | odkazuje na existující SRC/GAP/CASE? Je vazba obousměrná (R8)? |
| 12 | **Parita tabulky** | shoduje se text, stav, štítek a seznam zdrojů s řádkem v tabulce? (T1–T8) |

Kontrola 6 je ta, která se nejčastěji poruší při **druhé** zmínce.
Rámování není poznámka pod čarou — patří ke každému výskytu.

## Rozdíl, na kterém to stojí

Stav popisuje **sílu doložení**, ne pravdu. Tvrzení může být pravdivé
a přesto `1 ZDROJ`; může být `CORROBORATED` a přesto se později ukázat
jako mylné. Review posuzuje první, ne druhé.

Když tvrzení říká víc, než zdroje unesou, správná oprava je **zúžit
text**, ne přidat výhradu. „Podle dostupných informací se zdá, že…" je
nedoložené tvrzení v převleku.

## Výstup

```
TVRZENÍ:     <CLM-##> — <text>
STAV:        <deklarovaný>   NAVRHOVANÝ: <stejný | jiný, proč>
ZDROJE:      <n> → <m> nezávislých hlasů
NÁLEZY:
  [BLOCKER] <co nesmí zůstat publikované>
  [HIGH]    <co je vážná nepřesnost>
  [MEDIUM]  <co zhoršuje přesnost>
  [LOW]     <formulace, konzistence>
  [NOTE]    <pozorování bez požadavku>
BEZE ZMĚNY:  <co je v pořádku — vyjmenuj, ať je vidět, co bylo prověřeno>
DALŠÍ KROK:  <konkrétně>
```

**BLOCKER** je vyhrazený pro čtyři věci: nedoložené tvrzení o člověku,
chybějící procesní rámování, jmenovaná třetí osoba, která má zůstat
nejmenovaná, a osobní údaje. Nic jiného není blocker.

## Co skill NEUDĚLÁ

- Nezmění záznam.
- Nerozhodne, že je tvrzení pravdivé.
- Nepovýší stav bez nového nezávislého zdroje.
- Neposoudí rozsah pokrytí (to je `/authorization-check`).

## Příklady

**Základní.** `CLM-03` s jedním zdrojem, stav `1 ZDROJ`, text odpovídá
citované pasáži → žádný nález, výstup vyjmenuje, co bylo prověřeno.

**Realistický.** Tvrzení o pokutě za střet zájmů, stav `1 ZDROJ`, tři
zdroje. Nález [HIGH]: dva ze tří jsou přetisky, ale **stav je správně**
— chyba je v tom, že tabulka uvádí jen dva zdroje, tedy parita T4.
A [BLOCKER]: v textu chybí slovo „nepravomocná", které v citovaném
zpravodajství je a které patří ke každé zmínce.

**Selhání.** Tvrzení „byl zproštěn obvinění", zdroj mluví o **zastavení
stíhání**. To je [BLOCKER] a oprava není přeformulování — je to jiný
fakt. Zastavení je procesní výsledek: není to zjištění o vině ani
o nevině, a tak to musí být napsané.

## Související

`/verify-source` (jednotlivý zdroj), `/source-family` (nezávislost),
`/review-gap` (otevřené otázky), `/editorial-review` (celý dossier),
`/correction` (oprava nálezu), `.claude/rules/editorial.md`.
