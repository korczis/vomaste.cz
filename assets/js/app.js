// Single esbuild entrypoint.
//
// Flowbite self-initializes any component it finds via data-* attributes
// (Drawer, Dropdown, Modal, ...) on the window `load` event — imported for
// side effects only, nothing to wire up here.
import "flowbite";

// Alpine.js is used the same way as Chart.js/Sigma.js here: a targeted,
// per-page dependency for genuinely interactive UI (filter toolbars, the
// global search box), not a site-wide framework. Components are registered
// on `alpine:init` (Alpine's own required pattern) and each checks its own
// DOM in `init()`, so it's a safe no-op on pages that don't have that
// feature.
import Alpine from "alpinejs";
import { registerClaimsFilter } from "./modules/claims-filter.js";
import { registerTableFilter } from "./modules/table-filter.js";
import { registerGlobalSearch, initSearchShortcuts } from "./modules/global-search.js";

import { initSectionNav } from "./modules/section-nav.js";
import { initStatusChart } from "./modules/charts.js";
import { initFullscreenButtons } from "./modules/fullscreen.js";
import { initSidebarAria } from "./modules/shell.js";
import { initSqlConsole } from "./modules/sql-console.js";
// Sigma/Graphology (assets/js/modules/graph/index.js) are NOT imported here —
// they're a separate entrypoint (assets/js/graph-app.js, built to
// static/js/graph-app.js) loaded only by pages with a graph
// (templates/base.html's extra_js block), so every other page's bundle
// stays free of a renderer it never uses (mission § 5).

document.addEventListener("alpine:init", function () {
  registerClaimsFilter();
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
});
