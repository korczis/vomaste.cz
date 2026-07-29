// Desktop collapsible sidebar (templates/base.html). Width/offset are
// driven by html[data-sidebar] — see static/css/input.css for why this
// can't be a plain Tailwind utility (the state is set by JS after load).
var SIDEBAR_STORAGE_KEY = "vomaste:sidebar";

export function initSidebarToggle() {
  var toggle = document.getElementById("sidebar-toggle");
  if (!toggle || toggle.dataset.appInit) return;
  toggle.dataset.appInit = "true";

  var root = document.documentElement;
  var stored;
  try {
    stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
  } catch (e) {
    stored = null; // localStorage can throw in locked-down/private contexts
  }
  if (stored === "expanded" || stored === "collapsed") {
    root.dataset.sidebar = stored;
    toggle.setAttribute("aria-expanded", String(stored === "expanded"));
  }

  toggle.addEventListener("click", function () {
    var next = root.dataset.sidebar === "collapsed" ? "expanded" : "collapsed";
    root.dataset.sidebar = next;
    toggle.setAttribute("aria-expanded", String(next === "expanded"));
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next);
    } catch (e) {
      // best-effort persistence only — a failure here shouldn't break the toggle
    }
  });
}
