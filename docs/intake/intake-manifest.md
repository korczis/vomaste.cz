# Intake manifest (Phase 2)

Reference for `schemas/intake/intake-manifest.schema.json` — the artifact
`scripts/intake/build-intake-manifest.mjs` produces from one validated,
normalized submission. See `docs/adr/ADR-public-dossier-intake.md` for the
architecture decision this implements, and
`docs/missions/intake/PHASE_002.md` for the mission text this phase
followed.

## Schema versions

- `schema_version`: `"0.1.0"` — still experimental (not `1.0.0`), per
  `docs/adr/ADR-public-dossier-intake.md` §23.1. A future phase may bump
  this once the site owner accepts the model as stable.
- `form_version` (inside `system_observations`): the version of the
  *input form*, independent of the manifest schema version. Today only
  `vomaste-intake-form:v1` is supported (`scripts/intake/constants.mjs`
  `SUPPORTED_FORM_VERSIONS`).
- `provenance.generator_version`: the processor's own version, independent
  of both of the above.

These three are deliberately never merged into one field (PHASE_002.md
§23.2) — a form-format change, a manifest-shape change, and a processor
bugfix release are three different kinds of compatibility break.

## Field meanings, by section

- **`id`** — deterministic: `INTAKE-GH-<owner-slug>-<repo-slug>-<issue
  number, zero-padded to 6 digits>`. Derived only from repository full
  name + issue number, never from title, body, or wall-clock time — the
  same issue always produces the same ID, and editing the issue never
  changes it. See `scripts/intake/build-intake-manifest.mjs`'s
  `buildIntakeId`.
- **`source_event`** — a copy of the GitHub-issue facts the manifest was
  built from (repository, issue number/URL/author, event action,
  timestamps). Never used as a filesystem path anywhere in the processor.
- **`submission`** — the submitter's raw text, byte-preserved (line
  endings and all) except for the parser's own section-boundary
  whitespace trim. This is the `user_submission` class from PHASE_002.md
  §1.3 — never rewritten, corrected, or summarized.
- **`normalization`** — a *separate* layer derived from `submission`:
  `subject_text_normalized` (line-ending/whitespace/Unicode-NFC
  normalized, PHASE_002.md §13.1) and `normalized_source_urls` (syntactic
  URL extraction/classification, §14 — never a network fetch). This is
  the `system_normalization` / `system_observation` class.
- **`system_observations`** — parser/form versions plus `warnings` (valid
  submission, needs human attention — PHASE_002.md §15.3) and `errors`
  (always empty in a manifest that exists at all: an error means no
  manifest was ever created).
- **`proposed_authorization_scope`** — the `machine_draft` class (§1.3).
  `decision_class` and `authorization_effect` are JSON Schema `const`
  values (`"machine_draft_only"` / `"none"`) — not just convention, the
  schema itself makes any other value invalid. `subject_candidates` is a
  mechanical echo of what the submitter typed (`resolution_status` is
  always `"unresolved"` — Phase 2 has no entity matching, that's Phase 3).
- **`workflow`** — see below.
- **`provenance`** — `input_sha256` (canonical-JSON hash of the raw event,
  `scripts/intake/hash.mjs` `hashEventInput`) and `manifest_sha256` (hash
  of the manifest with this field itself excluded — see below).

## Raw vs. normalized, and assertion classes

PHASE_002.md §1.3 requires distinguishing at least: `user_submission`,
`system_normalization`, `system_observation`, `machine_draft`,
`human_decision`. Phase 2 produces the first four; `human_decision` never
appears in a manifest — that only exists once a human (the site owner)
acts, which is entirely outside this phase.

| Manifest section | Assertion class |
|---|---|
| `submission.*` | `user_submission` |
| `normalization.*` | `system_normalization` |
| `system_observations.*` | `system_observation` |
| `proposed_authorization_scope.*` | `machine_draft` |
| `workflow.*` | `system_observation` (mechanical, not a decision) |

## Workflow states

Phase 2's schema allows only the states the processor can actually
produce — a strict subset of the full state machine documented in
`docs/adr/ADR-public-dossier-intake.md`'s "State machine detail" section:

```text
intake_status:        triage | invalid | needs_information
authorization_status: pending_owner            (schema const — no other value is valid JSON)
publication_status:   blocked                  (schema const — no other value is valid JSON)
```

`authorized`, `publishable`, and `published` do not exist anywhere in
`schemas/intake/intake-manifest.schema.json` — not "unused," structurally
absent, so no future code change to this schema's consumers could
accidentally produce them without also changing the schema itself (which
is a visible, reviewable diff).

`intake_status` is `needs_information` whenever `system_observations.warnings`
is non-empty (an unrecognized section, an unrecognized acknowledgement
checkbox label, or a flagged URL syntax observation), `triage` otherwise.
This is a mechanical rule, not a judgment call — see
`scripts/intake/process-issue.mjs`.

## Hash strategy

- **Input hash** (`provenance.input_sha256`): SHA-256 of the canonical
  (key-sorted, `\n`-normalized) JSON serialization of the raw event input
  — see `scripts/intake/canonical-json.mjs` and `hash.mjs`
  `hashEventInput`. Stable regardless of the event JSON file's own key
  order or whitespace.
- **Manifest hash** (`provenance.manifest_sha256`): SHA-256 of the
  manifest with `provenance.manifest_sha256` itself excluded before
  hashing (resolves the "hash of a hash of itself" problem, PHASE_002.md
  §7.2) — see `hash.mjs` `hashManifest`. The manifest is otherwise
  serialized with `JSON.stringify(manifest, null, 2)`; the same inputs
  (event, clock, commit) always produce byte-identical manifest and
  report files — verified by `scripts/intake/process-issue.test.mjs`.

## ID strategy — see above (`id` field). Compatibility / migration policy

A future form version (`vomaste-intake-form:v2`) gets its own entry in
`scripts/intake/constants.mjs`'s `SUPPORTED_FORM_VERSIONS` and its own
heading/label map — never a mutation of the v1 map. An unknown form
version is always rejected, never best-effort parsed (PHASE_002.md
§23.3). A manifest schema version bump (e.g. `0.1.0` → `1.0.0` once the
owner accepts the model as stable) is a new `$id`/file, not an in-place
schema rewrite that would invalidate already-written manifests silently.

## Forbidden values (mechanically, not just by convention)

`authorization_status` and `publication_status` are JSON Schema `const`
in `intake-manifest.schema.json` — a manifest asserting any value other
than `"pending_owner"` / `"blocked"` fails schema validation. The
processor itself never even has a code path that writes a different
literal (`scripts/intake/build-intake-manifest.mjs`) —
`scripts/intake/negative-authorization.test.mjs` asserts both properties.

## Example

See `tests/fixtures/intake/valid-new-dossier.json` for a full event input,
and run `npm run intake:fixture` to produce a real manifest + report under
`.tmp/intake/fixture-run/` (gitignored).
