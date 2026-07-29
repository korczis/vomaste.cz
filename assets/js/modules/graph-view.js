// Minimal, real interactive Cytoscape view shared by the per-dossier local
// graph (templates/dossier.html) and the global map (templates/map.html).
//
// Deliberately simpler than a full filter/chip/detail-panel UI: reads graph
// data from a JSON island, resolves each node/edge's canonical route from
// the already-published search-index.json (the same id -> route mapping
// assets/js/modules/global-search.js uses, not a second lookup table), and
// makes every node/edge a real click target to its own canonical page.
// Every node/edge already has its own routable page and appears in the
// text-alternative registry list next to this graph — this view is a
// progressive-enhancement visualization of that same data, not a second
// source of truth.
const STATUS_COLOR = { corroborated: "#4ade80", disputed: "#facc15", quote: "#93c5fd", contextual: "rgba(255,255,255,0.35)" };
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
  if (!container || !window.cytoscape) return;
  const data = readJsonIsland(dataIslandId);
  if (!data || !data.nodes || !data.edges) return;

  const routeOf = await fetchRouteMap(searchIndexUrl);

  const elements = [
    ...data.nodes.map((n) => ({
      data: {
        id: n.id,
        label: n.label,
        type: n.type,
        route: routeOf[n.id] || null,
      },
    })),
    ...data.edges.map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        status: e.status,
        route: routeOf[e.id] || null,
      },
    })),
  ];

  const cy = window.cytoscape({
    container,
    elements,
    style: [
      {
        selector: "node",
        style: {
          "background-color": (el) => TYPE_COLOR[el.data("type")] || "#666",
          label: "data(label)",
          color: "#fff",
          "font-size": 9,
          "text-valign": "bottom",
          "text-margin-y": 4,
          width: 18,
          height: 18,
        },
      },
      {
        selector: "edge",
        style: {
          width: 1.5,
          "line-color": (el) => STATUS_COLOR[el.data("status")] || "#666",
          "target-arrow-color": (el) => STATUS_COLOR[el.data("status")] || "#666",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "arrow-scale": 0.7,
        },
      },
      {
        selector: "node[route], edge[route]",
        style: { "overlay-opacity": 0 },
      },
    ],
    layout: { name: "cose", animate: false, padding: 40, nodeRepulsion: 20000, idealEdgeLength: 90 },
    minZoom: 0.2,
    maxZoom: 3,
  });

  cy.on("tap", "node, edge", (evt) => {
    const route = evt.target.data("route");
    if (route) window.location.href = route;
  });
  cy.on("mouseover", "node, edge", (evt) => {
    if (evt.target.data("route")) container.style.cursor = "pointer";
  });
  cy.on("mouseout", "node, edge", () => {
    container.style.cursor = "";
  });

  return cy;
}
