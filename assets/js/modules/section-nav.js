// Scroll-spy for the dossier's sticky "on this page" quick-nav
// (templates/dossier.html). Purely an orientation aid — every link
// already works as a plain anchor without this; this only adds the
// active-section highlight as you scroll.
export function initSectionNav() {
  var nav = document.querySelector('nav[aria-label="Sekce dossieru"]');
  if (!nav || nav.dataset.spyInit || !window.IntersectionObserver) return;
  nav.dataset.spyInit = "true";

  var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
  var targets = links
    .map(function (link) {
      var el = document.getElementById(link.getAttribute("href").slice(1));
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);
  if (!targets.length) return;

  function setActive(link) {
    links.forEach(function (l) {
      var isActive = l === link;
      l.classList.toggle("quick-nav-active", isActive);
      if (isActive) l.setAttribute("aria-current", "location");
      else l.removeAttribute("aria-current");
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      // Pick the entry closest to the top of the viewport among those
      // currently intersecting — avoids flicker when several short
      // sections are visible at once.
      var visible = entries.filter(function (e) { return e.isIntersecting; });
      if (!visible.length) return;
      visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      var match = targets.find(function (t) { return t.el === visible[0].target; });
      if (match) setActive(match.link);
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
  );

  targets.forEach(function (t) { observer.observe(t.el); });
}
