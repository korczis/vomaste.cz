# Datový kontrakt (JSON-first kanonický model, T-028)

Kanonický tok dat a jeho vynucování po misi T-028 (fáze A–H hotové).
Souvisí: [ADR](adr/json-first-canonical-data-model.md),
[`schemas/README.md`](../schemas/README.md),
[`schemas/canonical/README.md`](../schemas/canonical/README.md),
průvodce přispěním [`contributing/add-dossier-data.md`](contributing/add-dossier-data.md).

## Kanonický zdroj → kompilace → konzumenti

```
data/dossiers/<slug>/dossier.json          data/dossiers/_shared/entities/*.json
data/dossiers/<slug>/{claims,sources,      data/dossiers/_shared/vocabularies/*.json
  cases,gaps,relations,updates}/*.json     data/dossiers/_shared/context/vomaste-v1.jsonld
        │                                        │
        ▼                                        ▼
  npm run data:validate  (tvar → reference R1–R7 → sémantika S1–S9 →
                          parita tabulky T1–T8 → JSON-LD expanze)
        │
        ▼
  jednotný kompilátor (scripts/data/: discover → load → validate → compile)
        │
        ▼
  compiled model  (JEDINÝ vstup všech konzumentů)
        ├─ view modely data/generated/views/**       (data:views; šablony je čtou load_data)
        ├─ generované content adaptéry content/**    (data:generate-content + data:sync-content)
        ├─ route manifest, navigace, metriky, search index
        ├─ flat exporty /data/*.json + JSON-LD exporty /data/*.jsonld + manifest
        └─ graf (projekce; hloubka POČÍTANÁ BFS od subjektů — lib/graph-depth.mjs)
```

Mimo kanonický model zůstávají (dokumentované výjimky): koncepty
(`content/koncepty/`), ručně psané kořenové indexy
(`content/dossiers/_index.md`, `content/entities/_index.md`),
government roster (`data/government.toml` → generátor kontextových
entit) a navigační skeleton (`data/navigation.toml`).

Generované artefakty (`content/dossiers/**`, `content/entities/*.md`,
`data/generated/*`, `static/data/*`, `static/search-index.json`) se
**nikdy** needitují ručně — `lint:generated-content` a parity brána
`data:check-generated:content` (content == staging) to vynucují; každý
`npm run data:build` je přepíše.

## Kde se data upravují

Výhradně v kanonickém JSON: `data/dossiers/<slug>/**` (záznamy + tabulka
tvrzení, timeline a grafová vrstva v `dossier.json`) a
`data/dossiers/_shared/entities/*.json` (globální entity; roster a ARES
expanzi generují `build:government-roster` a `scripts/osint/expand-entity.mjs`,
existující záznamy nikdy nepřepisují). Workflow:

```
$EDITOR data/dossiers/<slug>/…
npm run data:validate            # celý dataset; -- --file <cesta> pro jeden soubor
npm run data:build               # kompilace + view modely + regenerace adaptérů
npm run build                    # plná brána (stejná jako CI)
```

## Typy záznamů a obálka

Každý kanonický záznam nese společnou obálku: `$schema` (přesná URL
schématu), `schemaVersion` (const `1`), `@context`
(const `https://vomaste.cz/context/v1.jsonld`), `@id`, `@type`,
`recordType`, `identifier` a — kromě dossieru a entity — `dossier`
(idRef vlastnícího dossieru). Typy (`schemas/canonical/`):

| recordType | soubor | klíčová povinná pole (nad rámec obálky) |
|---|---|---|
| `dossier` | `dossier.json` | `slug`, `title`, `description`, `dossierType`, `language`, `navigationVisible`, `updated`; entity dossier navíc `canonicalDossier`, `subject`, `authorization.records` |
| `claim` | `claims/clm-NN.json` | `text`, `status`, `statusLabel`, `sources` (mimo `status-opinion` ≥ 1), `subjects`, `order`, `content` |
| `source` | `sources/src-NN.json` | `title`, `outlet`, `sourceType`, `url`, `retrieved`, `claims`, `subjects`, `content` (redakční poznámka, T7 ≥ 150 znaků), `order`; `sourceFamily`/`published` dle zdroje |
| `case` | `cases/case-NN.json` | `title`, `summary`, `period`, `status`, `statusLabel`, `anchor`, `claims`, `sources`, `subjects`, `content`, `order` |
| `gap` | `gaps/gap-NN.json` | `title`, `description`, `priority` (`vysoká`/`nízká`), `checked`, `claims`, `subjects`, `content`, `order` |
| `relation` | `relations/edge-*.json` | `relationId`, `sourceEntity`, `targetEntity`, `relationType`, `label`, `status`, `claims`, `sources`, `subjects`; ne-kontextová hrana ≥ 1 claim i zdroj (S3) |
| `update` | `updates/YYYY-MM-DD*.json` | `date`, `summary` — datovaný append-only záznam revize |
| `entity` | `_shared/entities/<id>.json` | `entityId`, `title`, `entityType`, `publicationRole`, `dossierEnabled`, `dossierStatus`, `coverageState`, `dossiers`; volitelně `provenance`, `externalIds`, `routeAliases`, `content` |

