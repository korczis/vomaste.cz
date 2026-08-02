// Central limits/enums for the intake processor (docs/missions/intake/PHASE_002.md §13,
// §5.4, §9.1, §11). One source of truth so a limit or enum is never duplicated
// (and silently drifted) between the parser, validator, normalizer and schemas.

export const LIMITS = Object.freeze({
  maxEventFileBytes: 1024 * 1024, // §8.2: 1 MiB safe max event size
  subjectTextMaxChars: 500,
  descriptionTextMaxChars: 20000,
  publicInterestTextMaxChars: 10000,
  identifiersTextMaxChars: 2000,
  knownUnknownsTextMaxChars: 5000,
  existingReferencesTextMaxChars: 5000,
  sourceUrlLineMaxChars: 2048,
  maxSourceUrls: 100,
  maxWarnings: 200,
});

// docs/missions/intake/PHASE_002.md §11 — exactly the Phase-1-approved enum,
// no "other" escape hatch (an unrecognized type must fail closed, not be
// silently accepted as a bypass of validation).
export const SUBMISSION_TYPES = Object.freeze([
  "new_dossier",
  "new_entity",
  "new_topic_for_existing_dossier",
  "link_existing_entities",
]);

// §12 — all three must be explicitly true; a missing key is never treated
// as an implicit yes.
export const REQUIRED_ACKNOWLEDGEMENT_KEYS = Object.freeze([
  "public_issue_understood",
  "no_confidential_material",
  "not_automatic_publication",
]);

// §9.1 — only explicitly known form versions are ever parsed; an unknown
// version (older or newer) is rejected rather than best-effort parsed.
export const SUPPORTED_FORM_VERSIONS = Object.freeze(["vomaste-intake-form:v1"]);

// §9 form recognition: a hidden HTML-comment marker as the form's own
// versioned identity, independent of title wording. Must be the first
// non-blank line of the issue body — a body-supplied occurrence anywhere
// else (e.g. inside a quoted description) does not count as the marker;
// see detect-form.mjs.
export const FORM_MARKER_PATTERN = /^<!--\s*(vomaste-intake-form:v\S+)\s*-->$/;

// §10 required-section headings for vomaste-intake-form:v1, and the
// submission-type / acknowledgement label vocabularies a future Phase 5
// GitHub Issue Form YAML must render byte-for-byte to be parseable. Kept
// here, not hardcoded in the parser, so the v1 contract has one place to
// read and one place to change (a v2 form gets its own map, never a
// mutation of this one — see §23.3).
export const FORM_V1 = Object.freeze({
  marker: "vomaste-intake-form:v1",
  requiredSections: Object.freeze([
    "submissionType",
    "subjectText",
    "descriptionText",
    "publicInterestText",
    "sourceUrls",
    "acknowledgements",
  ]),
  optionalSections: Object.freeze(["identifiersText", "knownUnknownsText", "existingReferencesText"]),
  headings: Object.freeze({
    submissionType: "Typ podnětu",
    subjectText: "Navržený subjekt",
    descriptionText: "Popis a kontext",
    publicInterestText: "Veřejný zájem",
    sourceUrls: "Zdrojové odkazy",
    identifiersText: "Identifikátory (nepovinné)",
    knownUnknownsText: "Co zatím nevíme (nepovinné)",
    existingReferencesText: "Souvislost s existujícím dossierem (nepovinné)",
    acknowledgements: "Potvrzení",
  }),
  submissionTypeLabels: Object.freeze({
    "Nový dossier (nová osoba/subjekt)": "new_dossier",
    "Nová entita (firma, spolek, vazba)": "new_entity",
    "Nové téma pro existující dossier": "new_topic_for_existing_dossier",
    "Propojení existujících entit": "link_existing_entities",
  }),
  acknowledgementLabels: Object.freeze({
    "Rozumím, že jde o veřejný GitHub issue a podnět bude veřejně viditelný.": "public_issue_understood",
    "Nenahraji sem důvěrný materiál, citlivé důkazy ani údaje identifikující zdroj.": "no_confidential_material",
    "Rozumím, že se nejedná o automatickou autorizaci ani publikaci — podnět jen čeká na posouzení vlastníkem.": "not_automatic_publication",
  }),
});

export const FORM_VERSION_NUMBER = "1.0.0";
export const PARSER_VERSION = "1.0.0";
export const GENERATOR_VERSION = "1.0.0";
export const SCHEMA_VERSION = "0.3.0"; // still experimental — see schemas/intake/intake-manifest.schema.json $comment
export const MATCHING_INDEX_SCHEMA_VERSION = "1.0.0"; // build-matching-index.mjs's own output schema_version

// §16 — the hidden HTML-comment marker the report renderer emits, and the
// exact same marker string an attacker-controlled issue body might try to
// spoof; detect-form/parse-issue-form must never trust a body-supplied
// occurrence of this string as if it were the report itself.
export const REPORT_MARKER = "<!-- vomaste-intake-report:v1 -->";

// §14.2 — syntactically supported URL protocols. Anything else is a
// syntax_observation, never a fetched or trusted URL (no network in Phase 2).
export const ALLOWED_URL_PROTOCOLS = Object.freeze(["https:", "http:"]);

export const EXIT_CODES = Object.freeze({
  success: 0,
  invalidCliUsage: 2,
  invalidEventJson: 3,
  unsupportedForm: 4,
  submissionValidationFailed: 5,
  manifestValidationFailed: 6,
  outputFailure: 7,
  internalError: 8,
});
