// Generates a SYNTHETIC graph payload for technical benchmarking only
// (mission § 17.4). Deterministic (a small LCG, never Math.random() —
// this repo's workflow scripts can't use Math.random(), and a
// reproducible benchmark is more useful anyway: the same size always
// produces the same shape, so a timing regression is comparable run to
// run). NEVER published as site content and NEVER mistaken for real
// data: every label is literally "Synthetic Node/Edge N", not a name.
function makeLcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const RECORD_TYPES = ["entity", "claim", "source", "case", "gap"];
const ENTITY_TYPES = ["person", "political_party", "public_institution", "company"];

export function generateSyntheticGraph({ nodeCount = 10_000, edgeCount = 30_000, seed = 1 } = {}) {
  const rand = makeLcg(seed);
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const recordType = RECORD_TYPES[i % RECORD_TYPES.length];
    nodes.push({
      id: `bench-${i}`,
      canonical_id: `bench-${i}`,
      record_type: recordType,
      entity_type: recordType === "entity" ? ENTITY_TYPES[i % ENTITY_TYPES.length] : undefined,
      label: `Synthetic ${recordType} ${i}`,
      route: null,
      dossier: "benchmark",
      subject: i % 500 === 0,
      size_class: recordType === "entity" ? (i % 500 === 0 ? "subject" : "entity") : recordType,
    });
  }
  const edges = [];
  for (let i = 0; i < edgeCount; i++) {
    const source = Math.floor(rand() * nodeCount);
    let target = Math.floor(rand() * nodeCount);
    if (target === source) target = (target + 1) % nodeCount;
    edges.push({
      id: `bench-edge-${i}`,
      source: `bench-${source}`,
      target: `bench-${target}`,
      edge_class: "curated_relation",
      label: "vazba",
      dossier: "benchmark",
    });
  }
  return { schema_version: 1, nodes, edges, clusters: [], source_families: [] };
}
