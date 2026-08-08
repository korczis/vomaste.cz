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

**Datový horizont**: `2026-08-08` — nejnovější datum v datasetu. Report neobsahuje čas
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
| Dossierů | 51 |
| Tvrzení | 1004 |
| — z toho `E0` / `E1` / `E1+` / `E2` | 0 / 560 / 93 / 351 |
| Zdrojů (z toho s vyplněnou `sourceFamily`) | 777 (408) |
| Kauz | 95 |
| Mezer celkem / otevřených / zastaralých | 208 / 205 / 0 |
| Vztahů | 341 |
| Bodů rizika celkem | 1444 |

## Pořadí dossierů

| # | Dossier | Priorita | Body | Podíl | Kumul. | Tvrzení | `E0`/`E1`/`E1+`/`E2` | Otevřené mezery | Zdroje bez rodiny | Aktualizováno |
|---:|---|---|---:|---:|---:|---:|---|---:|---:|---|
| 1 | [Andrej Babiš](../data/dossiers/andrej-babis/) `andrej-babis` | **vysoká** | 154 | 10.7 % | 10.7 % | 105 | 0/70/1/34 | 8 | 21 | 2026-08-06 |
| 2 | [Karel Havlíček](../data/dossiers/karel-havlicek/) `karel-havlicek` | **vysoká** | 99 | 6.9 % | 17.5 % | 58 | 0/39/8/11 | 12 | 26 | 2026-08-05 |
| 3 | [Jaromír Zůna](../data/dossiers/jaromir-zuna/) `jaromir-zuna` | **vysoká** | 87 | 6.0 % | 23.5 % | 58 | 0/38/2/18 | 9 | 20 | 2026-08-06 |
| 4 | [Martin Šebestyán](../data/dossiers/martin-sebestyan/) `martin-sebestyan` | **vysoká** | 80 | 5.5 % | 29.1 % | 55 | 0/33/0/22 | 14 | 20 | 2026-08-06 |
| 5 | [Ivan Bednárik](../data/dossiers/ivan-bednarik/) `ivan-bednarik` | **vysoká** | 79 | 5.5 % | 34.6 % | 48 | 0/34/1/13 | 9 | 26 | 2026-07-30 |
| 6 | [Adam Vojtěch](../data/dossiers/adam-vojtech/) `adam-vojtech` | **vysoká** | 78 | 5.4 % | 40.0 % | 55 | 0/31/1/23 | 15 | 21 | 2026-08-06 |
| 7 | [Zuzana Mrázová](../data/dossiers/zuzana-mrazova/) `zuzana-mrazova` | **vysoká** | 78 | 5.4 % | 45.4 % | 60 | 0/28/6/26 | 16 | 15 | 2026-08-05 |
| 8 | [Aleš Juchelka](../data/dossiers/ales-juchelka/) `ales-juchelka` | **vysoká** | 75 | 5.2 % | 50.6 % | 47 | 0/27/8/12 | 13 | 6 | 2026-07-30 |
| 9 | [Igor Červený](../data/dossiers/igor-cerveny/) `igor-cerveny` | **střední** | 75 | 5.2 % | 55.7 % | 59 | 0/26/9/24 | 14 | 14 | 2026-07-30 |
| 10 | [Oto Klempíř](../data/dossiers/oto-klempir/) `oto-klempir` | **střední** | 75 | 5.2 % | 60.9 % | 45 | 0/34/0/11 | 7 | 16 | 2026-08-06 |
| 11 | [Robert Plaga](../data/dossiers/robert-plaga/) `robert-plaga` | **střední** | 74 | 5.1 % | 66.1 % | 55 | 0/29/4/22 | 12 | 18 | 2026-08-06 |
| 12 | [Alena Schillerová](../data/dossiers/alena-schillerova/) `alena-schillerova` | **střední** | 70 | 4.8 % | 70.9 % | 41 | 0/28/4/9 | 8 | 15 | 2026-08-05 |
| 13 | [Petr Macinka a Filip Turek](../data/dossiers/macinka-turek/) `macinka-turek` | **střední** | 69 | 4.8 % | 75.7 % | 55 | 0/28/2/25 | 7 | 20 | 2026-07-29 |
| 14 | [Boris Šťastný](../data/dossiers/boris-stastny/) `boris-stastny` | **střední** | 64 | 4.4 % | 80.1 % | 42 | 0/21/11/10 | 10 | 8 | 2026-07-30 |
| 15 | [Jeroným Tejc](../data/dossiers/jeronym-tejc/) `jeronym-tejc` | **nízká** | 62 | 4.3 % | 84.4 % | 52 | 0/22/8/22 | 10 | 16 | 2026-08-06 |
| 16 | [Lubomír Metnar](../data/dossiers/lubomir-metnar/) `lubomir-metnar` | **nízká** | 47 | 3.3 % | 87.7 % | 31 | 0/13/6/12 | 15 | 5 | 2026-08-05 |
| 17 | [James Quick](../data/dossiers/james-quick/) `james-quick` | **nízká** | 45 | 3.1 % | 90.8 % | 23 | 0/19/1/3 | 3 | 20 | 2026-08-05 |
| 18 | [Tomio Okamura](../data/dossiers/tomio-okamura/) `tomio-okamura` | **nízká** | 43 | 3.0 % | 93.8 % | 36 | 0/9/15/12 | 8 | 10 | 2026-08-05 |
| 19 | [Richard Chlad](../data/dossiers/richard-chlad/) `richard-chlad` | **nízká** | 27 | 1.9 % | 95.6 % | 11 | 0/10/1/0 | 3 | 1 | 2026-08-05 |
| 20 | [Martin Pavlík](../data/dossiers/martin-pavlik/) `martin-pavlik` | **nízká** | 17 | 1.2 % | 96.8 % | 9 | 0/5/4/0 | 2 | 0 | 2026-08-08 |
| 21 | [Tünde Bartha](../data/dossiers/tunde-bartha/) `tunde-bartha` | **nízká** | 17 | 1.2 % | 98.0 % | 13 | 0/6/0/7 | 4 | 8 | 2026-08-01 |
| 22 | [Jaroslav Faltýnek](../data/dossiers/jaroslav-faltynek/) `jaroslav-faltynek` | **nízká** | 16 | 1.1 % | 99.1 % | 13 | 0/6/1/6 | 2 | 9 | 2026-08-05 |
| 23 | [Petr Fiala](../data/dossiers/petr-fiala/) `petr-fiala` | **nízká** | 8 | 0.6 % | 99.7 % | 3 | 0/2/0/1 | 3 | 2 | 2026-08-07 |
| 24 | [Petr Vencálek](../data/dossiers/petr-vencalek/) `petr-vencalek` | **nízká** | 3 | 0.2 % | 99.9 % | 3 | 0/1/0/2 | 1 | 2 | 2026-08-08 |
| 25 | [Petr Pavel](../data/dossiers/petr-pavel/) `petr-pavel` | **nízká** | 2 | 0.1 % | 100.0 % | 3 | 0/1/0/2 | 0 | 0 | 2026-08-01 |
| 26 | [Benjamin Činčila](../data/dossiers/benjamin-cincila/) `benjamin-cincila` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 27 | [Eva Decroix](../data/dossiers/eva-decroix/) `eva-decroix` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 28 | [Filip Turek](../data/dossiers/filip-turek/) `filip-turek` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 29 | [Ivan Bartoš](../data/dossiers/ivan-bartos/) `ivan-bartos` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 30 | [Jan Grolich](../data/dossiers/jan-grolich/) `jan-grolich` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 31 | [Jan Jakob](../data/dossiers/jan-jakob/) `jan-jakob` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 32 | [Jan Skopeček](../data/dossiers/jan-skopecek/) `jan-skopecek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 33 | [Jana Černochová](../data/dossiers/jana-cernochova/) `jana-cernochova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 34 | [Jiří Pospíšil](../data/dossiers/jiri-pospisil/) `jiri-pospisil` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-07 |
| 35 | [Karel Haas](../data/dossiers/karel-haas/) `karel-haas` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 36 | [Kateřina Stojanová](../data/dossiers/katerina-stojanova/) `katerina-stojanova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 37 | [Marek Benda](../data/dossiers/marek-benda/) `marek-benda` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 38 | [Marian Jurečka](../data/dossiers/marian-jurecka/) `marian-jurecka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 39 | [Martin Baxa](../data/dossiers/martin-baxa/) `martin-baxa` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 40 | [Martin Červíček](../data/dossiers/martin-cervicek/) `martin-cervicek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 41 | [Martin Kupka](../data/dossiers/martin-kupka/) `martin-kupka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-06 |
| 42 | [Matěj Ondřej Havel](../data/dossiers/matej-ondrej-havel/) `matej-ondrej-havel` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 43 | [Michaela Šebelová](../data/dossiers/michaela-sebelova/) `michaela-sebelova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 44 | [Olga Richterová](../data/dossiers/olga-richterova/) `olga-richterova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 45 | [Pavel Drobil](../data/dossiers/pavel-drobil/) `pavel-drobil` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 46 | [Petr Macinka](../data/dossiers/petr-macinka/) `petr-macinka` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 47 | [Petr Sokol](../data/dossiers/petr-sokol/) `petr-sokol` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 4 | 2026-08-06 |
| 48 | [Renáta Zajíčková](../data/dossiers/renata-zajickova/) `renata-zajickova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 49 | [Vít Rakušan](../data/dossiers/vit-rakusan/) `vit-rakusan` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 50 | [Vlastimil Válek](../data/dossiers/vlastimil-valek/) `vlastimil-valek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-07 |
| 51 | [Zdeněk Hřib](../data/dossiers/zdenek-hrib/) `zdenek-hrib` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |

