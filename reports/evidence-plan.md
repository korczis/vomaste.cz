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
| Dossierů | 162 |
| Tvrzení | 1107 |
| — z toho `E0` / `E1` / `E1+` / `E2` | 0 / 639 / 94 / 374 |
| Zdrojů (z toho s vyplněnou `sourceFamily`) | 899 (394) |
| Kauz | 94 |
| Mezer celkem / otevřených / zastaralých | 204 / 202 / 0 |
| Vztahů | 334 |
| Bodů rizika celkem | 1599 |

## Pořadí dossierů

| # | Dossier | Priorita | Body | Podíl | Kumul. | Tvrzení | `E0`/`E1`/`E1+`/`E2` | Otevřené mezery | Zdroje bez rodiny | Aktualizováno |
|---:|---|---|---:|---:|---:|---:|---|---:|---:|---|
| 1 | [Andrej Babiš](../data/dossiers/andrej-babis/) `andrej-babis` | **vysoká** | 154 | 9.6 % | 9.6 % | 105 | 0/70/1/34 | 8 | 21 | 2026-08-06 |
| 2 | [Karel Havlíček](../data/dossiers/karel-havlicek/) `karel-havlicek` | **vysoká** | 99 | 6.2 % | 15.8 % | 58 | 0/39/8/11 | 12 | 26 | 2026-08-05 |
| 3 | [Jaromír Zůna](../data/dossiers/jaromir-zuna/) `jaromir-zuna` | **vysoká** | 87 | 5.4 % | 21.3 % | 58 | 0/38/2/18 | 9 | 20 | 2026-08-06 |
| 4 | [Martin Šebestyán](../data/dossiers/martin-sebestyan/) `martin-sebestyan` | **vysoká** | 80 | 5.0 % | 26.3 % | 55 | 0/33/0/22 | 14 | 20 | 2026-08-06 |
| 5 | [Ivan Bednárik](../data/dossiers/ivan-bednarik/) `ivan-bednarik` | **vysoká** | 79 | 4.9 % | 31.2 % | 48 | 0/34/1/13 | 9 | 26 | 2026-07-30 |
| 6 | [Adam Vojtěch](../data/dossiers/adam-vojtech/) `adam-vojtech` | **vysoká** | 78 | 4.9 % | 36.1 % | 55 | 0/31/1/23 | 15 | 21 | 2026-08-06 |
| 7 | [Zuzana Mrázová](../data/dossiers/zuzana-mrazova/) `zuzana-mrazova` | **vysoká** | 78 | 4.9 % | 41.0 % | 60 | 0/28/6/26 | 16 | 15 | 2026-08-05 |
| 8 | [Aleš Juchelka](../data/dossiers/ales-juchelka/) `ales-juchelka` | **vysoká** | 75 | 4.7 % | 45.7 % | 47 | 0/27/8/12 | 13 | 6 | 2026-07-30 |
| 9 | [Igor Červený](../data/dossiers/igor-cerveny/) `igor-cerveny` | **vysoká** | 75 | 4.7 % | 50.3 % | 59 | 0/26/9/24 | 14 | 14 | 2026-07-30 |
| 10 | [Oto Klempíř](../data/dossiers/oto-klempir/) `oto-klempir` | **střední** | 75 | 4.7 % | 55.0 % | 45 | 0/34/0/11 | 7 | 16 | 2026-08-06 |
| 11 | [Robert Plaga](../data/dossiers/robert-plaga/) `robert-plaga` | **střední** | 74 | 4.6 % | 59.7 % | 55 | 0/29/4/22 | 12 | 18 | 2026-08-06 |
| 12 | [Alena Schillerová](../data/dossiers/alena-schillerova/) `alena-schillerova` | **střední** | 70 | 4.4 % | 64.0 % | 41 | 0/28/4/9 | 8 | 15 | 2026-08-05 |
| 13 | [Petr Macinka a Filip Turek](../data/dossiers/macinka-turek/) `macinka-turek` | **střední** | 69 | 4.3 % | 68.4 % | 55 | 0/28/2/25 | 7 | 20 | 2026-07-29 |
| 14 | [Boris Šťastný](../data/dossiers/boris-stastny/) `boris-stastny` | **střední** | 64 | 4.0 % | 72.4 % | 42 | 0/21/11/10 | 10 | 8 | 2026-07-30 |
| 15 | [Jeroným Tejc](../data/dossiers/jeronym-tejc/) `jeronym-tejc` | **střední** | 62 | 3.9 % | 76.2 % | 52 | 0/22/8/22 | 10 | 16 | 2026-08-06 |
| 16 | [Lubomír Metnar](../data/dossiers/lubomir-metnar/) `lubomir-metnar` | **střední** | 47 | 2.9 % | 79.2 % | 31 | 0/13/6/12 | 15 | 5 | 2026-08-05 |
| 17 | [James Quick](../data/dossiers/james-quick/) `james-quick` | **střední** | 43 | 2.7 % | 81.9 % | 19 | 0/18/1/0 | 3 | 19 | 2026-08-05 |
| 18 | [Tomio Okamura](../data/dossiers/tomio-okamura/) `tomio-okamura` | **nízká** | 43 | 2.7 % | 84.6 % | 36 | 0/9/15/12 | 8 | 10 | 2026-08-05 |
| 19 | [Richard Chlad](../data/dossiers/richard-chlad/) `richard-chlad` | **nízká** | 27 | 1.7 % | 86.2 % | 11 | 0/10/1/0 | 3 | 1 | 2026-08-05 |
| 20 | [Tünde Bartha](../data/dossiers/tunde-bartha/) `tunde-bartha` | **nízká** | 17 | 1.1 % | 87.3 % | 13 | 0/6/0/7 | 4 | 8 | 2026-08-01 |
| 21 | [Jaroslav Faltýnek](../data/dossiers/jaroslav-faltynek/) `jaroslav-faltynek` | **nízká** | 16 | 1.0 % | 88.3 % | 13 | 0/6/1/6 | 2 | 9 | 2026-08-05 |
| 22 | [Martin Pavlík](../data/dossiers/martin-pavlik/) `martin-pavlik` | **nízká** | 14 | 0.9 % | 89.2 % | 7 | 0/4/3/0 | 2 | 0 | 2026-08-05 |
| 23 | [Petr Vencálek](../data/dossiers/petr-vencalek/) `petr-vencalek` | **nízká** | 3 | 0.2 % | 89.4 % | 3 | 0/1/0/2 | 1 | 2 | 2026-08-01 |
| 24 | [Alena Hanáková](../data/dossiers/alena-hanakova/) `alena-hanakova` | **nízká** | 2 | 0.1 % | 89.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 25 | [Aleš Řebíček](../data/dossiers/ales-rebicek/) `ales-rebicek` | **nízká** | 2 | 0.1 % | 89.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 26 | [Alexandr Vondra (ministr obrany)](../data/dossiers/alexandr-vondra-ministr/) `alexandr-vondra-ministr` | **nízká** | 2 | 0.1 % | 89.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 27 | [Antonín Prachař](../data/dossiers/antonin-prachar/) `antonin-prachar` | **nízká** | 2 | 0.1 % | 89.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 28 | [Cyril Svoboda](../data/dossiers/cyril-svoboda/) `cyril-svoboda` | **nízká** | 2 | 0.1 % | 90.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 29 | [Dalibor Štys](../data/dossiers/dalibor-stys/) `dalibor-stys` | **nízká** | 2 | 0.1 % | 90.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 30 | [Dana Jurásková](../data/dossiers/dana-juraskova/) `dana-juraskova` | **nízká** | 2 | 0.1 % | 90.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 31 | [Dana Kuchtová](../data/dossiers/dana-kuchtova/) `dana-kuchtova` | **nízká** | 2 | 0.1 % | 90.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 32 | [Daniel Herman](../data/dossiers/daniel-herman/) `daniel-herman` | **nízká** | 2 | 0.1 % | 90.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 33 | [Daniela Filipiová](../data/dossiers/daniela-filipiova/) `daniela-filipiova` | **nízká** | 2 | 0.1 % | 90.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 34 | [Daniela Kovářová](../data/dossiers/daniela-kovarova/) `daniela-kovarova` | **nízká** | 2 | 0.1 % | 90.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 35 | [Džamila Stehlíková](../data/dossiers/dzamila-stehlikova/) `dzamila-stehlikova` | **nízká** | 2 | 0.1 % | 90.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 36 | [František Koníček](../data/dossiers/frantisek-konicek/) `frantisek-konicek` | **nízká** | 2 | 0.1 % | 91.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 37 | [Gustáv Slamečka](../data/dossiers/gustav-slamecka/) `gustav-slamecka` | **nízká** | 2 | 0.1 % | 91.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 38 | [Helena Třeštíková](../data/dossiers/helena-trestikova/) `helena-trestikova` | **nízká** | 2 | 0.1 % | 91.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 39 | [Helena Válková](../data/dossiers/helena-valkova/) `helena-valkova` | **nízká** | 2 | 0.1 % | 91.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 40 | [Ilja Šmíd](../data/dossiers/ilja-smid/) `ilja-smid` | **nízká** | 2 | 0.1 % | 91.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 41 | [Ivan Fuksa](../data/dossiers/ivan-fuksa/) `ivan-fuksa` | **nízká** | 2 | 0.1 % | 91.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 42 | [Ivan Langer](../data/dossiers/ivan-langer/) `ivan-langer` | **nízká** | 2 | 0.1 % | 91.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 43 | [Ivan Pilný](../data/dossiers/ivan-pilny/) `ivan-pilny` | **nízká** | 2 | 0.1 % | 91.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 44 | [Jakub Šebesta](../data/dossiers/jakub-sebesta/) `jakub-sebesta` | **nízká** | 2 | 0.1 % | 92.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 45 | [Jan Chvojka](../data/dossiers/jan-chvojka/) `jan-chvojka` | **nízká** | 2 | 0.1 % | 92.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 46 | [Jan Dusík](../data/dossiers/jan-dusik/) `jan-dusik` | **nízká** | 2 | 0.1 % | 92.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 47 | [Jan Fischer](../data/dossiers/jan-fischer/) `jan-fischer` | **nízká** | 2 | 0.1 % | 92.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 48 | [Jan Kohout](../data/dossiers/jan-kohout/) `jan-kohout` | **nízká** | 2 | 0.1 % | 92.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 49 | [Jan Kubice](../data/dossiers/jan-kubice/) `jan-kubice` | **nízká** | 2 | 0.1 % | 92.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 50 | [Jan Mládek](../data/dossiers/jan-mladek/) `jan-mladek` | **nízká** | 2 | 0.1 % | 92.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 51 | [Jaromír Drábek](../data/dossiers/jaromir-drabek/) `jaromir-drabek` | **nízká** | 2 | 0.1 % | 92.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 52 | [Jaroslava Němcová](../data/dossiers/jaroslava-nemcova/) `jaroslava-nemcova` | **nízká** | 2 | 0.1 % | 93.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 53 | [Jiří Balvín](../data/dossiers/jiri-balvin/) `jiri-balvin` | **nízká** | 2 | 0.1 % | 93.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 54 | [Jiří Besser](../data/dossiers/jiri-besser/) `jiri-besser` | **nízká** | 2 | 0.1 % | 93.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 55 | [Jiří Čunek](../data/dossiers/jiri-cunek/) `jiri-cunek` | **nízká** | 2 | 0.1 % | 93.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 56 | [Jiří Dienstbier ml.](../data/dossiers/jiri-dienstbier-ml/) `jiri-dienstbier-ml` | **nízká** | 2 | 0.1 % | 93.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 57 | [Jiří Havlíček](../data/dossiers/jiri-havlicek/) `jiri-havlicek` | **nízká** | 2 | 0.1 % | 93.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 58 | [Jiří Milek](../data/dossiers/jiri-milek/) `jiri-milek` | **nízká** | 2 | 0.1 % | 93.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 59 | [Jiří Pospíšil](../data/dossiers/jiri-pospisil/) `jiri-pospisil` | **nízká** | 2 | 0.1 % | 93.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 60 | [Jiří Rusnok](../data/dossiers/jiri-rusnok/) `jiri-rusnok` | **nízká** | 2 | 0.1 % | 94.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 61 | [Jiří Šedivý](../data/dossiers/jiri-sedivy-ministr/) `jiri-sedivy-ministr` | **nízká** | 2 | 0.1 % | 94.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 62 | [Josef Dobeš](../data/dossiers/josef-dobes/) `josef-dobes` | **nízká** | 2 | 0.1 % | 94.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 63 | [Juraj Chmiel](../data/dossiers/juraj-chmiel/) `juraj-chmiel` | **nízká** | 2 | 0.1 % | 94.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 64 | [Kamil Jankovský](../data/dossiers/kamil-jankovsky/) `kamil-jankovsky` | **nízká** | 2 | 0.1 % | 94.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 65 | [Karel Schwarzenberg](../data/dossiers/karel-schwarzenberg/) `karel-schwarzenberg` | **nízká** | 2 | 0.1 % | 94.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 66 | [Karla Šlechtová](../data/dossiers/karla-slechtova/) `karla-slechtova` | **nízká** | 2 | 0.1 % | 94.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 67 | [Karolína Peake](../data/dossiers/karolina-peake/) `karolina-peake` | **nízká** | 2 | 0.1 % | 94.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 68 | [Ladislav Miko](../data/dossiers/ladislav-miko/) `ladislav-miko` | **nízká** | 2 | 0.1 % | 95.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 69 | [Leoš Heger](../data/dossiers/leos-heger/) `leos-heger` | **nízká** | 2 | 0.1 % | 95.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 70 | [Ludmila Müllerová](../data/dossiers/ludmila-mullerova/) `ludmila-mullerova` | **nízká** | 2 | 0.1 % | 95.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 71 | [Marcel Chládek](../data/dossiers/marcel-chladek/) `marcel-chladek` | **nízká** | 2 | 0.1 % | 95.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 72 | [Martin Barták](../data/dossiers/martin-bartak/) `martin-bartak` | **nízká** | 2 | 0.1 % | 95.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 73 | [Martin Bursík](../data/dossiers/martin-bursik/) `martin-bursik` | **nízká** | 2 | 0.1 % | 95.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 74 | [Martin Dvořák](../data/dossiers/martin-dvorak/) `martin-dvorak` | **nízká** | 2 | 0.1 % | 95.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 75 | [Martin Holcát](../data/dossiers/martin-holcat/) `martin-holcat` | **nízká** | 2 | 0.1 % | 95.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 76 | [Martin Kuba](../data/dossiers/martin-kuba/) `martin-kuba` | **nízká** | 2 | 0.1 % | 96.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 77 | [Martin Pecina](../data/dossiers/martin-pecina/) `martin-pecina` | **nízká** | 2 | 0.1 % | 96.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 78 | [Martin Říman](../data/dossiers/martin-riman/) `martin-riman` | **nízká** | 2 | 0.1 % | 96.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 79 | [Michaela Marksová](../data/dossiers/michaela-marksova/) `michaela-marksova` | **nízká** | 2 | 0.1 % | 96.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 80 | [Milan Chovanec](../data/dossiers/milan-chovanec/) `milan-chovanec` | **nízká** | 2 | 0.1 % | 96.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 81 | [Miloslav Ludvík](../data/dossiers/miloslav-ludvik/) `miloslav-ludvik` | **nízká** | 2 | 0.1 % | 96.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 82 | [Mirek Topolánek](../data/dossiers/mirek-topolanek/) `mirek-topolanek` | **nízká** | 2 | 0.1 % | 96.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 83 | [Miroslav Kalousek](../data/dossiers/miroslav-kalousek/) `miroslav-kalousek` | **nízká** | 2 | 0.1 % | 96.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 84 | [Miroslav Toman](../data/dossiers/miroslav-toman/) `miroslav-toman` | **nízká** | 2 | 0.1 % | 97.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 85 | [Miroslava Kopicová](../data/dossiers/miroslava-kopicova/) `miroslava-kopicova` | **nízká** | 2 | 0.1 % | 97.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 86 | [Ondřej Liška](../data/dossiers/ondrej-liska/) `ondrej-liska` | **nízká** | 2 | 0.1 % | 97.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 87 | [Pavel Bělobrádek](../data/dossiers/pavel-belobradek/) `pavel-belobradek` | **nízká** | 2 | 0.1 % | 97.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 88 | [Pavel Dobeš](../data/dossiers/pavel-dobes/) `pavel-dobes` | **nízká** | 2 | 0.1 % | 97.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 89 | [Pavel Svoboda](../data/dossiers/pavel-svoboda-ministr/) `pavel-svoboda-ministr` | **nízká** | 2 | 0.1 % | 97.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 90 | [Pavel Zářecký](../data/dossiers/pavel-zarecky/) `pavel-zarecky` | **nízká** | 2 | 0.1 % | 97.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 91 | [Petr Bendl](../data/dossiers/petr-bendl-ministr/) `petr-bendl-ministr` | **nízká** | 2 | 0.1 % | 97.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 92 | [Petr Gandalovič](../data/dossiers/petr-gandalovic/) `petr-gandalovic` | **nízká** | 2 | 0.1 % | 98.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 93 | [Petr Nečas](../data/dossiers/petr-necas/) `petr-necas` | **nízká** | 2 | 0.1 % | 98.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 94 | [Petr Pavel](../data/dossiers/petr-pavel/) `petr-pavel` | **nízká** | 2 | 0.1 % | 98.2 % | 3 | 0/1/0/2 | 0 | 0 | 2026-08-01 |
| 95 | [Petr Šimerka](../data/dossiers/petr-simerka/) `petr-simerka` | **nízká** | 2 | 0.1 % | 98.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 96 | [Radek John](../data/dossiers/radek-john/) `radek-john` | **nízká** | 2 | 0.1 % | 98.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 97 | [Rut Bízková](../data/dossiers/rut-bizkova/) `rut-bizkova` | **nízká** | 2 | 0.1 % | 98.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 98 | [Stanislav Štech](../data/dossiers/stanislav-stech/) `stanislav-stech` | **nízká** | 2 | 0.1 % | 98.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 99 | [Štefan Füle](../data/dossiers/stefan-fule/) `stefan-fule` | **nízká** | 2 | 0.1 % | 98.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 100 | [Svatopluk Němeček](../data/dossiers/svatopluk-nemecek/) `svatopluk-nemecek` | **nízká** | 2 | 0.1 % | 99.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 101 | [Tomáš Chalupa](../data/dossiers/tomas-chalupa/) `tomas-chalupa` | **nízká** | 2 | 0.1 % | 99.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 102 | [Tomáš Hüner](../data/dossiers/tomas-huner/) `tomas-huner` | **nízká** | 2 | 0.1 % | 99.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 103 | [Tomáš Julínek](../data/dossiers/tomas-julinek/) `tomas-julinek` | **nízká** | 2 | 0.1 % | 99.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 104 | [Václav Jehlička](../data/dossiers/vaclav-jehlicka/) `vaclav-jehlicka` | **nízká** | 2 | 0.1 % | 99.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 105 | [Vladimír Tošovský](../data/dossiers/vladimir-tosovsky/) `vladimir-tosovsky` | **nízká** | 2 | 0.1 % | 99.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 106 | [Vlasta Parkanová](../data/dossiers/vlasta-parkanova/) `vlasta-parkanova` | **nízká** | 2 | 0.1 % | 99.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 107 | [Zdeněk Žák](../data/dossiers/zdenek-zak/) `zdenek-zak` | **nízká** | 2 | 0.1 % | 99.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 108 | [Kateřina Valachová](../data/dossiers/katerina-valachova/) `katerina-valachova` | **nízká** | 1 | 0.1 % | 99.9 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 109 | [Michael Kocáb](../data/dossiers/michael-kocab/) `michael-kocab` | **nízká** | 1 | 0.1 % | 100.0 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 110 | [Anna Hubáčková](../data/dossiers/anna-hubackova/) `anna-hubackova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 111 | [Antonín Staněk](../data/dossiers/antonin-stanek/) `antonin-stanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 112 | [Bohuslav Sobotka](../data/dossiers/bohuslav-sobotka/) `bohuslav-sobotka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 113 | [Dan Ťok](../data/dossiers/dan-tok/) `dan-tok` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 114 | [Eva Decroix](../data/dossiers/eva-decroix/) `eva-decroix` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 115 | [Filip Turek](../data/dossiers/filip-turek/) `filip-turek` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 116 | [Helena Langšádlová](../data/dossiers/helena-langsadlova/) `helena-langsadlova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 117 | [Ivan Bartoš](../data/dossiers/ivan-bartos/) `ivan-bartos` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 118 | [Jakub Kulhánek](../data/dossiers/jakub-kulhanek/) `jakub-kulhanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 119 | [Jan Blatný](../data/dossiers/jan-blatny/) `jan-blatny` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 120 | [Jan Hamáček](../data/dossiers/jan-hamacek/) `jan-hamacek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 121 | [Jan Kněžínek](../data/dossiers/jan-knezinek/) `jan-knezinek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 122 | [Jan Lipavský](../data/dossiers/jan-lipavsky/) `jan-lipavsky` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 123 | [Jan Skopeček](../data/dossiers/jan-skopecek/) `jan-skopecek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 124 | [Jana Černochová](../data/dossiers/jana-cernochova/) `jana-cernochova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 125 | [Jana Maláčová](../data/dossiers/jana-malacova/) `jana-malacova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 126 | [Jozef Síkela](../data/dossiers/jozef-sikela/) `jozef-sikela` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 127 | [Karel Haas](../data/dossiers/karel-haas/) `karel-haas` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 128 | [Klára Dostálová](../data/dossiers/klara-dostalova/) `klara-dostalova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 129 | [Lubomír Zaorálek](../data/dossiers/lubomir-zaoralek/) `lubomir-zaoralek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 130 | [Lukáš Vlček](../data/dossiers/lukas-vlcek/) `lukas-vlcek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 131 | [Marek Benda](../data/dossiers/marek-benda/) `marek-benda` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 132 | [Marek Výborný](../data/dossiers/marek-vyborny/) `marek-vyborny` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 133 | [Marek Ženíšek](../data/dossiers/marek-zenisek/) `marek-zenisek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 134 | [Marian Jurečka](../data/dossiers/marian-jurecka/) `marian-jurecka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 135 | [Marta Nováková](../data/dossiers/marta-novakova/) `marta-novakova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 136 | [Martin Baxa](../data/dossiers/martin-baxa/) `martin-baxa` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 137 | [Martin Červíček](../data/dossiers/martin-cervicek/) `martin-cervicek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 138 | [Martin Kupka](../data/dossiers/martin-kupka/) `martin-kupka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-06 |
| 139 | [Martin Stropnický](../data/dossiers/martin-stropnicky/) `martin-stropnicky` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 140 | [Michal Šalomoun](../data/dossiers/michal-salomoun/) `michal-salomoun` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 141 | [Mikuláš Bek](../data/dossiers/mikulas-bek/) `mikulas-bek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 142 | [Pavel Blažek](../data/dossiers/pavel-blazek/) `pavel-blazek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 143 | [Pavel Drobil](../data/dossiers/pavel-drobil/) `pavel-drobil` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 144 | [Petr Arenberger](../data/dossiers/petr-arenberger/) `petr-arenberger` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 145 | [Petr Fiala](../data/dossiers/petr-fiala/) `petr-fiala` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 146 | [Petr Gazdík](../data/dossiers/petr-gazdik/) `petr-gazdik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 147 | [Petr Hladík](../data/dossiers/petr-hladik/) `petr-hladik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 148 | [Petr Krčál](../data/dossiers/petr-krcal/) `petr-krcal` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 149 | [Petr Kulhánek](../data/dossiers/petr-kulhanek/) `petr-kulhanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-08 |
| 150 | [Petr Macinka](../data/dossiers/petr-macinka/) `petr-macinka` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 151 | [Richard Brabec](../data/dossiers/richard-brabec/) `richard-brabec` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 152 | [Robert Pelikán](../data/dossiers/robert-pelikan/) `robert-pelikan` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 153 | [Roman Prymula](../data/dossiers/roman-prymula/) `roman-prymula` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 154 | [Taťána Malá](../data/dossiers/tatana-mala/) `tatana-mala` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 155 | [Tomáš Petříček](../data/dossiers/tomas-petricek/) `tomas-petricek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 156 | [Věra Jourová](../data/dossiers/vera-jourova/) `vera-jourova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 157 | [Vít Rakušan](../data/dossiers/vit-rakusan/) `vit-rakusan` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 158 | [Vladimír Balaš](../data/dossiers/vladimir-balas/) `vladimir-balas` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 159 | [Vladimír Kremlík](../data/dossiers/vladimir-kremlik/) `vladimir-kremlik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 160 | [Vlastimil Válek](../data/dossiers/vlastimil-valek/) `vlastimil-valek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 161 | [Zbyněk Stanjura](../data/dossiers/zbynek-stanjura/) `zbynek-stanjura` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 162 | [Zdeněk Nekula](../data/dossiers/zdenek-nekula/) `zdenek-nekula` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-08 |

## Plán per dossier

### 1. Andrej Babiš — `andrej-babis`

**Priorita vysoká** · 154 bodů (9.6 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-05`

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

