# schemas/canonical/ — tvarový kontrakt kanonických JSON záznamů

Fáze B mise „JSON/JSON-LD-first datová platforma" (task T-028). Na rozdíl
od `schemas/*.schema.json` (validují **normalizované řádky** z
`scripts/dossier/lib/record-tables.mjs`, tedy projekci dnešního Markdown
front matter) validují tato schémata **přímo kanonické JSON soubory**
v `data/dossiers/**` — budoucí jediný zdroj pravdy po migraci fáze D.

Spouštění: `npm run data:validate` (`scripts/data/validate-shape.mjs`,
Ajv 2020-12, allErrors, strict; schéma se vybírá podle `recordType`).
Dnešní stav 0 kanonických záznamů (pre-migration) je legitimní a projde.

## Co validuje tvar (tady) vs. co zůstává sémantice (fáze C)

**Tvar (tato schémata):** typy, povinná pole, `additionalProperties:false`,
formáty ID a IRI (`https://vomaste.cz/id/…`), ISO data, uzavřené enumy
(claim status, entity type, relation type, edge status, coverage state,
gap priority), podmínky vyjádřitelné čistě nad jedním záznamem
(claim mimo `status-opinion` ⇒ `sources` minItems 1; ne-kontextová hrana
⇒ `claims` i `sources` minItems 1; entity dossier ⇒ `authorization`;
aggregate ⇒ `aggregates`).

**Sémantika (validátory fáze C, dnes jejich Markdown ekvivalenty):**
referenční integrita (odkazovaný CLM/SRC/CASE/GAP/entita skutečně
existuje) · source-families a pravidlo „corroborated ⇒ ≥2 nezávislé
rodiny" · single-source pravidlo (`single` ⇒ přesně 1 zdroj) · autorizace
subjektů proti append-only logu v AGENTS.md · unikátnost rout · depth a
konektivita grafu. Jedno pravidlo má právě jednoho vlastníka, nikdy dva
(`schemas/README.md`).

## Obálka každého záznamu

Každý kanonický záznam nese: `$schema` (const, přesná URL schématu),
`schemaVersion` (const 1), `@context`
(const `https://vomaste.cz/context/v1.jsonld`), `@id` (globální IRI pod
`https://vomaste.cz/id/`), `@type` (`vomaste:Claim` apod.), `recordType`,
`identifier` (lokální id: `CLM-1`, `SRC-1`, `edge-*`, slug, datum) a
`dossier` (idRef na vlastnící dossier). Výjimky:

- **dossier.json** nemá `dossier` (jeho `@id` JE ten dossier);
- **entity** nemá `dossier`, místo něj `dossiers` — pole slugů dossierů,
  ve kterých vystupuje. Entita je globální (jediný už dnes globální
  jmenný prostor), žádný dossier ji nevlastní; `dossiers` je členství,
  proto prosté slugy, ne idRef.

Interní reference jsou vždy objekty `{ "@id": "https://vomaste.cz/id/…" }`
(typované: `claimRef`, `sourceRef`, `dossierRef`, `entityRef`, …
v `_defs.schema.json`). `subjects` jsou prosté subject slugy
(`"babis"`) — stejná hodnota jako dnes ve front matter.

## Slovníky a kontext

- Uzavřené enumy žijí v `_defs.schema.json` a zrcadlí se do
  `data/dossiers/_shared/vocabularies/*.json` (deskriptivní
  `{value,label}` inventáře; hodnoty přesně z existujících enumů repa).
  Synchronizaci hlídá `scripts/data/validate-shape.test.mjs`.
  `source-types` je záměrně **otevřená** množina — jen inventář, žádný
  enum (stejně jako dnešní `src_type`).
- JSON-LD kontext: `data/dossiers/_shared/context/vomaste-v1.jsonld`
  (veřejně `https://vomaste.cz/context/v1.jsonld`). Termy navazují na
  slovník, který už emituje `build-jsonld-exports.mjs`
  (`vomaste:status`, `vomaste:retrieved`, `vomaste:checked`,
  `vomaste:from`/`to` — na ně mapují `sourceEntity`/`targetEntity`, …).
  Build kontexty nikdy nestahuje ze sítě —
  `scripts/data/lib/context-loader.mjs` mapuje URL na lokální soubor a
  cokoli cizího odmítne.

## Verzování a přidání pole

- `schemaVersion: 1` + `/context/v1.jsonld` jsou neměnný kontrakt.
  **Aditivní** změna (nové volitelné pole) = přidat pole do schématu
  (+ případně term do kontextu v1 — přidání termu je aditivní) a zapsat
  ji sem. **Zpětně nekompatibilní** změna (přejmenování, změna významu
  termu, zpřísnění) = `schemaVersion: 2` + nový
  `vomaste-v2.jsonld` vedle v1 (v1 se nikdy nepřepisuje) + migrace dat.
- Rozšíření uzavřeného enumu (claim status, relation type, entity type)
  je **redakční** změna datového modelu (AGENTS.md), ne technická:
  vyžaduje současně _defs enum + slovník + záznam v changelogu úpravy.
- Rezervované typy content bloků (`paragraph`, `list`, `table`,
  `references`, `related-records`) mají zatím volné `value`; plný tvar
  se specifikuje, až je začne emitovat migrátor fáze D.

## Odchylky od zadání fáze B (vědomé, doložené)

- `gap.priority` enum je `vysoká|střední|nízká` — zadání uvádělo jen
  `vysoká|nízká`, ale reálná data mají 155× `střední` (většina mezer).
- `source.published` povoluje i redukovanou přesnost (`2026-03`) —
  reálné zdroje ji nesou; plné ISO by nutilo den vymyslet.
- `claim.status` obsahuje `status-opinion` (zadání ho vyžaduje;
  v `schemas/claim.schema.json` chybí jen proto, že zatím nemá žádný
  záznam — deklarován je v AGENTS.md i `validate-dossier.mjs`).
