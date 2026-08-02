# Issue Form contract (Phase 5)

The exact contract between `.github/ISSUE_TEMPLATE/navrh-dossieru.yml` and
`scripts/intake/`'s parser. See `docs/intake/public-submission.md` for the
plain-language version, `docs/missions/intake/PHASE_005.md` for the full
mission text, and `reports/intake/phase-05-issue-form-audit.md` for how
this contract was verified against real GitHub Issue Forms rendering
behavior (not assumed) before being written.

## Form version and marker

- Marker: `vomaste-intake-form:v1`, rendered as the literal HTML comment
  `<!-- vomaste-intake-form:v1 -->` on the issue body's first non-blank
  line (a `type: markdown` body block whose `attributes.value` is exactly
  that comment, placed first in `body:`). `scripts/intake/detect-form.mjs`
  reads only this line — never the issue title, never a heuristic.
- `scripts/intake/constants.mjs`'s `SUPPORTED_FORM_VERSIONS` is the single
  list of versions the parser accepts; an unrecognized marker fails
  closed (`unsupported_form_version`), a missing one fails closed
  (`missing_form_marker`), and — since Phase 5 — a **second** marker-shaped
  line anywhere else in the body (e.g. injected into free-text
  description) fails closed too (`duplicate_form_marker`,
  `scripts/intake/detect-form.mjs`).

## Field ↔ heading ↔ parser-key mapping

