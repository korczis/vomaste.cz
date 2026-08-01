// Dedicated esbuild entrypoint for the graph workbench, separate from
// assets/js/app.js (mission § 5). Sigma + Graphology are real weight —
// they must only ship to pages that actually render a graph
// ([data-graph-workbench] pages: templates/map.html, templates/dossier.html
// via templates/base.html's extra_js block), never to the shared bundle
// every other page pays for.
import { initGraphView } from "./modules/graph/index.js";

document.addEventListener("DOMContentLoaded", function () {
  // Both checked defensively inside initGraphView (container/data-island
  // absent would be a template bug, not a normal case here since this
  // script only loads on pages that declared a graph). The per-dossier
  // local graph has no full-layer URL (dataset.fullLayerUrl is
  // undefined) — only the global map does.
  document.querySelectorAll("[data-graph-view]").forEach(function (el) {
    initGraphView(el.id, el.dataset.dataIsland, el.dataset.fullLayerUrl);
  });
});
