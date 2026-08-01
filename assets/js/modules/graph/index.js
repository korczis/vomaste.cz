// Public entrypoint for the graph workbench (mission §§ 6–14), replacing
// the old assets/js/modules/graph-view.js. Wires together the controller
// (one reused Sigma instance), state, reducers, permalink, inspector and
// path finder — but every piece of UI it drives is OPTIONAL and looked
// up defensively inside the nearest `[data-graph-section]` ancestor, so
// the same code runs the full workbench on templates/map.html and the
// smaller "restricted mode" local graph on templates/dossier.html
// (mission § 19.2): a page that omits the filter/path-finder markup just
// doesn't get that feature, nothing throws.
import { GraphController } from "./controller.js";
import { computeReducers, countMatching } from "./reducers.js";
import { createGraphState } from "./state.js";
import { readStateFromUrl, writeStateToUrl } from "./permalink.js";
import { fetchLayer, readJsonIsland } from "./loader.js";
import { renderNodeInspector, renderEdgeInspector, renderNeighbors, clearInspector } from "./inspector.js";
import { shortestPath } from "./path-finder.js";

const DEFAULT_LAYER = "curated";

function announce(section, message) {
  const status = section && section.querySelector("[data-graph-status]");
  if (status) status.textContent = message;
}

// mission § 13: WebGL unavailable/blocked must never leave a blank
// canvas — explain what happened and point at the text alternative that
// already exists lower on the same page, instead of a silent void.
function showRendererFallback(container, section) {
  container.replaceChildren();
  const message = document.createElement("div");
  message.className = "graph-fallback";
  message.setAttribute("role", "status");
  const heading = document.createElement("p");
  heading.className = "graph-fallback-heading";
  heading.textContent = "Interaktivní graf se nepodařilo spustit.";
  const body = document.createElement("p");
  body.textContent = "Prohlížeč pravděpodobně nepodporuje nebo blokuje WebGL. Použijte textový registr níže — obsahuje stejná data.";
  message.append(heading, body);
  container.appendChild(message);
  announce(section, "Interaktivní graf se nepodařilo spustit — použijte textový registr níže.");
}

