# Evidenční plán práce

> **Generováno** `npm run report:evidence-plan` (běží i v `npm run data:build`
> a `npm run build`) — **needitovat ručně**, ruční změna zmizí při dalším běhu.
> Zdroj: kanonický model `data/dossiers/**`. Strojová podoba téhož:
> `data/generated/evidence-plan.json`.

**Co tenhle report je.** Interní pracovní přehled evidence: kde je zdrojování
nejslabší a co ho konkrétně posílí. Každé číslo je spočítané z kanonických dat,
žádná položka není psaná rukou.

**Co není.** Hodnocení osob. Vysoké skóre nevypovídá nic o subjektu dossieru —
vypovídá o tom, že **tenhle web** má u daného dossieru nejvíc nedodělané
zdrojovací práce. Je to metrika naší evidence, ne jeho jednání. Report se
neroutuje na web, nezakládá dossier a není autorizačním rozhodnutím.

**Datový horizont**: `2026-08-06` — nejnovější datum v datasetu. Report neobsahuje čas
běhu: stáří mezer se měří proti nejnovějšímu datu v datech, takže dva běhy nad
stejným stromem dají bajt po bajtu stejný soubor.

## Jak se počítá priorita

Každé tvrzení spadne do právě jedné evidenční třídy podle toho, co **skutečně
cituje** (ne podle deklarovaného stavu — ten je redakční popisek, tohle je
měření). Nezávislost dvojice zdrojů počítá `scripts/data/lib/source-independence.mjs`,
tentýž primitiv, kterým `validate-semantics.mjs` vynucuje S1/S2/S4/S10.

| Třída | Význam |
|---|---|
| `E0` | žádný citovaný zdroj |
| `E1` | právě jeden citovaný zdroj |
| `E1+` | ≥2 zdroje, ale žádná nezávislá dvojice (jedna rodina / jeden vydavatel / jedna doména) — **potenciál na korroboraci**: stačí jeden nezávislý doklad |
| `E2` | existuje nezávislá dvojice — evidenčně hotovo |

```
riskPoints = 3·E0 + 2·E1 + 1·E1+
           + 2·otevřené mezery s prioritou „vysoká"
           + 1·ostatní otevřené mezery
           + 1·otevřené mezery nekontrolované déle než 30 dní
```

Váha = jak slabá je evidence. `E2` body nedává (hotový stav). Zdroje bez
`sourceFamily` se do skóre **záměrně nepočítají**: prázdná rodina není chyba
evidence, protože nezávislost pak spočítá fallback na `outlet`. Report je měří
a navrhuje jako krok, ale prioritu jimi nepřiživuje.

Pásmo priority není pevný práh (ten by byl odhad), ale **Pareto podíl na celkovém
objemu práce**. Dossiery seřazené sestupně; rozhoduje podíl práce ležící **nad**
dossierem (bez něj samotného):
`< 50.0 %` → **vysoká**, `< 80.0 %` → **střední**, zbytek → **nízká**, nula bodů → **žádná**.
„Vysoká" je tedy nejmenší skupina dossierů, která dohromady drží aspoň polovinu
veškeré nedodělané zdrojovací práce.

## Souhrn

| Metrika | Hodnota |
|---|---|
| Dossierů | 26 |
| Tvrzení | 967 |
| — z toho `E0` / `E1` / `E1+` / `E2` | 0 / 558 / 109 / 300 |
| Zdrojů (z toho s vyplněnou `sourceFamily`) | 680 (381) |
| Kauz | 94 |
| Mezer celkem / otevřených / zastaralých | 204 / 202 / 0 |
| Vztahů | 334 |
| Bodů rizika celkem | 1452 |

## Pořadí dossierů

