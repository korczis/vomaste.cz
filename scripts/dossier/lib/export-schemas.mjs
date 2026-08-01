// Schema brána plochých exportů (T-028 fáze H — dřívější samostatný
// scripts/dossier/validate-schemas.mjs zanikl; vlastníkem kontraktu
// exportních řádků je od fáze H GENERÁTOR sám: build-data-exports.mjs
// odmítne zapsat řádek, který neodpovídá schemas/*.schema.json).
//
// Dělba vlastnictví: schemas/canonical/ vlastní tvar KANONICKÝCH záznamů
// (brána data:validate); schemas/*.schema.json vlastní tvar VEŘEJNÉHO
// plochého exportu (/data/*.json) — dva různé kontrakty, každý s jedním
// vlastníkem.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";

let validators = null;

function loadValidators(root) {
  if (validators) return validators;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  validators = {};
  const dir = join(root, "schemas");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".schema.json"))) {
    const schema = JSON.parse(readFileSync(join(dir, file), "utf8"));
    validators[file.replace(".schema.json", "")] = ajv.compile(schema);
  }
  return validators;
}

/*
 * validateExportRows(root, rows) → [errorString]
 * rows = výstup buildRecordTables (RAW řádky, před adresářovým
 * obohacením — obohacené dossier řádky kontroluje
 * validate-directory-index.mjs proti kanonickému modelu).
 */
export function validateExportRows(root, rows) {
  const v = loadValidators(root);
  const errors = [];
  const check = (kind, row, tag) => {
    const validate = v[kind];
    if (!validate) throw new Error(`missing schema for kind "${kind}" — add schemas/${kind}.schema.json`);
    if (!validate(row)) {
      for (const e of validate.errors) errors.push(`${tag}: ${e.instancePath || "(root)"} ${e.message}`);
    }
  };
  const KINDS = [
    ["claim", rows.claims, (r) => `${r.dossier}/${r.clm_id}`],
    ["source", rows.sources, (r) => `${r.dossier}/${r.src_id}`],
    ["case", rows.cases, (r) => `${r.dossier}/${r.case_id}`],
    ["gap", rows.gaps, (r) => `${r.dossier}/${r.gap_id}`],
    ["relation", rows.relations, (r) => `${r.dossier}/${r.relation_id}`],
    ["entity", rows.entities, (r) => `entities/${r.entity_id}`],
    ["dossier", rows.dossiers, (r) => `dossiers/${r.slug}`],
  ];
  for (const [kind, list, tag] of KINDS) {
    for (const row of list) check(kind, row, `${kind} ${tag(row)}`);
  }
  return errors;
}
