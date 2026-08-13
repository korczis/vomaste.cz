---
name: data-model
description: Vysvětlí kanonický datový model z toho, co skutečně platí — ze schémat, validátorů, view modelů a existujících záznamů, ne z dokumentace. Použij ho, když někdo potřebuje vědět, jaká pole má tvrzení/zdroj/entita, co je povinné, co který validátor hlídá a kde se to mění: „jaká pole má SRC", „co znamená tohle pole", „kde se to validuje".
argument-hint: "[claim | source | case | gap | relation | entity | dossier | tooling]"
---

Referenční průvodce datovým modelem. **Read-only.** Odpovídá ze
schématu a z kódu, nikdy z paměti.

## Kdy ho použít

- Před přidáním nebo změnou pole.
- Když není jasné, co které pole znamená nebo kdo ho vynucuje.
- Při psaní záznamu ručně.

## Kdy ho NEPOUŽÍT

- **K provedení změny schématu.** Na to je `/schema-change`, protože
  změna má fan-out, který tenhle skill jen popisuje.
- **Když stačí spustit validátor.** Konkrétní chybová hláška
  (`S2`, `R8`, `T4`) řekne víc než výklad modelu.

## Kde je pravda

V tomhle pořadí; při rozporu vyhrává to výš:

```
schemas/canonical/<kind>.schema.json     ← tvar, povinnost, enumy
scripts/data/validate-references.mjs     ← R1–R8
scripts/data/validate-semantics.mjs      ← S1–S10
scripts/data/validate-registry-table.mjs ← T1–T8
scripts/data/build-view-models.mjs       ← co z toho vidí šablona
data/dossiers/**                         ← jak to vypadá v praxi
docs/data-contract.md                    ← výklad (může zaostat)
```

## Postup

1. **Načti schéma** požadovaného typu. `additionalProperties: false`
   znamená, že neuvedené pole shodí build — to je záměr.
2. **Vytáhni povinná pole** (`required`) a uzavřené enumy.
3. **Najdi, kdo pole vynucuje** nad rámec tvaru — grep na název pole
   ve validátorech.
4. **Ukaž reálný příklad** z `data/dossiers/**`, ne vymyšlený.
5. **Řekni, kdo pole čte** — view model, šablona, export, JSON-LD.

Pole, které nikdo nečte, i šablonové pole bez pokrytí schématem jsou
obojí nedodělaná změna.

## Co je potřeba vědět vždy

- Každý záznam je zároveň platný **JSON-LD**: `@context`, globální
  `@id` pod `https://vomaste.cz/id/…`, `@type`, `recordType` a lokální
  `identifier` pro UI.
- **Adresář s `dossier.json` je registrace dossieru.** Žádný seznam
  neexistuje a nemá vzniknout.
- **Hloubka v grafu se počítá**, neukládá (BFS ze subjektových uzlů).
- **Přidat záznam** je čistě datová operace. **Přidat pole** se dotýká
  tří míst: schéma, view model, konzument.

## Výstup

```
TYP:         <claim | source | …>
SCHÉMA:      schemas/canonical/<kind>.schema.json
POVINNÁ:     <pole>
VOLITELNÁ:   <pole>
UZAVŘENÉ ENUMY: <pole: hodnoty>
VYNUCUJE NAVÍC: <pravidlo → validátor>
ČTE:         <view model → šablona/export>
PŘÍKLAD:     <cesta ke skutečnému záznamu>
PASTI:       <co se u tohohle typu plete>
```

## Příklady

**Základní.** `/data-model source` → povinná pole, `sourceFamily` jako
volitelné s vysvětlením asymetrie (umí nezávislost jen odebrat),
povinná redakční poznámka v těle (T7), obousměrná vazba na tvrzení (R8).

**Realistický.** „Můžu do zdroje přidat pole `paywall`?" → Odpověď je
postup, ne ano/ne: schéma s `additionalProperties: false` to odmítne,
dokud pole nepřidáš; a pokud ho nepřidáš i do view modelu a šablony,
je to nedodělaná změna. Další krok `/schema-change`.

**Selhání.** „Jaká pole má tvrzení?" a schéma se rozchází s
`docs/data-contract.md`. Odpověď je schéma a **rozpor je nález** —
dokumentace zaostala a patří opravit.

## Související

`/schema-change` (provedení změny), `/dossier-entry` (zápis záznamu),
`docs/data-contract.md`, `.claude/rules/data-model.md`.