## Plán per dossier

### 1. Andrej Babiš — `andrej-babis`

**Priorita vysoká** · 154 bodů (10.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 105 | 0 | 70 | 1 | 34 | 86 | 65 | 20 | 8 (8) | 42 |

Deklarované stavy: CORROBORATED 33 · 1 ZDROJ 48 · CITACE 24

Další krok:

- 70 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 5 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 3 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-86) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 21 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 2. Karel Havlíček — `karel-havlicek`

**Priorita vysoká** · 99 bodů (6.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 58 | 0 | 39 | 8 | 11 | 39 | 13 | 4 | 12 (12) | 22 |

Deklarované stavy: CORROBORATED 9 · 1 ZDROJ 27 · CITACE 22

Další krok:

- 39 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-07, CLM-08) → dohledat druhého, nezávislého vydavatele
- 11 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-06, CLM-12, CLM-13) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 26 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 3. Jaromír Zůna — `jaromir-zuna`

**Priorita vysoká** · 87 bodů (6.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 58 | 0 | 38 | 2 | 18 | 42 | 22 | 4 | 11 (9) | 26 |

Deklarované stavy: CORROBORATED 15 · 1 ZDROJ 16 · CITACE 27

Další krok:

- 38 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 9 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-21, CLM-29) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 4. Martin Šebestyán — `martin-sebestyan`

