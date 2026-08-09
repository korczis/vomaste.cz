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

**Datový horizont**: `2026-08-09` — nejnovější datum v datasetu. Report neobsahuje čas
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
| Dossierů | 217 |
| Tvrzení | 1183 |
| — z toho `E0` / `E1` / `E1+` / `E2` | 0 / 673 / 99 / 411 |
| Zdrojů (z toho s vyplněnou `sourceFamily`) | 1018 (450) |
| Kauz | 95 |
| Mezer celkem / otevřených / zastaralých | 208 / 205 / 0 |
| Vztahů | 341 |
| Bodů rizika celkem | 1676 |

## Pořadí dossierů

| # | Dossier | Priorita | Body | Podíl | Kumul. | Tvrzení | `E0`/`E1`/`E1+`/`E2` | Otevřené mezery | Zdroje bez rodiny | Aktualizováno |
|---:|---|---|---:|---:|---:|---:|---|---:|---:|---|
| 1 | [Andrej Babiš](../data/dossiers/andrej-babis/) `andrej-babis` | **vysoká** | 148 | 8.8 % | 8.8 % | 105 | 0/67/1/37 | 8 | 22 | 2026-08-06 |
| 2 | [Karel Havlíček](../data/dossiers/karel-havlicek/) `karel-havlicek` | **vysoká** | 95 | 5.7 % | 14.5 % | 58 | 0/37/8/13 | 12 | 28 | 2026-08-05 |
| 3 | [Jaromír Zůna](../data/dossiers/jaromir-zuna/) `jaromir-zuna` | **vysoká** | 83 | 5.0 % | 19.5 % | 58 | 0/36/2/20 | 9 | 22 | 2026-08-06 |
| 4 | [Martin Šebestyán](../data/dossiers/martin-sebestyan/) `martin-sebestyan` | **vysoká** | 78 | 4.7 % | 24.1 % | 55 | 0/32/0/23 | 14 | 20 | 2026-08-06 |
| 5 | [Zuzana Mrázová](../data/dossiers/zuzana-mrazova/) `zuzana-mrazova` | **vysoká** | 78 | 4.7 % | 28.8 % | 60 | 0/28/6/26 | 16 | 15 | 2026-08-05 |
| 6 | [Ivan Bednárik](../data/dossiers/ivan-bednarik/) `ivan-bednarik` | **vysoká** | 77 | 4.6 % | 33.4 % | 48 | 0/33/1/14 | 9 | 27 | 2026-07-30 |
| 7 | [Aleš Juchelka](../data/dossiers/ales-juchelka/) `ales-juchelka` | **vysoká** | 75 | 4.5 % | 37.8 % | 47 | 0/27/8/12 | 13 | 6 | 2026-07-30 |
| 8 | [Igor Červený](../data/dossiers/igor-cerveny/) `igor-cerveny` | **vysoká** | 75 | 4.5 % | 42.3 % | 59 | 0/26/9/24 | 14 | 14 | 2026-07-30 |
| 9 | [Adam Vojtěch](../data/dossiers/adam-vojtech/) `adam-vojtech` | **vysoká** | 74 | 4.4 % | 46.7 % | 55 | 0/29/1/25 | 15 | 22 | 2026-08-06 |
| 10 | [Robert Plaga](../data/dossiers/robert-plaga/) `robert-plaga` | **vysoká** | 74 | 4.4 % | 51.1 % | 55 | 0/29/4/22 | 12 | 18 | 2026-08-06 |
| 11 | [Oto Klempíř](../data/dossiers/oto-klempir/) `oto-klempir` | **střední** | 73 | 4.4 % | 55.5 % | 45 | 0/33/0/12 | 7 | 16 | 2026-08-06 |
| 12 | [Alena Schillerová](../data/dossiers/alena-schillerova/) `alena-schillerova` | **střední** | 70 | 4.2 % | 59.7 % | 41 | 0/28/4/9 | 8 | 15 | 2026-08-05 |
| 13 | [Petr Macinka a Filip Turek](../data/dossiers/macinka-turek/) `macinka-turek` | **střední** | 69 | 4.1 % | 63.8 % | 55 | 0/28/2/25 | 7 | 20 | 2026-07-29 |
| 14 | [Boris Šťastný](../data/dossiers/boris-stastny/) `boris-stastny` | **střední** | 64 | 3.8 % | 67.6 % | 42 | 0/21/11/10 | 10 | 8 | 2026-07-30 |
| 15 | [Jeroným Tejc](../data/dossiers/jeronym-tejc/) `jeronym-tejc` | **střední** | 62 | 3.7 % | 71.3 % | 52 | 0/22/8/22 | 10 | 16 | 2026-08-06 |
| 16 | [Lubomír Metnar](../data/dossiers/lubomir-metnar/) `lubomir-metnar` | **střední** | 47 | 2.8 % | 74.1 % | 31 | 0/13/6/12 | 15 | 5 | 2026-08-05 |
| 17 | [James Quick](../data/dossiers/james-quick/) `james-quick` | **střední** | 45 | 2.7 % | 76.8 % | 23 | 0/19/1/3 | 3 | 20 | 2026-08-05 |
| 18 | [Tomio Okamura](../data/dossiers/tomio-okamura/) `tomio-okamura` | **střední** | 43 | 2.6 % | 79.4 % | 36 | 0/9/15/12 | 8 | 10 | 2026-08-05 |
| 19 | [Richard Chlad](../data/dossiers/richard-chlad/) `richard-chlad` | **střední** | 27 | 1.6 % | 81.0 % | 11 | 0/10/1/0 | 3 | 1 | 2026-08-05 |
| 20 | [Martin Pavlík](../data/dossiers/martin-pavlik/) `martin-pavlik` | **nízká** | 17 | 1.0 % | 82.0 % | 9 | 0/5/4/0 | 2 | 0 | 2026-08-08 |
| 21 | [Tünde Bartha](../data/dossiers/tunde-bartha/) `tunde-bartha` | **nízká** | 17 | 1.0 % | 83.0 % | 13 | 0/6/0/7 | 4 | 8 | 2026-08-01 |
| 22 | [Jaroslav Faltýnek](../data/dossiers/jaroslav-faltynek/) `jaroslav-faltynek` | **nízká** | 16 | 1.0 % | 83.9 % | 13 | 0/6/1/6 | 2 | 9 | 2026-08-05 |
| 23 | [Petr Fiala](../data/dossiers/petr-fiala/) `petr-fiala` | **nízká** | 8 | 0.5 % | 84.4 % | 3 | 0/2/0/1 | 3 | 2 | 2026-08-07 |
| 24 | [Bert Bartas](../data/dossiers/bert-bartas/) `bert-bartas` | **nízká** | 6 | 0.4 % | 84.8 % | 3 | 0/3/0/0 | 0 | 0 | 2026-08-09 |
| 25 | [Ivana Solařová](../data/dossiers/ivana-solarova/) `ivana-solarova` | **nízká** | 6 | 0.4 % | 85.1 % | 3 | 0/3/0/0 | 0 | 0 | 2026-08-09 |
| 26 | [František Koudela](../data/dossiers/frantisek-koudela/) `frantisek-koudela` | **nízká** | 4 | 0.2 % | 85.4 % | 3 | 0/2/0/1 | 0 | 0 | 2026-08-09 |
| 27 | [Jan Šťastník](../data/dossiers/jan-stastnik/) `jan-stastnik` | **nízká** | 4 | 0.2 % | 85.6 % | 2 | 0/2/0/0 | 0 | 0 | 2026-08-09 |
| 28 | [Petr Vencálek](../data/dossiers/petr-vencalek/) `petr-vencalek` | **nízká** | 3 | 0.2 % | 85.8 % | 3 | 0/1/0/2 | 1 | 2 | 2026-08-08 |
| 29 | [Alena Hanáková](../data/dossiers/alena-hanakova/) `alena-hanakova` | **nízká** | 2 | 0.1 % | 85.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 30 | [Aleš Řebíček](../data/dossiers/ales-rebicek/) `ales-rebicek` | **nízká** | 2 | 0.1 % | 86.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 31 | [Alexandr Vondra (ministr obrany)](../data/dossiers/alexandr-vondra-ministr/) `alexandr-vondra-ministr` | **nízká** | 2 | 0.1 % | 86.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 32 | [Antonín Prachař](../data/dossiers/antonin-prachar/) `antonin-prachar` | **nízká** | 2 | 0.1 % | 86.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 33 | [Bohumila Beranová](../data/dossiers/bohumila-beranova/) `bohumila-beranova` | **nízká** | 2 | 0.1 % | 86.4 % | 2 | 0/1/0/1 | 0 | 0 | 2026-08-09 |
| 34 | [Cyril Svoboda](../data/dossiers/cyril-svoboda/) `cyril-svoboda` | **nízká** | 2 | 0.1 % | 86.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 35 | [Dalibor Štys](../data/dossiers/dalibor-stys/) `dalibor-stys` | **nízká** | 2 | 0.1 % | 86.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 36 | [Dana Bérová](../data/dossiers/dana-berova/) `dana-berova` | **nízká** | 2 | 0.1 % | 86.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 37 | [Dana Jurásková](../data/dossiers/dana-juraskova/) `dana-juraskova` | **nízká** | 2 | 0.1 % | 86.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 38 | [Dana Kuchtová](../data/dossiers/dana-kuchtova/) `dana-kuchtova` | **nízká** | 2 | 0.1 % | 87.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 39 | [Daniel Herman](../data/dossiers/daniel-herman/) `daniel-herman` | **nízká** | 2 | 0.1 % | 87.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 40 | [Daniela Filipiová](../data/dossiers/daniela-filipiova/) `daniela-filipiova` | **nízká** | 2 | 0.1 % | 87.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 41 | [Daniela Kovářová](../data/dossiers/daniela-kovarova/) `daniela-kovarova` | **nízká** | 2 | 0.1 % | 87.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 42 | [David Rath](../data/dossiers/david-rath/) `david-rath` | **nízká** | 2 | 0.1 % | 87.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 43 | [Džamila Stehlíková](../data/dossiers/dzamila-stehlikova/) `dzamila-stehlikova` | **nízká** | 2 | 0.1 % | 87.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 44 | [František Bublan](../data/dossiers/frantisek-bublan/) `frantisek-bublan` | **nízká** | 2 | 0.1 % | 87.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 45 | [František Koníček](../data/dossiers/frantisek-konicek/) `frantisek-konicek` | **nízká** | 2 | 0.1 % | 87.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 46 | [Gustáv Slamečka](../data/dossiers/gustav-slamecka/) `gustav-slamecka` | **nízká** | 2 | 0.1 % | 87.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 47 | [Helena Třeštíková](../data/dossiers/helena-trestikova/) `helena-trestikova` | **nízká** | 2 | 0.1 % | 88.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 48 | [Helena Válková](../data/dossiers/helena-valkova/) `helena-valkova` | **nízká** | 2 | 0.1 % | 88.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 49 | [Ilja Šmíd](../data/dossiers/ilja-smid/) `ilja-smid` | **nízká** | 2 | 0.1 % | 88.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 50 | [Ivan Fuksa](../data/dossiers/ivan-fuksa/) `ivan-fuksa` | **nízká** | 2 | 0.1 % | 88.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 51 | [Ivan Langer](../data/dossiers/ivan-langer/) `ivan-langer` | **nízká** | 2 | 0.1 % | 88.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 52 | [Ivan Pilný](../data/dossiers/ivan-pilny/) `ivan-pilny` | **nízká** | 2 | 0.1 % | 88.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 53 | [Jakub Malačka](../data/dossiers/jakub-malacka/) `jakub-malacka` | **nízká** | 2 | 0.1 % | 88.8 % | 2 | 0/1/0/1 | 0 | 0 | 2026-08-09 |
| 54 | [Jakub Šebesta](../data/dossiers/jakub-sebesta/) `jakub-sebesta` | **nízká** | 2 | 0.1 % | 88.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 55 | [Jan Blaha](../data/dossiers/jan-blaha/) `jan-blaha` | **nízká** | 2 | 0.1 % | 89.0 % | 1 | 0/1/0/0 | 0 | 0 | 2026-08-09 |
| 56 | [Jan Chvojka](../data/dossiers/jan-chvojka/) `jan-chvojka` | **nízká** | 2 | 0.1 % | 89.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 57 | [Jan Dusík](../data/dossiers/jan-dusik/) `jan-dusik` | **nízká** | 2 | 0.1 % | 89.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 58 | [Jan Fischer](../data/dossiers/jan-fischer/) `jan-fischer` | **nízká** | 2 | 0.1 % | 89.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 59 | [Jan Kohout](../data/dossiers/jan-kohout/) `jan-kohout` | **nízká** | 2 | 0.1 % | 89.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 60 | [Jan Kubice](../data/dossiers/jan-kubice/) `jan-kubice` | **nízká** | 2 | 0.1 % | 89.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 61 | [Jan Mládek](../data/dossiers/jan-mladek/) `jan-mladek` | **nízká** | 2 | 0.1 % | 89.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 62 | [Jaromír Drábek](../data/dossiers/jaromir-drabek/) `jaromir-drabek` | **nízká** | 2 | 0.1 % | 89.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 63 | [Jaroslav Palas](../data/dossiers/jaroslav-palas/) `jaroslav-palas` | **nízká** | 2 | 0.1 % | 90.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 64 | [Jaroslav Tvrdík](../data/dossiers/jaroslav-tvrdik/) `jaroslav-tvrdik` | **nízká** | 2 | 0.1 % | 90.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 65 | [Jaroslava Němcová](../data/dossiers/jaroslava-nemcova/) `jaroslava-nemcova` | **nízká** | 2 | 0.1 % | 90.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 66 | [Jiří Balvín](../data/dossiers/jiri-balvin/) `jiri-balvin` | **nízká** | 2 | 0.1 % | 90.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 67 | [Jiří Beroun](../data/dossiers/jiri-beroun/) `jiri-beroun` | **nízká** | 2 | 0.1 % | 90.5 % | 1 | 0/1/0/0 | 0 | 0 | 2026-08-09 |
| 68 | [Jiří Besser](../data/dossiers/jiri-besser/) `jiri-besser` | **nízká** | 2 | 0.1 % | 90.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 69 | [Jiří Čunek](../data/dossiers/jiri-cunek/) `jiri-cunek` | **nízká** | 2 | 0.1 % | 90.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 70 | [Jiří Dienstbier ml.](../data/dossiers/jiri-dienstbier-ml/) `jiri-dienstbier-ml` | **nízká** | 2 | 0.1 % | 90.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 71 | [Jiří Havlíček](../data/dossiers/jiri-havlicek/) `jiri-havlicek` | **nízká** | 2 | 0.1 % | 90.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 72 | [Jiří Milek](../data/dossiers/jiri-milek/) `jiri-milek` | **nízká** | 2 | 0.1 % | 91.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 73 | [Jiří Paroubek](../data/dossiers/jiri-paroubek/) `jiri-paroubek` | **nízká** | 2 | 0.1 % | 91.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 74 | [Jiří Rusnok](../data/dossiers/jiri-rusnok/) `jiri-rusnok` | **nízká** | 2 | 0.1 % | 91.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 75 | [Jiří Šedivý](../data/dossiers/jiri-sedivy-ministr/) `jiri-sedivy-ministr` | **nízká** | 2 | 0.1 % | 91.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 76 | [Josef Dobeš](../data/dossiers/josef-dobes/) `josef-dobes` | **nízká** | 2 | 0.1 % | 91.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 77 | [Jozef Kubinyi](../data/dossiers/jozef-kubinyi/) `jozef-kubinyi` | **nízká** | 2 | 0.1 % | 91.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 78 | [Juraj Chmiel](../data/dossiers/juraj-chmiel/) `juraj-chmiel` | **nízká** | 2 | 0.1 % | 91.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 79 | [Kamil Jankovský](../data/dossiers/kamil-jankovsky/) `kamil-jankovsky` | **nízká** | 2 | 0.1 % | 91.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 80 | [Karel Blahůšek](../data/dossiers/karel-blahusek/) `karel-blahusek` | **nízká** | 2 | 0.1 % | 92.0 % | 1 | 0/1/0/0 | 0 | 0 | 2026-08-09 |
| 81 | [Karel Kühnl](../data/dossiers/karel-kuhnl/) `karel-kuhnl` | **nízká** | 2 | 0.1 % | 92.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 82 | [Karel Schwarzenberg](../data/dossiers/karel-schwarzenberg/) `karel-schwarzenberg` | **nízká** | 2 | 0.1 % | 92.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 83 | [Karla Šlechtová](../data/dossiers/karla-slechtova/) `karla-slechtova` | **nízká** | 2 | 0.1 % | 92.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 84 | [Karolína Peake](../data/dossiers/karolina-peake/) `karolina-peake` | **nízká** | 2 | 0.1 % | 92.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 85 | [Ladislav Miko](../data/dossiers/ladislav-miko/) `ladislav-miko` | **nízká** | 2 | 0.1 % | 92.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 86 | [Leoš Heger](../data/dossiers/leos-heger/) `leos-heger` | **nízká** | 2 | 0.1 % | 92.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 87 | [Libor Ambrozek](../data/dossiers/libor-ambrozek/) `libor-ambrozek` | **nízká** | 2 | 0.1 % | 92.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 88 | [Ludmila Müllerová](../data/dossiers/ludmila-mullerova/) `ludmila-mullerova` | **nízká** | 2 | 0.1 % | 93.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 89 | [Lukáš David](../data/dossiers/lukas-david/) `lukas-david` | **nízká** | 2 | 0.1 % | 93.1 % | 1 | 0/1/0/0 | 0 | 0 | 2026-08-09 |
| 90 | [Marcel Chládek](../data/dossiers/marcel-chladek/) `marcel-chladek` | **nízká** | 2 | 0.1 % | 93.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 91 | [Marie Součková](../data/dossiers/marie-souckova/) `marie-souckova` | **nízká** | 2 | 0.1 % | 93.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 92 | [Martin Barták](../data/dossiers/martin-bartak/) `martin-bartak` | **nízká** | 2 | 0.1 % | 93.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 93 | [Martin Bursík](../data/dossiers/martin-bursik/) `martin-bursik` | **nízká** | 2 | 0.1 % | 93.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 94 | [Martin Dvořák](../data/dossiers/martin-dvorak/) `martin-dvorak` | **nízká** | 2 | 0.1 % | 93.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 95 | [Martin Holcát](../data/dossiers/martin-holcat/) `martin-holcat` | **nízká** | 2 | 0.1 % | 93.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 96 | [Martin Jahn](../data/dossiers/martin-jahn/) `martin-jahn` | **nízká** | 2 | 0.1 % | 93.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 97 | [Martin Kuba](../data/dossiers/martin-kuba/) `martin-kuba` | **nízká** | 2 | 0.1 % | 94.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 98 | [Martin Pecina](../data/dossiers/martin-pecina/) `martin-pecina` | **nízká** | 2 | 0.1 % | 94.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 99 | [Martin Říman](../data/dossiers/martin-riman/) `martin-riman` | **nízká** | 2 | 0.1 % | 94.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 100 | [Michaela Marksová](../data/dossiers/michaela-marksova/) `michaela-marksova` | **nízká** | 2 | 0.1 % | 94.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 101 | [Milan Chovanec](../data/dossiers/milan-chovanec/) `milan-chovanec` | **nízká** | 2 | 0.1 % | 94.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 102 | [Milan Šimonovský](../data/dossiers/milan-simonovsky/) `milan-simonovsky` | **nízká** | 2 | 0.1 % | 94.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 103 | [Milan Urban](../data/dossiers/milan-urban/) `milan-urban` | **nízká** | 2 | 0.1 % | 94.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 104 | [Milena Vicenová](../data/dossiers/milena-vicenova/) `milena-vicenova` | **nízká** | 2 | 0.1 % | 94.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 105 | [Miloš Zeman](../data/dossiers/milos-zeman/) `milos-zeman` | **nízká** | 2 | 0.1 % | 95.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 106 | [Miloslav Ludvík](../data/dossiers/miloslav-ludvik/) `miloslav-ludvik` | **nízká** | 2 | 0.1 % | 95.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 107 | [Mirek Topolánek](../data/dossiers/mirek-topolanek/) `mirek-topolanek` | **nízká** | 2 | 0.1 % | 95.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 108 | [Miroslav Kalousek](../data/dossiers/miroslav-kalousek/) `miroslav-kalousek` | **nízká** | 2 | 0.1 % | 95.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 109 | [Miroslav Kostelka](../data/dossiers/miroslav-kostelka/) `miroslav-kostelka` | **nízká** | 2 | 0.1 % | 95.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 110 | [Miroslav Toman](../data/dossiers/miroslav-toman/) `miroslav-toman` | **nízká** | 2 | 0.1 % | 95.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 111 | [Miroslava Kopicová](../data/dossiers/miroslava-kopicova/) `miroslava-kopicova` | **nízká** | 2 | 0.1 % | 95.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 112 | [Ondřej Liška](../data/dossiers/ondrej-liska/) `ondrej-liska` | **nízká** | 2 | 0.1 % | 95.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 113 | [Pavel Bělobrádek](../data/dossiers/pavel-belobradek/) `pavel-belobradek` | **nízká** | 2 | 0.1 % | 95.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 114 | [Pavel Dobeš](../data/dossiers/pavel-dobes/) `pavel-dobes` | **nízká** | 2 | 0.1 % | 96.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 115 | [Pavel Němec](../data/dossiers/pavel-nemec/) `pavel-nemec` | **nízká** | 2 | 0.1 % | 96.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 116 | [Pavel Svoboda](../data/dossiers/pavel-svoboda-ministr/) `pavel-svoboda-ministr` | **nízká** | 2 | 0.1 % | 96.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 117 | [Pavel Zářecký](../data/dossiers/pavel-zarecky/) `pavel-zarecky` | **nízká** | 2 | 0.1 % | 96.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 118 | [Petr Bendl](../data/dossiers/petr-bendl-ministr/) `petr-bendl-ministr` | **nízká** | 2 | 0.1 % | 96.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 119 | [Petr Gandalovič](../data/dossiers/petr-gandalovic/) `petr-gandalovic` | **nízká** | 2 | 0.1 % | 96.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 120 | [Petr Kalaš](../data/dossiers/petr-kalas/) `petr-kalas` | **nízká** | 2 | 0.1 % | 96.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 121 | [Petr Mareš](../data/dossiers/petr-mares/) `petr-mares` | **nízká** | 2 | 0.1 % | 96.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 122 | [Petr Nečas](../data/dossiers/petr-necas/) `petr-necas` | **nízká** | 2 | 0.1 % | 97.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 123 | [Petr Pavel](../data/dossiers/petr-pavel/) `petr-pavel` | **nízká** | 2 | 0.1 % | 97.1 % | 3 | 0/1/0/2 | 0 | 0 | 2026-08-01 |
| 124 | [Petr Šimerka](../data/dossiers/petr-simerka/) `petr-simerka` | **nízká** | 2 | 0.1 % | 97.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 125 | [Petr Zgarba](../data/dossiers/petr-zgarba/) `petr-zgarba` | **nízká** | 2 | 0.1 % | 97.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 126 | [Petra Buzková](../data/dossiers/petra-buzkova/) `petra-buzkova` | **nízká** | 2 | 0.1 % | 97.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 127 | [Radek John](../data/dossiers/radek-john/) `radek-john` | **nízká** | 2 | 0.1 % | 97.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 128 | [Radko Martínek](../data/dossiers/radko-martinek/) `radko-martinek` | **nízká** | 2 | 0.1 % | 97.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 129 | [Rut Bízková](../data/dossiers/rut-bizkova/) `rut-bizkova` | **nízká** | 2 | 0.1 % | 97.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 130 | [Stanislav Štech](../data/dossiers/stanislav-stech/) `stanislav-stech` | **nízká** | 2 | 0.1 % | 98.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 131 | [Štefan Füle](../data/dossiers/stefan-fule/) `stefan-fule` | **nízká** | 2 | 0.1 % | 98.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 132 | [Svatopluk Němeček](../data/dossiers/svatopluk-nemecek/) `svatopluk-nemecek` | **nízká** | 2 | 0.1 % | 98.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 133 | [Tomáš Chalupa](../data/dossiers/tomas-chalupa/) `tomas-chalupa` | **nízká** | 2 | 0.1 % | 98.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 134 | [Tomáš Hüner](../data/dossiers/tomas-huner/) `tomas-huner` | **nízká** | 2 | 0.1 % | 98.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 135 | [Tomáš Julínek](../data/dossiers/tomas-julinek/) `tomas-julinek` | **nízká** | 2 | 0.1 % | 98.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 136 | [Václav Jehlička](../data/dossiers/vaclav-jehlicka/) `vaclav-jehlicka` | **nízká** | 2 | 0.1 % | 98.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 137 | [Vít Rakušan](../data/dossiers/vit-rakusan/) `vit-rakusan` | **nízká** | 2 | 0.1 % | 98.8 % | 3 | 0/1/0/2 | 0 | 1 | 2026-08-08 |
| 138 | [Vítězslav Jandák](../data/dossiers/vitezslav-jandak/) `vitezslav-jandak` | **nízká** | 2 | 0.1 % | 98.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 139 | [Vladimír Špidla](../data/dossiers/vladimir-spidla/) `vladimir-spidla` | **nízká** | 2 | 0.1 % | 99.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 140 | [Vladimír Tošovský](../data/dossiers/vladimir-tosovsky/) `vladimir-tosovsky` | **nízká** | 2 | 0.1 % | 99.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 141 | [Vlasta Parkanová](../data/dossiers/vlasta-parkanova/) `vlasta-parkanova` | **nízká** | 2 | 0.1 % | 99.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 142 | [Vlastimil Tlustý](../data/dossiers/vlastimil-tlusty/) `vlastimil-tlusty` | **nízká** | 2 | 0.1 % | 99.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 143 | [Zdeněk Škromach](../data/dossiers/zdenek-skromach/) `zdenek-skromach` | **nízká** | 2 | 0.1 % | 99.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 144 | [Zdeněk Žák](../data/dossiers/zdenek-zak/) `zdenek-zak` | **nízká** | 2 | 0.1 % | 99.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 145 | [Jaroslav Bureš](../data/dossiers/jaroslav-bures/) `jaroslav-bures` | **nízká** | 1 | 0.1 % | 99.7 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 146 | [Kateřina Valachová](../data/dossiers/katerina-valachova/) `katerina-valachova` | **nízká** | 1 | 0.1 % | 99.8 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 147 | [Michael Kocáb](../data/dossiers/michael-kocab/) `michael-kocab` | **nízká** | 1 | 0.1 % | 99.8 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 148 | [Milada Emmerová](../data/dossiers/milada-emmerova/) `milada-emmerova` | **nízká** | 1 | 0.1 % | 99.9 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 149 | [Pavel Rychetský](../data/dossiers/pavel-rychetsky/) `pavel-rychetsky` | **nízká** | 1 | 0.1 % | 99.9 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 150 | [Vladimír Mlynář](../data/dossiers/vladimir-mlynar/) `vladimir-mlynar` | **nízká** | 1 | 0.1 % | 100.0 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 151 | [Alena Paulenková](../data/dossiers/alena-paulenkova/) `alena-paulenkova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 0 | 2026-08-09 |
| 152 | [Anna Hubáčková](../data/dossiers/anna-hubackova/) `anna-hubackova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 153 | [Antonín Staněk](../data/dossiers/antonin-stanek/) `antonin-stanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 154 | [Benjamin Činčila](../data/dossiers/benjamin-cincila/) `benjamin-cincila` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 155 | [Blanka Dufková](../data/dossiers/blanka-dufkova/) `blanka-dufkova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 0 | 2026-08-09 |
| 156 | [Bohuslav Sobotka](../data/dossiers/bohuslav-sobotka/) `bohuslav-sobotka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 157 | [Dan Ťok](../data/dossiers/dan-tok/) `dan-tok` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 158 | [Eva Decroix](../data/dossiers/eva-decroix/) `eva-decroix` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 159 | [Filip Turek](../data/dossiers/filip-turek/) `filip-turek` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 160 | [Helena Langšádlová](../data/dossiers/helena-langsadlova/) `helena-langsadlova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 161 | [Ivan Bartoš](../data/dossiers/ivan-bartos/) `ivan-bartos` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 162 | [Jakub Kulhánek](../data/dossiers/jakub-kulhanek/) `jakub-kulhanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 163 | [Jan Blatný](../data/dossiers/jan-blatny/) `jan-blatny` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 164 | [Jan Grolich](../data/dossiers/jan-grolich/) `jan-grolich` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 165 | [Jan Hamáček](../data/dossiers/jan-hamacek/) `jan-hamacek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 166 | [Jan Jakob](../data/dossiers/jan-jakob/) `jan-jakob` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 167 | [Jan Kněžínek](../data/dossiers/jan-knezinek/) `jan-knezinek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 168 | [Jan Lipavský](../data/dossiers/jan-lipavsky/) `jan-lipavsky` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 169 | [Jan Skopeček](../data/dossiers/jan-skopecek/) `jan-skopecek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 170 | [Jana Černochová](../data/dossiers/jana-cernochova/) `jana-cernochova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 171 | [Jana Maláčová](../data/dossiers/jana-malacova/) `jana-malacova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 172 | [Jiří Kacetl](../data/dossiers/jiri-kacetl/) `jiri-kacetl` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 0 | 2026-08-09 |
| 173 | [Jiří Pospíšil](../data/dossiers/jiri-pospisil/) `jiri-pospisil` | **žádná** | 0 | 0.0 % | 100.0 % | 2 | 0/0/0/2 | 0 | 3 | 2026-08-09 |
| 174 | [Jozef Síkela](../data/dossiers/jozef-sikela/) `jozef-sikela` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 175 | [Karel Haas](../data/dossiers/karel-haas/) `karel-haas` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 176 | [Kateřina Stojanová](../data/dossiers/katerina-stojanova/) `katerina-stojanova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 177 | [Klára Dostálová](../data/dossiers/klara-dostalova/) `klara-dostalova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 178 | [Lubomír Zaorálek](../data/dossiers/lubomir-zaoralek/) `lubomir-zaoralek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 179 | [Lukáš Vlček](../data/dossiers/lukas-vlcek/) `lukas-vlcek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 180 | [Marek Benda](../data/dossiers/marek-benda/) `marek-benda` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 181 | [Marek Výborný](../data/dossiers/marek-vyborny/) `marek-vyborny` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 182 | [Marek Ženíšek](../data/dossiers/marek-zenisek/) `marek-zenisek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 183 | [Marian Jurečka](../data/dossiers/marian-jurecka/) `marian-jurecka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 184 | [Marta Nováková](../data/dossiers/marta-novakova/) `marta-novakova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 185 | [Martin Baxa](../data/dossiers/martin-baxa/) `martin-baxa` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 186 | [Martin Červíček](../data/dossiers/martin-cervicek/) `martin-cervicek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 187 | [Martin Kupka](../data/dossiers/martin-kupka/) `martin-kupka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-06 |
| 188 | [Martin Stropnický](../data/dossiers/martin-stropnicky/) `martin-stropnicky` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 189 | [Matěj Ondřej Havel](../data/dossiers/matej-ondrej-havel/) `matej-ondrej-havel` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 190 | [Michaela Šebelová](../data/dossiers/michaela-sebelova/) `michaela-sebelova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 191 | [Michal Šalomoun](../data/dossiers/michal-salomoun/) `michal-salomoun` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 192 | [Mikuláš Bek](../data/dossiers/mikulas-bek/) `mikulas-bek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 193 | [Olga Richterová](../data/dossiers/olga-richterova/) `olga-richterova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 194 | [Pavel Blažek](../data/dossiers/pavel-blazek/) `pavel-blazek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 195 | [Pavel Drobil](../data/dossiers/pavel-drobil/) `pavel-drobil` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 196 | [Pavel Jajtner](../data/dossiers/pavel-jajtner/) `pavel-jajtner` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 0 | 2026-08-09 |
| 197 | [Petr Arenberger](../data/dossiers/petr-arenberger/) `petr-arenberger` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 198 | [Petr Gazdík](../data/dossiers/petr-gazdik/) `petr-gazdik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 199 | [Petr Hladík](../data/dossiers/petr-hladik/) `petr-hladik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 200 | [Petr Krčál](../data/dossiers/petr-krcal/) `petr-krcal` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 201 | [Petr Kulhánek](../data/dossiers/petr-kulhanek/) `petr-kulhanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-08 |
| 202 | [Petr Macinka](../data/dossiers/petr-macinka/) `petr-macinka` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 203 | [Petr Sokol](../data/dossiers/petr-sokol/) `petr-sokol` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 4 | 2026-08-06 |
| 204 | [Renáta Zajíčková](../data/dossiers/renata-zajickova/) `renata-zajickova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 205 | [Richard Brabec](../data/dossiers/richard-brabec/) `richard-brabec` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 206 | [Robert Pelikán](../data/dossiers/robert-pelikan/) `robert-pelikan` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 207 | [Roman Prymula](../data/dossiers/roman-prymula/) `roman-prymula` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 208 | [Taťána Malá](../data/dossiers/tatana-mala/) `tatana-mala` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 209 | [Tomáš Petříček](../data/dossiers/tomas-petricek/) `tomas-petricek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 210 | [Věra Jourová](../data/dossiers/vera-jourova/) `vera-jourova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 211 | [Vladimír Balaš](../data/dossiers/vladimir-balas/) `vladimir-balas` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 212 | [Vladimír Kremlík](../data/dossiers/vladimir-kremlik/) `vladimir-kremlik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 213 | [Vlastimil Tima](../data/dossiers/vlastimil-tima/) `vlastimil-tima` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 0 | 2026-08-09 |
| 214 | [Vlastimil Válek](../data/dossiers/vlastimil-valek/) `vlastimil-valek` | **žádná** | 0 | 0.0 % | 100.0 % | 2 | 0/0/0/2 | 0 | 3 | 2026-08-09 |
| 215 | [Zbyněk Stanjura](../data/dossiers/zbynek-stanjura/) `zbynek-stanjura` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 216 | [Zdeněk Hřib](../data/dossiers/zdenek-hrib/) `zdenek-hrib` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 217 | [Zdeněk Nekula](../data/dossiers/zdenek-nekula/) `zdenek-nekula` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-08 |

