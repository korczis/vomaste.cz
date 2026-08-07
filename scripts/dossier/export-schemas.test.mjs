#!/usr/bin/env node
// Regression tests for the export schema gate (T-017 → T-028 fáze H:
// brána žije v build:data-exports přes lib/export-schemas.mjs, dřívější
// samostatný validate-schemas.mjs zanikl). Load-bearing behaviors:
// (1) the real repo dataset passes; (2) shape violations actually fail —
// a schema layer that never rejects anything would be claimed-but-not-real
// enforcement; (3) the claim status enum stays closed (extending it is an
// editorial-model change, not a technical one).
//
// Usage: node --test scripts/dossier/export-schemas.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import { buildRecordTables } from "./lib/record-tables.mjs";
import { validateExportRows } from "./lib/export-schemas.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

const ajv = new Ajv2020({ allErrors: true, strict: true });
const claimSchema = JSON.parse(readFileSync(path.join(ROOT, "schemas/claim.schema.json"), "utf8"));
const validateClaim = ajv.compile(claimSchema);

const VALID_CLAIM = {
  clm_id: "CLM-01",
  dossier: "test-dossier",
  status: "status-single",
  status_label: "1 ZDROJ",
  summary: "Testovací tvrzení.",
  sources: ["SRC-01"],
  source_count: 1,
  subjects: ["test"],
  url: "/dossiers/test-dossier/claims/clm-01/",
};

test("the real repo dataset passes the export schema gate", () => {
  const errors = validateExportRows(ROOT, buildRecordTables(ROOT));
  assert.deepEqual(errors, []);
});

test("a well-formed claim row validates", () => {
  assert.equal(validateClaim(VALID_CLAIM), true, JSON.stringify(validateClaim.errors));
});

test("an uncited claim is rejected (rule 1 in schema form)", () => {
  assert.equal(validateClaim({ ...VALID_CLAIM, sources: [], source_count: 0 }), false);
});

test("a status outside the closed editorial enum is rejected", () => {
  assert.equal(validateClaim({ ...VALID_CLAIM, status: "status-verified-true" }), false);
});

test("an unknown extra field is rejected (no field without a user)", () => {
  assert.equal(validateClaim({ ...VALID_CLAIM, confidence: 0.9 }), false);
});

test("the claim status enum is exactly the five sourcing states", () => {
  assert.deepEqual(
    [...claimSchema.properties.status.enum].sort(),
    ["status-corroborated", "status-disputed", "status-opinion", "status-quote", "status-single"],
  );
});
