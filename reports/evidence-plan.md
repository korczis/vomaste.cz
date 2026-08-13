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

**Datový horizont**: `2026-08-10` — nejnovější datum v datasetu. Report neobsahuje čas
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
| Dossierů | 202 |
| Tvrzení | 1159 |
| — z toho `E0` / `E1` / `E1+` / `E2` | 0 / 654 / 91 / 414 |
| Zdrojů (z toho s vyplněnou `sourceFamily`) | 992 (426) |
| Kauz | 95 |
| Mezer celkem / otevřených / zastaralých | 212 / 209 / 0 |
| Vztahů | 341 |
| Bodů rizika celkem | 1634 |

## Pořadí dossierů

| # | Dossier | Priorita | Body | Podíl | Kumul. | Tvrzení | `E0`/`E1`/`E1+`/`E2` | Otevřené mezery | Zdroje bez rodiny | Aktualizováno |
|---:|---|---|---:|---:|---:|---:|---|---:|---:|---|
| 1 | [Andrej Babiš](../data/dossiers/andrej-babis/) `andrej-babis` | **vysoká** | 148 | 9.1 % | 9.1 % | 105 | 0/67/1/37 | 8 | 22 | 2026-08-06 |
| 2 | [Karel Havlíček](../data/dossiers/karel-havlicek/) `karel-havlicek` | **vysoká** | 95 | 5.8 % | 14.9 % | 58 | 0/37/8/13 | 12 | 27 | 2026-08-05 |
| 3 | [Jaromír Zůna](../data/dossiers/jaromir-zuna/) `jaromir-zuna` | **vysoká** | 83 | 5.1 % | 20.0 % | 58 | 0/36/2/20 | 9 | 22 | 2026-08-06 |
| 4 | [Martin Šebestyán](../data/dossiers/martin-sebestyan/) `martin-sebestyan` | **vysoká** | 78 | 4.8 % | 24.7 % | 55 | 0/32/0/23 | 14 | 20 | 2026-08-06 |
| 5 | [Zuzana Mrázová](../data/dossiers/zuzana-mrazova/) `zuzana-mrazova` | **vysoká** | 78 | 4.8 % | 29.5 % | 60 | 0/28/6/26 | 16 | 15 | 2026-08-05 |
| 6 | [Ivan Bednárik](../data/dossiers/ivan-bednarik/) `ivan-bednarik` | **vysoká** | 77 | 4.7 % | 34.2 % | 48 | 0/33/1/14 | 9 | 26 | 2026-07-30 |
| 7 | [Aleš Juchelka](../data/dossiers/ales-juchelka/) `ales-juchelka` | **vysoká** | 75 | 4.6 % | 38.8 % | 47 | 0/27/8/12 | 13 | 6 | 2026-07-30 |
| 8 | [Adam Vojtěch](../data/dossiers/adam-vojtech/) `adam-vojtech` | **vysoká** | 74 | 4.5 % | 43.3 % | 55 | 0/29/1/25 | 15 | 22 | 2026-08-06 |
| 9 | [Robert Plaga](../data/dossiers/robert-plaga/) `robert-plaga` | **vysoká** | 74 | 4.5 % | 47.9 % | 55 | 0/29/4/22 | 12 | 18 | 2026-08-06 |
| 10 | [Igor Červený](../data/dossiers/igor-cerveny/) `igor-cerveny` | **vysoká** | 73 | 4.5 % | 52.3 % | 59 | 0/25/9/25 | 14 | 14 | 2026-07-30 |
| 11 | [Oto Klempíř](../data/dossiers/oto-klempir/) `oto-klempir` | **střední** | 73 | 4.5 % | 56.8 % | 45 | 0/33/0/12 | 7 | 16 | 2026-08-06 |
| 12 | [Alena Schillerová](../data/dossiers/alena-schillerova/) `alena-schillerova` | **střední** | 71 | 4.3 % | 61.1 % | 41 | 0/28/4/9 | 9 | 15 | 2026-08-05 |
| 13 | [Petr Macinka a Filip Turek](../data/dossiers/macinka-turek/) `macinka-turek` | **střední** | 67 | 4.1 % | 65.2 % | 55 | 0/27/2/26 | 7 | 20 | 2026-07-29 |
| 14 | [Jeroným Tejc](../data/dossiers/jeronym-tejc/) `jeronym-tejc` | **střední** | 63 | 3.9 % | 69.1 % | 52 | 0/22/8/22 | 11 | 16 | 2026-08-06 |
| 15 | [Boris Šťastný](../data/dossiers/boris-stastny/) `boris-stastny` | **střední** | 60 | 3.7 % | 72.8 % | 42 | 0/21/5/16 | 12 | 8 | 2026-07-30 |
| 16 | [James Quick](../data/dossiers/james-quick/) `james-quick` | **střední** | 45 | 2.8 % | 75.5 % | 23 | 0/19/1/3 | 3 | 20 | 2026-08-05 |
| 17 | [Lubomír Metnar](../data/dossiers/lubomir-metnar/) `lubomir-metnar` | **střední** | 45 | 2.8 % | 78.3 % | 31 | 0/12/6/13 | 15 | 5 | 2026-08-05 |
| 18 | [Tomio Okamura](../data/dossiers/tomio-okamura/) `tomio-okamura` | **střední** | 41 | 2.5 % | 80.8 % | 36 | 0/9/13/14 | 8 | 10 | 2026-08-05 |
| 19 | [Richard Chlad](../data/dossiers/richard-chlad/) `richard-chlad` | **nízká** | 27 | 1.7 % | 82.4 % | 11 | 0/10/1/0 | 3 | 1 | 2026-08-05 |
| 20 | [Martin Pavlík](../data/dossiers/martin-pavlik/) `martin-pavlik` | **nízká** | 17 | 1.0 % | 83.5 % | 9 | 0/5/4/0 | 2 | 0 | 2026-08-08 |
| 21 | [Tünde Bartha](../data/dossiers/tunde-bartha/) `tunde-bartha` | **nízká** | 17 | 1.0 % | 84.5 % | 13 | 0/6/0/7 | 4 | 8 | 2026-08-01 |
| 22 | [Jaroslav Faltýnek](../data/dossiers/jaroslav-faltynek/) `jaroslav-faltynek` | **nízká** | 16 | 1.0 % | 85.5 % | 13 | 0/6/1/6 | 2 | 9 | 2026-08-05 |
| 23 | [Petr Fiala](../data/dossiers/petr-fiala/) `petr-fiala` | **nízká** | 8 | 0.5 % | 86.0 % | 3 | 0/2/0/1 | 3 | 2 | 2026-08-07 |
| 24 | [Petr Vencálek](../data/dossiers/petr-vencalek/) `petr-vencalek` | **nízká** | 3 | 0.2 % | 86.2 % | 3 | 0/1/0/2 | 1 | 2 | 2026-08-08 |
| 25 | [Alena Hanáková](../data/dossiers/alena-hanakova/) `alena-hanakova` | **nízká** | 2 | 0.1 % | 86.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 26 | [Aleš Řebíček](../data/dossiers/ales-rebicek/) `ales-rebicek` | **nízká** | 2 | 0.1 % | 86.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 27 | [Alexandr Vondra (ministr obrany)](../data/dossiers/alexandr-vondra-ministr/) `alexandr-vondra-ministr` | **nízká** | 2 | 0.1 % | 86.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 28 | [Antonín Prachař](../data/dossiers/antonin-prachar/) `antonin-prachar` | **nízká** | 2 | 0.1 % | 86.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 29 | [Cyril Svoboda](../data/dossiers/cyril-svoboda/) `cyril-svoboda` | **nízká** | 2 | 0.1 % | 86.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 30 | [Dalibor Štys](../data/dossiers/dalibor-stys/) `dalibor-stys` | **nízká** | 2 | 0.1 % | 86.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 31 | [Dana Bérová](../data/dossiers/dana-berova/) `dana-berova` | **nízká** | 2 | 0.1 % | 87.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 32 | [Dana Jurásková](../data/dossiers/dana-juraskova/) `dana-juraskova` | **nízká** | 2 | 0.1 % | 87.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 33 | [Dana Kuchtová](../data/dossiers/dana-kuchtova/) `dana-kuchtova` | **nízká** | 2 | 0.1 % | 87.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 34 | [Daniel Herman](../data/dossiers/daniel-herman/) `daniel-herman` | **nízká** | 2 | 0.1 % | 87.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 35 | [Daniela Filipiová](../data/dossiers/daniela-filipiova/) `daniela-filipiova` | **nízká** | 2 | 0.1 % | 87.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 36 | [Daniela Kovářová](../data/dossiers/daniela-kovarova/) `daniela-kovarova` | **nízká** | 2 | 0.1 % | 87.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 37 | [David Rath](../data/dossiers/david-rath/) `david-rath` | **nízká** | 2 | 0.1 % | 87.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 38 | [Džamila Stehlíková](../data/dossiers/dzamila-stehlikova/) `dzamila-stehlikova` | **nízká** | 2 | 0.1 % | 87.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 39 | [František Bublan](../data/dossiers/frantisek-bublan/) `frantisek-bublan` | **nízká** | 2 | 0.1 % | 88.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 40 | [František Koníček](../data/dossiers/frantisek-konicek/) `frantisek-konicek` | **nízká** | 2 | 0.1 % | 88.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 41 | [Gustáv Slamečka](../data/dossiers/gustav-slamecka/) `gustav-slamecka` | **nízká** | 2 | 0.1 % | 88.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 42 | [Helena Třeštíková](../data/dossiers/helena-trestikova/) `helena-trestikova` | **nízká** | 2 | 0.1 % | 88.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 43 | [Helena Válková](../data/dossiers/helena-valkova/) `helena-valkova` | **nízká** | 2 | 0.1 % | 88.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 44 | [Ilja Šmíd](../data/dossiers/ilja-smid/) `ilja-smid` | **nízká** | 2 | 0.1 % | 88.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 45 | [Ivan Fuksa](../data/dossiers/ivan-fuksa/) `ivan-fuksa` | **nízká** | 2 | 0.1 % | 88.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 46 | [Ivan Langer](../data/dossiers/ivan-langer/) `ivan-langer` | **nízká** | 2 | 0.1 % | 88.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 47 | [Ivan Pilný](../data/dossiers/ivan-pilny/) `ivan-pilny` | **nízká** | 2 | 0.1 % | 89.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 48 | [Jakub Šebesta](../data/dossiers/jakub-sebesta/) `jakub-sebesta` | **nízká** | 2 | 0.1 % | 89.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 49 | [Jan Chvojka](../data/dossiers/jan-chvojka/) `jan-chvojka` | **nízká** | 2 | 0.1 % | 89.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 50 | [Jan Dusík](../data/dossiers/jan-dusik/) `jan-dusik` | **nízká** | 2 | 0.1 % | 89.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 51 | [Jan Fischer](../data/dossiers/jan-fischer/) `jan-fischer` | **nízká** | 2 | 0.1 % | 89.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 52 | [Jan Kohout](../data/dossiers/jan-kohout/) `jan-kohout` | **nízká** | 2 | 0.1 % | 89.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 53 | [Jan Kubice](../data/dossiers/jan-kubice/) `jan-kubice` | **nízká** | 2 | 0.1 % | 89.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 54 | [Jan Mládek](../data/dossiers/jan-mladek/) `jan-mladek` | **nízká** | 2 | 0.1 % | 89.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 55 | [Jaromír Drábek](../data/dossiers/jaromir-drabek/) `jaromir-drabek` | **nízká** | 2 | 0.1 % | 90.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 56 | [Jaroslav Palas](../data/dossiers/jaroslav-palas/) `jaroslav-palas` | **nízká** | 2 | 0.1 % | 90.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 57 | [Jaroslav Tvrdík](../data/dossiers/jaroslav-tvrdik/) `jaroslav-tvrdik` | **nízká** | 2 | 0.1 % | 90.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 58 | [Jaroslava Němcová](../data/dossiers/jaroslava-nemcova/) `jaroslava-nemcova` | **nízká** | 2 | 0.1 % | 90.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 59 | [Jiří Balvín](../data/dossiers/jiri-balvin/) `jiri-balvin` | **nízká** | 2 | 0.1 % | 90.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 60 | [Jiří Besser](../data/dossiers/jiri-besser/) `jiri-besser` | **nízká** | 2 | 0.1 % | 90.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 61 | [Jiří Čunek](../data/dossiers/jiri-cunek/) `jiri-cunek` | **nízká** | 2 | 0.1 % | 90.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 62 | [Jiří Dienstbier ml.](../data/dossiers/jiri-dienstbier-ml/) `jiri-dienstbier-ml` | **nízká** | 2 | 0.1 % | 90.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 63 | [Jiří Havlíček](../data/dossiers/jiri-havlicek/) `jiri-havlicek` | **nízká** | 2 | 0.1 % | 90.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 64 | [Jiří Milek](../data/dossiers/jiri-milek/) `jiri-milek` | **nízká** | 2 | 0.1 % | 91.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 65 | [Jiří Paroubek](../data/dossiers/jiri-paroubek/) `jiri-paroubek` | **nízká** | 2 | 0.1 % | 91.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 66 | [Jiří Rusnok](../data/dossiers/jiri-rusnok/) `jiri-rusnok` | **nízká** | 2 | 0.1 % | 91.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 67 | [Jiří Šedivý](../data/dossiers/jiri-sedivy-ministr/) `jiri-sedivy-ministr` | **nízká** | 2 | 0.1 % | 91.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 68 | [Josef Dobeš](../data/dossiers/josef-dobes/) `josef-dobes` | **nízká** | 2 | 0.1 % | 91.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 69 | [Jozef Kubinyi](../data/dossiers/jozef-kubinyi/) `jozef-kubinyi` | **nízká** | 2 | 0.1 % | 91.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 70 | [Juraj Chmiel](../data/dossiers/juraj-chmiel/) `juraj-chmiel` | **nízká** | 2 | 0.1 % | 91.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 71 | [Kamil Jankovský](../data/dossiers/kamil-jankovsky/) `kamil-jankovsky` | **nízká** | 2 | 0.1 % | 91.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 72 | [Karel Kühnl](../data/dossiers/karel-kuhnl/) `karel-kuhnl` | **nízká** | 2 | 0.1 % | 92.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 73 | [Karel Schwarzenberg](../data/dossiers/karel-schwarzenberg/) `karel-schwarzenberg` | **nízká** | 2 | 0.1 % | 92.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 74 | [Karla Šlechtová](../data/dossiers/karla-slechtova/) `karla-slechtova` | **nízká** | 2 | 0.1 % | 92.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 75 | [Karolína Peake](../data/dossiers/karolina-peake/) `karolina-peake` | **nízká** | 2 | 0.1 % | 92.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 76 | [Ladislav Miko](../data/dossiers/ladislav-miko/) `ladislav-miko` | **nízká** | 2 | 0.1 % | 92.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 77 | [Leoš Heger](../data/dossiers/leos-heger/) `leos-heger` | **nízká** | 2 | 0.1 % | 92.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 78 | [Libor Ambrozek](../data/dossiers/libor-ambrozek/) `libor-ambrozek` | **nízká** | 2 | 0.1 % | 92.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 79 | [Ludmila Müllerová](../data/dossiers/ludmila-mullerova/) `ludmila-mullerova` | **nízká** | 2 | 0.1 % | 92.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 80 | [Marcel Chládek](../data/dossiers/marcel-chladek/) `marcel-chladek` | **nízká** | 2 | 0.1 % | 93.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 81 | [Marie Součková](../data/dossiers/marie-souckova/) `marie-souckova` | **nízká** | 2 | 0.1 % | 93.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 82 | [Martin Barták](../data/dossiers/martin-bartak/) `martin-bartak` | **nízká** | 2 | 0.1 % | 93.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 83 | [Martin Bursík](../data/dossiers/martin-bursik/) `martin-bursik` | **nízká** | 2 | 0.1 % | 93.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 84 | [Martin Dvořák](../data/dossiers/martin-dvorak/) `martin-dvorak` | **nízká** | 2 | 0.1 % | 93.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 85 | [Martin Holcát](../data/dossiers/martin-holcat/) `martin-holcat` | **nízká** | 2 | 0.1 % | 93.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 86 | [Martin Jahn](../data/dossiers/martin-jahn/) `martin-jahn` | **nízká** | 2 | 0.1 % | 93.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 87 | [Martin Kuba](../data/dossiers/martin-kuba/) `martin-kuba` | **nízká** | 2 | 0.1 % | 93.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 88 | [Martin Pecina](../data/dossiers/martin-pecina/) `martin-pecina` | **nízká** | 2 | 0.1 % | 94.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 89 | [Martin Říman](../data/dossiers/martin-riman/) `martin-riman` | **nízká** | 2 | 0.1 % | 94.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 90 | [Michaela Marksová](../data/dossiers/michaela-marksova/) `michaela-marksova` | **nízká** | 2 | 0.1 % | 94.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 91 | [Milan Chovanec](../data/dossiers/milan-chovanec/) `milan-chovanec` | **nízká** | 2 | 0.1 % | 94.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 92 | [Milan Šimonovský](../data/dossiers/milan-simonovsky/) `milan-simonovsky` | **nízká** | 2 | 0.1 % | 94.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 93 | [Milan Urban](../data/dossiers/milan-urban/) `milan-urban` | **nízká** | 2 | 0.1 % | 94.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 94 | [Milena Vicenová](../data/dossiers/milena-vicenova/) `milena-vicenova` | **nízká** | 2 | 0.1 % | 94.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 95 | [Miloš Zeman](../data/dossiers/milos-zeman/) `milos-zeman` | **nízká** | 2 | 0.1 % | 94.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 96 | [Miloslav Ludvík](../data/dossiers/miloslav-ludvik/) `miloslav-ludvik` | **nízká** | 2 | 0.1 % | 95.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 97 | [Mirek Topolánek](../data/dossiers/mirek-topolanek/) `mirek-topolanek` | **nízká** | 2 | 0.1 % | 95.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 98 | [Miroslav Kalousek](../data/dossiers/miroslav-kalousek/) `miroslav-kalousek` | **nízká** | 2 | 0.1 % | 95.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 99 | [Miroslav Kostelka](../data/dossiers/miroslav-kostelka/) `miroslav-kostelka` | **nízká** | 2 | 0.1 % | 95.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 100 | [Miroslav Toman](../data/dossiers/miroslav-toman/) `miroslav-toman` | **nízká** | 2 | 0.1 % | 95.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 101 | [Miroslava Kopicová](../data/dossiers/miroslava-kopicova/) `miroslava-kopicova` | **nízká** | 2 | 0.1 % | 95.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 102 | [Ondřej Liška](../data/dossiers/ondrej-liska/) `ondrej-liska` | **nízká** | 2 | 0.1 % | 95.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 103 | [Pavel Bělobrádek](../data/dossiers/pavel-belobradek/) `pavel-belobradek` | **nízká** | 2 | 0.1 % | 95.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 104 | [Pavel Dobeš](../data/dossiers/pavel-dobes/) `pavel-dobes` | **nízká** | 2 | 0.1 % | 96.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 105 | [Pavel Němec](../data/dossiers/pavel-nemec/) `pavel-nemec` | **nízká** | 2 | 0.1 % | 96.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 106 | [Pavel Svoboda](../data/dossiers/pavel-svoboda-ministr/) `pavel-svoboda-ministr` | **nízká** | 2 | 0.1 % | 96.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 107 | [Pavel Zářecký](../data/dossiers/pavel-zarecky/) `pavel-zarecky` | **nízká** | 2 | 0.1 % | 96.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 108 | [Petr Bendl](../data/dossiers/petr-bendl-ministr/) `petr-bendl-ministr` | **nízká** | 2 | 0.1 % | 96.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 109 | [Petr Gandalovič](../data/dossiers/petr-gandalovic/) `petr-gandalovic` | **nízká** | 2 | 0.1 % | 96.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 110 | [Petr Kalaš](../data/dossiers/petr-kalas/) `petr-kalas` | **nízká** | 2 | 0.1 % | 96.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 111 | [Petr Mareš](../data/dossiers/petr-mares/) `petr-mares` | **nízká** | 2 | 0.1 % | 96.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 112 | [Petr Nečas](../data/dossiers/petr-necas/) `petr-necas` | **nízká** | 2 | 0.1 % | 96.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 113 | [Petr Pavel](../data/dossiers/petr-pavel/) `petr-pavel` | **nízká** | 2 | 0.1 % | 97.1 % | 3 | 0/1/0/2 | 0 | 0 | 2026-08-01 |
| 114 | [Petr Šimerka](../data/dossiers/petr-simerka/) `petr-simerka` | **nízká** | 2 | 0.1 % | 97.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 115 | [Petr Zgarba](../data/dossiers/petr-zgarba/) `petr-zgarba` | **nízká** | 2 | 0.1 % | 97.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 116 | [Petra Buzková](../data/dossiers/petra-buzkova/) `petra-buzkova` | **nízká** | 2 | 0.1 % | 97.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 117 | [Radek John](../data/dossiers/radek-john/) `radek-john` | **nízká** | 2 | 0.1 % | 97.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 118 | [Radko Martínek](../data/dossiers/radko-martinek/) `radko-martinek` | **nízká** | 2 | 0.1 % | 97.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 119 | [Rut Bízková](../data/dossiers/rut-bizkova/) `rut-bizkova` | **nízká** | 2 | 0.1 % | 97.8 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 120 | [Stanislav Štech](../data/dossiers/stanislav-stech/) `stanislav-stech` | **nízká** | 2 | 0.1 % | 97.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 121 | [Štefan Füle](../data/dossiers/stefan-fule/) `stefan-fule` | **nízká** | 2 | 0.1 % | 98.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 122 | [Svatopluk Němeček](../data/dossiers/svatopluk-nemecek/) `svatopluk-nemecek` | **nízká** | 2 | 0.1 % | 98.2 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 123 | [Tomáš Chalupa](../data/dossiers/tomas-chalupa/) `tomas-chalupa` | **nízká** | 2 | 0.1 % | 98.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 124 | [Tomáš Hüner](../data/dossiers/tomas-huner/) `tomas-huner` | **nízká** | 2 | 0.1 % | 98.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 125 | [Tomáš Julínek](../data/dossiers/tomas-julinek/) `tomas-julinek` | **nízká** | 2 | 0.1 % | 98.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 126 | [Václav Jehlička](../data/dossiers/vaclav-jehlicka/) `vaclav-jehlicka` | **nízká** | 2 | 0.1 % | 98.7 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 127 | [Vít Rakušan](../data/dossiers/vit-rakusan/) `vit-rakusan` | **nízká** | 2 | 0.1 % | 98.8 % | 3 | 0/1/0/2 | 0 | 1 | 2026-08-08 |
| 128 | [Vítězslav Jandák](../data/dossiers/vitezslav-jandak/) `vitezslav-jandak` | **nízká** | 2 | 0.1 % | 98.9 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 129 | [Vladimír Špidla](../data/dossiers/vladimir-spidla/) `vladimir-spidla` | **nízká** | 2 | 0.1 % | 99.0 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 130 | [Vladimír Tošovský](../data/dossiers/vladimir-tosovsky/) `vladimir-tosovsky` | **nízká** | 2 | 0.1 % | 99.1 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 131 | [Vlasta Parkanová](../data/dossiers/vlasta-parkanova/) `vlasta-parkanova` | **nízká** | 2 | 0.1 % | 99.3 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 132 | [Vlastimil Tlustý](../data/dossiers/vlastimil-tlusty/) `vlastimil-tlusty` | **nízká** | 2 | 0.1 % | 99.4 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 133 | [Zdeněk Škromach](../data/dossiers/zdenek-skromach/) `zdenek-skromach` | **nízká** | 2 | 0.1 % | 99.5 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 134 | [Zdeněk Žák](../data/dossiers/zdenek-zak/) `zdenek-zak` | **nízká** | 2 | 0.1 % | 99.6 % | 1 | 0/1/0/0 | 0 | 1 | 2026-08-08 |
| 135 | [Jaroslav Bureš](../data/dossiers/jaroslav-bures/) `jaroslav-bures` | **nízká** | 1 | 0.1 % | 99.7 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 136 | [Kateřina Valachová](../data/dossiers/katerina-valachova/) `katerina-valachova` | **nízká** | 1 | 0.1 % | 99.8 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 137 | [Michael Kocáb](../data/dossiers/michael-kocab/) `michael-kocab` | **nízká** | 1 | 0.1 % | 99.8 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 138 | [Milada Emmerová](../data/dossiers/milada-emmerova/) `milada-emmerova` | **nízká** | 1 | 0.1 % | 99.9 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 139 | [Pavel Rychetský](../data/dossiers/pavel-rychetsky/) `pavel-rychetsky` | **nízká** | 1 | 0.1 % | 99.9 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 140 | [Vladimír Mlynář](../data/dossiers/vladimir-mlynar/) `vladimir-mlynar` | **nízká** | 1 | 0.1 % | 100.0 % | 1 | 0/0/1/0 | 0 | 2 | 2026-08-08 |
| 141 | [Anna Hubáčková](../data/dossiers/anna-hubackova/) `anna-hubackova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 142 | [Antonín Staněk](../data/dossiers/antonin-stanek/) `antonin-stanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 143 | [Benjamin Činčila](../data/dossiers/benjamin-cincila/) `benjamin-cincila` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 144 | [Bohuslav Sobotka](../data/dossiers/bohuslav-sobotka/) `bohuslav-sobotka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 145 | [Dan Ťok](../data/dossiers/dan-tok/) `dan-tok` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 146 | [Eva Decroix](../data/dossiers/eva-decroix/) `eva-decroix` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 147 | [Filip Turek](../data/dossiers/filip-turek/) `filip-turek` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 148 | [Helena Langšádlová](../data/dossiers/helena-langsadlova/) `helena-langsadlova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 149 | [Ivan Bartoš](../data/dossiers/ivan-bartos/) `ivan-bartos` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 150 | [Jakub Kulhánek](../data/dossiers/jakub-kulhanek/) `jakub-kulhanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 151 | [Jan Blatný](../data/dossiers/jan-blatny/) `jan-blatny` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 152 | [Jan Grolich](../data/dossiers/jan-grolich/) `jan-grolich` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 153 | [Jan Hamáček](../data/dossiers/jan-hamacek/) `jan-hamacek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 154 | [Jan Jakob](../data/dossiers/jan-jakob/) `jan-jakob` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 155 | [Jan Kněžínek](../data/dossiers/jan-knezinek/) `jan-knezinek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 156 | [Jan Lipavský](../data/dossiers/jan-lipavsky/) `jan-lipavsky` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 157 | [Jan Skopeček](../data/dossiers/jan-skopecek/) `jan-skopecek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 158 | [Jana Černochová](../data/dossiers/jana-cernochova/) `jana-cernochova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 159 | [Jana Maláčová](../data/dossiers/jana-malacova/) `jana-malacova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 160 | [Jiří Pospíšil](../data/dossiers/jiri-pospisil/) `jiri-pospisil` | **žádná** | 0 | 0.0 % | 100.0 % | 2 | 0/0/0/2 | 0 | 3 | 2026-08-09 |
| 161 | [Jozef Síkela](../data/dossiers/jozef-sikela/) `jozef-sikela` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 162 | [Karel Haas](../data/dossiers/karel-haas/) `karel-haas` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 163 | [Kateřina Stojanová](../data/dossiers/katerina-stojanova/) `katerina-stojanova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 164 | [Klára Dostálová](../data/dossiers/klara-dostalova/) `klara-dostalova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 165 | [Lubomír Zaorálek](../data/dossiers/lubomir-zaoralek/) `lubomir-zaoralek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 166 | [Lukáš Vlček](../data/dossiers/lukas-vlcek/) `lukas-vlcek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 167 | [Marek Benda](../data/dossiers/marek-benda/) `marek-benda` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 168 | [Marek Výborný](../data/dossiers/marek-vyborny/) `marek-vyborny` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 169 | [Marek Ženíšek](../data/dossiers/marek-zenisek/) `marek-zenisek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 170 | [Marian Jurečka](../data/dossiers/marian-jurecka/) `marian-jurecka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 171 | [Marta Nováková](../data/dossiers/marta-novakova/) `marta-novakova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 172 | [Martin Baxa](../data/dossiers/martin-baxa/) `martin-baxa` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-06 |
| 173 | [Martin Červíček](../data/dossiers/martin-cervicek/) `martin-cervicek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 174 | [Martin Kupka](../data/dossiers/martin-kupka/) `martin-kupka` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-06 |
| 175 | [Martin Stropnický](../data/dossiers/martin-stropnicky/) `martin-stropnicky` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 176 | [Matěj Ondřej Havel](../data/dossiers/matej-ondrej-havel/) `matej-ondrej-havel` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 177 | [Michaela Šebelová](../data/dossiers/michaela-sebelova/) `michaela-sebelova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-07 |
| 178 | [Michal Šalomoun](../data/dossiers/michal-salomoun/) `michal-salomoun` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 179 | [Mikuláš Bek](../data/dossiers/mikulas-bek/) `mikulas-bek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 180 | [Olga Richterová](../data/dossiers/olga-richterova/) `olga-richterova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 181 | [Pavel Blažek](../data/dossiers/pavel-blazek/) `pavel-blazek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 182 | [Pavel Drobil](../data/dossiers/pavel-drobil/) `pavel-drobil` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 183 | [Petr Arenberger](../data/dossiers/petr-arenberger/) `petr-arenberger` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 184 | [Petr Gazdík](../data/dossiers/petr-gazdik/) `petr-gazdik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 185 | [Petr Hladík](../data/dossiers/petr-hladik/) `petr-hladik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 186 | [Petr Krčál](../data/dossiers/petr-krcal/) `petr-krcal` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 187 | [Petr Kulhánek](../data/dossiers/petr-kulhanek/) `petr-kulhanek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-08 |
| 188 | [Petr Macinka](../data/dossiers/petr-macinka/) `petr-macinka` *(view)* | **žádná** | 0 | 0.0 % | 100.0 % | 0 | 0/0/0/0 | 0 | 0 | 2026-07-29 |
| 189 | [Petr Sokol](../data/dossiers/petr-sokol/) `petr-sokol` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 4 | 2026-08-06 |
| 190 | [Renáta Zajíčková](../data/dossiers/renata-zajickova/) `renata-zajickova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 3 | 2026-08-06 |
| 191 | [Richard Brabec](../data/dossiers/richard-brabec/) `richard-brabec` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 192 | [Robert Pelikán](../data/dossiers/robert-pelikan/) `robert-pelikan` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 193 | [Roman Prymula](../data/dossiers/roman-prymula/) `roman-prymula` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 194 | [Taťána Malá](../data/dossiers/tatana-mala/) `tatana-mala` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 195 | [Tomáš Petříček](../data/dossiers/tomas-petricek/) `tomas-petricek` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 196 | [Věra Jourová](../data/dossiers/vera-jourova/) `vera-jourova` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 197 | [Vladimír Balaš](../data/dossiers/vladimir-balas/) `vladimir-balas` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 198 | [Vladimír Kremlík](../data/dossiers/vladimir-kremlik/) `vladimir-kremlik` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 199 | [Vlastimil Válek](../data/dossiers/vlastimil-valek/) `vlastimil-valek` | **žádná** | 0 | 0.0 % | 100.0 % | 2 | 0/0/0/2 | 0 | 3 | 2026-08-09 |
| 200 | [Zbyněk Stanjura](../data/dossiers/zbynek-stanjura/) `zbynek-stanjura` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-08 |
| 201 | [Zdeněk Hřib](../data/dossiers/zdenek-hrib/) `zdenek-hrib` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 2 | 2026-08-07 |
| 202 | [Zdeněk Nekula](../data/dossiers/zdenek-nekula/) `zdenek-nekula` | **žádná** | 0 | 0.0 % | 100.0 % | 1 | 0/0/0/1 | 0 | 1 | 2026-08-08 |