## Plán per dossier

### 1. Andrej Babiš — `andrej-babis`

**Priorita vysoká** · 148 bodů (8.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 105 | 0 | 67 | 1 | 37 | 89 | 67 | 20 | 8 (8) | 42 |

Deklarované stavy: CORROBORATED 36 · 1 ZDROJ 45 · CITACE 24

Další krok:

- 67 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 5 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 3 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-86) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 22 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 2. Karel Havlíček — `karel-havlicek`

**Priorita vysoká** · 95 bodů (5.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 58 | 0 | 37 | 8 | 13 | 41 | 13 | 4 | 12 (12) | 22 |

Deklarované stavy: CORROBORATED 11 · 1 ZDROJ 25 · CITACE 22

Další krok:

- 37 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-07, CLM-08) → dohledat druhého, nezávislého vydavatele
- 11 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-06, CLM-12, CLM-13) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 28 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 3. Jaromír Zůna — `jaromir-zuna`

**Priorita vysoká** · 83 bodů (5.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 58 | 0 | 36 | 2 | 20 | 44 | 22 | 4 | 11 (9) | 26 |

Deklarované stavy: CORROBORATED 17 · 1 ZDROJ 14 · CITACE 27

Další krok:

- 36 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-06) → dohledat druhého, nezávislého vydavatele
- 9 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-21, CLM-29) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 22 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 4. Martin Šebestyán — `martin-sebestyan`