| # | Dossier | Priorita | Body | Podíl | Kumul. | Tvrzení | `E0`/`E1`/`E1+`/`E2` | Otevřené mezery | Zdroje bez rodiny | Aktualizováno |
|---:|---|---|---:|---:|---:|---:|---|---:|---:|---|
| 1 | [Andrej Babiš](../data/dossiers/andrej-babis/) `andrej-babis` | **vysoká** | 164 | 11.3 % | 11.3 % | 105 | 0/75/1/29 | 8 | 20 | 2026-08-05 |
| 2 | [Karel Havlíček](../data/dossiers/karel-havlicek/) `karel-havlicek` | **vysoká** | 100 | 6.9 % | 18.2 % | 58 | 0/39/9/10 | 12 | 25 | 2026-08-05 |
| 3 | [Jaromír Zůna](../data/dossiers/jaromir-zuna/) `jaromir-zuna` | **vysoká** | 88 | 6.1 % | 24.2 % | 57 | 0/38/3/16 | 9 | 18 | 2026-08-06 |
| 4 | [Adam Vojtěch](../data/dossiers/adam-vojtech/) `adam-vojtech` | **vysoká** | 83 | 5.7 % | 30.0 % | 55 | 0/31/6/18 | 15 | 19 | 2026-08-05 |
| 5 | [Martin Šebestyán](../data/dossiers/martin-sebestyan/) `martin-sebestyan` | **vysoká** | 80 | 5.5 % | 35.5 % | 55 | 0/33/0/22 | 14 | 20 | 2026-08-06 |
| 6 | [Oto Klempíř](../data/dossiers/oto-klempir/) `oto-klempir` | **vysoká** | 80 | 5.5 % | 41.0 % | 45 | 0/34/5/6 | 7 | 12 | 2026-07-30 |
| 7 | [Ivan Bednárik](../data/dossiers/ivan-bednarik/) `ivan-bednarik` | **vysoká** | 79 | 5.4 % | 46.4 % | 48 | 0/34/1/13 | 9 | 26 | 2026-07-30 |
| 8 | [Robert Plaga](../data/dossiers/robert-plaga/) `robert-plaga` | **vysoká** | 79 | 5.4 % | 51.9 % | 55 | 0/29/9/17 | 12 | 14 | 2026-07-30 |
| 9 | [Zuzana Mrázová](../data/dossiers/zuzana-mrazova/) `zuzana-mrazova` | **střední** | 78 | 5.4 % | 57.2 % | 60 | 0/28/6/26 | 16 | 15 | 2026-08-05 |
| 10 | [Aleš Juchelka](../data/dossiers/ales-juchelka/) `ales-juchelka` | **střední** | 75 | 5.2 % | 62.4 % | 47 | 0/27/8/12 | 13 | 6 | 2026-07-30 |
| 11 | [Igor Červený](../data/dossiers/igor-cerveny/) `igor-cerveny` | **střední** | 75 | 5.2 % | 67.6 % | 59 | 0/26/9/24 | 14 | 14 | 2026-07-30 |
| 12 | [Alena Schillerová](../data/dossiers/alena-schillerova/) `alena-schillerova` | **střední** | 70 | 4.8 % | 72.4 % | 41 | 0/28/4/9 | 8 | 15 | 2026-08-05 |
| 13 | [Petr Macinka a Filip Turek](../data/dossiers/macinka-turek/) `macinka-turek` | **střední** | 69 | 4.8 % | 77.1 % | 55 | 0/28/2/25 | 7 | 20 | 2026-07-29 |
| 14 | [Boris Šťastný](../data/dossiers/boris-stastny/) `boris-stastny` | **střední** | 64 | 4.4 % | 81.5 % | 42 | 0/21/11/10 | 10 | 8 | 2026-07-30 |
| 15 | [Jeroným Tejc](../data/dossiers/jeronym-tejc/) `jeronym-tejc` | **nízká** | 62 | 4.3 % | 85.8 % | 52 | 0/22/8/22 | 10 | 16 | 2026-08-06 |
| 16 | [Lubomír Metnar](../data/dossiers/lubomir-metnar/) `lubomir-metnar` | **nízká** | 47 | 3.2 % | 89.0 % | 31 | 0/13/6/12 | 15 | 5 | 2026-08-05 |
| 17 | [Tomio Okamura](../data/dossiers/tomio-okamura/) `tomio-okamura` | **nízká** | 43 | 3.0 % | 92.0 % | 36 | 0/9/15/12 | 8 | 10 | 2026-08-05 |
| 18 | [James Quick](../data/dossiers/james-quick/) `james-quick` | **nízká** | 37 | 2.5 % | 94.6 % | 16 | 0/15/1/0 | 3 | 16 | 2026-08-05 |
| 19 | [Richard Chlad](../data/dossiers/richard-chlad/) `richard-chlad` | **nízká** | 27 | 1.9 % | 96.4 % | 11 | 0/10/1/0 | 3 | 1 | 2026-08-05 |
| 20 | [Tünde Bartha](../data/dossiers/tunde-bartha/) `tunde-bartha` | **nízká** | 17 | 1.2 % | 97.6 % | 13 | 0/6/0/7 | 4 | 8 | 2026-08-01 |
| 21 | [Jaroslav Faltýnek](../data/dossiers/jaroslav-faltynek/) `jaroslav-faltynek` | **nízká** | 16 | 1.1 % | 98.7 % | 13 | 0/6/1/6 | 2 | 9 | 2026-08-05 |
| 22 | [Martin Pavlík](../data/dossiers/martin-pavlik/) `martin-pavlik` | **nízká** | 14 | 1.0 % | 99.7 % | 7 | 0/4/3/0 | 2 | 0 | 2026-08-05 |
| 23 | [Petr Vencálek](../data/dossiers/petr-vencalek/) `petr-vencalek` | **nízká** | 3 | 0.2 % | 99.9 % | 3 | 0/1/0/2 | 1 | 2 | 2026-08-01 |
| 24 | [Petr Pavel](../data/dossiers/petr-pavel/) `petr-pavel` | **nízká** | 2 | 0.1 % | 100.0 % | 3 | 0/1/0/2 | 0 | 0 | 2026-08-01 |
| 25 | [Filip Turek](../data/dossiers/filip-turek/) `filip-turek` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 26 | [Petr Macinka](../data/dossiers/petr-macinka/) `petr-macinka` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |

## Plán per dossier

### 1. Andrej Babiš — `andrej-babis`

**Priorita vysoká** · 164 bodů (11.3 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 105 | 0 | 75 | 1 | 29 | 81 | 61 | 20 | 8 (8) | 42 |

Deklarované stavy: CORROBORATED 28 · 1 ZDROJ 53 · CITACE 24

Další krok:

- 75 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 5 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 3 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-86) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 2. Karel Havlíček — `karel-havlicek`

**Priorita vysoká** · 100 bodů (6.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 58 | 0 | 39 | 9 | 10 | 38 | 13 | 4 | 12 (12) | 22 |

Deklarované stavy: CORROBORATED 8 · 1 ZDROJ 28 · CITACE 22

Další krok:

- 39 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-07, CLM-08) → dohledat druhého, nezávislého vydavatele
- 11 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 9 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-05, CLM-06, CLM-12) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 25 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 3. Jaromír Zůna — `jaromir-zuna`

**Priorita vysoká** · 88 bodů (6.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 57 | 0 | 38 | 3 | 16 | 39 | 21 | 4 | 11 (9) | 26 |

Deklarované stavy: CORROBORATED 13 · 1 ZDROJ 17 · CITACE 27

Další krok:

- 38 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 9 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 3 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-21, CLM-28, CLM-29) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 18 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 4. Adam Vojtěch — `adam-vojtech`

**Priorita vysoká** · 83 bodů (5.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 31 | 6 | 18 | 42 | 23 | 3 | 15 (15) | 6 |

Deklarované stavy: CORROBORATED 17 · 1 ZDROJ 29 · CITACE 9

Další krok:

- 31 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-09, CLM-10) → dohledat druhého, nezávislého vydavatele
- 15 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 6 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-06, CLM-08, CLM-28) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 19 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 5. Martin Šebestyán — `martin-sebestyan`

**Priorita vysoká** · 80 bodů (5.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 33 | 0 | 22 | 43 | 23 | 3 | 14 (14) | 6 |

Deklarované stavy: CORROBORATED 14 · 1 ZDROJ 26 · CITACE 11 · SPORNÉ 4

Další krok:

- 33 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-07) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 6. Oto Klempíř — `oto-klempir`

