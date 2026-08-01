// Sdílený přístup build generátorů ke compiled modelu (T-028 fáze G).
//
// Od fáze G je JEDINÝM datovým vstupem build generátorů kompilovaný
// kanonický dataset (data/dossiers/**/*.json → loadCanonicalTree →
// compileDataset) — žádný generátor už neparsuje content/** front
// matter. Tenhle modul tu synchronní kompilaci memoizuje per root,
// aby ji skripty, které skládají víc projekcí (record-tables,
// build-search-index, …), neplatily opakovaně.
//
// Validace tvaru/referencí/sémantiky/JSON-LD sem NEPATŘÍ — tu vlastní
// `npm run data:validate` (kanonická brána na začátku buildu); loader
// hází tvrdou chybu jen na nečitelný/neparsovatelný soubor.
import { join } from "node:path";
import { loadCanonicalTree } from "../../data/load.mjs";
import { compileDataset } from "../../data/compile.mjs";

const cache = new Map();

/*
 * getCompiledModel(repoRoot) → compiled dataset (viz scripts/data/compile.mjs):
 *   { records, entities, indexes: { byId, byDossierIdentifier },
 *     counts, routes, graph, manifest }
 */
export function getCompiledModel(repoRoot) {
  const recordsRoot = join(repoRoot, "data", "dossiers");
  if (!cache.has(recordsRoot)) {
    cache.set(recordsRoot, compileDataset(loadCanonicalTree(recordsRoot)));
  }
  return cache.get(recordsRoot);
}

// Lokální část IRI ("…/claims/CLM-01" → "CLM-01", "…/entities/babis" →
// "babis") — stejná projekce jako v compile.mjs/build-view-models.mjs.
export const localPart = (iri) => (typeof iri === "string" ? iri.split("/").pop() : null);

// Reference pole → lokální identifikátory (kanonické refs jsou vždy
// [{ "@id": … }]).
export const localIds = (refs) => (refs ?? []).map((r) => localPart(r["@id"]));

/*
 * Záznamy jednoho dossieru v jednom registru, v kompilovaném
 * (deterministickém) pořadí — dossier → registry → identifier.
 */
export function recordsOf(compiled, slug, registry) {
  return compiled.records.filter((w) => w.dossier === slug && w.registry === registry);
}