**Priorita vysoká** · 78 bodů (4.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 32 | 0 | 23 | 43 | 23 | 3 | 14 (14) | 6 |

Deklarované stavy: CORROBORATED 15 · 1 ZDROJ 25 · CITACE 11 · SPORNÉ 4

Další krok:

- 32 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-07) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 5. Zuzana Mrázová — `zuzana-mrazova`

**Priorita vysoká** · 78 bodů (4.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 60 | 0 | 28 | 6 | 26 | 34 | 19 | 4 | 16 (16) | 8 |

Deklarované stavy: CORROBORATED 23 · 1 ZDROJ 31 · CITACE 6

Další krok:

- 28 tvrzení stojí na jediném zdroji (např. CLM-11, CLM-14, CLM-15) → dohledat druhého, nezávislého vydavatele
- 16 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 6 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-20, CLM-27, CLM-28) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 15 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 6. Ivan Bednárik — `ivan-bednarik`

**Priorita vysoká** · 77 bodů (4.6 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 48 | 0 | 33 | 1 | 14 | 34 | 7 | 2 | 9 (9) | 21 |

Deklarované stavy: CORROBORATED 14 · 1 ZDROJ 28 · CITACE 6

Další krok:

- 33 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 8 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-29) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 27 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 7. Aleš Juchelka — `ales-juchelka`