Interní reference jsou vždy objekty `{ "@id": "…" }` (typované
`claimRef`/`sourceRef`/… v `_defs.schema.json`); `subjects` jsou prosté
subject slugy (`"babis"`).

## Identifikátory: globální `@id`, lokální `identifier`

`CLM-01`/`SRC-01`/`CASE-01`/`GAP-01` jsou číslované **po dossierech** —
composite key `(dossier, id)`. Kanonický model to řeší konstrukčně:
každý záznam má globální IRI

```
https://vomaste.cz/id/dossiers/<slug>/claims/CLM-01
https://vomaste.cz/id/entities/<entityId>
```

a všechny reference jsou `@id` reference. Pravidlo R4 navíc vynucuje, že
záznam smí odkazovat jen do vlastního dossier namespace — cross-dossier
`SRC-##` záměna, která před migrací způsobila chybné JSON-LD citace
(94 % vložených citací ukazovalo na cizí záznamy, opraveno v `ce59cf8`),
je dnes mechanicky nemožná. Pro **externí konzumenty** plochých exportů
platí dál: join vždy přes `(dossier, id)` nebo rovnou přes `@id` — příklad
je předvedený v SQL konzoli na `/data/`.

## Content bloky

Tělo záznamu je rozšiřitelná unie `content`/`contentBlocks`
(`_defs.schema.json#contentBlock`): dnes plně tvarované typy `markdown`
(lossless základ — renderuje ho Zola, takže `{#kotvy}` i `@/` odkazy
fungují), `timeline` (`entries` s `date`/`title`/`anchor`/`dot`/`subjects`
— timeline dossieru), `quote` (s `attribution`/`source` idRef) a
`process-note`/`editorial-note`/`warning`; typy `paragraph`, `list`,
`table`, `references`, `related-records` jsou rezervované. Ručně psaná
tabulka tvrzení žije jako `markdown` blok v `dossier.json` a parita
T1–T8 ji drží byte-verně synchronní s kanonickými claim záznamy.

## Slovníky a JSON-LD context

- Uzavřené enumy (claim statusy, typy vztahů, typy entit, coverage
  stavy, gap priority) žijí v `_defs.schema.json` a zrcadlí se do
  `data/dossiers/_shared/vocabularies/*.json` (`{value,label}`);
  synchronizaci hlídá `validate-shape.test.mjs`. `source-types` je
  záměrně otevřená množina. Žádná confidence/truth skóre — stavy
  popisují zdrojování, ne rozsouzenou pravdu (konstituce § 6/§ 8).
- Context `data/dossiers/_shared/context/vomaste-v1.jsonld` je lokální a
  verzovaný; build context nikdy nestahuje ze sítě
  (`scripts/data/lib/context-loader.mjs` odmítne cizí URL). Veřejná
  routa `/context/v1.jsonld` publikuje týž soubor.

## Verzování (`schemaVersion` / context v1)

`schemaVersion: 1` + `/context/v1.jsonld` jsou neměnný kontrakt.
Aditivní změna (nové volitelné pole, nový term) = úprava schématu +
zápis do `schemas/canonical/README.md`. Zpětně nekompatibilní změna =
`schemaVersion: 2` + `vomaste-v2.jsonld` vedle v1 (v1 se nikdy
nepřepisuje) + migrace dat. Rozšíření uzavřeného enumu je redakční
změna datového modelu (AGENTS.md), ne technická.

## Jak přidat nové pole záznamu

Tři místa, jinak je změna nedokončená:

1. `schemas/canonical/<kind>.schema.json` — `additionalProperties: false`
   znamená, že pole bez schématu build shodí, což je záměr; u JSON-LD
   relevantních polí i term v contextu v1 (aditivně);
2. view-model builder (`scripts/data/build-view-models.mjs`) a/nebo
   export, který pole nese ke konzumentům;
3. konzument (šablona / export) — pole bez uživatele se nepřidává
   (recenze); mrtvé pole odhalí i review view modelů.

## Dělba práce validátorů (jedno pravidlo, jeden vlastník)

