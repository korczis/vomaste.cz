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
import { SENSITIVE_QUERY_PARAM_NAMES } from "./preflight/constants.mjs";

const INTAKE_STATUS_LABELS = Object.freeze({
  triage: "čeká na redakční třídění",
  invalid: "neplatné podání",
  needs_information: "vyžaduje doplnění informací",
  possible_duplicate: "možná duplicita — čeká na posouzení",
  security_review_required: "vyžaduje bezpečnostní revizi",
});

// PHASE_006.md §11.5 — one honest sentence about what happens next, per
// status. Never a promise about timing or outcome.
const NEXT_STEP_TEXT = Object.freeze({
  triage: "Podnět čeká na ruční posouzení vlastníkem projektu.",
  needs_information: "Podnět potřebuje doplnit veřejné zdroje nebo přesnější vymezení.",
  possible_duplicate: "Podnět může souviset s existujícím záznamem. Automat nic neslučuje ani nezavírá.",
  security_review_required: "Automatické zpracování bylo omezeno. Podnět vyžaduje ruční bezpečnostní kontrolu.",
});

const CONFIDENCE_LABELS = Object.freeze({
  very_high: "velmi vysoká",
  high: "vysoká",
  medium: "střední",
  low: "nízká",
  conflict: "konflikt",
});

const RESOLUTION_STATUS_LABELS = Object.freeze({
  no_match: "žádná shoda",
  possible_matches: "možné shody",
  ambiguous: "nejednoznačné",
  conflicting_identifiers: "konfliktní identifikátory",
});

const SEVERITY_LABELS = Object.freeze({ info: "info", low: "nízká", medium: "střední", high: "vysoká", critical: "kritická" });

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

// §17: candidate matches table, one per §10 output, plus the mandatory
// disclaimer. Never a link, never auto-formats an entity_id as a live
// reference — a match is a candidate, not a confirmed profile.
function renderMatchingSection(matching) {
  if (matching.candidate_subjects.length === 0) {
    return "_(Podání neobsahuje rozpoznatelný subjekt k porovnání.)_";
  }
  const blocks = matching.candidate_subjects.map((candidate, index) => {
    const header = `### Kandidát ${index + 1}\n\n- Vstup: \`${candidate.input.raw_label.replace(/`/g, "'").replace(/\n/g, " ")}\`\n- Typ: ${candidate.input.candidate_type}\n- Stav rozlišení: ${RESOLUTION_STATUS_LABELS[candidate.resolution_status] ?? candidate.resolution_status}\n- Počet možných shod: ${candidate.matches.length} (z ${candidate.total_candidates_considered} zvážených)`;
    if (candidate.matches.length === 0) return header;
    const rows = candidate.matches
      .map((m) => `| \`${m.entity_id}\` | ${m.match_type} | ${m.score.toFixed(2)} (${CONFIDENCE_LABELS[m.confidence_class] ?? m.confidence_class}) | ${m.reasons.join("; ")} | ${m.conflicting_fields.join(", ") || "—"} |`)
      .join("\n");
    return `${header}\n\n| Entita | Typ shody | Skóre | Důvody | Konflikty |\n|---|---|---:|---|---|\n${rows}`;
  });
  return `${blocks.join("\n\n")}\n\n> Možná shoda není potvrzení identity.`;
}

function renderDuplicateSection(duplicateDetection) {
  if (duplicateDetection.candidates.length === 0) {
    return "_(Nebyla nalezena žádná pravděpodobně související dřívější podání.)_\n\n> Automat podněty neslučuje ani nezavírá.";
  }
  const rows = duplicateDetection.candidates
    .map((c) => `- \`${c.intake_id}\` — ${c.duplicate_type} (${c.matched_signals.join(", ")})`)
    .join("\n");
  return `${rows}\n\n> Automat podněty neslučuje ani nezavírá.`;
}

const PREFLIGHT_STATUS_LABELS = Object.freeze({
  reachable: "dostupná",
  unreachable: "nedostupná",
  blocked: "blokována",
  timeout: "časový limit",
  invalid: "neplatná",
  unsupported: "nepodporovaná",
  partial: "částečná",
  not_attempted: "neprovedeno",
});

const MAX_DISPLAY_URL_LENGTH = 200;

