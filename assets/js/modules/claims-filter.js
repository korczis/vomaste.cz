// Alpine component backing the static filter toolbar now embedded directly
// in content/dossier/_index.md (right before the claims table). The table
// itself stays exactly as markdown-rendered it — this only decorates rows
// with copy-link buttons and applies the reactive search/status state.
import { copyToClipboard } from "./copy-link.js";

function findClaimsTable() {
  var heading = document.getElementById("registr-tvrzeni");
  if (!heading) return null;
  var node = heading.nextElementSibling;
  while (node && node.tagName !== "TABLE") node = node.nextElementSibling;
  return node;
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

export function registerClaimsFilter() {
  window.Alpine.data("claimsFilter", function () {
    return {
      search: "",
      status: "",
      total: 0,
      visible: 0,
      rows: [],

      init() {
        var table = findClaimsTable();
        if (!table) return;
        var tbody = table.tBodies[0] || table;
        this.rows = Array.prototype.slice.call(tbody.rows);
        if (!this.rows.length) return;
        this.rows.forEach(decorateRow);
        this.total = this.rows.length;
        this.apply();
      },

      apply() {
        var q = this.search.trim().toLowerCase();
        var status = this.status;
        var shown = 0;
        this.rows.forEach(function (row) {
          var matchesQ = !q || row.dataset.search.indexOf(q) !== -1;
          var matchesStatus = !status || row.dataset.status === status;
          var show = matchesQ && matchesStatus;
          row.hidden = !show;
          if (show) shown++;
        });
        this.visible = shown;
      },
    };
  });
}
