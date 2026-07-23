// Flowbite self-initializes any component it finds via data-* attributes
// (Drawer, Dropdown, Modal, ...) on DOMContentLoaded. Nothing else needed
// until a page actually uses one of those components.
import "flowbite";

const SIDEBAR_STORAGE_KEY = "vomaste:sidebar";

function initSidebarToggle() {
  var toggle = document.getElementById("sidebar-toggle");
  if (!toggle || toggle.dataset.appInit) return;
  toggle.dataset.appInit = "true";

  var root = document.documentElement;
  var stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored === "expanded" || stored === "collapsed") {
    root.dataset.sidebar = stored;
    toggle.setAttribute("aria-expanded", String(stored === "expanded"));
  }

  toggle.addEventListener("click", function () {
    var next = root.dataset.sidebar === "collapsed" ? "expanded" : "collapsed";
    root.dataset.sidebar = next;
    toggle.setAttribute("aria-expanded", String(next === "expanded"));
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initSidebarToggle();
});