## Plán per dossier

### 1. Andrej Babiš — `andrej-babis`

**Priorita vysoká** · 148 bodů (9.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-05`

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

**Priorita vysoká** · 95 bodů (5.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 58 | 0 | 37 | 8 | 13 | 41 | 14 | 4 | 12 (12) | 22 |

Deklarované stavy: CORROBORATED 11 · 1 ZDROJ 25 · CITACE 22

Další krok:

- 37 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-07, CLM-08) → dohledat druhého, nezávislého vydavatele
- 11 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-06, CLM-12, CLM-13) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 27 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 3. Jaromír Zůna — `jaromir-zuna`

**Priorita vysoká** · 83 bodů (5.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

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

**Priorita vysoká** · 78 bodů (4.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 32 | 0 | 23 | 43 | 23 | 3 | 14 (14) | 6 |

Deklarované stavy: CORROBORATED 15 · 1 ZDROJ 25 · CITACE 11 · SPORNÉ 4

Další krok:

- 32 tvrzení stojí na jediném zdroji (např. CLM-04, CLM-05, CLM-07) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 5. Zuzana Mrázová — `zuzana-mrazova`

**Priorita vysoká** · 78 bodů (4.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

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

**Priorita vysoká** · 77 bodů (4.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 48 | 0 | 33 | 1 | 14 | 34 | 8 | 2 | 9 (9) | 21 |

Deklarované stavy: CORROBORATED 14 · 1 ZDROJ 28 · CITACE 6

Další krok:

- 33 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 8 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-29) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 26 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 7. Aleš Juchelka — `ales-juchelka`

**Priorita vysoká** · 75 bodů (4.6 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 47 | 0 | 27 | 8 | 12 | 20 | 14 | 5 | 13 (13) | 14 |

Deklarované stavy: CORROBORATED 12 · 1 ZDROJ 21 · CITACE 14

Další krok:

- 27 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 13 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-10, CLM-17, CLM-23) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 6 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 8. Adam Vojtěch — `adam-vojtech`

**Priorita vysoká** · 74 bodů (4.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 29 | 1 | 25 | 49 | 27 | 3 | 15 (15) | 6 |

Deklarované stavy: CORROBORATED 24 · 1 ZDROJ 22 · CITACE 9

Další krok:

- 29 tvrzení stojí na jediném zdroji (např. CLM-09, CLM-10, CLM-12) → dohledat druhého, nezávislého vydavatele
- 15 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-28) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 22 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 9. Robert Plaga — `robert-plaga`

**Priorita vysoká** · 74 bodů (4.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 29 | 4 | 22 | 37 | 19 | 3 | 12 (12) | 7 |

Deklarované stavy: CORROBORATED 20 · 1 ZDROJ 22 · CITACE 12 · SPORNÉ 1

Další krok:

- 29 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-09, CLM-10) → dohledat druhého, nezávislého vydavatele
- 12 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 4 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-22, CLM-23, CLM-25) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 18 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 10. Igor Červený — `igor-cerveny`

**Priorita vysoká** · 73 bodů (4.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 59 | 0 | 25 | 9 | 25 | 37 | 23 | 4 | 14 (14) | 21 |

Deklarované stavy: CORROBORATED 24 · 1 ZDROJ 31 · CITACE 4

Další krok:

- 25 tvrzení stojí na jediném zdroji (např. CLM-06, CLM-07, CLM-09) → dohledat druhého, nezávislého vydavatele
- 14 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 9 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-08, CLM-12, CLM-13) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 14 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 11. Oto Klempíř — `oto-klempir`

**Priorita střední** · 73 bodů (4.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 45 | 0 | 33 | 0 | 12 | 35 | 19 | 5 | 7 (7) | 11 |

Deklarované stavy: CORROBORATED 11 · 1 ZDROJ 17 · CITACE 17

Další krok:

- 33 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 7 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 16 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 12. Alena Schillerová — `alena-schillerova`

**Priorita střední** · 71 bodů (4.3 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 41 | 0 | 28 | 4 | 9 | 28 | 13 | 4 | 9 (9) | 17 |

Deklarované stavy: CORROBORATED 8 · 1 ZDROJ 23 · CITACE 10

Další krok:

- 28 tvrzení stojí na jediném zdroji (např. CLM-02, CLM-04, CLM-06) → dohledat druhého, nezávislého vydavatele
- 7 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 4 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-05, CLM-13, CLM-14) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 15 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 13. Petr Macinka a Filip Turek — `macinka-turek`

**Priorita střední** · 67 bodů (4.1 % celkového objemu práce) · typ `aggregate` · aktualizováno `2026-07-29`, revidováno `2026-07-29`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 55 | 0 | 27 | 2 | 26 | 62 | 42 | 4 | 7 (7) | 34 |

Deklarované stavy: CORROBORATED 20 · 1 ZDROJ 23 · CITACE 11 · SPORNÉ 1

Další krok:

- 27 tvrzení stojí na jediném zdroji (např. CLM-07, CLM-08, CLM-10) → dohledat druhého, nezávislého vydavatele
- 4 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 3 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 2 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-11, CLM-27) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 14. Jeroným Tejc — `jeronym-tejc`

**Priorita střední** · 63 bodů (3.9 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `2026-08-06`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 52 | 0 | 22 | 8 | 22 | 31 | 15 | 3 | 11 (11) | 19 |

Deklarované stavy: CORROBORATED 18 · 1 ZDROJ 20 · CITACE 14

Další krok:

- 22 tvrzení stojí na jediném zdroji (např. CLM-23, CLM-24, CLM-25) → dohledat druhého, nezávislého vydavatele
- 11 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 8 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-03, CLM-06, CLM-07) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 16 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 15. Boris Šťastný — `boris-stastny`

**Priorita střední** · 60 bodů (3.7 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-30`, revidováno `2026-07-30`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 42 | 0 | 21 | 5 | 16 | 23 | 15 | 3 | 12 (12) | 28 |

Deklarované stavy: CORROBORATED 14 · 1 ZDROJ 11 · CITACE 17

Další krok:

- 21 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 11 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 5 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-12, CLM-18, CLM-19) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 1 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 8 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 16. James Quick — `james-quick`