**Priorita vysoká** · 99 bodů (6.2 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-07-30`

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

**Priorita vysoká** · 87 bodů (5.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

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

**Priorita vysoká** · 80 bodů (5.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 33 | 0 | 22 | 43 | 23 | 3 | 14 (14) | 6 |

Deklarované stavy: CORROBORATED 14 · 1 ZDROJ 26 · CITACE 11 · SPORNÉ 4

Další krok:

- 33 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-07) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 5. Ivan Bednárik — `ivan-bednarik`

**Priorita vysoká** · 79 bodů (4.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

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

**Priorita vysoká** · 78 bodů (4.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

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

**Priorita vysoká** · 78 bodů (4.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita vysoká** · 75 bodů (4.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

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

**Priorita vysoká** · 75 bodů (4.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

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

**Priorita střední** · 75 bodů (4.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 45 | 0 | 34 | 0 | 11 | 35 | 19 | 5 | 7 (7) | 11 |

Deklarované stavy: CORROBORATED 10 · 1 ZDROJ 18 · CITACE 17

Další krok:

- 34 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 7 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 16 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 11. Robert Plaga — `robert-plaga`

**Priorita střední** · 74 bodů (4.6 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

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

**Priorita střední** · 70 bodů (4.4 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita střední** · 69 bodů (4.3 % celkového objemu práce) · typ `aggregate` · aktualizováno `2026-07-29`, revidováno `2026-07-29`

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

**Priorita střední** · 64 bodů (4.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

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

**Priorita střední** · 62 bodů (3.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

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

**Priorita střední** · 47 bodů (2.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita střední** · 43 bodů (2.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 19 | 0 | 18 | 1 | 0 | 20 | 1 | 4 | 3 (3) | 10 |

Deklarované stavy: 1 ZDROJ 18 · CITACE 1

Další krok:

- 18 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-03, CLM-04) → dohledat druhého, nezávislého vydavatele
- 3 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-02) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 19 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 18. Tomio Okamura — `tomio-okamura`

**Priorita nízká** · 43 bodů (2.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita nízká** · 27 bodů (1.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita nízká** · 17 bodů (1.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

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

### 22. Martin Pavlík — `martin-pavlik`

**Priorita nízká** · 14 bodů (0.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

### 24. Alena Hanáková — `alena-hanakova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 25. Aleš Řebíček — `ales-rebicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 26. Alexandr Vondra (ministr obrany) — `alexandr-vondra-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 27. Antonín Prachař — `antonin-prachar`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 28. Cyril Svoboda — `cyril-svoboda`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 29. Dalibor Štys — `dalibor-stys`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 30. Dana Jurásková — `dana-juraskova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 31. Dana Kuchtová — `dana-kuchtova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 32. Daniel Herman — `daniel-herman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 33. Daniela Filipiová — `daniela-filipiova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 34. Daniela Kovářová — `daniela-kovarova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 35. Džamila Stehlíková — `dzamila-stehlikova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 36. František Koníček — `frantisek-konicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 37. Gustáv Slamečka — `gustav-slamecka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 38. Helena Třeštíková — `helena-trestikova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 39. Helena Válková — `helena-valkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 40. Ilja Šmíd — `ilja-smid`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 41. Ivan Fuksa — `ivan-fuksa`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 42. Ivan Langer — `ivan-langer`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 43. Ivan Pilný — `ivan-pilny`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 44. Jakub Šebesta — `jakub-sebesta`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 45. Jan Chvojka — `jan-chvojka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 46. Jan Dusík — `jan-dusik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 47. Jan Fischer — `jan-fischer`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 48. Jan Kohout — `jan-kohout`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 49. Jan Kubice — `jan-kubice`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 50. Jan Mládek — `jan-mladek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 51. Jaromír Drábek — `jaromir-drabek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 52. Jaroslava Němcová — `jaroslava-nemcova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 53. Jiří Balvín — `jiri-balvin`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 54. Jiří Besser — `jiri-besser`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 55. Jiří Čunek — `jiri-cunek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 56. Jiří Dienstbier ml. — `jiri-dienstbier-ml`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 57. Jiří Havlíček — `jiri-havlicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 58. Jiří Milek — `jiri-milek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 59. Jiří Pospíšil — `jiri-pospisil`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 60. Jiří Rusnok — `jiri-rusnok`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 61. Jiří Šedivý — `jiri-sedivy-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 62. Josef Dobeš — `josef-dobes`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 63. Juraj Chmiel — `juraj-chmiel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 64. Kamil Jankovský — `kamil-jankovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 65. Karel Schwarzenberg — `karel-schwarzenberg`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 66. Karla Šlechtová — `karla-slechtova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 67. Karolína Peake — `karolina-peake`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 68. Ladislav Miko — `ladislav-miko`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 69. Leoš Heger — `leos-heger`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 70. Ludmila Müllerová — `ludmila-mullerova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 71. Marcel Chládek — `marcel-chladek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 72. Martin Barták — `martin-bartak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 73. Martin Bursík — `martin-bursik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 74. Martin Dvořák — `martin-dvorak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 75. Martin Holcát — `martin-holcat`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 76. Martin Kuba — `martin-kuba`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 77. Martin Pecina — `martin-pecina`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 78. Martin Říman — `martin-riman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 79. Michaela Marksová — `michaela-marksova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 80. Milan Chovanec — `milan-chovanec`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 81. Miloslav Ludvík — `miloslav-ludvik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 82. Mirek Topolánek — `mirek-topolanek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 83. Miroslav Kalousek — `miroslav-kalousek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 84. Miroslav Toman — `miroslav-toman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 85. Miroslava Kopicová — `miroslava-kopicova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 86. Ondřej Liška — `ondrej-liska`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 87. Pavel Bělobrádek — `pavel-belobradek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 88. Pavel Dobeš — `pavel-dobes`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 89. Pavel Svoboda — `pavel-svoboda-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 90. Pavel Zářecký — `pavel-zarecky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 91. Petr Bendl — `petr-bendl-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 92. Petr Gandalovič — `petr-gandalovic`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 93. Petr Nečas — `petr-necas`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 94. Petr Pavel — `petr-pavel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 4 | 4 | 1 | 0 (0) | 2 |

Deklarované stavy: CORROBORATED 2 · CITACE 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele

### 95. Petr Šimerka — `petr-simerka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 96. Radek John — `radek-john`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 97. Rut Bízková — `rut-bizkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 98. Stanislav Štech — `stanislav-stech`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 99. Štefan Füle — `stefan-fule`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 100. Svatopluk Němeček — `svatopluk-nemecek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 101. Tomáš Chalupa — `tomas-chalupa`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 102. Tomáš Hüner — `tomas-huner`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 103. Tomáš Julínek — `tomas-julinek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 104. Václav Jehlička — `vaclav-jehlicka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 105. Vladimír Tošovský — `vladimir-tosovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 106. Vlasta Parkanová — `vlasta-parkanova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 107. Zdeněk Žák — `zdenek-zak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 108. Kateřina Valachová — `katerina-valachova`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 109. Michael Kocáb — `michael-kocab`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 110. Anna Hubáčková — `anna-hubackova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 111. Antonín Staněk — `antonin-stanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 112. Bohuslav Sobotka — `bohuslav-sobotka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 113. Dan Ťok — `dan-tok`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 114. Eva Decroix — `eva-decroix`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 115. Filip Turek — `filip-turek`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 116. Helena Langšádlová — `helena-langsadlova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 117. Ivan Bartoš — `ivan-bartos`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 118. Jakub Kulhánek — `jakub-kulhanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 119. Jan Blatný — `jan-blatny`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 120. Jan Hamáček — `jan-hamacek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 121. Jan Kněžínek — `jan-knezinek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 122. Jan Lipavský — `jan-lipavsky`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 123. Jan Skopeček — `jan-skopecek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 124. Jana Černochová — `jana-cernochova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 125. Jana Maláčová — `jana-malacova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 126. Jozef Síkela — `jozef-sikela`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 127. Karel Haas — `karel-haas`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 128. Klára Dostálová — `klara-dostalova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 129. Lubomír Zaorálek — `lubomir-zaoralek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 130. Lukáš Vlček — `lukas-vlcek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 131. Marek Benda — `marek-benda`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 132. Marek Výborný — `marek-vyborny`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 133. Marek Ženíšek — `marek-zenisek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 134. Marian Jurečka — `marian-jurecka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 135. Marta Nováková — `marta-novakova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 136. Martin Baxa — `martin-baxa`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 137. Martin Červíček — `martin-cervicek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 138. Martin Kupka — `martin-kupka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 139. Martin Stropnický — `martin-stropnicky`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 140. Michal Šalomoun — `michal-salomoun`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 141. Mikuláš Bek — `mikulas-bek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 142. Pavel Blažek — `pavel-blazek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 143. Pavel Drobil — `pavel-drobil`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 144. Petr Arenberger — `petr-arenberger`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 145. Petr Fiala — `petr-fiala`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 146. Petr Gazdík — `petr-gazdik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 147. Petr Hladík — `petr-hladik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 148. Petr Krčál — `petr-krcal`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 149. Petr Kulhánek — `petr-kulhanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 150. Petr Macinka — `petr-macinka`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 151. Richard Brabec — `richard-brabec`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 152. Robert Pelikán — `robert-pelikan`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 153. Roman Prymula — `roman-prymula`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 154. Taťána Malá — `tatana-mala`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 155. Tomáš Petříček — `tomas-petricek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 156. Věra Jourová — `vera-jourova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 157. Vít Rakušan — `vit-rakusan`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 158. Vladimír Balaš — `vladimir-balas`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 159. Vladimír Kremlík — `vladimir-kremlik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 160. Vlastimil Válek — `vlastimil-valek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 161. Zbyněk Stanjura — `zbynek-stanjura`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 162. Zdeněk Nekula — `zdenek-nekula`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

---

*Vygenerováno z kanonického modelu. Chceš jiné číslo? Změň data, ne tenhle soubor.*
