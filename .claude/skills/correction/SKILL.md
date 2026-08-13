---
name: correction
description: Vede opravu chyby v publikovaném obsahu od nahlášení přes ověření a zápis až po validaci a doložení, co se změnilo a proč. Rozlišuje typy oprav, protože faktická oprava, mrtvý odkaz a překlep mají velmi různé nároky. Použij ho, když někdo hlásí „tohle je špatně", „ten odkaz nefunguje", „to není přesné", nebo když review našel nález k opravě.
argument-hint: "<co je špatně a kde> [zdroj, který to dokládá]"
disable-model-invocation: true
---

Řízená oprava. **Zapisuje do kanonických dat**, takže výsledek jde na
review a projde plnou bránou.

## Kdy ho použít

- Někdo nahlásil chybu v publikovaném obsahu.
- Review (`/review-claim`, `/editorial-review`) vrátil nález k opravě.
- Vydavatel opravil svůj článek a záznam už neodpovídá.
- Odkaz přestal fungovat.

## Kdy ho NEPOUŽÍT

- **K přidání nového obsahu.** Oprava mění to, co už je; nové tvrzení
  je `/dossier-entry`.
- **K odstranění nepohodlného faktu.** Oprava má doklad. Bez dokladu to
  není oprava, je to úprava.
- **Na chybu v kódu nebo šabloně.** Tohle je obsahová vrstva.

## Nejdřív: který typ opravy to je

Nároky se liší zásadně. Urči typ **před** čímkoli dalším.

| Typ | Co je potřeba | Riziko |
|---|---|---|
| **faktická** — tvrzení říká něco jiného, než zdroje | nový nebo znovu přečtený zdroj, možná změna stavu | nejvyšší |
| **procesní rámování** — chybí „nepravomocné", „zastaveno" | přečíst zdroj znovu a doplnit ke KAŽDÉ zmínce | vysoké |
| **metadata zdroje** — datum, autor, vydavatel | otevřít zdroj a opravit podle něj | střední |
| **mrtvý odkaz** | archivní kopie nebo primární registr | střední |
| **stav tvrzení** — `1 ZDROJ` × `CORROBORATED` | posouzení nezávislosti | vysoké |
| **formulace** — nepřesné slovo, hodnotící přívlastek | čtení a rozvaha | nízké |
| **překlep** | nic | nízké |
| **technická** — rozbité zobrazení, kotva | to je práce pro vývojáře, ne oprava obsahu | — |

Faktická oprava a oprava stavu **nikdy** nejsou „drobnost", ani když je
změna jednoslovná.

## Postup

### 1. Zjisti, co přesně je špatně

Nahlášení bývá vágní („to není pravda"). Zpřesni:

```
KDE:      <konkrétní záznam nebo řádek>
TVRDÍ:    <co tam je teď>
MÁ BÝT:   <co má být místo toho>
DOKLAD:   <čím to hlásící dokládá>
```

Bez čtvrtého řádku oprava nezačíná. „Vím to" není doklad.

### 2. Ověř to sám

Otevři zdroje znovu — i ty, které tam už jsou. Chyba často vznikla tím,
že zdroj se změnil, ne tím, že byl špatně přečtený.

Když hlásící nemá pravdu, **je to taky výsledek**: napiš proč, s odkazem
na konkrétní pasáž. Odmítnutá oprava s odůvodněním je stejně hodnotná
jako provedená.

### 3. Zjisti dosah

Chyba je málokdy na jednom místě. Projdi:

- ostatní zmínky téhož faktu v dossieru (rámování!);
- ručně psanou tabulku tvrzení (parita T1–T8);
- kauzu a časovou osu, pokud se dotýká data;
- vazby na zdroje a mezery (R8);
- jiné dossiery, když jde o sdílenou entitu.

### 4. Oprav v kanonických datech

Vždy `data/dossiers/**`, **nikdy** `content/`. Editace generovaného
adaptéru se tiše přepíše a build zůstane zelený.

### 5. Doplň, co se změnilo

Oprava se nezametá. Podle povahy:

- záznam v `updates/` dossieru, když je změna podstatná;
- poznámka u zdroje, když vydavatel opravil svůj text;
- u faktické opravy vždy: co bylo, co je, kdy a proč.

### 6. Validuj

```bash
npm run data:validate -- --file data/dossiers/<slug>/claims/clm-NN.json
npm run data:build
npm run build
```

Poslední je jediné, co se počítá.

## Výstup

```
TYP:         <z tabulky výše>
NAHLÁŠENO:   <co a kým, když je to relevantní>
OVĚŘENO:     potvrzeno | vyvráceno (<proč>)
DOSAH:       <všechna dotčená místa, ne jen to nahlášené>
ZMĚNA:       <co bylo> → <co je>
DOLOŽENO:    <zdroj, pasáž>
ZAZNAMENÁNO: <kde je stopa po opravě>
VALIDACE:    <příkazy a výsledky>
ZBÝVÁ:       <co musí udělat člověk>
```

## Lidský checkpoint

Před publikací opravy, která mění **význam** tvrzení nebo jeho **stav**,
rozhoduje člověk. Automaticky se dokončí jen překlep a formát.

Zvlášť opatrně: oprava, která tvrzení **zostřuje**. Změkčení podložené
zdroji je bezpečné; zostření vyžaduje stejnou důkazní laťku jako nové
tvrzení, protože to nové tvrzení je.

## Co skill NEUDĚLÁ

- Nesmaže záznam proto, že je nepohodlný.
- Neupraví autorizační log.
- Nepovýší stav bez nového nezávislého zdroje.
- Nezmění `content/` ručně.

## Příklady

**Základní.** Překlep ve jméně vydavatele → typ „metadata", dosah jeden
záznam, oprava, `data:validate`, `build`. Bez záznamu v `updates/`.

**Realistický.** Nahlášeno: „ta pokuta už je pravomocná." Ověření
ukáže, že zdroj hlásícího je z pozdějšího data a opravdu to uvádí.
Dosah: tři zmínky v dossieru, řádek v tabulce, jedna mezera, která se
tím **zavírá**. Oprava mění fakt i rámování a jde na review.

**Selhání.** Nahlášeno: „to o něm není pravda, smažte to." Bez dokladu.
Výstup: oprava se neprovádí, ale nahlášení se nezahazuje — zaznamená se
jako podnět a odpověď vysvětlí, co by bylo potřeba (jmenovaný zdroj,
který říká něco jiného). Tvrzení mezitím zůstává, protože doklad pro
něj existuje.

## Související

`/review-claim`, `/review-source`, `/review-gap` (nálezy),
`/verify-source` (ověření dokladu), `/dossier-entry` (nový obsah),
`.claude/rules/editorial.md`.
