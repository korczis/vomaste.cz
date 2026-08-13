---
paths:
  - "data/dossiers/**"
  - "content/dossiers/**"
  - "content/entities/**"
---

# Redakční pravidla

Závazné znění je v `AGENTS.md`, sekce „Editorial rules". Osm pravidel,
zkráceně, protože se porušují právě ve chvíli, kdy se na ně nekouká:

1. **Každé faktické tvrzení cituje jmenovaný, datovaný, nezávislý zdroj
   s přímou URL.** Nedoložitelné tvrzení se škrtá, ne změkčuje.
2. **Citace je označená a připsaná.** Nepřevypráví se způsobem, který by
   zněl jako závěr tohohle webu.
3. **Procesní výsledek se odlišuje od věcného závěru při KAŽDÉ zmínce**,
   ne jednou v poznámce. Zastavení stíhání, promlčení, nepravomocný
   rozsudek, odvolání z funkce, demise — nic z toho není zjištění
   o vině ani o nevině.
4. **Názor je označený jako názor** a strukturálně oddělený od tabulky
   tvrzení.
5. **Nejmenovaná třetí osoba zůstává nejmenovaná** — i když ji některý
   citovaný zdroj jmenuje.
6. **Mezery v pokrytí se říkají nahlas.** Web nepředstírá úplnost.
7. **Web nerozhoduje o vině ani nevině** a nebere jednu stranu za fakt
   proto, že je hlasitější nebo se lépe cituje.
8. **Kde zdroje mlčí, nespekuluje se.** To patří do registru mezer, ne
   do registru tvrzení.

## Formulace, na kterých to nejčastěji padá

- „byl zproštěn" × „stíhání bylo zastaveno" — druhé není první.
- „odvolán" nebo „rezignoval" — politický krok, ne závěr o pochybení.
  Důvody se **připisují tomu, kdo je vyslovil**, včetně premiéra
  a prezidenta.
- „nepravomocná pokuta" — slovo *nepravomocná* patří ke každé zmínce,
  ne jen k první.
- „podle médií se podezřívá" — pokud to není doložené jmenovaným
  zdrojem, není to tvrzení, ale mezera.
- Kritika NGO, komentátora nebo opozice je **jejich pozice**, ne
  zjištění webu. Píše se s uvedením, kdo ji vyslovil.

## Dvě reprezentace téhož a jejich brána

Tabulka tvrzení na hlavní stránce dossieru je ručně psaný markdown blok
v `dossier.json`. Kanonické záznamy `claims/clm-NN.json` jsou to samé
podruhé. To je záměr — a `validate-registry-table.mjs` (T1–T8) shodí
build, když se text, stav, štítek nebo seznam zdrojů liší byť o znak.

Všechno ostatní (detailní stránky, indexy, karty kauz, časová osa,
počty na dlaždicích, navigace, exporty, JSON-LD) je **generované**.
Ručně se needituje.

## Když měníš záznam

```
$EDITOR data/dossiers/<slug>/…      # kanonický JSON
npm run data:validate               # tvar + reference + sémantika + JSON-LD
npm run data:build                  # view modely + adaptéry v content/
npm run build                       # plná brána, tatáž co CI
```

Rychlá smyčka na jeden záznam:
`npm run data:validate -- --file data/dossiers/<slug>/claims/clm-NN.json`.

Než něco ohlásíš jako hotové, `npm run build` musí skončit s exit 0.
Validátory jsou specifikace tohohle obsahu, ne formalita.
