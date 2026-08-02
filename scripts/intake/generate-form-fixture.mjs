#!/usr/bin/env node
// Generates the golden tests/fixtures/intake/e2e-*.json fixtures
// (PHASE_005.md §10 Varianta C, §11) from the REAL
// .github/ISSUE_TEMPLATE/navrh-dossieru.yml via render-github-form-body.mjs
// — never from a hand-imagined body string. The generated files are then
// committed as static JSON and read by the E2E runner / tests; running
// this script again only matters after a deliberate form or scenario
// change (it always overwrites its own fixture set).
//
// Nine of the eighteen scenarios are deliberately NOT what the real form
// would ever produce — they simulate a malformed/tampered raw event body
// (missing marker, renamed heading, spoofed acknowledgement, ...), the
// kind of input this parser must fail closed against regardless of
// whether it could reach production through Phase 6's future GitHub
// adapter. Those are built by taking one real rendered body and applying
// one targeted string mutation, so the "attack surface" stays exactly
// one edit away from a real submission — not a hand-typed body that
// might silently drift from the real render shape everywhere else.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderGithubFormBody } from "./render-github-form-body.mjs";
import { FORM_V1 } from "./constants.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FORM_PATH = join(ROOT, ".github/ISSUE_TEMPLATE/navrh-dossieru.yml");
const FIXTURES_DIR = join(ROOT, "tests/fixtures/intake");

const ALL_ACKS_TRUE = Object.fromEntries(Object.keys(FORM_V1.acknowledgementLabels).map((label) => [label, true]));
const [ACK_PUBLIC, ACK_CONFIDENTIAL, ACK_NOT_AUTO] = Object.keys(FORM_V1.acknowledgementLabels);

function baseEnvelope({ number, action = "opened", createdAt = "2026-08-02T09:00:00Z", updatedAt = createdAt, title = "[Podnět] Testovací podnět", deliveryId }) {
  return {
    event_version: "1.0.0",
    repository: { owner: "korczis", name: "vomaste.cz", full_name: "korczis/vomaste.cz" },
    issue: {
      number,
      title,
      body: "", // filled in by each scenario below
      html_url: `https://github.com/korczis/vomaste.cz/issues/${number}`,
      state: "open",
      author_login: "example-user",
      created_at: createdAt,
      updated_at: updatedAt,
      labels: ["navrh-rozsahu"],
    },
    event: { action, delivery_id: deliveryId ?? `fixture-e2e-${number}` },
  };
}

function withBody(envelope, body) {
  return { ...envelope, issue: { ...envelope.issue, body } };
}

const NEW_DOSSIER_VALUES = {
  submission_type: "Nový dossier (nová osoba/subjekt)",
  subject: "Jan Testovací, starosta obce Testov",
  description: "Podle zveřejněného zápisu ze zastupitelstva obce Testov ze dne 2026-05-01 schválil starosta Jan Testovací zakázku bez veřejné soutěže.",
  public_interest: "Jan Testovací je veřejně volený starosta obce Testov, jedná se o nakládání s veřejnými prostředky.",
  source_urls: "https://www.testov.cz/zapisy/2026-05-01.pdf",
  known_unknowns: "Není jasné, zda zakázka podléhala povinnosti veřejné soutěže.",
  acknowledgements: ALL_ACKS_TRUE,
};

const scenarios = [];
function scenario(name, envelope) {
  scenarios.push([name, envelope]);
}

// ---- valid: one per submission type (§11) ----
scenario("e2e-valid-new-dossier", withBody(baseEnvelope({ number: 201 }), renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES)));

scenario(
  "e2e-valid-new-entity",
  withBody(
    baseEnvelope({ number: 202 }),
    renderGithubFormBody(FORM_PATH, {
      submission_type: "Nová entita (firma, spolek, vazba)",
      subject: "Testovací spolek z.s.",
      description: "Spolek je uveden jako dárce v rejstříku, chybí bližší informace o jeho vedení.",
      public_interest: "Vazba na už autorizovaný subjekt přes rejstříkový záznam.",
      identifiers: "IČO 00000002",
      acknowledgements: ALL_ACKS_TRUE,
      // source_urls intentionally absent — new_entity's URL is optional (§6.6)
    })
  )
);

