// Export contract parsing/validation (Fáze 2.2,
// docs/adr/prismatic-platform-integration.md). Real implementation.
//
// A provider emits one JSON object per line (NDJSON/JSONL). This module
// parses that stream and validates each record against
// schemas/prismatic/export-contract.schema.json, with one rule the JSON
// Schema itself cannot express: an unknown MAJOR version is a hard
// rejection of the whole file, checked before any per-line schema
// validation runs.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import { contractVersionSupported } from "./config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCHEMA_PATH = join(ROOT, "schemas", "prismatic", "export-contract.schema.json");

let cachedValidator = null;
function getValidator() {
  if (cachedValidator) return cachedValidator;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  cachedValidator = ajv.compile(schema);
  return cachedValidator;
}

function supportedMajor() {
  return contractVersionSupported().split(".")[0];
}

/**
 * Parses NDJSON text into records, one entry per line. Never throws on a
 * malformed line — each line either becomes a record or a problem entry
 * carrying its line number, so one bad line doesn't lose the rest of a
 * real run's output.
 *
 * @returns {{records: object[], problems: {line: number, message: string}[]}}
 */
export function parseJsonl(text) {
  const records = [];
  const problems = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      records.push(JSON.parse(line));
    } catch (e) {
      problems.push({ line: i + 1, message: `invalid JSON: ${e.message}` });
    }
  }
  return { records, problems };
}

/**
 * Validates one already-parsed record against the export contract
 * schema. Returns a list of human-readable error strings (empty = valid).
 * Does NOT check the major version — call checkMajorVersion first, once,
 * for the whole batch (the major version gate is a file-level decision,
 * not a per-record one).
 */
export function validateRecord(record) {
  const validate = getValidator();
  if (validate(record)) return [];
  return (validate.errors ?? []).map(
    (e) => `${e.instancePath || "(root)"} ${e.message}`,
  );
}

/**
 * Checks the batch's declared contract_version(s) against the major
 * version this consumer supports. Returns null if compatible, or a
 * rejection reason string. Mixed major versions within one file, or a
 * record missing contract_version entirely, are both rejections — never
 * silently ignored.
 */
export function checkMajorVersion(records) {
  const supported = supportedMajor();
  const seen = new Set();
  for (const r of records) {
    if (typeof r.contract_version !== "string") {
      return "record missing contract_version — cannot determine compatibility";
    }
    seen.add(r.contract_version.split(".")[0]);
  }
  const unsupported = [...seen].filter((major) => major !== supported);
  if (unsupported.length > 0) {
    return `unsupported contract major version(s) [${unsupported.join(", ")}] — this consumer supports major ${supported} only`;
  }
  return null;
}

/**
 * Full pipeline: parse NDJSON text, reject on unknown major version,
 * validate every record against the schema. Returns a structured result
 * rather than throwing, so a caller can report every problem in one pass
 * instead of stopping at the first one.
 */
export function parseAndValidate(text) {
  const { records, problems } = parseJsonl(text);
  const parseProblems = problems.map((p) => `line ${p.line}: ${p.message}`);
  if (records.length === 0) {
    return { ok: false, records: [], errors: [...parseProblems, "no valid records found"] };
  }
  const majorVersionError = checkMajorVersion(records);
  if (majorVersionError) {
    return { ok: false, records: [], errors: [...parseProblems, majorVersionError] };
  }
  const errors = [...parseProblems];
  for (const [i, record] of records.entries()) {
    const recordErrors = validateRecord(record);
    for (const err of recordErrors) errors.push(`record ${i} (${record.record_id ?? "?"}): ${err}`);
  }
  return { ok: errors.length === 0, records, errors };
}
