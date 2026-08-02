import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvalidSubmissionReport, buildInternalErrorReport, buildSecurityReviewReport } from "./build-safe-reports.mjs";
import { REPORT_MARKER } from "../constants.mjs";

test("buildInvalidSubmissionReport starts with the marker and never claims authorization", () => {
  const report = buildInvalidSubmissionReport({ code: "missing_form_marker" });
  assert.ok(report.startsWith(REPORT_MARKER));
  assert.match(report, /Neplatné podání/);
  assert.match(report, /formuláře/);
});

test("buildInvalidSubmissionReport falls back to a generic explanation for an unrecognized code, never crashes", () => {
  const report = buildInvalidSubmissionReport({ code: "something_never_seen_before" });
  assert.ok(report.startsWith(REPORT_MARKER));
  assert.match(report, /nepodařilo zpracovat/);
});

test("buildInternalErrorReport includes the run URL but never a stack trace or file path", () => {
  const report = buildInternalErrorReport({ runUrl: "https://github.com/korczis/vomaste.cz/actions/runs/123" });
  assert.match(report, /Workflow run: https:\/\/github\.com\/korczis\/vomaste\.cz\/actions\/runs\/123/);
  assert.doesNotMatch(report, /at Object\.|node_modules|\.mjs:\d+/);
});

test("buildSecurityReviewReport lists risk flag codes but never repeats submitted text", () => {
  const manifest = {
    id: "INTAKE-GH-korczis-vomaste-cz-000217",
    risk_classification: { flags: [{ code: "contains_nonpublic_material_claim", evidence: { redacted_excerpt: "…SENSITIVE TEXT SHOULD NEVER APPEAR HERE…" } }] },
  };
  const report = buildSecurityReviewReport(manifest);
  assert.match(report, /contains_nonpublic_material_claim/);
  assert.doesNotMatch(report, /SENSITIVE TEXT SHOULD NEVER APPEAR HERE/);
  assert.match(report, /bezpečnostní kontrolu/);
});

test("buildSecurityReviewReport handles zero flags gracefully", () => {
  const manifest = { id: "x", risk_classification: { flags: [] } };
  const report = buildSecurityReviewReport(manifest);
  assert.match(report, /\(žádné\)/);
});
