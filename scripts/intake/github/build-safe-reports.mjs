// Safe, non-manifest report builders for the three outcomes that never
// produce a full manifest to render with render-intake-report.mjs:
// invalid submissions (§15.2), internal errors (§15.3), and the reduced
// report a security_review_required manifest gets instead of the full
// one (§17.1). All three share the same non-negotiable header the full
// report already carries (§1.5/§11).
import { REPORT_MARKER } from "../constants.mjs";

const COMMON_HEADER = `${REPORT_MARKER}

## Automatické předzpracování veřejného podnětu

> Tento report není autorizace, redakční závěr ani publikovaný dossier.
> Issue je veřejná. Rozsah zatím nebyl autorizován a publikace zůstává blokována.`;

// §15.2 — never a stack trace; explains what's structurally wrong so the
// submitter can fix it by editing the issue.
const INVALID_FORM_EXPLANATIONS = Object.freeze({
  missing_form_marker: "Tělo issue nezačíná rozpoznaným markerem formuláře. Použijte prosím formulář „Navrhnout dossier nebo entitu“ beze změn v jeho úvodní struktuře.",
  duplicate_form_marker: "V textu podnětu se objevuje druhý marker formuláře. Odstraňte prosím jakýkoli text, který marker formuláře napodobuje.",
  unsupported_form_version: "Podnět odpovídá jiné verzi formuláře, než tento repozitář aktuálně podporuje.",
  duplicate_section: "Některá sekce formuláře se v těle issue objevuje vícekrát (možná vložená i uvnitř volného textu jiné sekce).",
  missing_required_section: "V podnětu chybí některá povinná sekce formuláře.",
  submission_validation_failed: "Podnět nesplňuje jednu nebo více vstupních podmínek formuláře (např. chybějící povinné potvrzení, příliš dlouhý text nebo příliš mnoho zdrojových odkazů).",
});

export function buildInvalidSubmissionReport({ code }) {
  const explanation = INVALID_FORM_EXPLANATIONS[code] ?? "Podnět se nepodařilo zpracovat jako platné podání formuláře.";
  return `${COMMON_HEADER}

| Oblast | Stav |
|---|---|
| Intake | Neplatné podání |
| Autorizace | — |
| Publikace | Blokována |

${explanation}

Upravte prosím issue tak, aby odpovídala formuláři, a podnět bude znovu automaticky zpracován.`;
}

// §15.3 — no internal path, no stack, no secrets; only a run ID a
// maintainer can look up.
export function buildInternalErrorReport({ runUrl }) {
  return `${COMMON_HEADER}

| Oblast | Stav |
|---|---|
| Intake | Interní chyba zpracování |
| Autorizace | — |
| Publikace | Blokována |

Automatické předzpracování se nezdařilo kvůli interní chybě.
Podnět nebyl autorizován ani publikován.

Workflow run: ${runUrl ?? "(neuveden)"}`;
}

// §17.1 — a security_review_required manifest gets THIS instead of the
// full render-intake-report.mjs output: intake ID, generic status, risk
// flag CODES only (never their redacted_excerpt evidence text — that's
// still a fragment of submitted content), a call for manual review.
export function buildSecurityReviewReport(manifest) {
  const flagCodes = manifest.risk_classification.flags.map((f) => `\`${f.code}\``).join(", ") || "(žádné)";
  return `${COMMON_HEADER}

| Oblast | Stav |
|---|---|
| Intake ID | \`${manifest.id}\` |
| Intake | Vyžaduje bezpečnostní revizi |
| Autorizace | čeká na vlastníka |
| Publikace | Blokována |

**Automatické zpracování bylo omezeno.** Podnět vyžaduje ruční bezpečnostní kontrolu — tento report záměrně neobsahuje text podnětu.

Detekované rizikové kódy: ${flagCodes}

> Rizikový příznak není skutkový ani právní závěr.

Plný (needraný) manifest je dostupný jako workflow artifact pro ruční kontrolu maintainerem.`;
}
