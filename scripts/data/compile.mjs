// Kompilace kanonického datasetu (T-028 fáze C): z validního surového
// modelu (load.mjs) vyrábí normalizovaný, deterministicky seřazený a
// indexovaný compiled dataset pro budoucí generátory (fáze G). Čistá
// projekce — ŽÁDNÉ nové faktické pole, žádný FS/network přístup.
import { compareIdentifiers, compareWrappers, normalizeRecord, routeFor } from "./normalize.mjs";
import { documentLoader } from "./lib/context-loader.mjs";

const sortedObject = (entries) =>
  Object.fromEntries([...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

const localPart = (entityIri) => (typeof entityIri === "string" ? entityIri.split("/").pop() : null);

/*
 * compileDataset(model) →
 *   {
 *     records,   // seřazené wrappery { record, relPath, dossier, registry, route }
 *     entities,  // seřazené entity wrappery (stejný tvar, dossier: null)
 *     indexes: {
 *       byId,                  // "@id" → wrapper (záznamy i entity)
 *       byDossierIdentifier,   // "<slug>:<IDENTIFIER>" → wrapper; entity pod "<entityId>"
 *     },
 *     counts: { dossiers, entities, vocabularies, records, perType, perDossier },
 *     routes,    // klíče přesně jako build-route-manifest.mjs: DOSSIER:<slug>, <slug>:<ID>, <entityId>
 *     graph: { nodes, edges },
 *     manifest: { schemaVersion, contextVersion, counts },
 *   }
 */
export function compileDataset(model) {
  const records = model.records
    .map((w) => {
      const record = normalizeRecord(w.record);
      return { record, relPath: w.relPath, dossier: w.dossier, registry: w.registry, route: routeFor({ ...w, record }) };
    })
    .sort(compareWrappers);
  const entities = model.entities
    .map((w) => {
      const record = normalizeRecord(w.record);
      return { record, relPath: w.relPath, dossier: null, registry: "entities", route: routeFor({ ...w, record }) };
    })
    .sort((a, b) => compareIdentifiers(a.record.identifier, b.record.identifier));

  const byId = {};
  const byDossierIdentifier = {};
  for (const wrapper of [...records, ...entities]) {
    byId[wrapper.record["@id"]] = wrapper;
    const key = wrapper.dossier ? `${wrapper.dossier}:${wrapper.record.identifier}` : wrapper.record.identifier;
    byDossierIdentifier[key] = wrapper;
  }

  // Odvozené počty per dossier / per typ.
  const perType = {};
  const perDossier = {};
  for (const wrapper of records) {
    const type = wrapper.record.recordType;
    perType[type] = (perType[type] ?? 0) + 1;
    const dossierCounts = (perDossier[wrapper.dossier] ??= {});
    dossierCounts[type] = (dossierCounts[type] ?? 0) + 1;
  }
  perType.entity = entities.length;
  const counts = {
    dossiers: model.dossiers.length,
    entities: entities.length,
    vocabularies: model.vocabularies.length,
    records: records.length,
    perType: sortedObject(Object.entries(perType)),
    perDossier: sortedObject(
      Object.entries(perDossier).map(([slug, c]) => [
        slug,
        { ...sortedObject(Object.entries(c)), total: Object.values(c).reduce((a, b) => a + b, 0) },
      ]),
    ),
  };

  // Routy — stejné kompozitní klíče a route tvary jako dnešní
  // build-route-manifest.mjs (/dossiers/<slug>/<registry>/<lower-id>/);
  // updates veřejnou routu nemají (viz routeFor v normalize.mjs).
  const routes = {};
  for (const wrapper of [...records, ...entities]) {
    if (wrapper.route === null) continue;
    if (wrapper.registry === "dossier") {
      routes[`DOSSIER:${wrapper.dossier}`] = { type: "dossier", dossier: wrapper.dossier, route: wrapper.route };
    } else if (wrapper.registry === "entities") {
      routes[wrapper.record.identifier] = { type: "entity", dossier: null, route: wrapper.route };
    } else {
      routes[`${wrapper.dossier}:${wrapper.record.identifier}`] = {
        type: wrapper.record.recordType,
        dossier: wrapper.dossier,
        local_id: wrapper.record.identifier,
        route: wrapper.route,
      };
    }
  }

  // Graf: uzly z entit, hrany z relations — transportní projekce pro
  // budoucí grafové generátory.
  const graph = {
    nodes: entities.map((w) => ({
      id: w.record.identifier,
      "@id": w.record["@id"],
      title: w.record.title,
      entityType: w.record.entityType,
      publicationRole: w.record.publicationRole,
      coverageState: w.record.coverageState,
      dossiers: [...(w.record.dossiers ?? [])],
    })),
    edges: records
      .filter((w) => w.registry === "relations")
      .map((w) => ({
        id: w.record.identifier,
        "@id": w.record["@id"],
        dossier: w.dossier,
        from: localPart(w.record.sourceEntity?.["@id"]),
        to: localPart(w.record.targetEntity?.["@id"]),
        relationType: w.record.relationType,
        status: w.record.status,
        label: w.record.label,
        directed: w.record.directed,
        claims: (w.record.claims ?? []).map((r) => r["@id"]),
        sources: (w.record.sources ?? []).map((r) => r["@id"]),
      })),
  };

  // Manifest: verze kontraktu + počty. contextVersion se odvozuje z
  // kontextů skutečně použitých záznamy; prázdný dataset (pre-migration)
  // nese aktuální lokální verzi z context-loaderu.
  const usedContexts = [...new Set([...records, ...entities].map((w) => w.record["@context"]))].sort();
  const knownLocal = "https://vomaste.cz/context/v1.jsonld";
  const manifest = {
    schemaVersion: 1,
    contextVersion: usedContexts.length === 1 ? usedContexts[0] : usedContexts.length ? usedContexts : knownLocal,
    counts,
    routes: Object.keys(routes).length,
    graph: { nodes: graph.nodes.length, edges: graph.edges.length },
  };
  // Sanity: manifest kontext musí být lokálně načtitelný (hází při cizí URL).
  for (const url of usedContexts) documentLoader(url);

  return {
    records,
    entities,
    indexes: { byId: sortedObject(Object.entries(byId)), byDossierIdentifier: sortedObject(Object.entries(byDossierIdentifier)) },
    counts,
    routes: sortedObject(Object.entries(routes)),
    graph,
    manifest,
  };
}