export async function initGraphView(containerId, dataIslandId, fullLayerUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const island = readJsonIsland(dataIslandId);
  if (!island || !island.nodes || !island.edges) return;
  const section = container.closest("[data-graph-section]") || container.parentElement;

  const inspectorEl = section ? section.querySelector("[data-graph-inspector]") : null;
  const searchEl = section ? section.querySelector("[data-graph-search]") : null;
  const filterEls = section ? section.querySelectorAll("[data-graph-filter]") : [];
  const layerButtons = section ? section.querySelectorAll("[data-graph-layer]") : [];
  const layers = { curated: island, full: null };
  const validLayerKeys = fullLayerUrl ? ["curated", "full"] : ["curated"];

  const state = createGraphState(onStateChange);
  const controller = new GraphController(container, {
    onSelect(kind, id) {
      if (!kind || !id) {
        state.setSelected(null);
        return;
      }
      state.setSelected({ kind, id });
    },
    // controller.graph stays null after this (mission § 13) — every
    // other function here already checks `controller.graph` before
    // touching it, so the rest of initGraphView degrades to a no-op
    // instead of throwing.
    onRendererError() {
      showRendererFallback(container, section);
    },
  });

  function refreshReducers() {
    if (!controller.graph) return;
    const snapshot = state.get();
    const { nodeReducer, edgeReducer } = computeReducers(controller.graph, snapshot);
    controller.setReducers(nodeReducer, edgeReducer);
    announceFilter(snapshot);
  }

  // Filtr uzly ZTLUMÍ, ale nesmaže je z plátna, takže po zadání dotazu
  // uživatel nepozná, jestli našel dva záznamy nebo dvě stě. Bez tohohle
  // hlášení je hledání v grafu o 1631 uzlech odhad.
  //
  // Počítá countMatching TÝMIŽ predikáty jako reducery — jinak by se
  // hlášené číslo rozešlo s tím, co je vidět.
  function announceFilter(snapshot) {
    if (!controller.graph) return;
    const { matching, total, active } = countMatching(controller.graph, snapshot);
    if (!active) return;
    announce(
      section,
      matching === 0
        ? `Filtru neodpovídá žádný z ${total} uzlů.`
        : `Filtru odpovídá ${matching} z ${total} uzlů.`,
    );
  }

  function refreshInspector() {
    if (!inspectorEl) return;
    const selected = state.get().selected;
    if (!selected || !controller.graph) {
      clearInspector(inspectorEl);
      return;
    }
    if (selected.kind === "node" && controller.graph.hasNode(selected.id)) {
      const attrs = controller.graph.getNodeAttributes(selected.id);
      renderNodeInspector(inspectorEl, attrs);
      // Prokliknutí souseda je běžný pohyb v grafu, ne otevření nové
      // stránky: mění se výběr, takže zůstane zachovaný filtr, vrstva
      // i hloubka zvýraznění a adresa se udrží sdílitelná.
      renderNeighbors(inspectorEl, controller.graph, selected.id, (id) => {
        state.setSelected({ kind: "node", id });
      });
      const degree = controller.graph.degree(selected.id);
      announce(section, `Vybrán uzel ${attrs.label}, ${attrs.recordType === "entity" ? attrs.entityType || "entita" : attrs.recordType}, ${degree} přímých deklarovaných vazeb.`);
    } else if (selected.kind === "edge" && controller.graph.hasEdge(selected.id)) {
      renderEdgeInspector(inspectorEl, controller.graph.getEdgeAttributes(selected.id));
    } else {
      clearInspector(inspectorEl);
    }
  }

  function onStateChange() {
    refreshReducers();
    refreshInspector();
    writeStateToUrl(state.get(), DEFAULT_LAYER);
  }

  async function activateLayer(key) {
    if (key === "full" && !layers.full && fullLayerUrl) {
      announce(section, "Načítám registrovou vrstvu…");
      layers.full = await fetchLayer(fullLayerUrl);
      if (!layers.full) {
        announce(section, "Registrovou vrstvu se nepodařilo načíst.");
        return;
      }
    }
    const payload = layers[key];
    if (!payload) return;
    controller.setLayer(key, payload);
    state.setLayer(key);
    layerButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-graph-layer") === key)));
    announce(section, `Vrstva „${key === "full" ? "celý registr" : "vztahy entit"}" — ${payload.nodes.length} uzlů, ${payload.edges.length} hran.`);
  }

  // Initial layer: from URL if valid, else the default. Restored in a
  // fixed order (layer -> selection -> filters/query) so a deep link is
  // deterministic regardless of what it contains (mission § 12).
  const fromUrl = readStateFromUrl(validLayerKeys);
  await activateLayer(fromUrl.layer || DEFAULT_LAYER);

  if (fromUrl.node && controller.graph && controller.graph.hasNode(fromUrl.node)) {
    controller.select(fromUrl.node);
  }
  if (fromUrl.query) state.setQuery(fromUrl.query);
  if (fromUrl.recordType) state.setFilter("recordType", fromUrl.recordType);
  if (fromUrl.dossier) state.setFilter("dossier", fromUrl.dossier);
  if (fromUrl.depth) state.setFocusDepth(fromUrl.depth === "component" ? "component" : Number(fromUrl.depth) || 0);
  refreshReducers();
  refreshInspector();

  layerButtons.forEach((btn) => {
    btn.addEventListener("click", () => activateLayer(btn.getAttribute("data-graph-layer")));
  });

  if (searchEl) {
    searchEl.addEventListener("input", () => state.setQuery(searchEl.value));
  }
  // Hloubka procházení: 0 = bez zvýraznění, 1/2 = kroky od vybraného uzlu,
  // "component" = celá souvislá komponenta. Hodnota jde i do adresy, takže
  // konkrétní pohled na okolí záznamu je sdílitelný.
  const depthButtons = section ? section.querySelectorAll("[data-graph-depth]") : [];
  depthButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-graph-depth");
      const value = raw === "component" ? "component" : Number(raw);
      state.setFocusDepth(value);
      depthButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    });
  });

  filterEls.forEach((select) => {
    select.addEventListener("change", () => {
      const key = select.getAttribute("data-graph-filter") === "record_type" ? "recordType" : "dossier";
      state.setFilter(key, select.value || null);
    });
  });

  if (section) {
    section.querySelectorAll("[data-graph-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-graph-action");
        if (action === "reset-view") {
          controller.resetCamera();
        } else if (action === "focus-1") {
          state.setFocusDepth(1);
        } else if (action === "focus-2") {
          state.setFocusDepth(2);
        } else if (action === "focus-component") {
          state.setFocusDepth("component");
        } else if (action === "focus-clear") {
          state.setFocusDepth(0);
        } else if (action === "clear-selection") {
          controller.clearSelection();
        }
      });
    });

    const pathFrom = section.querySelector("[data-graph-path-from]");
    const pathTo = section.querySelector("[data-graph-path-to]");
    const pathButton = section.querySelector('[data-graph-action="find-path"]');
    const pathResult = section.querySelector("[data-graph-path-result]");
    if (pathFrom && pathTo && pathButton && pathResult) {
      const populate = () => {
        if (!controller.graph) return;
        const options = controller.graph
          .mapNodes((id, attrs) => ({ id, label: attrs.label }))
          .sort((a, b) => a.label.localeCompare(b.label, "cs"));
        for (const select of [pathFrom, pathTo]) {
          const previous = select.value;
          select.replaceChildren(...options.map((o) => new Option(o.label, o.id)));
          if (options.some((o) => o.id === previous)) select.value = previous;
        }
      };
      populate();
      layerButtons.forEach((b) => b.addEventListener("click", () => setTimeout(populate, 0)));
      pathButton.addEventListener("click", () => {
        pathResult.replaceChildren();
        const from = pathFrom.value;
        const to = pathTo.value;
        if (!from || !to || !controller.graph) return;
        const path = shortestPath(controller.graph, from, to);
        if (!path) {
          pathResult.textContent = "Mezi vybranými uzly neexistuje žádná deklarovaná cesta v tomto datasetu.";
          return;
        }
        const note = document.createElement("p");
        note.className = "graph-path-note";
        note.textContent = "Výřez ukazuje dosažitelnost přes deklarované vazby v tomto datasetu. Nejde o tvrzení o přímém vztahu mezi krajními uzly.";
        pathResult.appendChild(note);
        const list = document.createElement("ol");
        list.className = "graph-path-steps";
        path.nodes.forEach((nodeId, i) => {
          const li = document.createElement("li");
          const attrs = controller.graph.getNodeAttributes(nodeId);
          const link = document.createElement("a");
          link.textContent = attrs.label;
          if (attrs.route) link.href = attrs.route;
          li.appendChild(link);
          if (i < path.edges.length) {
            const edgeAttrs = controller.graph.getEdgeAttributes(path.edges[i]);
            const edgeLabel = document.createElement("span");
            edgeLabel.className = "graph-path-edge";
            edgeLabel.textContent = ` — ${edgeAttrs.label || edgeAttrs.edgeClass} → `;
            li.appendChild(edgeLabel);
          }
          list.appendChild(li);
        });
        pathResult.appendChild(list);
      });
    }
  }

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape" && state.get().selected) controller.clearSelection();
  });

  return controller;
}
