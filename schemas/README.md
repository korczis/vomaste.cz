# schemas/ — strojově čitelné datové kontrakty

Dvě vrstvy, jedna vstupní:

- **`schemas/canonical/`** — JEDINÁ vstupní vrstva datového modelu
  (T-028): JSON Schema (draft 2020-12) validující PŘÍMO kanonické
  soubory `data/dossiers/**/*.json` podle `recordType`. Spouští se přes
  `npm run data:validate` (`scripts/data/validate-shape.mjs`, AJV 2020-12,
  allErrors, strict) — první krok každého režimu build pipeline.
  Podrobnosti (obálka záznamu, slovníky, context v1, verzování):
  [`canonical/README.md`](canonical/README.md).
- **`schemas/*.schema.json`** (tento adresář) — kontrakty **generovaných
  plochých exportů** `/data/*.json`. Nevalidují žádný vstup: jsou to
  výstupní brány, které `build:data-exports` aplikuje na vlastní produkt
  (`scripts/dossier/lib/export-schemas.mjs`), aby se tvar veřejných
  exportů nemohl změnit bez vědomé úpravy schématu. Sem patří i
  `graph-manifest` / `graph-payload` pro grafové projekce.

## Co zmizelo (T-028 fáze H) a kdo pravidla vlastní

Dřívější `npm run validate:schemas` (AJV nad normalizovanými řádky
z front-matter parseru `record-tables.mjs`) zanikl spolu s front matter
jako zdrojem pravdy. Vlastnictví každého pravidla přešlo jmenovitě:

| Dřívější vlastník | Nový vlastník |
|---|---|
| `validate:schemas` (tvar řádků) | `schemas/canonical/` + `validate-shape.mjs` (tvar kanonických záznamů); tvar exportů: schema brána v `build:data-exports` |
| `validate:dossier` (reference, parita tabulka ↔ stránky) | `validate-references.mjs` R1–R8 + `validate-registry-table.mjs` T1–T8; parita se stránkami je rozpuštěná konstrukcí (stránky se generují) |
| `validate:graph` (graf) | R7 (integrita) + S7/S8 (`validate-semantics.mjs`) + `graph` v `dossier.schema.json`; hloubka se počítá BFS (`lib/graph-depth.mjs`), depth pravidla platí z definice |

## Dělba práce (jedno pravidlo, jeden vlastník)

Schémata vynucují **tvar** (typy, povinnost, formáty ID/IRI, uzavřené
enumy, `additionalProperties: false` — pole bez schématu neprojde, což
je záměr). **Sémantiku** (referenční existence, source families,
single/corroborated, autorizace subjektů, subjektové uzly grafu)
vynucují kanonické validátory `scripts/data/validate-{references,
semantics,registry-table,jsonld}.mjs`. Enum se do schématu zapisuje jen
tam, kde je množina uzavřená redakčním modelem (claim status, typy
vztahů/entit, coverage stavy); otevřené množiny (typy zdrojů) drží
inventář slovníku bez enumu. Plný kontrakt:
[`docs/data-contract.md`](../docs/data-contract.md).
