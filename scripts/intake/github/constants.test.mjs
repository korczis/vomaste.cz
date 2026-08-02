import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readCanonicalOwnerLogin, LABELS, FORBIDDEN_LABEL_SUBSTRINGS } from "./constants.mjs";

test("reads the real repository's data/maintainers.toml and returns the configured login", () => {
  assert.equal(readCanonicalOwnerLogin(), "korczis");
});

test("returns null for a missing config file rather than a guessed default", () => {
  assert.equal(readCanonicalOwnerLogin(join(tmpdir(), "definitely-does-not-exist.toml")), null);
});

test("returns null for a config file missing the key", () => {
  const dir = mkdtempSync(join(tmpdir(), "maintainers-toml-test-"));
  try {
    const path = join(dir, "maintainers.toml");
    writeFileSync(path, "[intake]\nsomething_else = \"x\"\n");
    assert.equal(readCanonicalOwnerLogin(path), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("intake-state labels are mutually exclusive by construction (one key per state)", () => {
  const values = Object.values(LABELS.intakeState);
  assert.equal(new Set(values).size, values.length);
});

test("no label anywhere in the vocabulary contains a forbidden (truth-claiming) substring", () => {
  const allLabels = [...Object.values(LABELS.intakeState), LABELS.preflightComplete, ...LABELS.alwaysOn];
  for (const label of allLabels) {
    for (const forbidden of FORBIDDEN_LABEL_SUBSTRINGS) {
      assert.ok(!label.toLowerCase().includes(forbidden), `label "${label}" must not contain forbidden substring "${forbidden}"`);
    }
  }
});
