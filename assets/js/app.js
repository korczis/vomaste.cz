// Single esbuild entrypoint.
//
// Flowbite self-initializes any component it finds via data-* attributes
// (Drawer, Dropdown, Modal, ...) on the window `load` event — imported for
// side effects only, nothing to wire up here.
import "flowbite";

// Alpine.js is used the same way as Chart.js/Cytoscape.js here: a targeted,
// per-page dependency for genuinely interactive UI (filter toolbars, the
// relationship graph's chips/detail panel), not a site-wide framework.
// Components are registered on `alpine:init` (Alpine's own required
// pattern) and each checks its own DOM in `init()`, so it's a safe no-op
// on pages that don't have that feature.
import Alpine from "alpinejs";
import { registerClaimsFilter } from "./modules/claims-filter.js";
import { registerSourcesFilter } from "./modules/sources-filter.js";
import { registerRelationshipGraph } from "./modules/relationship-graph.js";

import { initSectionNav } from "./modules/section-nav.js";
import { initStatusChart } from "./modules/charts.js";
import { initFullscreenButtons } from "./modules/fullscreen.js";
import { initSidebarAria } from "./modules/shell.js";

document.addEventListener("alpine:init", function () {
  registerClaimsFilter();
  registerSourcesFilter();
  registerRelationshipGraph();
});

window.Alpine = Alpine;
Alpine.start();

document.addEventListener("DOMContentLoaded", function () {
  initSectionNav();
  initStatusChart();
  // Registers the graph's resize handler as a side effect of Alpine's own
  // init() (see relationship-graph.js), so this can safely run after
  // Alpine.start() above has already initialized the component.
  initFullscreenButtons();
  initSidebarAria();
});
