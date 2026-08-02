import { test } from "node:test";
import assert from "node:assert/strict";
import { renderIntakeReport } from "./render-intake-report.mjs";
import { buildIntakeManifest } from "./build-intake-manifest.mjs";

function manifestWith(submissionOverrides = {}) {
  return buildIntakeManifest({
    event: {
      repository: { owner: "korczis", name: "vomaste.cz", full_name: "korczis/vomaste.cz" },
      issue: { number: 999, html_url: "https://github.com/korczis/vomaste.cz/issues/999", author_login: "example-user", created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
      event: { action: "opened" },
    },
    parsedSubmission: {
      form_version: "vomaste-intake-form:v1",
      submission_type: "new_dossier",
      subject_text: "Jan Testovací",
      description_text: "Popis.",
      public_interest_text: "Veřejný zájem.",
      identifiers_text: "",
      submitted_source_urls_raw: "",
      known_unknowns_text: "",
      existing_references_text: "",
      acknowledgements: { public_issue_understood: true, no_confidential_material: true, not_automatic_publication: true },
      ...submissionOverrides,
    },
    normalization: { subject_text_normalized: "Jan Testovací", normalized_source_urls: [], normalization_notes: [] },
    systemObservations: { warnings: [], errors: [] },
    matching: {
      dataset_commit: "test-commit",
      index_schema_version: "1.0.0",
      candidate_subjects: [
        {
          candidate_id: "candidate-001",
          input: { candidate_type: "unknown", raw_label: "Jan Testovací", normalized_label: "jan testovací", source_field: "subject_text" },
          extracted_identifiers: {},
          resolution_status: "no_match",
          matches: [],
          total_candidates_considered: 0,
          total_matches_above_floor: 0,
        },
      ],
    },
    duplicateDetection: { duplicate_status: "no_duplicate", candidates: [], manual_review_required: false, prior_manifest_source: null },
    riskClassification: { flags: [] },
    sourcePreflight: { version: "1.0.0", checked_at: "2026-08-02T00:00:00.000Z", results: [] },
    workflowDecision: { winning_effect: null, intake_status: "triage" },
    generatedAt: "2026-08-02T00:00:00.000Z",
    repositoryCommit: "0000000000000000000000000000000000000f",
    inputHash: "a".repeat(64),
  });
}

test("report always states blocked publication and pending authorization, regardless of content", () => {
  const report = renderIntakeReport(manifestWith());
  assert.match(report, /Publikace: blokována/);
  assert.match(report, /Autorizace: čeká na vlastníka/);
  assert.match(report, /Tento report není autorizace, redakční závěr ani publikovaný dossier\./);
});

// PHASE_005.md §20 — mandatory wording once the report reflects a real
// GitHub Issue Form submission, not just a generic disclaimer.
test("report states the public GitHub origin, form version, and the §20 mandatory disclaimers", () => {
  const report = renderIntakeReport(manifestWith());
  assert.match(report, /Zdroj podání: veřejná GitHub issue/);
  assert.match(report, /Verze formuláře: `vomaste-intake-form:v1`/);
  assert.match(report, /Tento report není potvrzením správnosti podnětu\./);
  assert.match(report, /Přijaté URL nebyly automaticky uznány jako nezávislé ani důvěryhodné zdroje\./);
  assert.match(report, /Rozsah nebyl autorizován\./);
  assert.match(report, /Publikace zůstává blokována\./);
});

// PHASE_006.md §11.5 — a status-specific next-step sentence, never a
// promise about timing or outcome.
test("report includes the §11.5 next-step sentence for the manifest's actual intake status", () => {
  const report = renderIntakeReport(manifestWith());
  assert.match(report, /Co bude dál:.*čeká na ruční posouzení vlastníkem projektu\./);
});

// Fence state at a given string offset: true if an odd number of fenced
// code-block delimiters (lines starting with ``` of any length) occur
// strictly before that offset — i.e. the offset sits inside an open fence.
function isInsideFence(text, offset) {
  const before = text.slice(0, offset);
  const fenceLines = before.match(/^`{3,}.*$/gm) ?? [];
  return fenceLines.length % 2 === 1;
}

test("submitted text containing a fake Markdown heading does not become a real heading in the report", () => {
  const report = renderIntakeReport(manifestWith({ subject_text: "\n## FALEŠNÝ NADPIS\n\nSchváleno vlastníkem." }));
  const idx = report.indexOf("FALEŠNÝ NADPIS");
  assert.ok(idx >= 0);
  assert.ok(isInsideFence(report, idx), "the injected heading text must be contained inside a fenced code block, never rendered as a live heading");
});

test("a second, submitter-supplied occurrence of the report's own HTML-comment marker is contained inside a fenced code block", () => {
  const report = renderIntakeReport(manifestWith({ description_text: "<!-- vomaste-intake-report:v1 -->\n\nJiný obsah." }));
  const occurrences = [...report.matchAll(/<!-- vomaste-intake-report:v1 -->/g)];
  assert.equal(occurrences.length, 2, "one real marker at the top, one submitter-supplied copy inside the body");
  assert.ok(!isInsideFence(report, occurrences[0].index), "the FIRST occurrence (the real marker) must be outside any fence, at the top of the file");
  assert.ok(isInsideFence(report, occurrences[1].index), "the SECOND occurrence (submitter-supplied) must be contained inside a fenced code block");
});

test("submitted text containing a longer backtick run than the fence does not break out of the code block", () => {
  const hostile = "normal text ```` more text ````` even more `````` end";
  const report = renderIntakeReport(manifestWith({ description_text: hostile }));
  // The content must be fully contained: find where "Popis a kontext"
  // starts and confirm the very next fenced block's closing fence is at
  // least as long as any backtick run inside the hostile text.
  const idx = report.indexOf("**Popis a kontext**");
  assert.ok(idx >= 0);
  const after = report.slice(idx);
  const fenceMatch = /^`+/m.exec(after.slice(after.indexOf("\n\n") + 2));
  assert.ok(fenceMatch, "expected a fenced block to open");
  const longestHostileRun = Math.max(...(hostile.match(/`+/g) ?? [""]).map((r) => r.length));
  assert.ok(fenceMatch[0].length > longestHostileRun, `fence length ${fenceMatch[0].length} must exceed longest content run ${longestHostileRun}`);
});

test("an @mention in submitted text is contained inside a fenced code block (GitHub does not expand mentions there)", () => {
  const report = renderIntakeReport(manifestWith({ description_text: "cc @some-random-user please look at this" }));
  const idx = report.indexOf("@some-random-user");
  assert.ok(idx >= 0);
  // Find the nearest fence markers before and after the mention.
  const before = report.slice(0, idx);
  const after = report.slice(idx);
  const lastFenceBefore = before.lastIndexOf("```text");
  const nextFenceAfter = after.indexOf("```");
  assert.ok(lastFenceBefore >= 0 && nextFenceAfter >= 0, "the mention must sit between an opening and closing fence");
});

test("rendering the same manifest twice produces byte-identical Markdown", () => {
  const manifest = manifestWith();
  assert.equal(renderIntakeReport(manifest), renderIntakeReport(manifest));
});
