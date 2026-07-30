#!/usr/bin/env node
/*
 * JSON Schema gate for the canonical dataset (workbench mission Phase 1,
 * coop task T-017; docs/missions/2026-07-30-workbench-master-prompt.md
 * § 5.3). Validates the NORMALIZED representation every generator
 * consumes — the record-tables rows (one shared front-matter parser,
 * see lib/record-tables.mjs) and each dossier's parsed graph.toml —
 * against schemas/*.schema.json.
 *
 * Division of labor (see schemas/README.md): schemas enforce SHAPE
 * (types, required fields, ID formats, URL patterns, the closed claim
 * status enum). SEMANTICS (referential integrity, allowed relation
 * types, authorization) stay with validate:dossier / validate:graph /
 * validate:authorization — one rule, one owner, never two.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import { buildRecordTables } from "./lib/record-tables.mjs";
import { readGraphToml } from "./lib/jsonld-shared.mjs";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCHEMAS_DIR = join(ROOT, "schemas");

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validators = {};
for (const file of readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith(".schema.json"))) {
  const schema = JSON.parse(readFileSync(join(SCHEMAS_DIR, file), "utf8"));
  validators[file.replace(".schema.json", "")] = ajv.compile(schema);
}

const errors = [];
function check(kind, row, tag) {
  const validate = validators[kind];
  if (!validate) throw new Error(`missing schema for kind "${kind}" — add schemas/${kind}.schema.json`);
  if (!validate(row)) {
    for (const e of validate.errors) {
      errors.push(`${tag}: ${e.instancePath || "(root)"} ${e.message}`);
    }
  }
}

const tables = buildRecordTables(ROOT);
let rows = 0;

const KINDS = [
  ["claim", tables.claims, (r) => `${r.dossier}/${r.clm_id}`],
  ["source", tables.sources, (r) => `${r.dossier}/${r.src_id}`],
  ["case", tables.cases, (r) => `${r.dossier}/${r.case_id}`],
  ["gap", tables.gaps, (r) => `${r.dossier}/${r.gap_id}`],
  ["relation", tables.relations, (r) => `${r.dossier}/${r.relation_id}`],
  ["entity", tables.entities, (r) => `entities/${r.entity_id}`],
  ["dossier", tables.dossiers, (r) => `dossiers.toml/${r.slug}`],
];
for (const [kind, list, tag] of KINDS) {
  for (const row of list) {
    rows++;
    check(kind, row, `${kind} ${tag(row)}`);
  }
}

// Every physically existing graph.toml, regardless of dossier_type —
// self-canonical entity dossiers own one too.
let graphs = 0;
for (const d of loadDossierRegistry()) {
  if (!existsSync(join(ROOT, "data/dossiers", d.slug, "graph.toml"))) continue;
  graphs++;
  check("graph", readGraphToml(ROOT, d.slug), `graph ${d.slug}/graph.toml`);
}

console.log(`Validated ${rows} row(s) across ${KINDS.length} record kinds + ${graphs} graph file(s) against ${Object.keys(validators).length} schema(s).`);
if (errors.length) {
  console.log(`\n${errors.length} schema error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log("\nFAILED");
  process.exit(1);
}
console.log("OK — every canonical row and graph conforms to its schema.");
