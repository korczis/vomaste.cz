// Section parser for vomaste-intake-form:v1 (PHASE_002.md §9.2, §10). A
// small, exact parser for one versioned, machine-generated heading
// structure — not a general Markdown parser (§10: "nepřidávej těžký
// parser bez potřeby"). Does no entity matching, no URL fetching, no
// content classification — it only locates section boundaries and hands
// back their raw text untouched.
import { FORM_V1, GITHUB_EMPTY_FIELD_PLACEHOLDER } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";

const HEADING_LINE = /^### +(.+?) *\r?$/gm;

function reverseLookup(map, wantedValue) {
  for (const [key, value] of Object.entries(map)) if (value === wantedValue) return key;
  return undefined;
}

// §10: locates every "### <heading>" line and slices the raw text between
// consecutive headings, preserving original line endings and internal
// whitespace of the section body (only the boundary whitespace immediately
// touching the heading markers is trimmed — that's parsing structure, not
// submitted content).
function splitSections(body) {
  const matches = [...body.matchAll(HEADING_LINE)];
  const sections = []; // [{ heading, content }], in document order — duplicates kept for detection below
  for (let i = 0; i < matches.length; i += 1) {
    const heading = matches[i][1].trim();
    const contentStart = matches[i].index + matches[i][0].length;
    const contentEnd = i + 1 < matches.length ? matches[i + 1].index : body.length;
    const rawContent = body.slice(contentStart, contentEnd);
    sections.push({ heading, content: rawContent.replace(/^\s+/, "").replace(/\s+$/, "") });
  }
  return sections;
}

function parseAcknowledgements(rawContent) {
  const checkboxLine = /^-\s*\[([ xX])\]\s*(.+?)\s*\r?$/;
  const found = {};
  const unrecognizedLabels = [];
  for (const line of rawContent.split(/\r\n|\r|\n/)) {
    if (line.trim().length === 0) continue;
    const match = checkboxLine.exec(line);
    if (!match) continue;
    const checked = match[1].toLowerCase() === "x";
    const label = match[2].trim();
    const key = FORM_V1.acknowledgementLabels[label];
    if (key) found[key] = checked;
    else unrecognizedLabels.push(label);
  }
  return { found, unrecognizedLabels };
}

// Returns the §9.2 parser-contract shape plus `unparsed_sections` (§10.2)
// for any heading this version doesn't recognize. Throws DUPLICATE_SECTION
// if the exact same heading text appears more than once, or
// MISSING_REQUIRED_SECTION if a required v1 heading never appears.
export function parseIssueFormV1(issueBody) {
  const sections = splitSections(issueBody);

  const seenHeadings = new Set();
  for (const { heading } of sections) {
    if (seenHeadings.has(heading)) {
      throw new IntakeError(ERROR_CODES.DUPLICATE_SECTION, `duplicate section heading: "${heading}"`, { heading });
    }
    seenHeadings.add(heading);
  }

  const byKey = {};
  const unparsedSections = [];
  for (const { heading, content } of sections) {
    const key = reverseLookup(FORM_V1.headings, heading);
    if (!key) {
      unparsedSections.push({ heading, content });
      continue;
    }
    // §11/§25: a real GitHub submission renders an unanswered input/
    // textarea/dropdown field as this literal placeholder, never as an
    // empty section — applied to every text-valued heading (not just
    // FORM_V1.optionalSections: "required section" here means the
    // heading itself always exists in a well-formed body, which is true
    // regardless of whether the underlying GitHub field is itself
    // `required: true` — sourceUrls is a heading-required, GitHub-
    // optional field per PHASE_005.md §6.6). `acknowledgements` is
    // excluded: it's a checkboxes field, GitHub always lists every
    // option's checked state, so this placeholder never legitimately
    // appears there — and if a raw fixture forges it anyway, leaving it
    // untouched means parseAcknowledgements below correctly finds zero
    // recognized checkbox lines rather than silently treating it as an
    // empty-but-valid answer.
    const normalizedContent = key !== "acknowledgements" && content === GITHUB_EMPTY_FIELD_PLACEHOLDER ? "" : content;
    byKey[key] = normalizedContent;
  }

  for (const requiredKey of FORM_V1.requiredSections) {
    if (!(requiredKey in byKey)) {
      throw new IntakeError(ERROR_CODES.MISSING_REQUIRED_SECTION, `missing required section: "${FORM_V1.headings[requiredKey]}"`, {
        section: requiredKey,
      });
    }
  }

  const submissionTypeRaw = byKey.submissionType;
  const submissionType = FORM_V1.submissionTypeLabels[submissionTypeRaw] ?? null;

  const { found: acknowledgements, unrecognizedLabels } = parseAcknowledgements(byKey.acknowledgements);

  return {
    form_version: FORM_V1.marker,
    submission_type: submissionType,
    submission_type_raw: submissionTypeRaw,
    subject_text: byKey.subjectText,
    description_text: byKey.descriptionText,
    public_interest_text: byKey.publicInterestText,
    submitted_source_urls_raw: byKey.sourceUrls,
    identifiers_text: byKey.identifiersText ?? "",
    known_unknowns_text: byKey.knownUnknownsText ?? "",
    existing_references_text: byKey.existingReferencesText ?? "",
    acknowledgements,
    unparsed_sections: unparsedSections,
    unrecognized_acknowledgement_labels: unrecognizedLabels,
  };
}
