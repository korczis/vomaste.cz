// Interactive relationship view shared by the per-dossier local graph
// (templates/dossier.html) and the global map (templates/map.html).
//
// Renderer: Sigma.js (WebGL) over a Graphology model — see
// docs/adr/duckdb-wasm-and-sigma.md, which supersedes the Cytoscape choice
// in docs/adr/graph-renderer.md. Both libraries are bundled by esbuild into
// static/js/app.js, so this removes a third-party CDN dependency rather than
// adding one, and keeps the graph *model* (Graphology) separate from its
// *rendering* (Sigma).
//
// Data flow is unchanged: nodes/edges come from a JSON island generated at
// build time from graph.toml, and each node/edge resolves its canonical route
// from the already-published search-index.json (the same id -> route mapping
// assets/js/modules/global-search.js uses, not a second lookup table).
// Every node and edge already has its own routable page and appears in the
// text-alternative registry list next to this graph — this view is a
// progressive-enhancement visualization of that same data, never the only
// way to reach a record.
//
// Resize: Sigma caches its canvas dimensions, so every container resize
// (sidebar toggle, fullscreen enter/exit, orientation change) needs an
// explicit refresh — same constraint the Cytoscape implementation had.
import Graph from "graphology";
import Sigma from "sigma";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { resizeHandlers } from "./fullscreen.js";

const STATUS_COLOR = { corroborated: "#4ade80", disputed: "#facc15", quote: "#93c5fd", contextual: "rgba(255,255,255,0.35)" };
// Plná registrová vrstva má vlastní typy uzlů (záznamy, ne entity) — barvy
// kopírují to, co už používají štítky stavů a registry na stránkách.
const RECORD_COLOR = {
  entity: "#f3e5c0",
  claim: "#93c5fd",
  source: "#4ade80",
  case: "#facc15",
  gap: "#f87171",
};
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

function readJsonIsland(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    return null;
  }
}

async function fetchRouteMap(indexUrl) {
  try {
    const res = await fetch(indexUrl);
    const entries = await res.json();
    const map = {};
    for (const e of entries) map[e.id] = e.route;
    return map;
  } catch (e) {
    return {};
  }
}

export async function initGraphView(containerId, dataIslandId, searchIndexUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const island = readJsonIsland(dataIslandId);
  if (!island || !island.nodes || !island.edges) return;

  const routeOf = await fetchRouteMap(searchIndexUrl);
  let renderer = null;

  // Layer switch (only the global map ships one): the curated entity graph and
  // the mechanically derived full-registry graph are two views of the same
  // data, so switching just rebuilds the Graphology model from a different
  // node/edge set — no second renderer, no second dataset.
  const layers = { curated: { nodes: island.nodes, edges: island.edges }, full: island.full || null };

  const render = (data) => {
    if (renderer) { renderer.kill(); renderer = null; }
    const graph = new Graph({ multi: true, type: "directed" });

  // Deterministic seed positions on a circle: ForceAtlas2 needs a starting
  // layout, and seeding it from the node order (rather than Math.random)
  // makes the rendered graph identical on every load.
  data.nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / data.nodes.length;
    graph.addNode(n.id, {
      label: n.label,
      size: n.subject ? 9 : 7,
      color: RECORD_COLOR[n.type] || TYPE_COLOR[n.type] || "#666",
      x: Math.cos(angle),
      y: Math.sin(angle),
      route: n.url || routeOf[n.id] || null,
      kind: "node",
    });
  });

  for (const e of data.edges) {
    if (!graph.hasNode(e.source) || !graph.hasNode(e.target)) continue;
    graph.addEdgeWithKey(e.id, e.source, e.target, {
      label: e.label,
      size: 1.4,
      color: STATUS_COLOR[e.status] || "rgba(255,255,255,0.28)",
      type: "arrow",
      route: routeOf[e.id] || null,
      kind: "edge",
    });
  }

  forceAtlas2.assign(graph, {
    iterations: 220,
    settings: { ...forceAtlas2.inferSettings(graph), gravity: 1.4, scalingRatio: 12, slowDown: 4 },
  });

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
  renderer.on("leaveNode", () => { container.style.cursor = ""; });
  renderer.on("leaveEdge", () => { container.style.cursor = ""; });

  // rAF-batched refresh: coalesces bursts of ResizeObserver callbacks (e.g.
  // during a CSS transition) into one call per frame.
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

  // Covers every resize cause, not just fullscreen: sidebar collapse,
  // viewport/orientation change, font-loading reflow — anything that changes
  // this container's box.
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

  render(layers.curated);

  const buttons = document.querySelectorAll("[data-graph-layer]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-graph-layer");
      const data = layers[key];
      if (!data) return;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      render(data);
    });
  });

  return renderer;
}