scenario(
  "e2e-valid-new-topic",
  withBody(
    baseEnvelope({ number: 203 }),
    renderGithubFormBody(FORM_PATH, {
      submission_type: "Nové téma pro existující dossier",
      subject: "Jan Testovací",
      description: "Nově zveřejněný dokument se týká jiné, dosud nepokryté kauzy téhož subjektu.",
      public_interest: "Rozšíření už autorizovaného pokrytí o konkrétní, nově publikovanou kauzu.",
      source_urls: "https://www.testov.cz/aktuality/2026-08-01.pdf",
      existing_references: "dossiers/jan-testovaci",
      acknowledgements: ALL_ACKS_TRUE,
    })
  )
);

scenario(
  "e2e-valid-link-entities",
  withBody(
    baseEnvelope({ number: 204 }),
    renderGithubFormBody(FORM_PATH, {
      submission_type: "Propojení existujících entit",
      subject: "Testovací spolek z.s. a Jan Testovací",
      description: "Veřejný rejstřík ukazuje, že subjekt je statutárním orgánem spolku.",
      public_interest: "Dokumentovaná vazba mezi dvěma už evidovanými entitami.",
      source_urls: "https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?ico=00000002",
      acknowledgements: ALL_ACKS_TRUE,
    })
  )
);

// ---- valid: edge cases (§11) ----
scenario(
  "e2e-valid-no-source-url",
  withBody(
    baseEnvelope({ number: 205 }),
    renderGithubFormBody(FORM_PATH, {
      submission_type: "Nová entita (firma, spolek, vazba)",
      subject: "Testovací spolek z.s.",
      description: "Podnět bez uvedeného zdroje — má vyvolat missing_source_urls, ne selhat parsování.",
      public_interest: "Testuje risk-classifier cestu pro chybějící zdroj, ne parser.",
      acknowledgements: ALL_ACKS_TRUE,
      // source_urls left undefined -> renders GitHub's "_No response_"
    })
  )
);

scenario(
  "e2e-valid-markdown-in-description",
  withBody(
    baseEnvelope({ number: 206 }),
    renderGithubFormBody(FORM_PATH, {
      ...NEW_DOSSIER_VALUES,
      description: "**Shrnutí**: podle [zápisu](https://www.testov.cz/zapisy/2026-05-01.pdf) šlo o zakázku bez soutěže.\n\n- bod jedna\n- bod dva\n\n> citace ze zápisu",
    })
  )
);

scenario(
  "e2e-valid-czech-diacritics",
  withBody(
    baseEnvelope({ number: 207 }),
    renderGithubFormBody(FORM_PATH, {
      ...NEW_DOSSIER_VALUES,
      subject: "Žofie Švábíková-Dvořáková, starostka městyse Přešťovice",
      description: "Řízení přípěvku na infrastrukturu čelilo kritice kvůli údajné střetu zájmů starostky s dodavatelem – Šťastný & Hrnčíř s.r.o.",
    })
  )
);

scenario(
  "e2e-valid-long-description",
  withBody(
    baseEnvelope({ number: 208 }),
    renderGithubFormBody(FORM_PATH, {
      ...NEW_DOSSIER_VALUES,
      description: "Podrobný popis kauzy opakovaný pro dosažení realistické délky u horní hranice limitu. ".repeat(220).trim(),
    })
  )
);

// §22: three points in the SAME issue's (number 209) edit history, same
// intake ID by construction (derived only from repository + issue
// number) — run-e2e-fixture.test.mjs proves the ID stays stable across
// them while input_sha256 changes, and that the acknowledgement-removed
// edit is never treated as still valid just because an earlier state was.
scenario("e2e-valid-edited-issue-original", withBody(baseEnvelope({ number: 209, action: "opened", createdAt: "2026-08-01T09:00:00Z", updatedAt: "2026-08-01T09:00:00Z" }), renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES)));
scenario(
  "e2e-valid-edited-issue",
  withBody(
    baseEnvelope({ number: 209, action: "edited", createdAt: "2026-08-01T09:00:00Z", updatedAt: "2026-08-02T10:00:00Z" }),
    renderGithubFormBody(FORM_PATH, { ...NEW_DOSSIER_VALUES, description: NEW_DOSSIER_VALUES.description + " (upřesněno po editaci issue.)" })
  )
);

