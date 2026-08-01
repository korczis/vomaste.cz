// Deterministická BFS hloubka grafu dossieru (T-028 fáze H).
//
// Dřívější graph.toml nesl ručně kurátorované `depth` per uzel — od
// fáze H se prezentační hloubka POČÍTÁ: BFS od subjektových uzlů
// (depth 0) po neorientovaných hranách. Tím se rozpouštějí dřívější
// validační pravidla validate-graph.mjs („depth 0–3“, „subject ⇒ depth
// 0“, „hrana nesmí skočit o víc než 1“) — vypočtená hloubka je splňuje
// z definice. Kurátorovaná hodnota z doby objevení entity zůstává jako
// provenience v entity.provenance.depth.
//
// Determinismus: BFS ve stabilním pořadí (subjektové uzly v pořadí
// graph.nodes, sousedé v pořadí graph.edges); uzel bez cesty k subjektu
// má hloubku null (odpojenost hlásí validate-semantics S8).

/*
 * computeGraphDepths(nodeIds, subjectIds, edges) → Map<nodeId, number|null>
 *   nodeIds    [string]                 — uzly v kurátorském pořadí
 *   subjectIds [string]                 — subjektové uzly (depth 0)
 *   edges      [{ from, to }]           — hrany (neorientovaně)
 */
export function computeGraphDepths(nodeIds, subjectIds, edges) {
  const depths = new Map(nodeIds.map((id) => [id, null]));
  const adjacency = new Map(nodeIds.map((id) => [id, []]));
  for (const e of edges) {
    if (adjacency.has(e.from) && adjacency.has(e.to)) {
      adjacency.get(e.from).push(e.to);
      adjacency.get(e.to).push(e.from);
    }
  }
  const queue = [];
  for (const id of subjectIds) {
    if (!depths.has(id)) continue;
    depths.set(id, 0);
    queue.push(id);
  }
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const nextDepth = depths.get(current) + 1;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (depths.get(neighbor) === null) {
        depths.set(neighbor, nextDepth);
        queue.push(neighbor);
      }
    }
  }
  return depths;
}

/*
 * dossierGraphDepths(compiled, slug) → Map<entityId, number|null>
 * Hloubky uzlů kurátorovaného grafu dossieru z compiled modelu:
 * uzly/subjekty z dossier.graph, hrany z kanonických relations.
 */
export function dossierGraphDepths(compiled, slug) {
  const record = compiled.records.find((w) => w.registry === "dossier" && w.dossier === slug)?.record;
  const graph = record?.graph;
  if (!graph) return new Map();
  const localPart = (iri) => (typeof iri === "string" ? iri.split("/").pop() : null);
  const edges = compiled.records
    .filter((w) => w.dossier === slug && w.registry === "relations")
    .map((w) => ({
      from: localPart(w.record.sourceEntity?.["@id"]),
      to: localPart(w.record.targetEntity?.["@id"]),
    }));
  return computeGraphDepths(
    graph.nodes.map((n) => n.entity),
    graph.nodes.filter((n) => n.subject === true).map((n) => n.entity),
    edges,
  );
}
