// Veřejné API kompilátoru kanonického datasetu (T-028 fáze C):
//
//   const model = await loadCanonicalDataset(root);   // discover + load
//   await validateCanonicalDataset(model);            // shape + refs + semantics + jsonld
//   const compiled = compileDataset(model);           // normalizace + indexy + routy + graf + manifest
//
// Fasáda nic nevlastní — jen skládá moduly, z nichž každý vlastní své
// vrstvy pravidel (validate-shape tvar, validate-references integritu,
// validate-semantics redakční pravidla, validate-jsonld expanzi).
import { loadCanonicalTree } from "../load.mjs";
import { createValidators, validateRecordObject, RECORDS_ROOT } from "../validate-shape.mjs";
import { validateReferences } from "../validate-references.mjs";
import { validateSemantics } from "../validate-semantics.mjs";
import { validateRegistryTables } from "../validate-registry-table.mjs";
import { validateJsonLd } from "../validate-jsonld.mjs";
import { compileDataset } from "../compile.mjs";

export { compileDataset, RECORDS_ROOT };

// discover + load; async kvůli stabilitě API (budoucí fáze mohou číst
// asynchronně), dnes čte synchronně a hází Error s cestami při
// nečitelném/neparsovatelném souboru.
export async function loadCanonicalDataset(root = RECORDS_ROOT) {
  return loadCanonicalTree(root);
}

function formatAjvErrors(relPath, ajvErrors) {
  return (ajvErrors ?? []).map((e) => `${relPath}: ${e.instancePath || "(root)"} ${e.message}`);
}

/*
 * Kompletní validace modelu: shape → references → semantics → jsonld.
 * Vrací { errors, warnings } — nehází; o exit kódu rozhoduje volající
 * (check.mjs). options se předává validate-semantics
 * ({ authorizations, authorizationsPath }).
 */
export async function validateCanonicalDataset(model, options = {}) {
  const errors = [];
  const warnings = [];

  // 1) tvar — stejné validátory jako npm run data:validate (validate-shape.mjs)
  const { vocabulary } = createValidators();
  for (const wrapper of [...model.records, ...model.entities]) {
    errors.push(...validateRecordObject(wrapper.record, wrapper.relPath));
  }
  for (const { relPath, data } of model.vocabularies) {
    if (!vocabulary(data)) errors.push(...formatAjvErrors(relPath, vocabulary.errors));
  }

  // 2) referenční integrita
  errors.push(...validateReferences(model));

  // 3) redakční sémantika
  const semantics = validateSemantics(model, options);
  errors.push(...semantics.errors);
  warnings.push(...semantics.warnings);

  // 3b) parita přehledové tabulky s kanonickými záznamy (T1–T8 — fáze H,
  //     dřívější validate-dossier.mjs)
  const tables = validateRegistryTables(model);
  errors.push(...tables.errors);
  warnings.push(...tables.warnings);

  // 4) JSON-LD expanze (lokální kontexty, safe mode)
  errors.push(...(await validateJsonLd(model)));

  return { errors, warnings };
}
