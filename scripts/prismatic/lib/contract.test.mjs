#!/usr/bin/env node
// Unit tests for scripts/prismatic/lib/contract.mjs (Fáze 2.2). Uses the
// checked-in fixtures under scripts/prismatic/fixtures/ so both the
// schema and this consumer stay honest against real example payloads,
// not just inline test strings.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseJsonl, validateRecord, checkMajorVersion, parseAndValidate } from "./contract.mjs";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");
const read = (name) => readFileSync(join(FIXTURES, name), "utf8");

test("parseJsonl parses every well-formed line, skipping blank lines", () => {
  const { records, problems } = parseJsonl('{"a":1}\n\n{"b":2}\n');
  assert.deepEqual(problems, []);
  assert.equal(records.length, 2);
});

test("parseJsonl reports a malformed line by number without losing the valid lines around it (malformed.jsonl fixture)", () => {
  const { records, problems } = parseJsonl(read("malformed.jsonl"));
  assert.equal(records.length, 2);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].line, 2);
  assert.match(problems[0].message, /invalid JSON/);
});

test("checkMajorVersion accepts the fixture at the supported major version", () => {
  const { records } = parseJsonl(read("valid-run.jsonl"));
  assert.equal(checkMajorVersion(records), null);
});

test("checkMajorVersion rejects an unknown major version outright (unknown-major-version.jsonl fixture)", () => {
  const { records } = parseJsonl(read("unknown-major-version.jsonl"));
  const reason = checkMajorVersion(records);
  assert.match(reason, /unsupported contract major version/);
  assert.match(reason, /99/);
});

test("checkMajorVersion rejects a record missing contract_version entirely", () => {
  const reason = checkMajorVersion([{ record_type: "run_manifest" }]);
  assert.match(reason, /missing contract_version/);
});

test("checkMajorVersion rejects mixed major versions within one batch, not just the first record's", () => {
  const reason = checkMajorVersion([{ contract_version: "1.0" }, { contract_version: "2.0" }]);
  assert.match(reason, /unsupported contract major version/);
});

test("validateRecord accepts every record in the valid-run fixture", () => {
  const { records } = parseJsonl(read("valid-run.jsonl"));
  for (const record of records) {
    assert.deepEqual(validateRecord(record), []);
  }
});

test("validateRecord rejects a record missing a required field", () => {
  const errors = validateRecord({ contract_version: "1.0", record_type: "run_manifest" });
  assert.ok(errors.length > 0);
});

test("validateRecord rejects an unknown record_type (closed enum)", () => {
  const errors = validateRecord({
    contract_version: "1.0",
    record_type: "not_a_real_type",
    record_id: "x",
    run_id: "x",
    generated_at: "2026-08-06T09:00:00Z",
  });
  assert.ok(errors.length > 0);
});

test("validateRecord rejects a malformed content_hash (wrong hex length)", () => {
  const errors = validateRecord({
    contract_version: "1.0",
    record_type: "entity_candidate",
    record_id: "x",
    run_id: "x",
    generated_at: "2026-08-06T09:00:00Z",
    content_hash: "sha256:not-actually-hex",
  });
  assert.ok(errors.length > 0);
});

test("parseAndValidate: valid-run fixture round-trips clean end to end", () => {
  const result = parseAndValidate(read("valid-run.jsonl"));
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.records.length, 2);
});

test("parseAndValidate: malformed fixture surfaces the bad line but still validates the good ones", () => {
  const result = parseAndValidate(read("malformed.jsonl"));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("line 2")));
});

test("parseAndValidate: unknown-major-version fixture is rejected before any per-record validation runs", () => {
  const result = parseAndValidate(read("unknown-major-version.jsonl"));
  assert.equal(result.ok, false);
  assert.equal(result.records.length, 0);
  assert.ok(result.errors.some((e) => e.includes("unsupported contract major version")));
});

test("parseAndValidate: empty input is a rejection, not a silent empty success", () => {
  const result = parseAndValidate("");
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("no valid records found")));
});