**Priorita vysoká** · 80 bodů (5.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 33 | 0 | 22 | 43 | 23 | 3 | 14 (14) | 6 |

Deklarované stavy: CORROBORATED 14 · 1 ZDROJ 26 · CITACE 11 · SPORNÉ 4

Další krok:

- 33 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-07) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 5. Ivan Bednárik — `ivan-bednarik`

**Priorita vysoká** · 79 bodů (5.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

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

### 6. Adam Vojtěch — `adam-vojtech`

**Priorita vysoká** · 78 bodů (5.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 31 | 1 | 23 | 47 | 26 | 3 | 15 (15) | 6 |

Deklarované stavy: CORROBORATED 22 · 1 ZDROJ 24 · CITACE 9

Další krok:

- 31 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-09, CLM-10) → dohledat druhého, nezávislého vydavatele
- 15 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-28) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 21 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 7. Zuzana Mrázová — `zuzana-mrazova`

**Priorita vysoká** · 78 bodů (5.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 60 | 0 | 28 | 6 | 26 | 34 | 19 | 4 | 16 (16) | 8 |

Deklarované stavy: CORROBORATED 23 · 1 ZDROJ 31 · CITACE 6

Další krok:

- 28 tvrzení stojí na jediném zdroji (např. CLM-11, CLM-14, CLM-15) → dohledat druhého, nezávislého vydavatele
- 16 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 6 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-20, CLM-27, CLM-28) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 15 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 8. Aleš Juchelka — `ales-juchelka`

**Priorita vysoká** · 75 bodů (5.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 47 | 0 | 27 | 8 | 12 | 20 | 14 | 5 | 13 (13) | 14 |

Deklarované stavy: CORROBORATED 12 · 1 ZDROJ 21 · CITACE 14

Další krok:

- 27 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 13 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-10, CLM-17, CLM-23) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 6 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 9. Igor Červený — `igor-cerveny`

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

### 10. Oto Klempíř — `oto-klempir`

