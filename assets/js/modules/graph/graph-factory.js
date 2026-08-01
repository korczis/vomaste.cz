// Pure Graphology graph construction from a normalized transport payload
// (schemas/graph-payload.schema.json — already laid out at build time,
// see scripts/dossier/lib/graph-layout.mjs). No layout computation here:
// x/y come straight from the payload. This is the one place that knows
// the visual mapping (color/size by record_type/entity_type/size_class),
// shared by every layer (curated, registry, per-dossier local).
import Graph from "graphology";

const STATUS_COLOR = { corroborated: "#4ade80", single: "#fdba74", disputed: "#facc15", quote: "#93c5fd", contextual: "rgba(255,255,255,0.35)" };
// Full-registry edges have no editorial status (they're mechanical
// references a record already declares) — color by edge_class instead.
const EDGE_CLASS_COLOR = {
  curated_relation: "rgba(255,255,255,0.28)",
  claim_cites_source: "rgba(147,197,253,0.35)",
  gap_questions_claim: "rgba(248,113,113,0.35)",
  entity_mentions_claim: "rgba(243,229,192,0.30)",
  relation_backed_by_claim: "rgba(74,222,128,0.30)",
};
const RECORD_COLOR = { claim: "#93c5fd", source: "#4ade80", case: "#facc15", gap: "#f87171" };
const TYPE_COLOR = {
  person: "#f3e5c0",
  political_party: "#93c5fd",
  public_institution: "#a78bfa",
  company: "#fb923c",
  organization: "#fb923c",
  role: "#94a3b8",
  controversy: "#facc15",
  event: "#facc15",
  legal_or_administrative_process: "#f87171",
};
// Visual role only (mission § 7.4) — never connectivity/importance.
const SIZE_BY_CLASS = { subject: 9, entity: 7, case: 6, claim: 5, source: 5, gap: 5 };

export function nodeColor(n) {
  if (n.record_type === "entity") return TYPE_COLOR[n.entity_type] || "#f3e5c0";
  return RECORD_COLOR[n.record_type] || "#666";
}

export function edgeColor(e) {
  return STATUS_COLOR[e.status] || EDGE_CLASS_COLOR[e.edge_class] || "rgba(255,255,255,0.28)";
}

export function nodeSize(n) {
  return SIZE_BY_CLASS[n.size_class] || 6;
}

// `payload` is {nodes, edges, ...} per schemas/graph-payload.schema.json.
// A node without finite coordinates is skipped (defensive — the build
// gate already rejects these, see validate-graph-projections.mjs) rather
// than handed to Sigma, which throws on non-finite coordinates.
// Carries the full normalized record through as Graphology attributes —
// not just what Sigma needs to draw — so selection/filters/search/the
// inspector (assets/js/modules/graph/index.js) can all read
// `graph.getNodeAttributes(id)` as their one source, instead of a second
// id -> payload lookup that could drift from what's actually rendered.
export function buildGraph(payload) {
  const graph = new Graph({ multi: true, type: "directed" });
  for (const n of payload.nodes) {
    if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) continue;
    graph.addNode(n.id, {
      label: n.label,
      size: nodeSize(n),
      color: nodeColor(n),
      x: n.x,
      y: n.y,
      route: n.route || null,
      recordType: n.record_type,
      entityType: n.entity_type || null,
      dossier: n.dossier || null,
      dossiers: n.dossiers || null,
      status: n.status || null,
      outlet: n.outlet || null,
      priority: n.priority || null,
      summary: n.summary || null,
      title: n.title || null,
      canonicalId: n.canonical_id,
      claimCount: n.claim_count ?? null,
      sourceCount: n.source_count ?? null,
      componentId: n.component_id,
      kind: "node",
    });
  }
  for (const e of payload.edges) {
    if (!graph.hasNode(e.source) || !graph.hasNode(e.target)) continue;
    graph.addEdgeWithKey(e.id, e.source, e.target, {
      label: e.label,
      size: 1.4,
      color: edgeColor(e),
      type: "arrow",
      route: e.route || null,
      edgeClass: e.edge_class,
      status: e.status || null,
      dossier: e.dossier || null,
      relation: e.relation || null,
      claims: e.claims || null,
      sources: e.sources || null,
      kind: "edge",
    });
  }
  return graph;
}
