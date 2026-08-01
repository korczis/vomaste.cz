// Sigma nodeReducer/edgeReducer (mission § 7.3) — selection/hover
// neighborhood, filters and search-match dimming, all computed from the
// SAME state object, without mutating the Graphology graph itself.
// Cheap by construction: one Set built per selection/filter change, then
// O(1) lookups per node/edge at render time.
const DIM_NODE_COLOR = "rgba(255,255,255,0.12)";
const DIM_EDGE_COLOR = "rgba(255,255,255,0.05)";

function matchesQuery(attrs, query) {
  if (!query) return true;
  const haystack = [attrs.label, attrs.canonicalId, attrs.dossier, attrs.outlet, attrs.entityType].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query);
}

function matchesFilters(attrs, filters) {
  if (filters.recordType && attrs.recordType !== filters.recordType) return false;
  if (filters.dossier) {
    const dossiers = attrs.dossiers || (attrs.dossier ? [attrs.dossier] : []);
    if (!dossiers.includes(filters.dossier)) return false;
  }
  return true;
}

export function computeReducers(graph, state) {
  const selected = state.selected;
  const query = (state.query || "").trim().toLowerCase();
  const filters = state.filters || {};
  const hasActiveFilter = Boolean(filters.recordType || filters.dossier || query);

  let neighborhood = null; // Set of node ids to KEEP fully visible, or null = no selection-based dimming
  if (selected && selected.kind === "node" && graph.hasNode(selected.id)) {
    if (state.focusDepth === "component") {
      const targetComponent = graph.getNodeAttribute(selected.id, "componentId");
      neighborhood = new Set(graph.filterNodes((id, attrs) => attrs.componentId === targetComponent));
    } else {
      const depth = typeof state.focusDepth === "number" && state.focusDepth > 0 ? state.focusDepth : 1;
      neighborhood = new Set([selected.id]);
      let frontier = [selected.id];
      for (let step = 0; step < depth; step++) {
        const next = [];
        for (const id of frontier) {
          for (const neighbor of graph.neighbors(id)) {
            if (!neighborhood.has(neighbor)) {
              neighborhood.add(neighbor);
              next.push(neighbor);
            }
          }
        }
        frontier = next;
      }
    }
  }

  const nodeReducer = (id, attrs) => {
    const res = { ...attrs };
    const inFilter = !hasActiveFilter || matchesQuery(attrs, query) && matchesFilters(attrs, filters);
    const inNeighborhood = !neighborhood || neighborhood.has(id);
    if (!inFilter || !inNeighborhood) {
      res.color = DIM_NODE_COLOR;
      res.label = null;
      res.zIndex = 0;
    } else if (id === (selected && selected.id)) {
      res.zIndex = 2;
      res.highlighted = true;
    } else if (neighborhood) {
      res.zIndex = 1;
    }
    return res;
  };

  const edgeReducer = (id, attrs) => {
    const res = { ...attrs };
    const bothEndpointsVisible = !neighborhood || (neighborhood.has(graph.source(id)) && neighborhood.has(graph.target(id)));
    if (!bothEndpointsVisible) {
      res.color = DIM_EDGE_COLOR;
      res.hidden = true;
    }
    return res;
  };

  return { nodeReducer, edgeReducer };
}

// Kolik uzlů filtr a hledání skutečně nechaly viditelných.
//
// Používá TYTÉŽ predikáty jako reducery výše. Kdyby si počítání psalo
// vlastní podmínky, hlášené číslo by se dřív nebo později rozešlo s tím,
// co uživatel na plátně vidí — a to je horší než číslo nehlásit vůbec.
export function countMatching(graph, state) {
  const query = (state.query || "").trim().toLowerCase();
  const filters = state.filters || {};
  const active = Boolean(filters.recordType || filters.dossier || query);
  if (!active) return { matching: graph.order, total: graph.order, active: false };
  let matching = 0;
  graph.forEachNode((id, attrs) => {
    if (matchesQuery(attrs, query) && matchesFilters(attrs, filters)) matching++;
  });
  return { matching, total: graph.order, active: true };
}
