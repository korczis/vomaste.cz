// Real, JS-only-enhancement filter over the already-rendered claims table
// (content/dossier/_index.md's "Registr tvrzení" markdown table). Reads
// status/text straight off the rendered DOM — never duplicates or
// reinterprets the claim text, and without this script the full table is
// still there and fully usable.
import { copyToClipboard } from "./copy-link.js";

const STATUS_LABELS = {
  "status-corroborated": "CORROBORATED",
  "status-quote": "CITACE",
  "status-disputed": "SPORNÉ",
  "status-opinion": "NÁZOR",
  "status-ongoing": "PROBÍHÁ",
};

function findClaimsTable() {
  var heading = document.getElementById("registr-tvrzeni");
  if (!heading) return null;
  var node = heading.nextElementSibling;
  while (node && node.tagName !== "TABLE") node = node.nextElementSibling;
  return node;
}

function buildToolbar() {
  var wrap = document.createElement("div");
  wrap.className = "mb-4 flex flex-wrap items-end gap-3";
  wrap.setAttribute("role", "search");
  wrap.setAttribute("aria-label", "Filtrovat registr tvrzení");
  wrap.innerHTML =
    '<div class="flex flex-col gap-1">' +
    '<label for="clm-search" class="text-xs text-white/50">Hledat (ID, text, zdroj)</label>' +
    '<input type="text" id="clm-search" class="src-filter-input w-64" placeholder="např. CLM-07, Turek, SRC-15…" autocomplete="off">' +
    "</div>" +
    '<div class="flex flex-col gap-1">' +
    '<label for="clm-status-filter" class="text-xs text-white/50">Stav</label>' +
    '<select id="clm-status-filter" class="src-filter-select"><option value="">Všechny stavy</option></select>' +
    "</div>" +
    '<button type="button" id="clm-filter-reset" class="src-filter-reset">Zrušit filtry</button>' +
    '<p class="text-xs text-white/50"><span id="clm-result-count" aria-live="polite">0</span> z <span id="clm-total-count">0</span> tvrzení</p>';
  return wrap;
}

function decorateRow(row) {
  var badge = row.querySelector(".status-badge");
  var statusClass = badge
    ? Array.prototype.find.call(badge.classList, function (c) {
        return c.indexOf("status-") === 0 && c !== "status-badge";
      })
    : "";
  row.dataset.status = statusClass || "";
  row.dataset.search = row.textContent.toLowerCase();

  var anchor = row.querySelector('a[id^="clm-"]');
  if (anchor && !row.querySelector(".clm-copy-btn")) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "clm-copy-btn";
    btn.title = "Zkopírovat přímý odkaz na toto tvrzení";
    btn.setAttribute("aria-label", "Zkopírovat přímý odkaz na tvrzení " + anchor.id.toUpperCase());
    btn.textContent = "🔗";
    btn.addEventListener("click", function () {
      copyToClipboard(location.origin + location.pathname + "#" + anchor.id, btn);
    });
    anchor.insertAdjacentElement("afterend", btn);
  }
}

export function initClaimsFilter() {
  var table = findClaimsTable();
  if (!table || table.dataset.filterInit) return;
  table.dataset.filterInit = "true";

  var tbody = table.tBodies[0] || table;
  var rows = Array.prototype.slice.call(tbody.rows);
  if (!rows.length) return;

  rows.forEach(decorateRow);

  var toolbar = buildToolbar();
  table.parentNode.insertBefore(toolbar, table);

  var search = toolbar.querySelector("#clm-search");
  var statusSelect = toolbar.querySelector("#clm-status-filter");
  var reset = toolbar.querySelector("#clm-filter-reset");
  var countEl = toolbar.querySelector("#clm-result-count");
  var totalEl = toolbar.querySelector("#clm-total-count");

  var statuses = [];
  rows.forEach(function (r) {
    if (r.dataset.status && statuses.indexOf(r.dataset.status) === -1) statuses.push(r.dataset.status);
  });
  statuses.forEach(function (s) {
    var opt = document.createElement("option");
    opt.value = s;
    opt.textContent = STATUS_LABELS[s] || s;
    statusSelect.appendChild(opt);
  });
  totalEl.textContent = String(rows.length);

  function applyFilter() {
    var q = search.value.trim().toLowerCase();
    var status = statusSelect.value;
    var shown = 0;
    rows.forEach(function (row) {
      var matchesQ = !q || row.dataset.search.indexOf(q) !== -1;
      var matchesStatus = !status || row.dataset.status === status;
      var show = matchesQ && matchesStatus;
      row.hidden = !show;
      if (show) shown++;
    });
    countEl.textContent = String(shown);
  }

  search.addEventListener("input", applyFilter);
  statusSelect.addEventListener("change", applyFilter);
  reset.addEventListener("click", function () {
    search.value = "";
    statusSelect.value = "";
    applyFilter();
    search.focus();
  });

  applyFilter();
}