**Priorita vysoká** · 80 bodů (5.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 45 | 0 | 34 | 5 | 6 | 30 | 18 | 5 | 7 (7) | 11 |

Deklarované stavy: CORROBORATED 6 · 1 ZDROJ 22 · CITACE 17

Další krok:

- 34 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 7 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 5 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-18, CLM-19, CLM-22) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 12 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 7. Ivan Bednárik — `ivan-bednarik`

**Priorita vysoká** · 79 bodů (5.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 48 | 0 | 34 | 1 | 13 | 33 | 7 | 2 | 9 (9) | 21 |

Deklarované stavy: CORROBORATED 13 · 1 ZDROJ 29 · CITACE 6

Další krok:

- 34 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 8 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-29) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 26 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 8. Robert Plaga — `robert-plaga`

**Priorita vysoká** · 79 bodů (5.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 29 | 9 | 17 | 33 | 19 | 3 | 12 (12) | 7 |

Deklarované stavy: CORROBORATED 16 · 1 ZDROJ 27 · CITACE 12

Další krok:

- 29 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-09, CLM-10) → dohledat druhého, nezávislého vydavatele
- 12 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 9 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-06, CLM-22, CLM-23) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 14 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 9. Zuzana Mrázová — `zuzana-mrazova`

**Priorita střední** · 78 bodů (5.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 60 | 0 | 28 | 6 | 26 | 34 | 19 | 4 | 16 (16) | 8 |

Deklarované stavy: CORROBORATED 23 · 1 ZDROJ 31 · CITACE 6

Další krok:

- 28 tvrzení stojí na jediném zdroji (např. CLM-11, CLM-14, CLM-15) → dohledat druhého, nezávislého vydavatele
- 16 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 6 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-20, CLM-27, CLM-28) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 15 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 10. Aleš Juchelka — `ales-juchelka`

**Priorita střední** · 75 bodů (5.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 47 | 0 | 27 | 8 | 12 | 20 | 14 | 5 | 13 (13) | 14 |

Deklarované stavy: CORROBORATED 12 · 1 ZDROJ 21 · CITACE 14

Další krok:

- 27 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 13 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-10, CLM-17, CLM-23) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 6 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 11. Igor Červený — `igor-cerveny`

**Priorita střední** · 75 bodů (5.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 59 | 0 | 26 | 9 | 24 | 37 | 23 | 4 | 14 (14) | 21 |

Deklarované stavy: CORROBORATED 23 · 1 ZDROJ 32 · CITACE 4

Další krok:

- 26 tvrzení stojí na jediném zdroji (např. CLM-06, CLM-07, CLM-09) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 9 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-08, CLM-12, CLM-13) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 14 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 12. Alena Schillerová — `alena-schillerova`

**Priorita střední** · 70 bodů (4.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 41 | 0 | 28 | 4 | 9 | 28 | 13 | 4 | 8 (8) | 17 |

Deklarované stavy: CORROBORATED 8 · 1 ZDROJ 23 · CITACE 10

Další krok:

- 28 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-04, CLM-06) → dohledat druhého, nezávislého vydavatele
- 6 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 4 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-05, CLM-13, CLM-14) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 15 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 13. Petr Macinka a Filip Turek — `macinka-turek`

**Priorita střední** · 69 bodů (4.8 % celkového objemu práce) · typ `aggregate` · aktualizováno `2026-07-29`, revidováno `2026-07-29`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 28 | 2 | 25 | 61 | 41 | 4 | 7 (7) | 34 |

Deklarované stavy: CORROBORATED 19 · 1 ZDROJ 24 · CITACE 11 · SPORNÉ 1

Další krok:

- 28 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-08, CLM-10) → dohledat druhého, nezávislého vydavatele
- 4 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 3 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-11, CLM-27) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 14. Boris Šťastný — `boris-stastny`

**Priorita střední** · 64 bodů (4.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 42 | 0 | 21 | 11 | 10 | 22 | 14 | 3 | 10 (10) | 28 |

Deklarované stavy: CORROBORATED 8 · 1 ZDROJ 17 · CITACE 17

Další krok:

- 21 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 11 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-02, CLM-06, CLM-07) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 9 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 8 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 15. Jeroným Tejc — `jeronym-tejc`

