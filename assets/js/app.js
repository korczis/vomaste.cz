// Single esbuild entrypoint. Each module below checks for its own DOM
// before doing anything, so it's a safe no-op on pages that don't have
// that feature — this file doesn't need to know which page it's on.
//
// Flowbite self-initializes any component it finds via data-* attributes
// (Drawer, Dropdown, Modal, ...) on DOMContentLoaded — imported for side
// effects only, nothing to wire up here.
import "flowbite";

import { initSidebarToggle } from "./modules/sidebar.js";
import { initSectionNav } from "./modules/section-nav.js";
import { initClaimsFilter } from "./modules/claims-filter.js";
import { initSourcesFilter } from "./modules/sources-filter.js";
import { initStatusChart } from "./modules/charts.js";
import { initRelationshipGraph } from "./modules/relationship-graph.js";
import { initFullscreenButtons } from "./modules/fullscreen.js";

document.addEventListener("DOMContentLoaded", function () {
  initSidebarToggle();
  initSectionNav();
  initClaimsFilter();
  initSourcesFilter();
  initStatusChart();
  initRelationshipGraph();
  // Registers resize handlers first (charts/graph above), then wires the
  // fullscreen buttons that call them — order matters here.
  initFullscreenButtons();
});