**Priorita střední** · 75 bodů (5.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 45 | 0 | 34 | 0 | 11 | 35 | 19 | 5 | 7 (7) | 11 |

Deklarované stavy: CORROBORATED 10 · 1 ZDROJ 18 · CITACE 17

Další krok:

- 34 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 7 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 16 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 11. Robert Plaga — `robert-plaga`

**Priorita střední** · 74 bodů (5.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 29 | 4 | 22 | 37 | 19 | 3 | 12 (12) | 7 |

Deklarované stavy: CORROBORATED 20 · 1 ZDROJ 22 · CITACE 12 · SPORNÉ 1

Další krok:

- 29 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-09, CLM-10) → dohledat druhého, nezávislého vydavatele
- 12 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 4 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-22, CLM-23, CLM-25) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 18 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

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

**Priorita nízká** · 47 bodů (3.3 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 31 | 0 | 13 | 6 | 12 | 13 | 8 | 4 | 15 (15) | 8 |

Deklarované stavy: CORROBORATED 9 · 1 ZDROJ 9 · CITACE 11 · SPORNÉ 2

Další krok:

- 13 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 15 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 6 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-05, CLM-14, CLM-18) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 5 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 17. James Quick — `james-quick`

**Priorita nízká** · 45 bodů (3.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 23 | 0 | 19 | 1 | 3 | 23 | 3 | 5 | 3 (3) | 10 |

Deklarované stavy: CORROBORATED 3 · 1 ZDROJ 19 · CITACE 1

Další krok:

- 19 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-03, CLM-04) → dohledat druhého, nezávislého vydavatele
- 3 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-02) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 18. Tomio Okamura — `tomio-okamura`

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

### 20. Martin Pavlík — `martin-pavlik`

**Priorita nízká** · 17 bodů (1.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `2026-08-08`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 9 | 0 | 5 | 4 | 0 | 5 | 5 | 0 | 3 (2) | 14 |

Deklarované stavy: 1 ZDROJ 9

Další krok:

- 5 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 4 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01, CLM-02, CLM-03) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá

### 21. Tünde Bartha — `tunde-bartha`

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

### 22. Jaroslav Faltýnek — `jaroslav-faltynek`

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

### 23. Petr Fiala — `petr-fiala`

**Priorita nízká** · 8 bodů (0.6 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 2 | 0 | 1 | 4 | 2 | 0 | 3 (3) | 0 |

Deklarované stavy: CORROBORATED 1 · 1 ZDROJ 1 · NÁZOR 1

Další krok:

- 2 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03) → dohledat druhého, nezávislého vydavatele
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 2 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 24. Petr Vencálek — `petr-vencalek`

**Priorita nízká** · 3 bodů (0.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `2026-08-08`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 5 | 3 | 1 | 1 (1) | 4 |

Deklarované stavy: CORROBORATED 2 · 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele
- 1 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 25. Petr Pavel — `petr-pavel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 4 | 4 | 1 | 0 (0) | 2 |

Deklarované stavy: CORROBORATED 2 · CITACE 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele

### 26. Benjamin Činčila — `benjamin-cincila`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 27. Eva Decroix — `eva-decroix`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 28. Filip Turek — `filip-turek`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 29. Ivan Bartoš — `ivan-bartos`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 30. Jan Grolich — `jan-grolich`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 31. Jan Jakob — `jan-jakob`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 32. Jan Skopeček — `jan-skopecek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 33. Jana Černochová — `jana-cernochova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 34. Jiří Pospíšil — `jiri-pospisil`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 35. Karel Haas — `karel-haas`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 36. Kateřina Stojanová — `katerina-stojanova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 37. Marek Benda — `marek-benda`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 38. Marian Jurečka — `marian-jurecka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 39. Martin Baxa — `martin-baxa`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 40. Martin Červíček — `martin-cervicek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 41. Martin Kupka — `martin-kupka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 42. Matěj Ondřej Havel — `matej-ondrej-havel`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 43. Michaela Šebelová — `michaela-sebelova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 44. Olga Richterová — `olga-richterova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 45. Pavel Drobil — `pavel-drobil`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 46. Petr Macinka — `petr-macinka`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 47. Petr Sokol — `petr-sokol`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 4 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 4 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 48. Renáta Zajíčková — `renata-zajickova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 49. Vít Rakušan — `vit-rakusan`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 50. Vlastimil Válek — `vlastimil-valek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 51. Zdeněk Hřib — `zdenek-hrib`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

---

*Vygenerováno z kanonického modelu. Chceš jiné číslo? Změň data, ne tenhle soubor.*
