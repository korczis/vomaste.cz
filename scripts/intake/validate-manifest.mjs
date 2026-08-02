#!/usr/bin/env node
// Standalone manifest validator CLI (PHASE_002.md §21 `intake:validate`).
// Validates an already-written manifest.json against
// schemas/intake/intake-manifest.schema.json — useful on its own (e.g. to
// re-check a manifest produced by an earlier processor version) without
// re-running the whole pipeline.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateManifestShape } from "./lib/schema-validators.mjs";
import { EXIT_CODES } from "./constants.mjs";

export function validateManifestFile(manifestPath) {
  const raw = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  return validateManifestShape(manifest);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error("usage: node scripts/intake/validate-manifest.mjs <manifest.json>");
    process.exit(EXIT_CODES.invalidCliUsage);
  }
  try {
    const result = validateManifestFile(manifestPath);
    if (result.valid) {
      console.log(`OK: ${manifestPath} matches schemas/intake/intake-manifest.schema.json`);
      process.exit(EXIT_CODES.success);
    }
    console.error(`INVALID: ${manifestPath}`);
    for (const err of result.errors) console.error(`  ${err.path}: ${err.message}`);
    process.exit(EXIT_CODES.manifestValidationFailed);
  } catch (err) {
    console.error(`error reading/parsing ${manifestPath}: ${err.message}`);
    process.exit(EXIT_CODES.invalidEventJson);
  }
}
