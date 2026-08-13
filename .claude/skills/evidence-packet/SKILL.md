---
name: evidence-packet
description: Provede člověka od ověřených zdrojů k strukturovanému důkaznímu balíčku, který může někdo jiný posoudit a případně zapsat do dossieru — bez toho, aby přispěvatel musel znát JSON, schémata nebo repozitář. Použij ho, když někdo říká „mám zdroje a nevím, jak to předat", „chci to někam poslat", „připrav z toho podklad".
argument-hint: "[\"tvrzení nebo téma, ke kterému balíček vzniká\"]"
---

Důkazní balíček je **předstupeň zápisu**, ne zápis. Vzniká proto, aby
člověk, který umí najít a ověřit zdroj, mohl přispět, aniž by musel umět
kanonický datový model — a aby ten, kdo bude zapisovat, měl všechno, co
potřebuje, na jednom místě.

## Kdy ho použít

- Někdo má ověřené zdroje a chce z nich udělat použitelný podklad.
- Netechnický přispěvatel chce přispět, ale nemá psát JSON.
- Před `/dossier-entry`, aby zápis nebyl improvizace.

## Kdy ho NEPOUŽÍT

- **Se zdroji, které nebyly otevřené.** Balíček z kandidátů je balíček
  domněnek. Nejdřív `/verify-source`.
- **Místo zápisu, když zapisuješ ty sám** a máš všechno v hlavě i v
  ruce — pak je to mezikrok navíc.
- **Na téma mimo rozsah pokrytí.** Balíček není způsob, jak rozsah
  obejít „jen jako podklad".

## Postup — sedm otázek

Ptej se po jedné. Když odpověď chybí, **nech pole prázdné a označ ho** —
vymyšlená hodnota je horší než mezera, protože se tváří jako zjištění.

### 1. Co konkrétně se tvrdí

Jedna věta, jeden fakt, žádné „a zároveň". Tvrzení, které se nedá
rozdělit, se nedá ani doložit po částech.

Bez hodnocení: „byl odvolán" ano, „byl skandálně odvolán" ne.

### 2. Čím je to doložené

Za každý zdroj: URL, vydavatel, autor, datum vydání, datum pořízení,
a **doslovná pasáž**, ze které to plyne. Ne shrnutí pasáže — pasáž.

### 3. Jaký je to typ zdroje

Primární registr, úřední dokument, zpravodajství, investigace,
komentář, vlastní prezentace subjektu. Vlastní web a autorské profily
dokládají **jen sebeprezentaci**, nikdy nezávislé potvrzení.

### 4. Kolik nezávislých hlasů to je

Ne kolik odkazů. Když si nejsi jistý, projdi `/source-family` a napiš
výsledek včetně nejistoty.

### 5. Co tomu odporuje

Povinné pole. Rozpor, který zdroje obsahují, se **dokumentuje**, ne
zamlčuje. Když jeden zdroj uvádí jiné číslo nebo jiné datum, patří to
sem — a často je to ta nejcennější část balíčku.

### 6. Co zůstalo nezodpovězené

Kandidáti na `GAP`. Formuluj je jako otázky, ne jako náznaky:
„není doloženo, jak řízení skončilo" ano, „není jasné, co skrývá" ne.

### 7. Koho se to týká kromě subjektu

Vyjmenuj třetí osoby, které zdroje jmenují, a označ je jako **kontext**.
Nejmenované zůstávají nejmenované. Osobní údaje se nepřebírají —
datum narození, adresa, rodinné poměry ne, ani „pro úplnost".

## Výstup

Musí být uložitelný a přenositelný. Markdown, ne prozaická odpověď:

```markdown
# Důkazní balíček — <téma>

**Připraveno:** <datum>
**Rozsah:** <ověřeno přes /authorization-check | neověřeno>

## Tvrzení
<jedna věta>

## Navrhovaný stav
<1 ZDROJ | CORROBORATED | CITACE | SPORNÉ | NÁZOR> — protože <důvod>

## Zdroje
### [1] <vydavatel>, <datum>
- URL:
- Autor:
- Pořízeno:
- Typ:
- Zdrojová rodina:
- Doslovná pasáž: „…"
- Dokládá:
- Nedokládá:

## Nezávislost
<n hlasů; nezávislá dvojice ano/ne; nejistota>

## Rozpory
<co si zdroje odporují, nebo „žádné nalezené">

## Otevřené otázky (kandidáti na GAP)
- …

## Třetí osoby
<kdo je jmenován a v jaké roli — všichni jako kontext>

## Povinné rámování
<co musí být u každé zmínky, nebo „—">
```

Balíček se ukládá mimo kanonická data — je to podklad k posouzení,
ne obsah. Do `data/dossiers/**` se dostane teprve zápisem přes
`/dossier-entry`, a to je samostatné rozhodnutí.

## Lidský checkpoint

**Balíček nikdy nepublikuje.** Mezi ním a webem stojí:

1. kontrola rozsahu,
2. redakční posouzení stavu a rámování,
3. zápis do kanonických dat,
4. `npm run build`,
5. review diffu člověkem.

Když někdo čeká, že „to teď bude na webu", je to nedorozumění, které
je potřeba vyslovit hned, ne po odeslání.

## Co skill NEUDĚLÁ

- Nezapíše nic do `data/dossiers/**`.
- Nerozhodne o rozsahu ani o publikaci.
- Nepovýší tvrzení na CORROBORATED bez druhého hlasu.
- Nedoplní chybějící datum, autora ani pasáž odhadem.

## Příklady

**Základní.** Jeden článek ČT24 o jmenování ministra → balíček s jedním
zdrojem, navrhovaný stav `1 ZDROJ`, rozpory žádné, otevřená otázka
„od kdy přesně mandát běží", třetí osoby žádné.

**Realistický.** Tři odkazy k pokutě za střet zájmů. Balíček ukáže, že
jde o dva hlasy (jeden originál, dva přetisky), že jeden zdroj uvádí
jinou částku — **rozpor se zapíše, ne zprůměruje** — a že povinné
rámování je „nepravomocná" u každé zmínky.

**Selhání.** Přispěvatel přinese screenshot soukromé konverzace.
Balíček **nevznikne**: neveřejný materiál a materiál identifikující
zdroj do tohohle repozitáře nesmí ani jako podklad. Odpověď to říká
rovnou a vysvětlí proč — Git nezapomíná.

## Související

`/verify-source` (ověření zdrojů — dělá se dřív), `/source-family`
(nezávislost), `/authorization-check` (rozsah), `/dossier-entry`
(zápis — samostatné rozhodnutí), `.claude/rules/evidence.md`.
