// Two corrections to Flowbite's official docked-sidebar-via-Drawer technique
// (templates/base.html), both side effects of the same trick — the sidebar is
// one element that is a real Drawer on mobile and a permanently visible
// sidebar on desktop (`md:translate-x-0`):
//
//  1. Drawer.init() sets aria-hidden="true" on the target regardless of
//     viewport, so on desktop the sidebar ends up visible yet marked hidden
//     for assistive tech.
//  2. Flowbite does not maintain aria-expanded on the trigger, so the
//     hamburger never announces whether the menu is open.
//
// Both are mirrored from the drawer's own state (Flowbite toggles the
// `transform-none` / `-translate-x-full` classes), so this never fights the
// library — it only reflects what the Drawer already did. Runs after
// `window.load` too, because Flowbite wires its instances there (see
// node_modules/flowbite/lib/esm/index.js).
export function initSidebarAria() {
  var sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  var toggles = document.querySelectorAll('[data-drawer-toggle="sidebar"]');
  var mq = window.matchMedia("(min-width: 768px)");

  function isOpen() {
    return sidebar.classList.contains("transform-none");
  }

  function sync() {
    if (mq.matches) {
      sidebar.removeAttribute("aria-hidden");
    } else if (!isOpen()) {
      // Only on mobile and only when the drawer is actually closed —
      // Flowbite's own show()/hide() already set this on every toggle.
      sidebar.setAttribute("aria-hidden", "true");
    }
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute("aria-expanded", isOpen() ? "true" : "false");
    }
  }

  // The class flip is the only state change Flowbite emits without
  // registering per-instance callbacks, so observe it rather than wrapping
  // its API.
  new MutationObserver(sync).observe(sidebar, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("load", sync);
  mq.addEventListener("change", sync);
  sync();
}
