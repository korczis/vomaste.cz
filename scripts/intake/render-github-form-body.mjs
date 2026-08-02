// Renders a realistic GitHub-generated issue body from the real
// .github/ISSUE_TEMPLATE/navrh-dossieru.yml (PHASE_005.md §0, §10 Varianta
// A/C: golden fixtures built from the actual form, not from what we
// imagine the form does). Used by:
//   - the form/parser compatibility tests (issue-form-compatibility.test.mjs)
//     to prove the real YAML round-trips through parseIssueFormV1;
//   - the one-off fixture-generation step that produced the golden
//     tests/fixtures/intake/e2e-*.json bodies (the fixtures themselves are
//     then committed as static JSON, never regenerated at test time —
//     see docs/intake/issue-form-contract.md's fixture-strategy note).
//
// This is NOT a general Issue Forms renderer — it only implements the
// four field types and the exact rendering rules this project's own form
// uses (verified against GitHub's documented behavior and third-party
// parser implementations, see PHASE_005.md audit): every field's `label`
// becomes a `### <label>` heading, `type: markdown` blocks are inserted
// verbatim, and an unanswered input/textarea/dropdown renders GitHub's
// own literal "_No response_" placeholder rather than an empty body.
import { readFileSync } from "node:fs";
import { load } from "js-yaml";
import { GITHUB_EMPTY_FIELD_PLACEHOLDER } from "./constants.mjs";

// Returns the parsed `body:` array from the YAML, unmodified — callers
// that just need field metadata (ids/labels/options), e.g. the
// compatibility tests, read this directly instead of rendering a body.
export function loadFormBody(yamlPath) {
  const doc = load(readFileSync(yamlPath, "utf8"));
  if (!Array.isArray(doc?.body)) throw new Error(`${yamlPath}: no top-level "body:" array`);
  return doc.body;
}

// `values` maps field `id` -> a string (input/textarea/dropdown) or, for
// a `checkboxes` field, an object mapping that option's exact `label`
// text -> boolean checked. A field whose id is absent from `values`
// renders as GitHub's own empty-field placeholder (input/textarea/
// dropdown) or as every option unchecked (checkboxes) — never silently
// skipped, since GitHub always renders every defined field's heading.
export function renderGithubFormBody(yamlPath, values) {
  const body = loadFormBody(yamlPath);
  const parts = [];

  for (const item of body) {
    if (item.type === "markdown") {
      parts.push(item.attributes.value.replace(/\n+$/, ""));
      continue;
    }
    const id = item.id;
    const label = item.attributes?.label;
    if (!label) throw new Error(`field "${id}" has no label — cannot render a heading for it`);

    if (item.type === "checkboxes") {
      const optionStates = values?.[id] ?? {};
      const lines = (item.attributes.options ?? []).map((opt) => `- [${optionStates[opt.label] ? "x" : " "}] ${opt.label}`);
      parts.push(`### ${label}\n\n${lines.join("\n")}`);
      continue;
    }

    // input / textarea / dropdown all render the same way: heading, then
    // either the submitted value or GitHub's own placeholder.
    const value = values?.[id];
    parts.push(`### ${label}\n\n${value !== undefined && value !== null ? value : GITHUB_EMPTY_FIELD_PLACEHOLDER}`);
  }

  return parts.join("\n\n") + "\n";
}
