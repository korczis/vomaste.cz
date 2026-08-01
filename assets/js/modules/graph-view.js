// Interactive relationship view shared by the per-dossier local graph
// (templates/dossier.html) and the global map (templates/map.html).
//
// Renderer: Sigma.js (WebGL) over a Graphology model — see
// docs/adr/duckdb-wasm-and-sigma.md, refined for the layered data
// contract in docs/adr/graph-workbench-and-data-projection.md (T-027).
//
// Data flow: nodes/edges come from a build-time-generated, ALREADY
// LAID-OUT projection (scripts/dossier/build-graph-projections.mjs —
// schemas/graph-payload.schema.json) — every node already carries its
// x/y (computed once at build time, mission § 4) and its own canonical
// `route`, resolved at build time from data/generated/routes.json. There
// is no client-side layout pass and no second route lookup: this fixes
// the two biggest measured problems in
// docs/audits/graph-workbench-baseline.md (synchronous ForceAtlas2 on
// load, and a second search-index.json fetch before first render).
//
// The small curated layer ships inline (a JSON island, like before); the
// much larger full-registry layer is fetched lazily, once, only when its
// layer button is actually activated — see `fullLayerUrl` below.
//
// Resize: Sigma caches its canvas dimensions, so every container resize
// (sidebar toggle, fullscreen enter/exit, orientation change) needs an
// explicit refresh — same constraint the previous implementation had.
import Graph from "graphology";
import Sigma from "sigma";
import { resizeHandlers } from "./fullscreen.js";

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

function nodeColor(n) {
  if (n.record_type === "entity") return TYPE_COLOR[n.entity_type] || "#f3e5c0";
  return RECORD_COLOR[n.record_type] || "#666";
}

function readJsonIsland(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    return null;
  }
}

const fullLayerCache = new Map();
async function fetchLayer(url) {
  if (fullLayerCache.has(url)) return fullLayerCache.get(url);
  const promise = fetch(url)
    .then((res) => res.json())
    .catch(() => null);
  fullLayerCache.set(url, promise);
  return promise;
}

export async function initGraphView(containerId, dataIslandId, fullLayerUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const island = readJsonIsland(dataIslandId);
  if (!island || !island.nodes || !island.edges) return;

  let renderer = null;

  const render = (data) => {
    if (renderer) {
      renderer.kill();
      renderer = null;
    }
    const graph = new Graph({ multi: true, type: "directed" });

    for (const n of data.nodes) {
      if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) continue;
      graph.addNode(n.id, {
        label: n.label,
        size: SIZE_BY_CLASS[n.size_class] || 6,
        color: nodeColor(n),
        x: n.x,
        y: n.y,
        route: n.route || null,
        kind: "node",
      });
    }

    for (const e of data.edges) {
      if (!graph.hasNode(e.source) || !graph.hasNode(e.target)) continue;
      graph.addEdgeWithKey(e.id, e.source, e.target, {
        label: e.label,
        size: 1.4,
        color: STATUS_COLOR[e.status] || EDGE_CLASS_COLOR[e.edge_class] || "rgba(255,255,255,0.28)",
        type: "arrow",
        route: e.route || null,
        kind: "edge",
      });
    }

    renderer = new Sigma(graph, container, {
      renderEdgeLabels: false,
      labelColor: { color: "#ffffff" },
      labelSize: 11,
      labelWeight: "500",
      labelDensity: 0.7,
      labelGridCellSize: 70,
      edgeLabelColor: { color: "rgba(255,255,255,0.7)" },
      defaultEdgeType: "arrow",
      minCameraRatio: 0.3,
      maxCameraRatio: 4,
    });

    const routeOfNode = (id) => graph.getNodeAttribute(id, "route");
    const routeOfEdge = (id) => graph.getEdgeAttribute(id, "route");

    renderer.on("clickNode", ({ node }) => {
      const route = routeOfNode(node);
      if (route) window.location.href = route;
    });
    renderer.on("clickEdge", ({ edge }) => {
      const route = routeOfEdge(edge);
      if (route) window.location.href = route;
    });
    renderer.on("enterNode", ({ node }) => {
      container.style.cursor = routeOfNode(node) ? "pointer" : "";
    });
    renderer.on("enterEdge", ({ edge }) => {
      container.style.cursor = routeOfEdge(edge) ? "pointer" : "";
    });
    renderer.on("leaveNode", () => {
      container.style.cursor = "";
    });
    renderer.on("leaveEdge", () => {
      container.style.cursor = "";
    });

    // rAF-batched refresh: coalesces bursts of ResizeObserver callbacks
    // (e.g. during a CSS transition) into one call per frame.
    let resizePending = false;
    const scheduleResize = () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        renderer.resize();
        renderer.refresh();
      });
    };

    if (window.ResizeObserver) {
      new ResizeObserver(scheduleResize).observe(container);
    } else {
      window.addEventListener("resize", scheduleResize);
    }

    const fsBox = container.closest(".fs-box");
    if (fsBox && fsBox.id) {
      resizeHandlers[fsBox.id] = scheduleResize;
    }

    return renderer;
  };

  render(island);

  const buttons = document.querySelectorAll("[data-graph-layer]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const key = btn.getAttribute("data-graph-layer");
      let data = key === "curated" ? island : null;
      if (key === "full" && fullLayerUrl) {
        data = await fetchLayer(fullLayerUrl);
      }
      if (!data) return;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      render(data);
    });
  });

  return renderer;
}