**Priorita střední** · 45 bodů (2.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 23 | 0 | 19 | 1 | 3 | 23 | 3 | 5 | 3 (3) | 10 |

Deklarované stavy: CORROBORATED 3 · 1 ZDROJ 19 · CITACE 1

Další krok:

- 19 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-03, CLM-04) → dohledat druhého, nezávislého vydavatele
- 3 otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly
- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-02) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 20 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 17. Lubomír Metnar — `lubomir-metnar`

**Priorita střední** · 45 bodů (2.8 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 31 | 0 | 12 | 6 | 13 | 13 | 8 | 4 | 15 (15) | 8 |

Deklarované stavy: CORROBORATED 10 · 1 ZDROJ 8 · CITACE 11 · SPORNÉ 2

Další krok:

- 12 tvrzení stojí na jediném zdroji (např. CLM-01, CLM-03, CLM-06) → dohledat druhého, nezávislého vydavatele
- 15 dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá
- 6 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-05, CLM-14, CLM-18) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 5 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 18. Tomio Okamura — `tomio-okamura`

**Priorita střední** · 41 bodů (2.5 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-05`, revidováno `2026-08-05`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 36 | 0 | 9 | 13 | 14 | 33 | 23 | 5 | 8 (8) | 7 |

Deklarované stavy: CORROBORATED 14 · 1 ZDROJ 19 · CITACE 3

Další krok:

- 9 tvrzení stojí na jediném zdroji (např. CLM-03, CLM-04, CLM-05) → dohledat druhého, nezávislého vydavatele
- 13 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01, CLM-02, CLM-08) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
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

### 25. Alena Hanáková — `alena-hanakova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 26. Aleš Řebíček — `ales-rebicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 27. Alexandr Vondra (ministr obrany) — `alexandr-vondra-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 28. Antonín Prachař — `antonin-prachar`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 29. Cyril Svoboda — `cyril-svoboda`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 30. Dalibor Štys — `dalibor-stys`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 31. Dana Bérová — `dana-berova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 32. Dana Jurásková — `dana-juraskova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 33. Dana Kuchtová — `dana-kuchtova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 34. Daniel Herman — `daniel-herman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 35. Daniela Filipiová — `daniela-filipiova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 36. Daniela Kovářová — `daniela-kovarova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 37. David Rath — `david-rath`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 38. Džamila Stehlíková — `dzamila-stehlikova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 39. František Bublan — `frantisek-bublan`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 40. František Koníček — `frantisek-konicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 41. Gustáv Slamečka — `gustav-slamecka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 42. Helena Třeštíková — `helena-trestikova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 43. Helena Válková — `helena-valkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 44. Ilja Šmíd — `ilja-smid`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 45. Ivan Fuksa — `ivan-fuksa`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 46. Ivan Langer — `ivan-langer`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 47. Ivan Pilný — `ivan-pilny`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 48. Jakub Šebesta — `jakub-sebesta`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 49. Jan Chvojka — `jan-chvojka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 50. Jan Dusík — `jan-dusik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 51. Jan Fischer — `jan-fischer`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 52. Jan Kohout — `jan-kohout`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 53. Jan Kubice — `jan-kubice`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 54. Jan Mládek — `jan-mladek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 55. Jaromír Drábek — `jaromir-drabek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 56. Jaroslav Palas — `jaroslav-palas`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 57. Jaroslav Tvrdík — `jaroslav-tvrdik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 58. Jaroslava Němcová — `jaroslava-nemcova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 59. Jiří Balvín — `jiri-balvin`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 60. Jiří Besser — `jiri-besser`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 61. Jiří Čunek — `jiri-cunek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 62. Jiří Dienstbier ml. — `jiri-dienstbier-ml`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 63. Jiří Havlíček — `jiri-havlicek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 64. Jiří Milek — `jiri-milek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 65. Jiří Paroubek — `jiri-paroubek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 66. Jiří Rusnok — `jiri-rusnok`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 67. Jiří Šedivý — `jiri-sedivy-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 68. Josef Dobeš — `josef-dobes`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 69. Jozef Kubinyi — `jozef-kubinyi`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 70. Juraj Chmiel — `juraj-chmiel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 71. Kamil Jankovský — `kamil-jankovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 72. Karel Kühnl — `karel-kuhnl`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 73. Karel Schwarzenberg — `karel-schwarzenberg`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 74. Karla Šlechtová — `karla-slechtova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 75. Karolína Peake — `karolina-peake`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 76. Ladislav Miko — `ladislav-miko`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 77. Leoš Heger — `leos-heger`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 78. Libor Ambrozek — `libor-ambrozek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 79. Ludmila Müllerová — `ludmila-mullerova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 80. Marcel Chládek — `marcel-chladek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 81. Marie Součková — `marie-souckova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 82. Martin Barták — `martin-bartak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 83. Martin Bursík — `martin-bursik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 84. Martin Dvořák — `martin-dvorak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 85. Martin Holcát — `martin-holcat`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 86. Martin Jahn — `martin-jahn`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 87. Martin Kuba — `martin-kuba`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 88. Martin Pecina — `martin-pecina`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 89. Martin Říman — `martin-riman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 90. Michaela Marksová — `michaela-marksova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 91. Milan Chovanec — `milan-chovanec`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 92. Milan Šimonovský — `milan-simonovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 93. Milan Urban — `milan-urban`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 94. Milena Vicenová — `milena-vicenova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 95. Miloš Zeman — `milos-zeman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 96. Miloslav Ludvík — `miloslav-ludvik`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 97. Mirek Topolánek — `mirek-topolanek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 98. Miroslav Kalousek — `miroslav-kalousek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 99. Miroslav Kostelka — `miroslav-kostelka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 100. Miroslav Toman — `miroslav-toman`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 101. Miroslava Kopicová — `miroslava-kopicova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 102. Ondřej Liška — `ondrej-liska`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 103. Pavel Bělobrádek — `pavel-belobradek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 104. Pavel Dobeš — `pavel-dobes`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 105. Pavel Němec — `pavel-nemec`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 106. Pavel Svoboda — `pavel-svoboda-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 107. Pavel Zářecký — `pavel-zarecky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 108. Petr Bendl — `petr-bendl-ministr`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 109. Petr Gandalovič — `petr-gandalovic`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 110. Petr Kalaš — `petr-kalas`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 111. Petr Mareš — `petr-mares`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 112. Petr Nečas — `petr-necas`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 113. Petr Pavel — `petr-pavel`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-01`, revidováno `2026-08-01`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 4 | 4 | 1 | 0 (0) | 2 |

Deklarované stavy: CORROBORATED 2 · CITACE 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-02) → dohledat druhého, nezávislého vydavatele

### 114. Petr Šimerka — `petr-simerka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 115. Petr Zgarba — `petr-zgarba`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 116. Petra Buzková — `petra-buzkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 117. Radek John — `radek-john`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 118. Radko Martínek — `radko-martinek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 119. Rut Bízková — `rut-bizkova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 120. Stanislav Štech — `stanislav-stech`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 121. Štefan Füle — `stefan-fule`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 122. Svatopluk Němeček — `svatopluk-nemecek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 123. Tomáš Chalupa — `tomas-chalupa`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 124. Tomáš Hüner — `tomas-huner`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 125. Tomáš Julínek — `tomas-julinek`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 126. Václav Jehlička — `vaclav-jehlicka`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 127. Vít Rakušan — `vit-rakusan`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 0 | 1 | 0 | 2 | 6 | 5 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 2 · CITACE 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-03) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 128. Vítězslav Jandák — `vitezslav-jandak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 129. Vladimír Špidla — `vladimir-spidla`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 130. Vladimír Tošovský — `vladimir-tosovsky`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 131. Vlasta Parkanová — `vlasta-parkanova`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 132. Vlastimil Tlustý — `vlastimil-tlusty`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 133. Zdeněk Škromach — `zdenek-skromach`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 134. Zdeněk Žák — `zdenek-zak`

**Priorita nízká** · 2 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení stojí na jediném zdroji (např. CLM-01) → dohledat druhého, nezávislého vydavatele
- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 135. Jaroslav Bureš — `jaroslav-bures`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 136. Kateřina Valachová — `katerina-valachova`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 137. Michael Kocáb — `michael-kocab`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 138. Milada Emmerová — `milada-emmerova`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 139. Pavel Rychetský — `pavel-rychetsky`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 140. Vladimír Mlynář — `vladimir-mlynar`

**Priorita nízká** · 1 bodů (0.1 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: 1 ZDROJ 1

Další krok:

- 1 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele (např. CLM-01) → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED
- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 141. Anna Hubáčková — `anna-hubackova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 142. Antonín Staněk — `antonin-stanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 143. Benjamin Činčila — `benjamin-cincila`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 144. Bohuslav Sobotka — `bohuslav-sobotka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 145. Dan Ťok — `dan-tok`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 146. Eva Decroix — `eva-decroix`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 147. Filip Turek — `filip-turek`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 148. Helena Langšádlová — `helena-langsadlova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 149. Ivan Bartoš — `ivan-bartos`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 150. Jakub Kulhánek — `jakub-kulhanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 151. Jan Blatný — `jan-blatny`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 152. Jan Grolich — `jan-grolich`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 153. Jan Hamáček — `jan-hamacek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 154. Jan Jakob — `jan-jakob`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 155. Jan Kněžínek — `jan-knezinek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 156. Jan Lipavský — `jan-lipavsky`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 157. Jan Skopeček — `jan-skopecek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 158. Jana Černochová — `jana-cernochova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 159. Jana Maláčová — `jana-malacova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 160. Jiří Pospíšil — `jiri-pospisil`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 0 | 0 | 2 | 5 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 2

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 161. Jozef Síkela — `jozef-sikela`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 162. Karel Haas — `karel-haas`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 163. Kateřina Stojanová — `katerina-stojanova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 164. Klára Dostálová — `klara-dostalova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 165. Lubomír Zaorálek — `lubomir-zaoralek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 166. Lukáš Vlček — `lukas-vlcek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 167. Marek Benda — `marek-benda`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 168. Marek Výborný — `marek-vyborny`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 169. Marek Ženíšek — `marek-zenisek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 170. Marian Jurečka — `marian-jurecka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 171. Marta Nováková — `marta-novakova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 172. Martin Baxa — `martin-baxa`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 173. Martin Červíček — `martin-cervicek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 174. Martin Kupka — `martin-kupka`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 175. Martin Stropnický — `martin-stropnicky`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 176. Matěj Ondřej Havel — `matej-ondrej-havel`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 177. Michaela Šebelová — `michaela-sebelova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 178. Michal Šalomoun — `michal-salomoun`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 179. Mikuláš Bek — `mikulas-bek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 180. Olga Richterová — `olga-richterova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 181. Pavel Blažek — `pavel-blazek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 182. Pavel Drobil — `pavel-drobil`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 183. Petr Arenberger — `petr-arenberger`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 184. Petr Gazdík — `petr-gazdik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 185. Petr Hladík — `petr-hladik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 186. Petr Krčál — `petr-krcal`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 187. Petr Kulhánek — `petr-kulhanek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 188. Petr Macinka — `petr-macinka`

