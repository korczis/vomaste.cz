// Shared AJV setup for the two intake schemas (event input, manifest) —
// mirrors scripts/data/validate-shape.mjs's Ajv2020 convention (allErrors,
// strict) so intake validation reads the same way as the canonical
// dossier-data validator, not a second ad hoc setup.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCHEMAS_DIR = join(ROOT, "schemas/intake");

let cached = null;
function getAjv() {
  if (cached) return cached;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const eventSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, "intake-event.schema.json"), "utf8"));
  const manifestSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, "intake-manifest.schema.json"), "utf8"));
  ajv.addSchema(eventSchema);
  ajv.addSchema(manifestSchema);
  cached = {
    validateEvent: ajv.getSchema(eventSchema.$id),
    validateManifest: ajv.getSchema(manifestSchema.$id),
  };
  return cached;
}

// Both return { valid: boolean, errors: Array<{ path, message }> } — never
// throw on a schema mismatch, so callers can turn a failure into a
// structured IntakeError instead of an uncaught AJV exception.
export function validateEventShape(eventJson) {
  const { validateEvent } = getAjv();
  const valid = validateEvent(eventJson);
  return { valid, errors: valid ? [] : formatErrors(validateEvent.errors) };
}

export function validateManifestShape(manifestJson) {
  const { validateManifest } = getAjv();
  const valid = validateManifest(manifestJson);
  return { valid, errors: valid ? [] : formatErrors(validateManifest.errors) };
}

function formatErrors(ajvErrors) {
  return (ajvErrors ?? []).map((e) => ({ path: e.instancePath || "/", message: e.message ?? "invalid" }));
}
