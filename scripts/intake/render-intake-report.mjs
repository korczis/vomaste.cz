// Deterministic Markdown report renderer (PHASE_002.md §16). Never sent
// anywhere by Phase 2 — written to disk only, for a future Phase 6 to post
// as an issue comment. Every piece of submitter-controlled text is placed
// inside a fenced code block sized so the fence itself cannot be broken
// out of; GitHub does not expand @mentions, headings, autolinks or HTML
// comments inside a fenced code block, which is what makes this the
// single mechanism that satisfies §16.2's whole list at once, rather than
// a pile of ad hoc escaping rules that could each be wrong in a different
// way.
import { REPORT_MARKER } from "./constants.mjs";

const INTAKE_STATUS_LABELS = Object.freeze({
  triage: "čeká na redakční třídění",
  invalid: "neplatné podání",
  needs_information: "vyžaduje doplnění informací",
});

const SUBMISSION_TYPE_LABELS = Object.freeze({
  new_dossier: "Nový dossier (nová osoba/subjekt)",
  new_entity: "Nová entita (firma, spolek, vazba)",
  new_topic_for_existing_dossier: "Nové téma pro existující dossier",
  link_existing_entities: "Propojení existujících entit",
});

// §16.2: fence length must exceed the longest run of backticks already
// present in the content, or the content could prematurely close the
// block and have its remainder rendered as live Markdown.
function fencedBlock(text) {
  const content = String(text ?? "");
  const longestBacktickRun = Math.max(2, ...(content.match(/`+/g) ?? [""]).map((run) => run.length));
  const fence = "`".repeat(longestBacktickRun + 1);
  return `${fence}text\n${content}\n${fence}`;
}

function renderUrlList(normalizedUrls) {
  if (normalizedUrls.length === 0) return "_(žádné URL nebyly rozpoznány)_";
  return normalizedUrls
    .map((entry) => {
      const flags = entry.syntax_observations.length > 0 ? ` _(${entry.syntax_observations.join(", ")})_` : "";
      // Each URL is plain-text list content (not a link — never auto-link
      // submitter-controlled URLs in a comment that will render live),
      // wrapped inline in a single-backtick code span so it can't itself
      // break the list line.
      return `- \`${entry.normalized.replace(/`/g, "'")}\`${flags}`;
    })
    .join("\n");
}

function renderSimpleList(items, emptyLabel) {
  if (!items || items.length === 0) return `_(${emptyLabel})_`;
  return items.map((item) => `- ${item}`).join("\n");
}

// `manifest` is the already-built, already-schema-valid manifest object
// (build-intake-manifest.mjs). Same manifest + same rendering logic always
// produces byte-identical Markdown — no clock or randomness read in here.
export function renderIntakeReport(manifest) {
  const { submission, normalization, system_observations, proposed_authorization_scope, workflow, provenance, id } = manifest;

  const warningLines = system_observations.warnings.map((w) => `- **${w.code}**${w.field ? ` (\`${w.field}\`)` : ""}: ${w.message}`);

  return `${REPORT_MARKER}

## Stav podnětu

- Intake ID: \`${id}\`
- Intake: ${INTAKE_STATUS_LABELS[workflow.intake_status] ?? workflow.intake_status}
- Autorizace: čeká na vlastníka
- Publikace: blokována

> Tento report není autorizace, redakční závěr ani publikovaný dossier.

## Přijatý podnět

- Typ: ${SUBMISSION_TYPE_LABELS[submission.submission_type] ?? submission.submission_type}
- Počet uvedených URL: ${normalization.normalized_source_urls.length}

**Navržený subjekt**

${fencedBlock(submission.subject_text)}

**Popis a kontext**

${fencedBlock(submission.description_text)}

**Veřejný zájem**

${fencedBlock(submission.public_interest_text)}

**Zdrojové odkazy (syntakticky normalizované, NEOVĚŘENÉ síťově)**

${renderUrlList(normalization.normalized_source_urls)}

## Technické zpracování

- Verze formuláře: \`${system_observations.form_version}\`
- Verze procesoru: \`${system_observations.parser_version}\`
- Vstupní hash: \`${provenance.input_sha256}\`
- Čas zpracování: ${provenance.generated_at}

## Upozornění

${warningLines.length > 0 ? warningLines.join("\n") : "_(žádná)_"}

## Strojový návrh rozsahu

> Pouze strojový návrh bez autorizačního účinku.

- Třída rozhodnutí: \`${proposed_authorization_scope.decision_class}\`
- Autorizační účinek: \`${proposed_authorization_scope.authorization_effect}\`

**Navržené subjekty**

${
  proposed_authorization_scope.subject_candidates.length === 0
    ? "_(žádné)_"
    : proposed_authorization_scope.subject_candidates
        .map((c) => `- \`${c.label_from_submission.replace(/`/g, "'").replace(/\n/g, " ")}\` (stav: ${c.resolution_status})`)
        .join("\n")
}

**Výslovná vyloučení**

${renderSimpleList(proposed_authorization_scope.explicit_exclusions, "žádná")}

**Zdrojová omezení**

${renderSimpleList(proposed_authorization_scope.sourcing_limits, "žádná")}

## Další krok

Podnět musí ručně posoudit vlastník projektu.
`;
}