**Priorita vysoká** · 75 bodů (4.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 47 | 0 | 27 | 8 | 12 | 20 | 14 | 5 | 13 (13) | 14 |

Deklarované stavy: CORROBORATED 12 · 1 ZDROJ 21 · CITACE 14

Další krok:

- 27 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 13 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-10, CLM-17, CLM-23) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 6 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 8. Igor Červený — `igor-cerveny`

**Priorita vysoká** · 75 bodů (4.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 59 | 0 | 26 | 9 | 24 | 37 | 23 | 4 | 14 (14) | 21 |

Deklarované stavy: CORROBORATED 23 · 1 ZDROJ 32 · CITACE 4

Další krok:

- 26 tvrzení stojí na jediném zdroji (např. CLM-06, CLM-07, CLM-09) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 9 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-08, CLM-12, CLM-13) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 14 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 9. Adam Vojtěch — `adam-vojtech`

**Priorita vysoká** · 74 bodů (4.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 29 | 1 | 25 | 49 | 27 | 3 | 15 (15) | 6 |

Deklarované stavy: CORROBORATED 24 · 1 ZDROJ 22 · CITACE 9

Další krok:

- 29 tvrzení stojí na jediném zdroji (např. CLM-09, CLM-10, CLM-12) → dohledat druhého, nezávislého vydavatele
- 15 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-28) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 22 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 10. Robert Plaga — `robert-plaga`

