# Phase 3 — Entity matching data inventory

**Datum**: 2026-08-02 · Base commit: `9a46527e` (master, after Phase 2 merge)

Audited by reading the actual canonical files, not by trusting field
names (PHASE_003.md §3). Two source collections feed the matching index —
neither is the "one entity index" PHASE_003.md's Variant A hoped might
already exist as a reusable generated artifact; the closest thing
(`data/generated/navigation.json`, the JSON-LD exports) carries route/nav
shape, not matching-shape fields, so Variant B (a dedicated read-only
index builder) was used — see §4.

## Source 1: entity dossiers (`data/dossiers/*/dossier.json`, `dossierType: "entity"`)

23 of the 24 files under `data/dossiers/*/dossier.json` (the 24th,
`macinka-turek`, is `dossierType: "aggregate"` — excluded, it is not a
person or organization, it is a generated rollup view). Each is an
**authorized dossier subject** — `subject_text` in an intake submission
naming one of these should be treated as "this may already be covered,"
which is exactly what candidate matching needs to surface.

| Field | Path | Unique | Validated | Safe for matching | Weight |
|---|---|---:|---:|---:|---:|
| `slug` | `dossier.json.slug` | yes (route-unique, `validate-navigation.mjs`) | yes | yes — used as `entity_id` | identifier-strength (exact) |
| `title` | `dossier.json.title` | yes among the 23 | yes (front matter, human-authored) | yes — used as `canonical_name` | name-strength |
| `authorization.records` | `dossier.json.authorization.records` | — | yes (`validate-authorization.mjs`) | not used for scoring (§7.2 forbids authorization status as identity evidence) — used only to set `dossier_status: "authorized"` on the index row | — |

**No alias field exists on `dossier.json`** — a dossier subject has
exactly one canonical display name in this dataset today. This is a real
finding, not an oversight to route around: candidate matching against
dossier subjects is name+slug only, no alias layer, until/unless a future
phase adds one.

## Source 2: shared registry entities (`data/dossiers/_shared/entities/*.json`)

503 files, `schemas/canonical/entity.schema.json`.

| Field | Path | Entity types | Unique | Validated | Safe for matching | Weight |
|---|---|---|---:|---:|---:|---:|
| `entityId` | `.entityId` | all | yes (filename-derived) | yes | yes — `entity_id` | identifier (exact) |
| `title` | `.title` | all | mostly (a few shared surnames exist by design — see below) | yes | yes — `canonical_name` | name-strength |
| `entityType` | `.entityType` | all | — | yes, enum-validated (`person, political_party, public_institution, company, organization, event, controversy, role, legal_or_administrative_process`) | yes — routes person vs. organization normalization | — |
| `alternateNames` | `.alternateNames` | all | — | schema-typed (string array) | **0 of 503 entities have this field populated** — checked directly (`grep -l alternateNames`), matches the open question already on record in `AGENTS.md`/ADR §36.4 | present in the index shape, always empty today |
| `externalIds` | `.externalIds` | all | — | schema-typed (map of registry→id, e.g. would carry IČO) | **0 of 503 entities have this field populated** — same finding | present in the index shape, always empty today |
| `dossiers` | `.dossiers` | all | — | yes | yes — `dossier_ids` | — |
| `publicationRole` | `.publicationRole` | all | — | yes (`context` for all 503 — no shared entity is itself a dossier subject) | copied through as `publication_role` | — |
| `dossierStatus` | `.dossierStatus` | all | — | yes | copied through | — |

Type distribution (2026-08-02): 196 `person`, 71 `company`, 47
`organization`, 100 `public_institution`, 11 `political_party` (325
name-matchable "who/what" entities), plus 27 `controversy`, 13 `event`,
37 `legal_or_administrative_process`, 1 `role` (78 non-name-matching
records — a controversy or legal process has a `title` but isn't a
"subject" a candidate would ever resolve to, so the index builder
excludes these four types from the matchable set; see §4.2).

## What this means for Phase 3 scoring

- **Identifier-based matching (IČO, databox — §5.6/§5.7) is fully
  implemented in code but cannot exact-match anything against today's
  dataset**, because no entity currently carries a populated
  `externalIds`. This is expected and documented, not a bug: an intake
  submission's own extracted IČO can still be checksum-validated and
  recorded as an `extracted_identifiers` observation even when the index
  has nothing to match it against. `scripts/intake/matching/match-entities.mjs`'s
  tests therefore use a **synthetic** index (PHASE_003.md §19), not the
  real 503-entity dataset, to exercise identifier matching at all — the
  real dataset is used only for the index-builder's own shape/determinism
  tests.
- **Alias matching (§6.3) is currently a no-op against real data** for
  the same reason — `alternateNames` is unpopulated everywhere. The
  matcher still implements it (reads `normalized_aliases`), so it starts
  working the moment a future editorial pass populates the field, with
  no matcher code change required.
- **Name matching (exact/near) is the only layer with real signal
  today** — 325 person/organization entities × 23 dossier subjects give
  a real, if modest, name-collision surface (e.g. common Czech surnames
  across the `person` set) worth testing against.

## Index builder decision

Variant B: `scripts/intake/build-matching-index.mjs`, a read-only
derived-artifact builder over the two sources above (never a new source
of truth — §4.2). See `docs/intake/entity-matching.md` for its output
contract.
