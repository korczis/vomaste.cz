// Folds validate-issue-forms.mjs into `npm test` (and therefore `npm run
// build`, per PHASE_005.md §30.1) without adding a new named step to
// scripts/build/pipeline.mjs — `test` is already one of BUILD_STEPS, same
// approach Phase 2 used for its own new test files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { collectIssueFormErrors } from "./validate-issue-forms.mjs";

test("every .github/ISSUE_TEMPLATE/*.yml file is structurally valid", () => {
  const { errors, fileCount } = collectIssueFormErrors();
  assert.deepEqual(errors, []);
  assert.ok(fileCount >= 4, "expected at least the 4 known issue templates");
});