| Vrstva | Vlastník | Příklady |
|---|---|---|
| Tvar (typy, povinnost, formáty `@id`/ISO, uzavřené enumy) | `schemas/canonical/` + `scripts/data/validate-shape.mjs` (AJV 2020-12, strict) | `CLM-\d+`, `retrieved` ISO datum, claim mimo opinion ≥ 1 zdroj |
| Referenční integrita R1–R7 | `scripts/data/validate-references.mjs` | unikátní `@id`, cesta ↔ `@id`, same-dossier reference, graf (uzly = existující entity, edges 1:1 s relations) |
| Redakční sémantika S1–S9 | `scripts/data/validate-semantics.mjs` | S1 single = 1 zdroj; S2 corroborated ≥ 2 rodiny; S5/S6 autorizace; S7 subjektové uzly; S8 souvislost grafu (BFS); S9 provenance refs entit rozlišitelné v jejich dossierech |
| Parita tabulky tvrzení T1–T8 | `scripts/data/validate-registry-table.mjs` | řádka ↔ kanonický claim byte-verně, kotvy, URL dedup, T7 poznámka zdroje |
| JSON-LD expanze | `scripts/data/validate-jsonld.mjs` | lokální context, safe mode, expandovatelnost každého záznamu |
| Generovaný content | `lint:generated-content` + `data:check-generated:content` | adaptér = minimální obálka; content == staging |
| Tvar exportů | schema brána v `build:data-exports` (`scripts/dossier/lib/export-schemas.mjs`) | `schemas/*.schema.json` nad plochými exporty |
| Autorizace subjektů (obsahová vrstva) | `validate:authorization` + `verify:authorization-log` | žádný dossier bez záznamu v AGENTS.md; log append-only |
| JSON-LD poctivost + integrita výstupu | `verify:jsonld`, `verify:export`, `verify:full-pages`, `verify:anchors` | zákaz ClaimReview/ratingů, manifest sha256, citační otisky, kotvy |

Grandfathered dluh: porušení S1–S4 zděděná 1:1 migrací žijí v allowlistu
`data/dossiers/_shared/semantics-baseline.json` (degradace na warning);
nové porušení mimo allowlist je chyba, S5/S6 grandfatherovat nelze.

## Source families

Nezávislost zdrojů se počítá po **rodinách**: `sourceFamily` >
`outlet` > zdroj sám za sebe. Dva zdroje téže rodiny (převzetí téže
agenturní zprávy, týž vydavatel) se počítají jako jeden nezávislý zdroj
— S2 proto pro `CORROBORATED` vyžaduje ≥ 2 zdroje z ≥ 2 rodin a T5 navíc
≥ 2 různé URL.

## Generované artefakty a manifest

- `static/data/*.json` — ploché exporty (dossiers, claims, sources, …)
  pro `/data/` a SQL konzoli; tvar hlídá export-schemas brána.
- `/data/dossiers/<slug>.jsonld`, `/data/graph.jsonld` — plnohloubkové
  JSON-LD exporty; `/data/jsonld-manifest.json` nese `{route, sha256,
  bytes}` každého exportu (offline ověření:
  `node scripts/dossier/verify-export.mjs --dir <kopie>`).
- Compiled model nese vlastní manifest `{schemaVersion, contextVersion,
  counts}` — kontrakt konzumentů kompilátoru.
- Počty (tvrzení, zdrojů, …) jsou vždy odvozené z compiled modelu (view
  modely, `readDossierStats`); ručně psaný počet v šabloně je bug a
  `lint:hardcoded-records` na něj cílí.

## Prezentační index adresáře

`static/data/dossiers.json` je jediný vstup adresáře dossierů (tabulka /
seznam / dlaždice na `/` a `/dossiers/`). Staví ho
`scripts/dossier/lib/record-tables.mjs` — od fáze G **tenká projekce nad
compiled kanonickým modelem** (identita/typ/pořadí z `dossier.json`,
počty z compiled záznamů, routy z `data/generated/navigation.json`).
Routy se čtou z manifestu, neskládají se z řetězců; počty se nikdy
nepíšou do šablony (test `scripts/ui/dossier-directory.test.mjs`).
Rozhodnutí a důsledky: [ADR o adresáři](adr/dossier-directory-multi-view.md)
(historický — popisuje TOML vstupy před T-028).

## Rozhodnutí: AJV (mini-ADR)

Dev-závislost `ajv` (build-time only, nic se neservíruje klientovi).
Alternativa „vlastní mini-validátor" odmítnuta: schémata používají draft
2020-12 (`additionalProperties`, `enum`, `pattern`, podmíněné `allOf`,
cross-file `$ref`) a vlastní implementace by byla větší údržbová plocha
než standardní, všude auditovaný AJV — přesně případ, kdy `adr`
disciplína repa závislost povoluje (měřená potřeba: 11 kanonických
schémat + exportní schémata, brána v každém buildu).
