# Phase 1 — Architecture inventory

**Datum**: 2026-08-02 · **Stav**: VERIFIED · **Base commit**: `20f048b9` (master)
**Mise**: [docs/missions/intake/](../../docs/missions/intake/README.md) · **ADR**: [docs/adr/ADR-public-dossier-intake.md](../../docs/adr/ADR-public-dossier-intake.md)

Inventář zdrojů pravdy, generátorů, validátorů, rendererů a testů. Vše ověřeno v kódu (§5.2 zadání).

---

## 1. Datové domény — zdroje pravdy, generátory, validátory, renderery, testy

| Doména | Kanonický zdroj | Generovaný výstup | Schema | Validátor | Renderer | Test |
|---|---|---|---|---|---|---|
| **dossiers** (24) | `data/dossiers/<slug>/dossier.json` | `content/dossiers/<slug>/_index.md`, `data/generated/views/dossiers/<slug>/overview.json`, `static/data/dossiers.json`, `/data/dossiers/<slug>.jsonld` | `schemas/canonical/dossier.schema.json` + export `schemas/dossier.schema.json` | shape + R1-R3 + S5/S7/S8 + T1-T8 | `templates/dossier.html`, `entity-dossier.html`, `dossiers-index.html` | `compiled-golden.test.mjs`, `ui/dossier-directory.test.mjs`, `validate-directory-index.mjs` |
| **entities** (503, globální) | `data/dossiers/_shared/entities/<id>.json` | `content/entities/<id>.md`, `views/entities/<id>.json`, `static/data/entities.json` | `canonical/entity.schema.json` + export | shape + R3/R5 + S6 + `validate-authorization.mjs` + `validate-entity-types.mjs` | `templates/entity.html`, `entities-index.html`, `entity-type-*.html` | `osint/expand-entity.test.mjs`, `entity-dedupe.test.mjs`, golden |
| **claims** (860) | `data/dossiers/<slug>/claims/clm-NN.json` | `content/.../claims/clm-nn.md`, view model, `static/data/claims.json` | `canonical/claim.schema.json` | shape (sources≥1 mimo opinion) + R4/R6 + S1/S2 + T1-T5 | `dossier-claim.html`, `dossier-claims-index.html` | `dataset-validate.test.mjs`, `ui/source-independence.test.mjs` |
| **sources** (542) | `.../sources/src-NN.json` | dtto + `static/data/sources.json` | `canonical/source.schema.json` | shape + R4 + T7 (tělo ≥150 zn.) + T8 (dup URL warn) + `lint:source-outlets` | `dossier-source.html` | `ui/source-families.test.mjs`, `lint/lint-source-outlets.test.mjs` |
| **cases** (88) | `.../cases/case-NN.json` | dtto + `static/data/cases.json` | `canonical/case.schema.json` | shape + R4 | `dossier-case.html` | golden |
| **gaps** (188) | `.../gaps/gap-NN.json` | dtto + `static/data/gaps.json` | `canonical/gap.schema.json` | shape + R4 | `dossier-gap.html` | golden |
| **relations** (142, jediný zdroj hran) | `.../relations/edge-*.json` | dtto + `static/data/relations.json` | `canonical/relation.schema.json` | shape + R4/R5/R7 + S3/S4 | `dossier-relation.html` | `dataset-validate.test.mjs`, golden |
| **updates** (47) | `.../updates/YYYY-MM-DD[-N].json` | žádná vlastní routa (render uvnitř dossieru) | `canonical/update.schema.json` | shape + R4 | `dossier.html` (view model) | golden |
| **authorizations** | `AGENTS.md` „Content about real parties" (ř. 461, append-only) → transkripce `data/authorizations.toml` (22×) | — | žádné JSON Schema (TOML) | `validate-authorization.mjs`, `verify-authorization-log-append-only.mjs`, S5 | (nezobrazováno) | `verify-authorization-log-append-only.test.mjs` |
| **navigation** | `data/navigation.toml` (manual skeleton, mimo kanonický model) | `data/generated/navigation{,-flat,-secondary,-metrics}.json` | žádné | `validate-navigation.mjs`, `build-navigation-metrics.mjs --check`, `verify-navigation-counts.mjs` | `base.html`, partials | `navigation-metrics.test.mjs` |
| **JSON-LD** | kanonické záznamy + `_shared/context/vomaste-v1.jsonld` (83 termů) | `/data/dossiers/<slug>.jsonld`, `/data/graph.jsonld`, `jsonld-manifest.json` | context (ne JSON Schema) | `validate-jsonld.mjs` (J1-J3), `verify-jsonld.mjs`, `verify-export.mjs` | `partials/jsonld.html` | `build-jsonld-exports.test.mjs`, `verify-export.test.mjs` |
| **graph** | `dossier.json` → `graph.nodes/edges/clusters/sourceFamilies` (kurátor) + `relations/*.json` (data) | `static/data/graph/{manifest,global-curated,global-registry}.json`, `global-graph.json` | `schemas/graph-{manifest,payload}.schema.json` | `validate-graph-projections.mjs` (schema+sha256+parita) + R7 + S7/S8 | `map.html`, `assets/js/graph-app.js` (Sigma) | `graph-layout.test.mjs`, `graph-depth.test.mjs`, `graph-benchmark.spec.mjs` |

