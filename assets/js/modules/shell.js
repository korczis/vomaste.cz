// Accessibility state for the docked-sidebar Drawer (templates/base.html).
//
// The sidebar is one element that is a real Flowbite Drawer on mobile and a
// permanently visible sidebar on desktop (`md:translate-x-0`). Flowbite owns
// every behaviour (open, close, backdrop, body scroll); this module only
// reflects the Drawer's own state into ARIA, through Flowbite's public API
// (`FlowbiteInstances.getInstance` + `updateOnShow` / `updateOnHide`):
//
//  1. Drawer.init() sets aria-hidden="true" on the target regardless of
//     viewport, so on desktop the sidebar would be visible yet hidden for
//     assistive tech.
//  2. Flowbite does not maintain aria-expanded on the triggers, so the
//     hamburger would never announce whether the menu is open.
//  3. aria-hidden alone leaves the links of a closed drawer reachable by Tab;
//     `inert` removes the whole subtree from tab order and the a11y tree
//     (axe aria-hidden-focus, mobile project of the browser tests).
//
// Flowbite creates its instances on `window.load` (flowbite/lib/esm/index.js),
// and its listener is registered first because app.js imports it first.
export function initSidebarAria() {
  var sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  // Triggers are found by the ARIA relation they declare, not by Flowbite's
  // data attributes: Flowbite wires them, this only mirrors their state.
  var triggers = document.querySelectorAll('[aria-controls="sidebar"]');
  var mq = window.matchMedia("(min-width: 768px)");
  var drawer = null;

  function isOpen() {
    // Without a registry instance, read the class Flowbite toggles on show().
    return drawer ? drawer.isVisible() : sidebar.classList.contains("transform-none");
  }

  function sync() {
    var open = isOpen();
    if (mq.matches) {
      sidebar.removeAttribute("aria-hidden");
      sidebar.removeAttribute("inert");
    } else if (!open) {
      sidebar.setAttribute("aria-hidden", "true");
      sidebar.setAttribute("inert", "");
    } else {
      sidebar.removeAttribute("inert");
    }
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  window.addEventListener("load", function () {
    var registry = window.FlowbiteInstances;
    drawer = registry ? registry.getInstance("Drawer", "sidebar") : null;
    if (drawer) {
      drawer.updateOnShow(sync);
      drawer.updateOnHide(sync);
    } else {
      // Registry missing (Flowbite not loaded, or a version without
      // FlowbiteInstances): warn instead of failing silently, and fall back
      // to observing the transform-none / -translate-x-full class flip.
      console.warn("shell.js: no Flowbite Drawer instance for #sidebar; observing classes.");
      new MutationObserver(sync).observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    }
    sync();
  });
  mq.addEventListener("change", sync);
  sync();
}