**Priorita vysoká** · 74 bodů (4.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 29 | 4 | 22 | 37 | 19 | 3 | 12 (12) | 7 |

Deklarované stavy: CORROBORATED 20 · 1 ZDROJ 22 · CITACE 12 · SPORNÉ 1

Další krok:

- 29 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-09, CLM-10) → dohledat druhého, nezávislého vydavatele
- 12 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 4 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-22, CLM-23, CLM-25) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 18 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 11. Oto Klempíř — `oto-klempir`

**Priorita střední** · 73 bodů (4.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 45 | 0 | 33 | 0 | 12 | 35 | 19 | 5 | 7 (7) | 11 |

Deklarované stavy: CORROBORATED 11 · 1 ZDROJ 17 · CITACE 17

Další krok:

- 33 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 7 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 16 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 12. Alena Schillerová — `alena-schillerova`

**Priorita střední** · 70 bodů (4.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita střední** · 69 bodů (4.1 % celkového objemu práce) · typ `aggregate` · aktualizováno `2026-07-29`, revidováno `2026-07-29`

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

**Priorita střední** · 64 bodů (3.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

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

**Priorita střední** · 62 bodů (3.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

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

**Priorita střední** · 47 bodů (2.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita střední** · 45 bodů (2.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita střední** · 43 bodů (2.6 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita střední** · 27 bodů (1.6 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita nízká** · 17 bodů (1.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `2026-08-08`

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

**Priorita nízká** · 17 bodů (1.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

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

**Priorita nízká** · 16 bodů (1.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita nízká** · 8 bodů (0.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 2 | 0 | 1 | 4 | 2 | 0 | 3 (3) | 0 |

Deklarované stavy: CORROBORATED 1 · 1 ZDROJ 1 · NÁZOR 1

Další krok:

- 2 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03) → dohledat druhého, nezávislého vydavatele
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 2 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 24. Bert Bartas — `bert-bartas`

**Priorita nízká** · 6 bodů (0.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 3 | 0 | 0 | 3 | 3 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 2 · SPORNÉ 1

Další krok:

- 3 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-02, CLM-03) → dohledat druhého, nezávislého vydavatele

### 25. Ivana Solařová — `ivana-solarova`

**Priorita nízká** · 6 bodů (0.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 3 | 0 | 0 | 3 | 3 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 3

Další krok:

- 3 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-02, CLM-03) → dohledat druhého, nezávislého vydavatele

### 26. František Koudela — `frantisek-koudela`

**Priorita nízká** · 4 bodů (0.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 2 | 0 | 1 | 3 | 3 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1 · 1 ZDROJ 1 · CITACE 1

Další krok:

- 2 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03) → dohledat druhého, nezávislého vydavatele

### 27. Jan Šťastník — `jan-stastnik`

**Priorita nízká** · 4 bodů (0.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 2 | 0 | 0 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 2

Další krok:

- 2 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-02) → dohledat druhého, nezávislého vydavatele

### 28. Petr Vencálek — `petr-vencalek`

**Priorita nízká** · 3 bodů (0.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `2026-08-08`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 5 | 3 | 1 | 1 (1) | 4 |

Deklarované stavy: CORROBORATED 2 · 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele
- 1 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 29. Alena Hanáková — `alena-hanakova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 30. Aleš Řebíček — `ales-rebicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 31. Alexandr Vondra (ministr obrany) — `alexandr-vondra-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 32. Antonín Prachař — `antonin-prachar`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 33. Bohumila Beranová — `bohumila-beranova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 1 | 0 | 1 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1 · 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele

### 34. Cyril Svoboda — `cyril-svoboda`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 35. Dalibor Štys — `dalibor-stys`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 36. Dana Bérová — `dana-berova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 37. Dana Jurásková — `dana-juraskova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 38. Dana Kuchtová — `dana-kuchtova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 39. Daniel Herman — `daniel-herman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 40. Daniela Filipiová — `daniela-filipiova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 41. Daniela Kovářová — `daniela-kovarova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 42. David Rath — `david-rath`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 43. Džamila Stehlíková — `dzamila-stehlikova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 44. František Bublan — `frantisek-bublan`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 45. František Koníček — `frantisek-konicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 46. Gustáv Slamečka — `gustav-slamecka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 47. Helena Třeštíková — `helena-trestikova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 48. Helena Válková — `helena-valkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 49. Ilja Šmíd — `ilja-smid`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 50. Ivan Fuksa — `ivan-fuksa`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 51. Ivan Langer — `ivan-langer`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 52. Ivan Pilný — `ivan-pilny`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 53. Jakub Malačka — `jakub-malacka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 1 | 0 | 1 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1 · 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele

### 54. Jakub Šebesta — `jakub-sebesta`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 55. Jan Blaha — `jan-blaha`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele

### 56. Jan Chvojka — `jan-chvojka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 57. Jan Dusík — `jan-dusik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 58. Jan Fischer — `jan-fischer`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 59. Jan Kohout — `jan-kohout`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 60. Jan Kubice — `jan-kubice`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 61. Jan Mládek — `jan-mladek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 62. Jaromír Drábek — `jaromir-drabek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 63. Jaroslav Palas — `jaroslav-palas`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 64. Jaroslav Tvrdík — `jaroslav-tvrdik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 65. Jaroslava Němcová — `jaroslava-nemcova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 66. Jiří Balvín — `jiri-balvin`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 67. Jiří Beroun — `jiri-beroun`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele

### 68. Jiří Besser — `jiri-besser`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 69. Jiří Čunek — `jiri-cunek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 70. Jiří Dienstbier ml. — `jiri-dienstbier-ml`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 71. Jiří Havlíček — `jiri-havlicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 72. Jiří Milek — `jiri-milek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 73. Jiří Paroubek — `jiri-paroubek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 74. Jiří Rusnok — `jiri-rusnok`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 75. Jiří Šedivý — `jiri-sedivy-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 76. Josef Dobeš — `josef-dobes`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 77. Jozef Kubinyi — `jozef-kubinyi`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 78. Juraj Chmiel — `juraj-chmiel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 79. Kamil Jankovský — `kamil-jankovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 80. Karel Blahůšek — `karel-blahusek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele

### 81. Karel Kühnl — `karel-kuhnl`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 82. Karel Schwarzenberg — `karel-schwarzenberg`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 83. Karla Šlechtová — `karla-slechtova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 84. Karolína Peake — `karolina-peake`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 85. Ladislav Miko — `ladislav-miko`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 86. Leoš Heger — `leos-heger`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 87. Libor Ambrozek — `libor-ambrozek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 88. Ludmila Müllerová — `ludmila-mullerova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 89. Lukáš David — `lukas-david`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele

### 90. Marcel Chládek — `marcel-chladek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 91. Marie Součková — `marie-souckova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 92. Martin Barták — `martin-bartak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 93. Martin Bursík — `martin-bursik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 94. Martin Dvořák — `martin-dvorak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 95. Martin Holcát — `martin-holcat`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 96. Martin Jahn — `martin-jahn`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 97. Martin Kuba — `martin-kuba`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 98. Martin Pecina — `martin-pecina`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 99. Martin Říman — `martin-riman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 100. Michaela Marksová — `michaela-marksova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 101. Milan Chovanec — `milan-chovanec`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 102. Milan Šimonovský — `milan-simonovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 103. Milan Urban — `milan-urban`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 104. Milena Vicenová — `milena-vicenova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 105. Miloš Zeman — `milos-zeman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 106. Miloslav Ludvík — `miloslav-ludvik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 107. Mirek Topolánek — `mirek-topolanek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 108. Miroslav Kalousek — `miroslav-kalousek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 109. Miroslav Kostelka — `miroslav-kostelka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 110. Miroslav Toman — `miroslav-toman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 111. Miroslava Kopicová — `miroslava-kopicova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 112. Ondřej Liška — `ondrej-liska`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 113. Pavel Bělobrádek — `pavel-belobradek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 114. Pavel Dobeš — `pavel-dobes`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 115. Pavel Němec — `pavel-nemec`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 116. Pavel Svoboda — `pavel-svoboda-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 117. Pavel Zářecký — `pavel-zarecky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 118. Petr Bendl — `petr-bendl-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 119. Petr Gandalovič — `petr-gandalovic`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 120. Petr Kalaš — `petr-kalas`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 121. Petr Mareš — `petr-mares`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 122. Petr Nečas — `petr-necas`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 123. Petr Pavel — `petr-pavel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 4 | 4 | 1 | 0 (0) | 2 |

Deklarované stavy: CORROBORATED 2 · CITACE 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele

### 124. Petr Šimerka — `petr-simerka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 125. Petr Zgarba — `petr-zgarba`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 126. Petra Buzková — `petra-buzkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 127. Radek John — `radek-john`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 128. Radko Martínek — `radko-martinek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 129. Rut Bízková — `rut-bizkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 130. Stanislav Štech — `stanislav-stech`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 131. Štefan Füle — `stefan-fule`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 132. Svatopluk Němeček — `svatopluk-nemecek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 133. Tomáš Chalupa — `tomas-chalupa`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 134. Tomáš Hüner — `tomas-huner`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 135. Tomáš Julínek — `tomas-julinek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 136. Václav Jehlička — `vaclav-jehlicka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 137. Vít Rakušan — `vit-rakusan`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 6 | 5 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 2 · CITACE 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-03) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 138. Vítězslav Jandák — `vitezslav-jandak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 139. Vladimír Špidla — `vladimir-spidla`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 140. Vladimír Tošovský — `vladimir-tosovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 141. Vlasta Parkanová — `vlasta-parkanova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 142. Vlastimil Tlustý — `vlastimil-tlusty`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 143. Zdeněk Škromach — `zdenek-skromach`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 144. Zdeněk Žák — `zdenek-zak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 145. Jaroslav Bureš — `jaroslav-bures`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 146. Kateřina Valachová — `katerina-valachova`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 147. Michael Kocáb — `michael-kocab`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 148. Milada Emmerová — `milada-emmerova`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 149. Pavel Rychetský — `pavel-rychetsky`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 150. Vladimír Mlynář — `vladimir-mlynar`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 151. Alena Paulenková — `alena-paulenkova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 152. Anna Hubáčková — `anna-hubackova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 153. Antonín Staněk — `antonin-stanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 154. Benjamin Činčila — `benjamin-cincila`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 155. Blanka Dufková — `blanka-dufkova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 156. Bohuslav Sobotka — `bohuslav-sobotka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 157. Dan Ťok — `dan-tok`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 158. Eva Decroix — `eva-decroix`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 159. Filip Turek — `filip-turek`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 160. Helena Langšádlová — `helena-langsadlova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 161. Ivan Bartoš — `ivan-bartos`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 162. Jakub Kulhánek — `jakub-kulhanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 163. Jan Blatný — `jan-blatny`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 164. Jan Grolich — `jan-grolich`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 165. Jan Hamáček — `jan-hamacek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 166. Jan Jakob — `jan-jakob`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 167. Jan Kněžínek — `jan-knezinek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 168. Jan Lipavský — `jan-lipavsky`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 169. Jan Skopeček — `jan-skopecek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 170. Jana Černochová — `jana-cernochova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 171. Jana Maláčová — `jana-malacova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 172. Jiří Kacetl — `jiri-kacetl`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 173. Jiří Pospíšil — `jiri-pospisil`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 0 | 0 | 2 | 5 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 2

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 174. Jozef Síkela — `jozef-sikela`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 175. Karel Haas — `karel-haas`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 176. Kateřina Stojanová — `katerina-stojanova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 177. Klára Dostálová — `klara-dostalova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 178. Lubomír Zaorálek — `lubomir-zaoralek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 179. Lukáš Vlček — `lukas-vlcek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 180. Marek Benda — `marek-benda`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 181. Marek Výborný — `marek-vyborny`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 182. Marek Ženíšek — `marek-zenisek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 183. Marian Jurečka — `marian-jurecka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 184. Marta Nováková — `marta-novakova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 185. Martin Baxa — `martin-baxa`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 186. Martin Červíček — `martin-cervicek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 187. Martin Kupka — `martin-kupka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 188. Martin Stropnický — `martin-stropnicky`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 189. Matěj Ondřej Havel — `matej-ondrej-havel`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 190. Michaela Šebelová — `michaela-sebelova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 191. Michal Šalomoun — `michal-salomoun`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 192. Mikuláš Bek — `mikulas-bek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 193. Olga Richterová — `olga-richterova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 194. Pavel Blažek — `pavel-blazek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 195. Pavel Drobil — `pavel-drobil`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 196. Pavel Jajtner — `pavel-jajtner`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 197. Petr Arenberger — `petr-arenberger`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 198. Petr Gazdík — `petr-gazdik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 199. Petr Hladík — `petr-hladik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 200. Petr Krčál — `petr-krcal`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 201. Petr Kulhánek — `petr-kulhanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 202. Petr Macinka — `petr-macinka`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 203. Petr Sokol — `petr-sokol`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 4 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 4 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 204. Renáta Zajíčková — `renata-zajickova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 205. Richard Brabec — `richard-brabec`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 206. Robert Pelikán — `robert-pelikan`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 207. Roman Prymula — `roman-prymula`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 208. Taťána Malá — `tatana-mala`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 209. Tomáš Petříček — `tomas-petricek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 210. Věra Jourová — `vera-jourova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 211. Vladimír Balaš — `vladimir-balas`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 212. Vladimír Kremlík — `vladimir-kremlik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 213. Vlastimil Tima — `vlastimil-tima`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 214. Vlastimil Válek — `vlastimil-valek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 0 | 0 | 2 | 5 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 2

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 215. Zbyněk Stanjura — `zbynek-stanjura`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 216. Zdeněk Hřib — `zdenek-hrib`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 217. Zdeněk Nekula — `zdenek-nekula`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

---

*Vygenerováno z kanonického modelu. Chceš jiné číslo? Změň data, ne tenhle soubor.*