**Priorita nízká** · 62 bodů (4.3 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 52 | 0 | 22 | 8 | 22 | 31 | 15 | 3 | 10 (10) | 19 |

Deklarované stavy: CORROBORATED 18 · 1 ZDROJ 20 · CITACE 14

Další krok:

- 22 tvrzení stojí na jediném zdroji (např. CLM-23, CLM-24, CLM-25) → dohledat druhého, nezávislého vydavatele
- 10 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-03, CLM-06, CLM-07) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 16 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 16. Lubomír Metnar — `lubomir-metnar`

**Priorita nízká** · 47 bodů (3.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 31 | 0 | 13 | 6 | 12 | 13 | 8 | 4 | 15 (15) | 8 |

Deklarované stavy: CORROBORATED 9 · 1 ZDROJ 9 · CITACE 11 · SPORNÉ 2

Další krok:

- 13 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 15 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 6 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-05, CLM-14, CLM-18) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 5 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 17. Tomio Okamura — `tomio-okamura`

**Priorita nízká** · 43 bodů (3.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 36 | 0 | 9 | 15 | 12 | 32 | 22 | 5 | 8 (8) | 7 |

Deklarované stavy: CORROBORATED 12 · 1 ZDROJ 21 · CITACE 3

Další krok:

- 9 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 15 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01, CLM-02, CLM-08) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 6 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 10 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 18. James Quick — `james-quick`

**Priorita nízká** · 37 bodů (2.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 16 | 0 | 15 | 1 | 0 | 17 | 1 | 4 | 3 (3) | 10 |

Deklarované stavy: 1 ZDROJ 15 · CITACE 1

Další krok:

- 15 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-03, CLM-04) → dohledat druhého, nezávislého vydavatele
- 3 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-02) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 16 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 19. Richard Chlad — `richard-chlad`

**Priorita nízká** · 27 bodů (1.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 11 | 0 | 10 | 1 | 0 | 8 | 7 | 2 | 3 (3) | 3 |

Deklarované stavy: 1 ZDROJ 6 · CITACE 5

Další krok:

- 10 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03, CLM-04) → dohledat druhého, nezávislého vydavatele
- 3 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 20. Tünde Bartha — `tunde-bartha`

**Priorita nízká** · 17 bodů (1.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 13 | 0 | 6 | 0 | 7 | 11 | 3 | 4 | 4 (4) | 9 |

Deklarované stavy: CORROBORATED 6 · 1 ZDROJ 6 · CITACE 1

Další krok:

- 6 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-04, CLM-06) → dohledat druhého, nezávislého vydavatele
- 3 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 8 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 21. Jaroslav Faltýnek — `jaroslav-faltynek`

**Priorita nízká** · 16 bodů (1.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 13 | 0 | 6 | 1 | 6 | 16 | 7 | 2 | 2 (2) | 2 |

Deklarované stavy: CORROBORATED 6 · 1 ZDROJ 3 · CITACE 4

Další krok:

- 6 tvrzení stojí na jediném zdroji (např. CLM-06, CLM-07, CLM-08) → dohledat druhého, nezávislého vydavatele
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-13) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 9 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 22. Martin Pavlík — `martin-pavlik`

**Priorita nízká** · 14 bodů (1.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 7 | 0 | 4 | 3 | 0 | 3 | 3 | 0 | 2 (2) | 7 |

Deklarované stavy: 1 ZDROJ 7

Další krok:

- 4 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 3 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01, CLM-02, CLM-03) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá

### 23. Petr Vencálek — `petr-vencalek`

**Priorita nízká** · 3 bodů (0.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 4 | 2 | 1 | 1 (1) | 4 |

Deklarované stavy: CORROBORATED 2 · 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele
- 1 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 24. Petr Pavel — `petr-pavel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 4 | 4 | 1 | 0 (0) | 2 |

Deklarované stavy: CORROBORATED 2 · CITACE 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele

### 25. Filip Turek — `filip-turek`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 26. Petr Macinka — `petr-macinka`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

---

*Vygenerováno z kanonického modelu. Chceš jiné číslo? Změň data, ne tenhle soubor.*
