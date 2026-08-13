---
name: review-pr
description: Posoudí cizí pull request nebo připravenou změnu podle toho, čeho se skutečně dotýká — rozsah, architektura, data a redakce, testy, dokumentace, bezpečnost, UI. Vrací nálezy s prioritou a doporučení. Použij ho, když má někdo posoudit změnu, kterou nedělal.
argument-hint: "[číslo PR | větev | changed]"
---

Review cizí změny. **Read-only.**

## Kdy ho použít

- Někdo poslal PR nebo požádal o merge.
- Před mergem v co-op modelu.
- Když se má posoudit změna, kterou jsi nedělal.

## Kdy ho NEPOUŽÍT

- **Na vlastní práci těsně po dopsání.** Použij `/quality` a odstup;
  review vlastní čerstvé změny přehlédne to samé, co ji vyrobilo.
- **K opravě.** Review vrací nálezy. Opravu dělá autor.

## Postup

### 1. Zjisti, čeho se to dotýká

```bash
gh pr diff <n> --name-only      # nebo git diff --name-only master...
```

Rozsah rozhoduje o tom, které kontroly dávají smysl. Review dokumentační
změny podle bezpečnostních kritérií je obřad, ne pečlivost.

### 2. Pusť jen relevantní osy

| Dotýká se | Projdi |
|---|---|
| `data/dossiers/**` | `/editorial-review` — a je to ta nejdůležitější osa |
| `schemas/**` | fan-out změny (`/schema-change` jako checklist) |
| `templates/**`, `assets/**` | `/ui-review`, u interaktivních prvků `/a11y-review` |
| `scripts/**` | čitelnost, chybové stavy, testy, které skutečně padají bez změny |
| `.claude/**` | `npm run validate:claude-tooling`, persona a riziko, hranice použití |
| `docs/**`, `content/**` | drift proti implementaci; `/docs-sync` jako checklist |
| cokoli | soubory, které tam nepatří; tajemství; osobní data |

### 3. Ověř, co autor tvrdí

Když PR říká „build zelený", **spusť ho**. Tvrzení o testech je stejný
druh tvrzení jako každé jiné v tomhle repozitáři: platí, když je
doložené.

### 4. Posuď rozsah, ne jen provedení

Tři otázky, které se přeskakují nejčastěji:

- Dělá změna **to, co měla**, nebo taky něco navíc?
- Je něco **vynechané** tiše, bez zmínky?
- Vzniká tím **snadnější cesta** k nedoloženému tvrzení, tichému
  rozšíření rozsahu nebo úniku dat, než byla předtím?

Třetí otázka je epistemický test celého projektu. Když je odpověď ano,
je to BLOCKER bez ohledu na kvalitu kódu.

## Priorita nálezů

```
BLOCKER  nedoložené tvrzení · chybějící procesní rámování · osobní
         data · tajemství · rozšíření rozsahu bez podkladu ·
         červená brána · ruční editace generovaného obsahu
HIGH     chybějící test u nové brány · nekonzistentní rámování ·
         změna významu bez migrace · nedodělané pole
MEDIUM   čitelnost, duplicita, chybějící okrajový stav
LOW      styl, formulace, konzistence
NOTE     pozorování bez požadavku
```

## Výstup

```
PR / VĚTEV:  <co se posuzuje>
ROZSAH:      <n souborů — po kategoriích>
OSY:         <které kontroly dávaly smysl a proč>
OVĚŘENO:     <co jsem skutečně spustil a s jakým výsledkem>
NÁLEZY:      [priorita] <soubor> — <co> → <návrh>
CO JE DOBŘE: <konkrétně — review bez toho vypadá jako odmítnutí>
DOPORUČENÍ:  schválit | schválit s výhradami | vrátit (<co musí padnout>)
```

Řádek **CO JE DOBŘE** není zdvořilost: říká autorovi, co nemá při
opravě rozbít.

## Co skill NEUDĚLÁ

- Nemerguje ani nezavírá PR.
- Neopravuje cizí kód.
- Neschválí změnu, jejíž bránu nespustil.

## Příklady

**Základní.** PR s jedním skriptem a testem → osa „scripts", build
spuštěn, jeden MEDIUM k chybějícímu okrajovému stavu, doporučení
schválit s výhradou.

**Realistický.** PR přidává pět tvrzení. Osa redakční je hlavní:
`/editorial-review` najde, že tři z pěti stojí na jedné investigaci
a mají stav CORROBORATED. BLOCKER — jeden hlas vydávaný za dva.
Kód i testy jsou přitom v pořádku a review to musí říct.

**Selhání.** PR přidává hook, který blokuje operaci, ale nemá test.
HIGH podle tabulky, ale u **blokujícího** hooku je to BLOCKER: hook bez
testu může chybným parsováním zablokovat celý repozitář, a to je horší
než chybějící kontrola.

## Související

`/editorial-review`, `/ui-review`, `/a11y-review`, `/docs-sync`
(jednotlivé osy), `/diff-explain` (pochopení změny), `/quality`
(druhá strana).
