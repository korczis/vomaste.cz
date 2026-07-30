// Single esbuild entrypoint.
//
// Flowbite self-initializes any component it finds via data-* attributes
// (Drawer, Dropdown, Modal, ...) on the window `load` event — imported for
// side effects only, nothing to wire up here.
import "flowbite";

// Alpine.js is used the same way as Chart.js/Cytoscape.js here: a targeted,
// per-page dependency for genuinely interactive UI (filter toolbars, the
// global search box), not a site-wide framework. Components are registered
// on `alpine:init` (Alpine's own required pattern) and each checks its own
// DOM in `init()`, so it's a safe no-op on pages that don't have that
// feature.
import Alpine from "alpinejs";
import { registerClaimsFilter } from "./modules/claims-filter.js";
import { registerSourcesFilter } from "./modules/sources-filter.js";
import { registerTableFilter } from "./modules/table-filter.js";
import { registerGlobalSearch, initSearchShortcuts } from "./modules/global-search.js";

import { initSectionNav } from "./modules/section-nav.js";
import { initStatusChart } from "./modules/charts.js";
import { initFullscreenButtons } from "./modules/fullscreen.js";
import { initSidebarAria } from "./modules/shell.js";
import { initGraphView } from "./modules/graph-view.js";
import { initSqlConsole } from "./modules/sql-console.js";

document.addEventListener("alpine:init", function () {
  registerClaimsFilter();
  registerSourcesFilter();
  registerTableFilter();
  registerGlobalSearch();
});

window.Alpine = Alpine;
Alpine.start();

document.addEventListener("DOMContentLoaded", function () {
  initSearchShortcuts();
  initSectionNav();
  initStatusChart();
  initFullscreenButtons();
  initSidebarAria();
  initSqlConsole();
  // Both checked defensively inside initGraphView (container/data-island
  // absent on pages without a graph) — the per-dossier local graph and the
  // global map each carry their own container/data-island/search-index ids.
  document.querySelectorAll("[data-graph-view]").forEach(function (el) {
    initGraphView(el.id, el.dataset.dataIsland, el.dataset.searchIndexUrl);
  });
});
