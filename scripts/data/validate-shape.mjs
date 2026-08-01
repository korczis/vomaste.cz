#!/usr/bin/env node
/*
 * Tvarový (shape) validátor kanonického JSON/JSON-LD datového modelu
 * (T-028 fáze B). Validuje PŘÍMO kanonické soubory:
 *
 *   data/dossiers/<slug>/{dossier.json, claims/*.json, sources/*.json,
 *     cases/*.json, gaps/*.json, relations/*.json, updates/*.json}
 *   data/dossiers/_shared/entities/*.json
 *   data/dossiers/_shared/vocabularies/*.json   (proti mini-schématu)
 *
 * proti schemas/canonical/*.schema.json (JSON Schema draft 2020-12,
 * Ajv2020, allErrors, strict) — schéma se vybírá podle pole recordType.
 * Dělba práce (schemas/README.md): tady jen TVAR; referenční integrita,
 * source-families a autorizace patří sémantickým validátorům fáze C.
 *
 * Dnešní pre-migračn stav (0 kanonických záznamů) je legitimní a
 * validátor v něm projde — hlídá, že migrace fáze D začne proti už
 * fungující bráně, ne naopak.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCHEMAS_DIR = join(ROOT, "schemas/canonical");
export const RECORDS_ROOT = join(ROOT, "data/dossiers");

const RECORD_SCHEMA_IDS = {
  dossier: "https://vomaste.cz/schemas/canonical/dossier.schema.json",
  entity: "https://vomaste.cz/schemas/canonical/entity.schema.json",
  claim: "https://vomaste.cz/schemas/canonical/claim.schema.json",
  source: "https://vomaste.cz/schemas/canonical/source.schema.json",
  case: "https://vomaste.cz/schemas/canonical/case.schema.json",
  gap: "https://vomaste.cz/schemas/canonical/gap.schema.json",
  relation: "https://vomaste.cz/schemas/canonical/relation.schema.json",
  update: "https://vomaste.cz/schemas/canonical/update.schema.json",
};
const VOCABULARY_SCHEMA_ID = "https://vomaste.cz/schemas/canonical/vocabulary.schema.json";

// Jedna sdílená AJV instance pro všechna schémata, aby cross-file $ref
// (každé schéma odkazuje _defs.schema.json) resolvoval přes $id — nikdy
// druhé ad hoc AJV nastavení vedle (jedno pravidlo, jeden vlastník).
let cachedValidators = null;
export function createValidators() {
  if (cachedValidators) return cachedValidators;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  for (const file of readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith(".schema.json"))) {
    ajv.addSchema(JSON.parse(readFileSync(join(SCHEMAS_DIR, file), "utf8")));
  }
  const byRecordType = {};
  for (const [recordType, id] of Object.entries(RECORD_SCHEMA_IDS)) {
    const validate = ajv.getSchema(id);
    if (!validate) throw new Error(`schemas/canonical: chybí schéma ${id} pro recordType "${recordType}"`);
    byRecordType[recordType] = validate;
  }
  const vocabulary = ajv.getSchema(VOCABULARY_SCHEMA_ID);
  if (!vocabulary) throw new Error(`schemas/canonical: chybí mini-schéma slovníku ${VOCABULARY_SCHEMA_ID}`);
  cachedValidators = { ajv, byRecordType, vocabulary };
  return cachedValidators;
}

function* walkJsonFiles(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walkJsonFiles(full);
    else if (name.endsWith(".json")) yield full;
  }
}

function formatAjvErrors(relPath, ajvErrors) {
  return (ajvErrors ?? []).map((e) => {
    const where = e.instancePath || "(root)";
    const extra = e.keyword === "additionalProperties" ? ` (cizí pole "${e.params.additionalProperty}")` : "";
    return `${relPath}: ${where} ${e.message}${extra}`;
  });
}

// Zvaliduje jeden kanonický záznam (už rozparsovaný objekt); vrací pole
// chybových hlášek s cestou. Export pro testy.
export function validateRecordObject(record, relPath) {
  const { byRecordType } = createValidators();
  const recordType = record?.recordType;
  if (typeof recordType !== "string" || !byRecordType[recordType]) {
    return [
      `${relPath}: (root) neznámý nebo chybějící recordType ${JSON.stringify(recordType)} — očekávám jeden z: ${Object.keys(byRecordType).join(", ")}`,
    ];
  }
  const validate = byRecordType[recordType];
  if (validate(record)) return [];
  return formatAjvErrors(relPath, validate.errors);
}

// Projde jeden strom kanonických dat. Vrací { errors, records,
// vocabularies }. rootDir default = data/dossiers; testy sem míří na
// fixture strom.
export function validateShapeTree(rootDir = RECORDS_ROOT) {
  const { vocabulary } = createValidators();
  const errors = [];
  let records = 0;
  let vocabularies = 0;

  for (const file of walkJsonFiles(rootDir)) {
    const relPath = relative(ROOT, file);
    const parts = relative(rootDir, file).split(sep);

    let parsed;
    try {
      parsed = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      errors.push(`${relPath}: (root) neplatný JSON — ${e.message}`);
      continue;
    }

    if (parts[0] === "_shared") {
      if (parts[1] === "vocabularies") {
        vocabularies++;
        if (!vocabulary(parsed)) errors.push(...formatAjvErrors(relPath, vocabulary.errors));
      } else if (parts[1] === "entities") {
        records++;
        errors.push(...validateRecordObject(parsed, relPath));
      }
      // _shared/context/*.jsonld sem nespadne (walk bere jen .json);
      // jiné budoucí _shared soubory nejsou záznamy — přeskočit.
      continue;
    }

    records++;
    errors.push(...validateRecordObject(parsed, relPath));
  }

  return { errors, records, vocabularies };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { errors, records, vocabularies } = validateShapeTree();
  console.log(
    `Zkontrolováno ${records} kanonických záznamů a ${vocabularies} slovníků proti schemas/canonical/ (Ajv 2020-12, strict).`,
  );
  if (records === 0) console.log("0 canonical records (pre-migration) — OK");
  if (errors.length) {
    console.log(`\n${errors.length} chyb(a) tvaru:`);
    for (const e of errors) console.log(`  ERROR ${e}`);
    console.log("\nFAILED");
    process.exit(1);
  }
  console.log("OK — každý kanonický soubor odpovídá svému schématu.");
}
