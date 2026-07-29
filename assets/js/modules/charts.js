// Status doughnut chart. Counts are derived from the already-rendered
// claims table's status badges (single source of truth — never a second,
// hand-maintained count that could drift from the actual table).
import { resizeHandlers } from "./fullscreen.js";

var STATUS_LABELS = {
  "status-corroborated": "Ověřeno více zdroji",
  "status-quote": "Citace",
  "status-disputed": "Sporné",
  "status-opinion": "Názor",
  "status-ongoing": "Probíhá",
};
var STATUS_COLORS = {
  "status-corroborated": "#4ade80",
  "status-quote": "#93c5fd",
  "status-disputed": "#facc15",
  "status-opinion": "#a3a3a3",
  "status-ongoing": "#d8b4fe",
};

export function initStatusChart() {
  var canvas = document.getElementById("chart-status");
  if (!canvas || !window.Chart || canvas.dataset.chartInit) return;
  canvas.dataset.chartInit = "true";

  var counts = {};
  document.querySelectorAll(".dossier-prose .status-badge").forEach(function (el) {
    var key = Array.prototype.find.call(el.classList, function (c) {
      return c.indexOf("status-") === 0 && c !== "status-badge";
    });
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  var keys = Object.keys(counts);
  if (!keys.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Koláčový graf rozložení tvrzení podle stavu ověřenosti: " +
      keys.map(function (k) { return (STATUS_LABELS[k] || k) + ": " + counts[k]; }).join(", "),
  );

  var chart = new window.Chart(canvas, {
    type: "doughnut",
    data: {
      labels: keys.map(function (k) { return STATUS_LABELS[k] || k; }),
      datasets: [{ data: keys.map(function (k) { return counts[k]; }), backgroundColor: keys.map(function (k) { return STATUS_COLORS[k] || "#666"; }) }],
    },
    options: {
      maintainAspectRatio: false,
      animation: reduceMotion ? false : undefined,
      plugins: {
        legend: { labels: { color: "#fff", font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var total = keys.reduce(function (sum, k) { return sum + counts[k]; }, 0);
              var pct = Math.round((ctx.parsed / total) * 100);
              return ctx.label + ": " + ctx.parsed + " tvrzení (" + pct + " %)";
            },
          },
        },
      },
    },
  });

  // Visible textual summary — not just an aria-label — so the same
  // information survives for anyone not rendering the canvas at all.
  var summaryHost = document.getElementById("chart-status-summary");
  if (summaryHost) {
    summaryHost.innerHTML = keys
      .map(function (k) {
        return '<li><span class="status-badge ' + k + ' m-0">' + (STATUS_LABELS[k] || k) + "</span> " + counts[k] + "×</li>";
      })
      .join("");
  }

  resizeHandlers["chart-status-box"] = function () {
    chart.resize();
  };
}
