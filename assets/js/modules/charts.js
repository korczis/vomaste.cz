// Status doughnut chart. Counts are derived from the already-rendered
// claims table's status badges (single source of truth — never a second,
// hand-maintained count that could drift from the actual table).
//
// Dva způsoby, jak se ten záměr rozešel se skutečností, oba opravené
// 2026-08-13:
//
//   1. Selektor bral VŠECHNY odznaky v próze, tedy i ty na kartách kauz.
//      Na macinka-turek to dělalo 60 místo 55 a nafukovalo každou
//      kategorii — přitom dlaždice o kus výš hlásila 55 z view modelu.
//      Dvě čísla o téže věci na jedné obrazovce, obě „automaticky
//      spočítaná". Odznak tvrzení je vždy v buňce tabulky, karta kauzy
//      nikdy; selektor to teď rozlišuje.
//   2. Barvy byly druhou ručně psanou kopií palety z input.css a tři
//      z pěti už se rozešly (odznak a jeho výseč měly pro tentýž stav
//      jinou barvu). Čtou se proto za běhu z týchž CSS proměnných, které
//      obarvují odznak — druhý zdroj pravdy tím mizí, ne se srovnává.
import { resizeHandlers } from "./fullscreen.js";

var STATUS_LABELS = {
  "status-corroborated": "Ověřeno více zdroji",
  "status-single": "Doloženo 1 zdrojem",
  "status-quote": "Citace",
  "status-disputed": "Sporné",
  "status-opinion": "Názor",
  "status-ongoing": "Probíhá",
};
// Nouzová záloha pro případ, že se CSS proměnná nepřečte (nenačtené nebo
// jinak sestavené CSS). Není to paleta — je to poslední pojistka, aby graf
// nezmizel; barvy vlastní input.css.
var STATUS_COLOR_FALLBACK = "rgba(255, 255, 255, 0.6)";

function statusColor(key) {
  var v = getComputedStyle(document.documentElement).getPropertyValue("--" + key + "-fg");
  v = v && v.trim();
  return v || STATUS_COLOR_FALLBACK;
}

export function initStatusChart() {
  var canvas = document.getElementById("chart-status");
  if (!canvas || !window.Chart || canvas.dataset.chartInit) return;
  canvas.dataset.chartInit = "true";

  var counts = {};
  document.querySelectorAll(".dossier-prose table td .status-badge").forEach(function (el) {
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
      datasets: [{ data: keys.map(function (k) { return counts[k]; }), backgroundColor: keys.map(statusColor) }],
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
