# Phase 5 — Issue Form audit

Per `docs/missions/intake/PHASE_005.md` §3. Audited 2026-08-02, base commit
`08f7a0ac` (post T-039b/T-044 merge, pre-Phase-5 changes).

## `.github/ISSUE_TEMPLATE/` inventory

| Template | Purpose | Parser support (pre-Phase-5) | Public warning | Versioned | Keep |
|---|---|---:|---:|---:|---:|
| `navrh-dossieru.yml` | Propose a new dossier/entity/topic/relation | **None** — single free-text `scope`/`interest`/`sources` fields, no marker, no field-to-heading contract matching `scripts/intake/constants.mjs` `FORM_V1` | Yes (T-042 hardening) | No | Yes — rebuilt in Phase 5 to be the actual `vomaste-intake-form:v1` submission channel |
| `oprava-faktu.yml` | Report a factual error in existing content | N/A — out of Phase 2-5's scope (correction workflow, not new-subject intake) | Yes | No | Yes, unmodified |
| `reakce-subjektu.yml` | A dossier subject's right-of-reply submission | N/A — same reason | Yes | No | Yes, unmodified |
| `mrtvy-zdroj.yml` | Report a dead source link | N/A | (not applicable — not a content-about-real-people channel) | No | Yes, unmodified |
| `config.yml` | Blank-issue policy + contact links | N/A | `blank_issues_enabled: false` (T-042); contact links honestly state no confidential channel exists | N/A | Yes, unmodified |

**Mission §3 "Neodstraňuj unrelated templates" honored**: `oprava-faktu.yml`,
`reakce-subjektu.yml`, `mrtvy-zdroj.yml`, and `config.yml` are untouched by
Phase 5 — only `navrh-dossieru.yml` was in scope, since it's the only one
this project's local processor (`scripts/intake/`) actually parses.

## Field-by-field audit of `navrh-dossieru.yml` (pre-Phase-5)

| Attribute | Pre-Phase-5 value |
|---|---|
| `name` | "Návrh nového dossieru či rozšíření záběru" |
| `description` | "Návrh nového subjektu, kauzy nebo tématu..." |
| `title` | `"[návrh] "` |
| `labels` | `["navrh-rozsahu"]` |
| `assignees` | (unset) |
| Field IDs | `scope` (input), `interest` (textarea), `sources` (textarea) |
| Headings generated | "Navrhovaný rozsah", "Odůvodnění veřejného zájmu", "Výchozí zdroje" — **none of these match any `FORM_V1.headings` value** |
| Version marker | **absent** |
| Acknowledgement | **one single combined checkbox**, not the three separate, individually-labeled acknowledgements `FORM_V1.acknowledgementLabels` requires |
| Public warning | Present, first body block, good wording |
| Parsability | **Would fail `detectFormVersion` outright** (`missing_form_marker`) — this form and the local processor built in Phase 2-4 had never actually been connected |

**Root cause**: `navrh-dossieru.yml` was hardened for *safety wording* by the
T-042 governance-fix mission (2026-08-02, GitHub CRITICAL audit finding —
blank issues + no warning/checkbox), which predates and is independent of
the Phase 2-4 local-processor contract (`FORM_V1` in `constants.mjs`) — the
two were never reconciled until this phase. This is exactly the gap
PHASE_005.md §0 describes: *"parser podle našich představ"* (the Phase 2
parser, designed against an imagined form) vs. *"parser, který skutečně
rozumí ... GitHub Issue Forms"* (a real, connected form).

## `config.yml` audit

Already correct and unchanged by this phase:

- `blank_issues_enabled: false` — closes the "skip the form entirely" gap
  T-042 fixed.
- Three `contact_links`, each honestly scoped: security vulnerabilities →
  `SECURITY.md` (explicitly **not** for dossier content); sensitive case
  material → explicit "no confidential channel exists" statement, no
  fictional email/endpoint; general contribution rules → `CONTRIBUTING.md`.
- No link anywhere promises anonymity, a secure/whistleblower channel, or
  automatic processing — matches PHASE_005.md §1.3/§17.3.

## Real GitHub rendering behavior — verified before building golden fixtures

GitHub's own Issue Forms docs (`syntax-for-issue-forms`,
`syntax-for-githubs-form-schema`) do **not** document the exact rendered
Markdown shape (heading level, empty-field placeholder text, checkbox
line format). Verified instead against GitHub's documented behavior
descriptions plus a well-known third-party parser implementation
(`issue-ops/parser`) before writing `render-github-form-body.mjs`:

- Every field's `attributes.label` becomes a `### <label>` (H3) heading —
  confirmed, matches `scripts/intake/parse-issue-form.mjs`'s existing
  `HEADING_LINE` regex exactly.
- An **unanswered optional field** renders the literal placeholder
  `_No response_` under its heading — **not** an empty section body.
  Phase 2's own hand-written fixtures (`tests/fixtures/intake/valid-*.json`)
  used a blank body instead, which silently masked this until this audit:
  `scripts/intake/parse-issue-form.mjs` had no handling for the literal
  string at all, so a real empty-optional-field submission would have
  carried the text `"_No response_"` into the manifest as if it were
  submitted content. Fixed in this phase (see the implementation report).
- A `checkboxes` field renders each option as `- [x] <label>` /
  `- [ ] <label>`, one per line under the field's own heading — matches
  the existing `parseAcknowledgements` regex.
- `type: markdown` block values are inserted verbatim with no heading —
  the mechanism `docs/intake/issue-form-contract.md` relies on for the
  version marker staying the body's literal first line.
- A field's `attributes.description` (the form-UI helper text) is **not**
  included in the rendered issue body — only `label` and the submitted
  value are. Confirmed important: it means Phase 5 could freely write
  human-friendly question framing (`description`/`placeholder`) without
  touching the parser-facing `label` heading contract at all.

This was not left as an assumption: `scripts/intake/render-github-form-body.mjs`
renders a body from the **real, checked-in** `navrh-dossieru.yml`, and
`scripts/intake/issue-form-compatibility.test.mjs` round-trips that real
rendered body through the real parser — 9 passing tests are the actual
proof, not a restated assumption.

## Outcome

`navrh-dossieru.yml` was rebuilt (not replaced with a new file — same
filename, same `labels`, same core safety wording) to be the real,
versioned `vomaste-intake-form:v1` submission channel: marker as the
body's first line, all 9 `FORM_V1` fields with byte-exact headings, the
three individually-labeled required acknowledgements, and `source_urls`
left GitHub-optional per §6.6's policy (heading always present, value may
legitimately be the empty placeholder — the risk classifier, not GitHub's
client-side validation, is what flags a missing source).
