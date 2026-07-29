// Real client-side filter over the already-rendered sources registry
// (templates/dossier-sources-index.html). Dropdown options are built from
// whatever actually appears on the page, never a hardcoded list that can
// drift from the real data.
export function initSourcesFilter() {
  var form = document.getElementById("src-filter-form");
  if (!form || form.dataset.filterInit) return;
  form.dataset.filterInit = "true";

  var search = document.getElementById("src-search");
  var typeSelect = document.getElementById("src-type-filter");
  var familySelect = document.getElementById("src-family-filter");
  var reset = document.getElementById("src-filter-reset");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".src-card"));
  var countEl = document.getElementById("src-result-count");
  var emptyEl = document.getElementById("src-empty-state");

  var types = [];
  var families = [];
  cards.forEach(function (c) {
    var t = c.getAttribute("data-type");
    if (t && types.indexOf(t) === -1) types.push(t);
    var f = c.getAttribute("data-family");
    if (f && families.indexOf(f) === -1) families.push(f);
  });
  types.sort();
  types.forEach(function (t) {
    var opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });
  families.sort();
  families.forEach(function (f) {
    var opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    familySelect.appendChild(opt);
  });

  function applyFilter() {
    var q = search.value.trim().toLowerCase();
    var type = typeSelect.value;
    var family = familySelect.value;
    var shown = 0;
    cards.forEach(function (c) {
      var matchesQ = !q || c.getAttribute("data-search").toLowerCase().indexOf(q) !== -1;
      var matchesType = !type || c.getAttribute("data-type") === type;
      var matchesFamily = !family || c.getAttribute("data-family") === family;
      var show = matchesQ && matchesType && matchesFamily;
      c.hidden = !show;
      if (show) shown++;
    });
    if (countEl) countEl.textContent = String(shown);
    if (emptyEl) emptyEl.classList.toggle("hidden", shown !== 0);
  }

  search.addEventListener("input", applyFilter);
  typeSelect.addEventListener("change", applyFilter);
  familySelect.addEventListener("change", applyFilter);
  reset.addEventListener("click", function () {
    search.value = "";
    typeSelect.value = "";
    familySelect.value = "";
    applyFilter();
    search.focus();
  });
}