// §26.1/§26.2: shorten extreme URLs, neutralize embedded credentials (a
// defensive display-only measure — policy already blocks these before
// any request; this is about what a human reading the COMMENT sees, not
// what got requested), and redact known-sensitive query parameters.
// Displayed as an inert code span, never a live link (§26.1: "blocked
// URL nemusí být aktivní clickable link" — this report never makes any
// submitter-controlled URL clickable, blocked or not, matching the same
// discipline the rest of this renderer already applies).
function redactUrlForDisplay(rawUrl) {
  let display;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.username || parsed.password) {
      parsed.username = "";
      parsed.password = "";
    }
    for (const param of SENSITIVE_QUERY_PARAM_NAMES) {
      if (parsed.searchParams.has(param)) parsed.searchParams.set(param, "[redacted]");
    }
    display = parsed.toString();
  } catch {
    display = String(rawUrl);
  }
  display = display.length > MAX_DISPLAY_URL_LENGTH ? `${display.slice(0, MAX_DISPLAY_URL_LENGTH)}…` : display;
  return display.replace(/`/g, "'");
}

function renderPreflightSection(sourcePreflight) {
  if (!sourcePreflight || sourcePreflight.results.length === 0) {
    return "_(Podání neobsahuje žádnou URL k technické kontrole.)_";
  }

  const rows = sourcePreflight.results
    .map((r) => {
      const note = r.errors[0]?.code ?? r.warnings[0]?.code ?? "—";
      return `| \`${redactUrlForDisplay(r.normalized_url)}\` | ${PREFLIGHT_STATUS_LABELS[r.status] ?? r.status} | ${r.http?.status ?? "—"} | ${r.http?.content_type ?? "—"} | ${r.redirects.length} | ${note} |`;
    })
    .join("\n");
  const table = `| URL | Výsledek | HTTP | Typ obsahu | Redirecty | Poznámka |\n|---|---|---:|---|---:|---|\n${rows}`;

  const blocked = sourcePreflight.results.filter((r) => r.policy_decision === "blocked");
  const blockedSection = blocked.length === 0 ? "_(žádné)_" : blocked.map((r) => `- \`${redactUrlForDisplay(r.normalized_url)}\` — ${r.errors[0]?.code ?? "blocked"}`).join("\n");

  const withMetadata = sourcePreflight.results.filter((r) => r.metadata);
  const metadataSection =
    withMetadata.length === 0
      ? "_(žádná metadata nebyla extrahována)_"
      : withMetadata
          .map(
            (r) =>
              `**\`${redactUrlForDisplay(r.normalized_url)}\`**\n\n- Deklarovaný název stránky: ${r.metadata.title ? fencedBlock(r.metadata.title) : "_(neuvedeno)_"}\n- Deklarovaný web: ${r.metadata.og_site_name ?? "_(neuvedeno)_"}\n- Canonical URL: \`${r.metadata.canonical_url ? redactUrlForDisplay(r.metadata.canonical_url) : "neuvedeno"}\`\n- Editorial verification: neprovedeno`
          )
          .join("\n\n");

  return `> Tato kontrola ověřuje pouze technickou dostupnost a bezpečnost cíle.\n> Neověřuje pravdivost, nezávislost ani redakční kvalitu zdroje.\n\n${table}\n\n### Blokované adresy\n\n${blockedSection}\n\n### Technická metadata\n\n${metadataSection}`;
}

function renderRiskSection(riskClassification) {
  if (riskClassification.flags.length === 0) {
    return "_(Nebyl detekován žádný rizikový příznak.)_\n\n> Rizikový příznak není skutkový ani právní závěr.";
  }
  const rows = riskClassification.flags
    .map((f) => `| ${SEVERITY_LABELS[f.severity] ?? f.severity} | \`${f.code}\` | ${f.explanation} | ${f.effect} |`)
    .join("\n");
  return `| Závažnost | Kód | Vysvětlení | Dopad |\n|---|---|---|---|\n${rows}\n\n> Rizikový příznak není skutkový ani právní závěr.`;
}

// `manifest` is the already-built, already-schema-valid manifest object
// (build-intake-manifest.mjs). Same manifest + same rendering logic always
// produces byte-identical Markdown — no clock or randomness read in here.
export function renderIntakeReport(manifest) {
  const { submission, normalization, system_observations, proposed_authorization_scope, matching, duplicate_detection, risk_classification, source_preflight, workflow, provenance, id } = manifest;

  const warningLines = system_observations.warnings.map((w) => `- **${w.code}**${w.field ? ` (\`${w.field}\`)` : ""}: ${w.message}`);

  return `${REPORT_MARKER}

## Stav podnětu

- Intake ID: \`${id}\`
- Zdroj podání: veřejná GitHub issue
- Verze formuláře: \`${system_observations.form_version}\`
- Intake: ${INTAKE_STATUS_LABELS[workflow.intake_status] ?? workflow.intake_status}
- Autorizace: čeká na vlastníka
- Publikace: blokována

> Tento report není autorizace, redakční závěr ani publikovaný dossier. Tento report není potvrzením správnosti podnětu. Přijaté URL nebyly automaticky uznány jako nezávislé ani důvěryhodné zdroje. Rozsah nebyl autorizován. Publikace zůstává blokována.

${NEXT_STEP_TEXT[workflow.intake_status] ? `**Co bude dál:** ${NEXT_STEP_TEXT[workflow.intake_status]}\n` : ""}
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

## Možné shody v datasetu

${renderMatchingSection(matching)}

## Možné duplicitní podněty

${renderDuplicateSection(duplicate_detection)}

## Technická kontrola uvedených URL

${renderPreflightSection(source_preflight)}

## Rizikové příznaky

${renderRiskSection(risk_classification)}

## Další krok

Podnět musí ručně posoudit vlastník projektu.
`;
}