> Entity view kanonického dossieru `macinka-turek` — vlastní registry nemá,
> jeho evidence se počítá tam a tady se nezdvojuje.

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-07-29`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 |

Další krok:

- žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená

### 189. Petr Sokol — `petr-sokol`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 4 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 4 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 190. Renáta Zajíčková — `renata-zajickova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-06`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 191. Richard Brabec — `richard-brabec`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 192. Robert Pelikán — `robert-pelikan`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 193. Roman Prymula — `roman-prymula`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 194. Taťána Malá — `tatana-mala`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 195. Tomáš Petříček — `tomas-petricek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 196. Věra Jourová — `vera-jourova`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 197. Vladimír Balaš — `vladimir-balas`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 198. Vladimír Kremlík — `vladimir-kremlik`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 199. Vlastimil Válek — `vlastimil-valek`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-09`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 0 | 0 | 2 | 5 | 2 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 2

Další krok:

- 3 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 200. Zbyněk Stanjura — `zbynek-stanjura`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 201. Zdeněk Hřib — `zdenek-hrib`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-07`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 3 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 2 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

### 202. Zdeněk Nekula — `zdenek-nekula`

**Priorita žádná** · 0 bodů (0.0 % celkového objemu práce) · typ `entity` · aktualizováno `2026-08-08`, revidováno `—`

| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 (0) | 0 |

Deklarované stavy: CORROBORATED 1

Další krok:

- 1 zdrojů nemá vyplněnou `sourceFamily` → doplnit přes `npm run sources:detect-family`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas

---

*Vygenerováno z kanonického modelu. Chceš jiné číslo? Změň data, ne tenhle soubor.*
