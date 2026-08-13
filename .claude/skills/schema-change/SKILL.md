---
name: schema-change
description: Provede změnu kanonického schématu se všemi místy, která z ní plynou — schéma, existující data, generátory, view modely, šablony, exporty, JSON-LD, validátory, testy, migrace a dokumentace. Použij ho při přidání, přejmenování nebo odebrání pole v záznamu, nebo když někdo řekne „chci u zdroje evidovat i X".
argument-hint: "<typ záznamu> <co se mění>"
disable-model-invocation: true
---

Změna datového kontraktu. **Riziko: maintainer.** Poloviční
implementace pole je selhání, ne rozpracovanost — a build ji nemusí
odhalit v obou směrech.

## Kdy ho použít

- Přidání pole do typu záznamu.
- Přejmenování nebo odebrání pole.
- Změna enumu, povinnosti nebo formátu.

## Kdy ho NEPOUŽÍT

- **Na přidání záznamu.** To je čistě datová operace a nic z tohohle
  nepotřebuje.
- **Na změnu, kterou lze vyjádřit existujícím polem.** Nové pole je
  trvalá údržbová plocha; nejlevnější pole je to, které nevzniklo.
- **Bez rozmyšlení, kdo ho bude číst.** Pole, které nikdo nečte, je
  jen závazek do budoucna.

## Fan-out — projdi VŠECHNO

Nevynechávej řádek proto, že „to se nás netýká". Napiš u něj, že se
netýká, a proč.

| # | Místo | Otázka |
|---|---|---|
| 1 | `schemas/canonical/<kind>.schema.json` | tvar, povinnost, enum, `$comment` s odůvodněním |
| 2 | existující data `data/dossiers/**` | je pole povinné? Pak musí doplnit **všechny** záznamy |
| 3 | `scripts/data/build-view-models.mjs` | propíše se pole do view modelu? |
| 4 | šablony `templates/**` | kdo ho zobrazuje? |
| 5 | exporty (`build:data-exports`, `build:jsonld-exports`) | patří do strojové vrstvy? |
| 6 | JSON-LD kontext `_shared/context/vomaste-v1.jsonld` | má vlastní termín? |
| 7 | validátory (R/S/T) | vzniká nové pravidlo, nebo se mění existující? |
| 8 | testy | pokrývá nové chování test, který **skutečně padá** bez změny? |
| 9 | golden snapshot | `npm run test:update-golden` |
| 10 | migrace | jak se dostanou existující data do nového tvaru? |
| 11 | `docs/data-contract.md` | výklad |
| 12 | vzdělávací vrstva | příručka, lekce úrovně A5, cvičná data |
| 13 | `data/seo.toml` | jen když vzniká nový `record_type` |

Kroky 2 a 10 se podceňují nejčastěji. Povinné pole bez migrace znamená,
že build spadne na každém existujícím záznamu — což je správně, ale
musí to být plán, ne překvapení.

## Postup

### 1. Rozhodni, jestli má pole vzniknout

Ptej se: kdo ho bude číst, co bez něj dnes nejde, a jestli to není
odvoditelné z toho, co už tam je. Hloubka v grafu se **počítá**, ne
ukládá — a to je vzor, ne výjimka.

### 2. Navrhni tvar

Uzavřený enum je lepší než volný řetězec. Volitelné je bezpečnější než
povinné. `$comment` ve schématu je místo, kde se vysvětlí **proč**, ne
co — a čte ho ten, kdo bude o rok později přemýšlet, jestli pole
zrušit.

### 3. Postupuj odspodu

```
schéma → data → view model → šablona/export → validátor → testy → docs
```

Opačné pořadí vyrobí stav, kdy šablona čte pole, které schéma nezná.

### 4. Ověřuj průběžně

```bash
npm run data:validate     # tvar a pravidla
npm run data:build        # view modely a adaptéry
npm run test              # včetně golden snapshotu
npm run build             # jediné „hotovo"
```

### 5. Zvaž ADR

Když je změna sporná (nový kanonický formát, druhý zdroj pravdy, změna
významu existujícího pole), patří k ní `/adr` s měřenými čísly.

## Výstup

```
ZMĚNA:       <typ záznamu>.<pole> — <přidat | přejmenovat | odebrat | změnit>
DŮVOD:       <co bez toho nejde>
KDO ČTE:     <konkrétní konzument>
FAN-OUT:     <13 řádků, u každého „hotovo" nebo „netýká se, protože…">
MIGRACE:     <jak se dostanou existující data do nového tvaru>
VALIDACE:    <příkazy a výsledky>
ADR:         <potřeba | ne, protože…>
ZBÝVÁ:       <co musí udělat člověk>
```

## Co skill NEUDĚLÁ

- Nezmění význam existujícího pole potichu.
- Nepřidá pole bez konzumenta.
- Neobejde `additionalProperties: false` — to je brána, ne překážka.

## Příklady

**Základní.** Volitelné `paywall: boolean` u zdroje. Fan-out: schéma,
view model, šablona zdroje, `/review-source` kontrola. Migrace není
potřeba (volitelné). Bez ADR.

**Realistický.** Povinné `retrievedBy` u zdroje. Fan-out zasáhne
**všech 989 existujících zdrojů** — bez migračního skriptu build spadne
na každém. Plán musí obsahovat, jakou hodnotu dostanou historické
záznamy, a proč je to poctivé.

**Selhání.** „Přidej pole `credibility: 1–5`." Skill musí odmítnout
provedení a vysvětlit proč: skóre důvěryhodnosti je hodnocení pravdy,
ne doloženosti. Tenhle web stavy popisuje sourcing a strojová data
nesmějí naznačovat rozsouzenou pravdu — `verify:jsonld` ostatně
truth-rating značky zakazuje. Alternativa je popsat nezávislost, což
model už umí.

## Související

`/data-model` (co dnes platí), `/adr` (sporné rozhodnutí),
`/docs-sync` (dopad na dokumentaci), `.claude/rules/data-model.md`.
