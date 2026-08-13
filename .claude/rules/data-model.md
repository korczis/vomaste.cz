---
paths:
  - "schemas/**"
  - "data/**"
  - "scripts/data/**"
---

# Kanonický datový model

Plný kontrakt: `docs/data-contract.md`. Rozhodnutí:
`docs/adr/json-first-canonical-data-model.md`. Tady je to, co rozhoduje
o tom, kam sáhnout.

## Jediný zdroj pravdy

```
data/dossiers/<slug>/dossier.json          ← dossier sám + graf + bloky obsahu
data/dossiers/<slug>/{claims,sources,cases,gaps,relations,updates}/*.json
data/dossiers/_shared/entities/*.json      ← globální registr entit
data/dossiers/_shared/vocabularies/*.json
data/dossiers/_shared/context/vomaste-v1.jsonld
```

Adresář s `dossier.json` **je** registrací dossieru. Žádný ručně
udržovaný seznam neexistuje a nesmí vzniknout.

Každý záznam je zároveň platný JSON-LD: nese `@context`, **globální**
`@id` pod `https://vomaste.cz/id/…`, `@type`, `recordType` a lokální
`identifier` (`CLM-01`) pro UI. Identifikátory jsou v rámci dossieru;
kolizi napříč dossiery znemožňuje globální `@id`.

## Jedno pravidlo, jeden vlastník

| Vrstva | Vlastník |
|---|---|
| Tvar (typy, povinná pole, formáty, uzavřené enumy) | `schemas/canonical/*.schema.json` přes `validate-shape.mjs` |
| Referenční integrita R1–R8 | `scripts/data/validate-references.mjs` |
| Redakční sémantika S1–S10 | `scripts/data/validate-semantics.mjs` |
| Parita tabulky tvrzení T1–T8 | `scripts/data/validate-registry-table.mjs` |
| Expanze JSON-LD (lokální kontext, bez sítě) | `scripts/data/validate-jsonld.mjs` |
| Tvar exportů | `scripts/dossier/lib/export-schemas.mjs` |

Všechno spouští `npm run data:validate` — první krok každého režimu
pipeline.

## Přidat ZÁZNAM × přidat POLE

**Nový CLM/SRC/GAP záznam** je čistě datová operace: napiš kanonický
JSON, `npm run data:validate`, `npm run data:build`. Žádná šablona,
schéma ani validátor se nemění a drift mezi tabulkou, detailem
a exportem je vyloučený konstrukcí.

**Nové POLE** typu záznamu se dotýká **tří míst**, která musí zůstat
konzistentní:

1. kanonické schéma (`additionalProperties: false` jinak shodí build —
   to je jeho účel);
2. builder view modelů (`scripts/data/build-view-models.mjs`);
3. šablona nebo export, který pole čte.

Pole, které nikdo nečte, i šablonové pole bez pokrytí schématem, je
nedodělaná změna. Na dopadovou analýzu je `/schema-change`.

## Co se počítá a co se neukládá

Hloubka v grafu se **počítá** (BFS ze subjektových uzlů,
`scripts/data/lib/graph-depth.mjs`), nikdy neukládá. Počty na dlaždicích
se počítají z compiled modelu. Stav rozpracovanosti důkazů se generuje
(`npm run report:evidence-plan` → `reports/evidence-plan.md`) — paralelní
ruční todo seznam by byl zastaralý dřív než další commit.