Slovníky: `_shared/vocabularies/{claim-statuses,coverage-states,entity-types,relation-types,source-types}.json` (5), sync s enumy `_defs.schema.json` hlídá `validate-shape.test.mjs:155-165`.

## 2. Generované vs. ručně spravované (§5.3)

| Adresář | Klasifikace | Evidence |
|---|---|---|
| `data/dossiers/**/*.json` | **canonical** | `README.md:84-91`, `AGENTS.md:15` |
| `data/dossiers/_shared/entities/*.json` | canonical (část gen. nástroji, existující se nepřepíše) | `AGENTS.md:445-456` |
| `data/{navigation,authorizations,government,concept-groups,entity-types}.toml` | canonical / manual | `data/navigation.toml:1-29` |
| `data/discovery-log.jsonl` | derived, append-only | `generate-discovery-log.mjs` |
| `data/generated/**` | generated / cache, gitignored | `.gitignore:6`, `README.md:77` |
| `content/dossiers/**`, `content/entities/*.md` | **generated** (hlavička „GENERATED FILE. DO NOT EDIT" ř. 2 + `extra.generated=true`), lint L1-L3 | `lint-generated-content.mjs:5-31` |
| `content/{_index,koncepty,dokumentace}/**`, root `_index.md` | manual (výjimky lintu) | `lint-generated-content.mjs:28-31` |
| `templates/**` | manual (canonical UI), gates `lint:component-reuse`+`verify:full-pages` | `AGENTS.md:620-638` |
| `assets/js/**` | manual source (esbuild) | `README.md:229` |
| `static/{css,images,favicon,CNAME,...}` | canonical/manual assets | `README.md:230` |
| `static/{css/main.css,js/app.js,search-index.json,data/}` | generated, gitignored | `.gitignore:7-14` |
| `public/` | build output, gitignored | `.gitignore:5` |
| `schemas/canonical/**` | canonical contract (AJV strict) | `README.md:223` |
| `reports/` | **generated (2/3) + manual (1/3), ale TRACKOVANÉ v gitu** — rozpor: README.md:241 a `generate-authorization-candidates.mjs:27` tvrdí gitignored, realita opak | `git ls-files reports/` |

**`unknown` klasifikace (nutno vyřešit):**
- `AUTHORIZATION.md` + `authorization.json` (root) — ruční triage tracker, žádný skill je nezmiňuje; kandidát na 3./4. nesynchronizovanou autorizační vrstvu.
- `reports/` gitignore status — dokumentace vs. realita si odporují (3 místa).

## 3. Schema registry (§10.1)

Dvě vrstvy: **canonical** (validuje vstup `data/dossiers/**`) a **ploché exporty** (brána výstupů `static/data/*.json`). Vše draft **2020-12**, vše `additionalProperties:false`.

| Schema | Vrstva | Version | Validátor | `$id` publikován? |
|---|---|---|---|---|
| `canonical/_defs.schema.json` | canonical ($defs) | — | sdílený `$ref` | ne |
| `canonical/{dossier,entity,claim,source,case,gap,relation,update,vocabulary}.schema.json` | canonical | `schemaVersion` const 1 | `validate-shape.mjs` | **ne (404)** |
| `{dossier,entity,claim,source,case,gap,relation}.schema.json` | export | **žádná** | `lib/export-schemas.mjs` | ne |
| `graph-{manifest,payload}.schema.json` | export | `schema_version` const 1 | `validate-graph-projections.mjs` | ne |

**Nálezy:** (1) asymetrické verzování — kanonická vrstva verzovaná, 7 exportních schémat ne; dvě konvence (`schemaVersion` vs `schema_version`). (2) `$id` a `@context` URI se nikde nepublikují (`public/schemas`, `public/context` neexistují), ač 4 dokumenty tvrdí opak. (3) Výběr schématu podle pole `recordType`, ne cesty (`validate-shape.mjs:29-38`).

## 4. Provenance & hashe (§10)

| Mechanismus | Kde | Nad čím |
|---|---|---|
| `entity.provenance` (`discoveredAt`/`discoveredVia`/`claimRefs`/`sourceRefs`/`depth`) | `canonical/entity.schema.json:67-99` | objevení entity (lokální refs, ne globální) |
| citation fingerprint | `lib/jsonld-shared.mjs:31-41` | `sha256(url\n retrieved\n outlet)` — přepočitatelný z citace |
| jsonld-manifest | `build-jsonld-exports.mjs:361,406` | `{route, sha256, bytes}` |
| graph manifest | `graph-manifest.schema.json` | `source_hash`, `input_hash`, per-payload sha256 |
| hash-tree | `scripts/build/hash-tree.mjs` | determinismus buildu (celý strom) |
| append-only logy | `AGENTS.md`, `data/discovery-log.jsonl`, `update` záznamy | autorizace, objevení, změny |

Kanonická serializace: **není samostatný modul**; determinismus přes codepoint řazení (`normalize.mjs:20`, bez locale), `sortedObject()`, `readdirSync().sort()`, `JSON.stringify(x,null,2)+"\n"`.

## 5. Build pipeline (§4)

Jediný vstup: `scripts/build/pipeline.mjs` (3 režimy: `build`/`dev`/`check`). Každý začíná `data:validate`. `deploy.yml` volá jediný krok `npm run build` (parita hlídána `check:workflow-parity`). `BUILD_STEPS` (38 kroků) obsahuje autorizační brány (`validate:authorization`, `verify:authorization-log`). Pre-commit je vědomá podmnožina (8 bran), obejitelná `--no-verify`.

**Nálezy pořadí:** `lint:source-outlets` a `lint:historical-coupling` NEjsou v `BUILD_STEPS` (jen `check`, resp. nikde) → v CI neběží. `npm run dev` (`package.json:52`) duplikuje `DEV_STEPS` a vynechává `data:views`/`generate-content`/`sync-content` → může servírovat stale adaptéry.

## 6. Reuse pro intake (§11.1, §16)

**Přímo reusovatelné (čisté, testované):**
- `scripts/osint/lib/entity-dedupe.mjs` — `slugify`/`baseName`/`findPossibleDuplicate` (Map-based, plnitelná z libovolného zdroje)
- `scripts/data/validate-shape.mjs` → `validateRecordObject()` — validace kandidáta v paměti
- `scripts/data/normalize.mjs` — deterministické řazení bez locale
- `scripts/lint/lint-source-outlets.mjs` → `outletKey()` — kanonizace vydavatele/domény
- `scripts/data/validate-semantics.mjs` → `familyOf` (kaskáda sourceFamily>outlet>id)
- `scripts/dossier/generate-authorization-candidates.mjs` — hotová šablona kandidátního reportu (píše mimo content/, s explicitním „this is not an authorization")
- `scripts/data/scaffold-dossier.mjs` — fail-closed scaffold (vyžaduje existující AUTH record)
- `scripts/osint/expand-entity.mjs` — vzor „nikdy nepřepiš, kolizi reportuj" + `stripPersonalData()`
- co-op bus (`scripts/coop/coop.sh`) — uzavřený validovaný slovník zpráv, append-only NDJSON, single-writer merge gate (ale neverzovaný/efemérní — pro důkazní stopu by intake potřeboval commitovaný log dle vzoru `discovery-log.jsonl`)

**Chybí, intake musí dodat:** strukturované `externalIds`/`alternateNames` (schéma ano, 0 dat), URL normalizace, kandidátní index (dnes O(n) sken), skóre/prahy, křestní jméno v matchingu, SSRF vrstva, intake schema namespace, deterministický parser issue formů (label→id mapa + fixtures).