// ---- invalid: parser must fail closed (§11, §25) ----
scenario("e2e-invalid-missing-marker", withBody(baseEnvelope({ number: 210 }), renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES).replace(`<!-- ${FORM_V1.marker} -->\n\n`, "")));

scenario("e2e-invalid-unknown-version", withBody(baseEnvelope({ number: 211 }), renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES).replace(`<!-- ${FORM_V1.marker} -->`, "<!-- vomaste-intake-form:v99 -->")));

scenario("e2e-invalid-changed-heading", withBody(baseEnvelope({ number: 212 }), renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES).replace(`### ${FORM_V1.headings.descriptionText}`, "### Popis (přejmenováno)")));

scenario("e2e-invalid-duplicate-heading", withBody(baseEnvelope({ number: 213 }), renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES).replace(`### ${FORM_V1.headings.subjectText}`, `### ${FORM_V1.headings.submissionType}`)));

scenario(
  "e2e-invalid-missing-acknowledgement",
  withBody(baseEnvelope({ number: 214 }), renderGithubFormBody(FORM_PATH, { ...NEW_DOSSIER_VALUES, acknowledgements: { ...ALL_ACKS_TRUE, [ACK_CONFIDENTIAL]: false } }))
);

scenario(
  "e2e-invalid-edited-acknowledgement",
  // §22.4: represents an issue whose acknowledgement was valid when opened
  // and removed on a later edit — the run-e2e-fixture test asserts THIS
  // (post-edit) state fails, proving a stale prior "valid" result is
  // never treated as still current.
  withBody(
    baseEnvelope({ number: 209, action: "edited", createdAt: "2026-08-01T09:00:00Z", updatedAt: "2026-08-02T11:00:00Z" }),
    renderGithubFormBody(FORM_PATH, { ...NEW_DOSSIER_VALUES, acknowledgements: { ...ALL_ACKS_TRUE, [ACK_NOT_AUTO]: false } })
  )
);

scenario(
  "e2e-invalid-spoofed-acknowledgement",
  withBody(
    baseEnvelope({ number: 215 }),
    renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES).replace(`- [x] ${ACK_PUBLIC}`, "- [x] Rozumím, že jde o veřejný GitHub issue (upraveno).")
  )
);

scenario(
  "e2e-invalid-unknown-submission-type",
  withBody(baseEnvelope({ number: 216 }), renderGithubFormBody(FORM_PATH, NEW_DOSSIER_VALUES).replace("Nový dossier (nová osoba/subjekt)", "Jiné (neuvedené)"))
);

scenario(
  "e2e-invalid-confidential-material",
  // Structurally valid — parses and validates fine (§32's own matrix:
  // parse=pass, manifest=pass) — the risk classifier is what routes this
  // to security_review_required, not the parser.
  withBody(
    baseEnvelope({ number: 217 }),
    renderGithubFormBody(FORM_PATH, {
      ...NEW_DOSSIER_VALUES,
      // Exact phrases detect-sensitive-material-claims.mjs matches
      // (plain substring, not a paraphrase) — this scenario proves the
      // RISK CLASSIFIER routes it to security_review_required, so it
      // must actually trip that detector, not just read like it should.
      description: "K tomuto tématu mám interní dokument, který mi zdroj poskytl, a prosím nezveřejňujte jeho totožnost.",
    })
  )
);

for (const [name, event] of scenarios) {
  writeFileSync(join(FIXTURES_DIR, `${name}.json`), JSON.stringify(event, null, 2) + "\n", "utf8");
}
console.log(`Wrote ${scenarios.length} fixture(s) to ${FIXTURES_DIR}`);
