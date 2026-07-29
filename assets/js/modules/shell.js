// Corrects the one known side effect of Flowbite's official
// docked-sidebar-via-Drawer technique (templates/base.html): Drawer.init()
// always sets aria-hidden="true" on the target regardless of viewport, but
// on desktop the sidebar is forced visible with a `md:translate-x-0`
// override — leaving it visually shown yet marked aria-hidden. Runs after
// `window.load` so Flowbite's own Drawer instance (wired on `load`, see
// node_modules/flowbite/lib/esm/index.js) already exists.
export function initSidebarAria() {
  var sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  var mq = window.matchMedia("(min-width: 768px)");

  function sync() {
    if (mq.matches) {
      sidebar.removeAttribute("aria-hidden");
    } else if (!sidebar.classList.contains("transform-none")) {
      // Only restore aria-hidden if the drawer is actually closed on
      // mobile — Flowbite's own show()/hide() already set this correctly
      // whenever the user toggles it; this just re-applies it after a
      // desktop-to-mobile resize where our own removal above left it unset.
      sidebar.setAttribute("aria-hidden", "true");
    }
  }

  window.addEventListener("load", sync);
  mq.addEventListener("change", sync);
}