GitHub renders every field's `attributes.label` as a `### <label>` (H3)
heading, in body order, followed by the submitted value (or the literal
placeholder `_No response_` for an unanswered field — see below). This is
the single source of truth (`scripts/intake/constants.mjs`'s `FORM_V1`);
`scripts/intake/issue-form-compatibility.test.mjs` proves the real YAML
matches it, not just documentation asserting so.

| Form field id | Generated heading | Parser key | GitHub `required` |
| --- | --- | --- | --- |
| `submission_type` | Typ podnětu | `submissionType` | true |
| `subject` | Navržený subjekt | `subjectText` | true |
| `description` | Popis a kontext | `descriptionText` | true |
| `public_interest` | Veřejný zájem | `publicInterestText` | true |
| `source_urls` | Zdrojové odkazy | `sourceUrls` | **false** — see below |
| `identifiers` | Identifikátory (nepovinné) | `identifiersText` | false |
| `known_unknowns` | Co zatím nevíme (nepovinné) | `knownUnknownsText` | false |
| `existing_references` | Souvislost s existujícím dossierem (nepovinné) | `existingReferencesText` | false |
| `acknowledgements` | Potvrzení | `acknowledgements` | (each of the 3 options individually `required: true`) |

`source_urls` is deliberately **heading-required but GitHub-optional**:
GitHub Issue Forms cannot conditionally require a field based on another
field's value (§6.6), so making it `required: true` would force a source
URL even for a `link_existing_entities` submission that legitimately
might not have one at issue-open time. The heading always exists in a
well-formed v1 body (`FORM_V1.requiredSections` includes `sourceUrls`);
whether the *value* is empty is instead handled by the risk classifier
(`missing_source_urls` flag), not by client-side validation.

## Dropdown mapping (`submission_type`)

| Form option (exact text) | Internal enum |
| --- | --- |
| Nový dossier (nová osoba/subjekt) | `new_dossier` |
| Nová entita (firma, spolek, vazba) | `new_entity` |
| Nové téma pro existující dossier | `new_topic_for_existing_dossier` |
| Propojení existujících entit | `link_existing_entities` |

No `other` option exists — an unrecognized dropdown value (only reachable
by a malformed/tampered raw event, since GitHub's own UI only offers
these four) resolves to `submission_type: null` in the parsed output,
which `validate-submission.mjs` then rejects
(`unsupported_submission_type`) rather than silently accepting.

## Acknowledgement mapping

| Form checkbox option (exact text) | Parser key |
| --- | --- |
| Rozumím, že jde o veřejný GitHub issue a podnět bude veřejně viditelný. | `public_issue_understood` |
| Nenahraji sem důvěrný materiál, citlivé důkazy ani údaje identifikující zdroj. | `no_confidential_material` |
| Rozumím, že se nejedná o automatickou autorizaci ani publikaci — podnět jen čeká na posouzení vlastníkem. | `not_automatic_publication` |

All three are individually `required: true` in the YAML (GitHub blocks
submission client-side without them) and matched by **exact label text**,
never by checkbox position — `scripts/intake/parse-issue-form.mjs`'s
`parseAcknowledgements` looks up each `- [x]`/`- [ ]` line's label in this
exact map. An unrecognized label (edited text, or one the form doesn't
define) is recorded in `unrecognized_acknowledgement_labels` and does
**not** count toward any of the three required keys — a submitter can't
satisfy the requirement by checking something that merely looks similar.

## The empty-field placeholder

GitHub renders an unanswered `input`/`textarea`/`dropdown` field as the
literal text `_No response_` under its heading — never a blank section.
`scripts/intake/parse-issue-form.mjs` normalizes this to an empty string
for every text-valued heading except `acknowledgements` (a checkboxes
field, where GitHub always lists every option's checked state — this
placeholder never legitimately appears there; if a raw/tampered event
forged it anyway, leaving it untouched means zero checkbox lines are
recognized, which is the correct fail-closed outcome rather than treating
it as a valid-but-empty answer). This was a real gap until Phase 5 — see
the phase-05 implementation report.

## Version bump policy

The form version must bump (a new `v2.mjs`-equivalent contract, never a
mutation of `FORM_V1`) if any of the following changes:

- the marker string;
- any required heading's exact text;
- a field's meaning (what it's asking for);
- a dropdown option's label-to-enum mapping;
- an acknowledgement checkbox's label text;
- a field's `required` status;
- the parsing grammar itself (`HEADING_LINE`'s `### ` convention).

It does **not** need to bump for: field `description`/`placeholder` text
(form-UI-only, never in the rendered body — verified in the phase-05
audit), the form's `name`/`title`/`labels`, or reordering optional
fields relative to each other.

## Compatibility testing

`scripts/intake/issue-form-compatibility.test.mjs` (`npm run
test:intake:form`) is the actual proof, not a restatement of this table:
it reads the real `.github/ISSUE_TEMPLATE/navrh-dossieru.yml` via
`scripts/intake/render-github-form-body.mjs`, renders realistic bodies
from it, and round-trips them through the real parser and validator. It
fails if: a field's label stops matching a known heading, a required
heading has no field, a dropdown option has no enum (or an enum is
unreachable), a checkbox option isn't `required: true` or has no
acknowledgement mapping, field ids collide, or a fully/minimally answered
real submission fails to parse and validate.

## Fixture strategy

`tests/fixtures/intake/e2e-*.json` are **golden, hand-reviewed, committed
fixtures** (PHASE_005.md §10 "Varianta A/C") generated once by
`scripts/intake/generate-form-fixture.mjs` from the real form via the
same renderer the compatibility tests use — never a second, independently
imagined body format. Re-run the generator only after a deliberate form
or scenario change; it always overwrites its own fixture set. `npm run
intake:e2e-fixture` processes all of them through the full pipeline
(offline, mock DNS resolving to a private address — the same
"prove the SSRF policy fires" pattern `intake:preflight-fixture` already
uses) into `.tmp/intake/e2e-run/`. `scripts/intake/run-e2e-fixture.test.mjs`
(`npm run test:intake:e2e`) asserts each scenario reaches its specified
outcome, proves edit semantics (§22: same intake ID across an edit,
different input hash, a removed acknowledgement invalidates the new run),
and separately exercises one genuinely network-reachable (mocked,
loopback-only) HTTP round trip — the static fixtures above always resolve
to a private address by design, since they can't embed an ephemeral mock
server port, so that one scenario is built dynamically instead of from a
committed file.
