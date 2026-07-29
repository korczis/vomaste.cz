// Relationship graph (Cytoscape.js). Data comes from a JSON island written
// by the template from data/relationship-graph.toml (see that file's
// header comment for why it's treated as dossier content, not decoration).
import { resizeHandlers } from "./fullscreen.js";

var COLOR = { fact: "#4ade80", disputed: "#facc15", quote: "#93c5fd" };

var KIND_GROUPS = [
  { key: "person", label: "Osoba", kinds: ["person", "person-other"] },
  { key: "entity", label: "Strana / instituce", kinds: ["party", "entity"] },
  { key: "role", label: "Role", kinds: ["role"] },
  { key: "case", label: "Kauza", kinds: ["case"] },
];
var STATUS_GROUPS = [
  { key: "fact", label: "Fakt" },
  { key: "disputed", label: "Sporné" },
  { key: "quote", label: "Citace" },
];

function readGraphData() {
  var el = document.getElementById("dossier-graph-data");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    return null;
  }
}

function chipButton(label, active) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cy-chip";
  btn.setAttribute("aria-pressed", active ? "true" : "false");
  btn.textContent = label;
  return btn;
}

export function initRelationshipGraph() {
  var container = document.getElementById("cy");
  if (!container || !window.cytoscape || container.dataset.cyInit) return;

  var data = readGraphData();
  if (!data || !data.nodes || !data.edges) return;
  container.dataset.cyInit = "true";

  var nodes = data.nodes.map(function (n) {
    return { data: { id: n.id, label: n.label, kind: n.kind }, classes: n.kind };
  });
  var edges = data.edges.map(function (e, i) {
    return { data: { id: "e" + i, source: e.source, target: e.target, label: e.label, status: e.status }, classes: e.status };
  });

  var LAYOUT = {
    name: "cose",
    animate: false,
    padding: 50,
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: function () { return 22000; },
    idealEdgeLength: function () { return 160; },
    edgeElasticity: function () { return 120; },
    nestingFactor: 5,
    gravity: 30,
    numIter: 2000,
    initialTemp: 220,
    coolingFactor: 0.95,
    minTemp: 1.0,
  };

  var cy = window.cytoscape({
    container: container,
    elements: { nodes: nodes, edges: edges },
    wheelSensitivity: 0.25,
    style: [
      { selector: "node", style: {
        "background-color": "#f3e5c0", "color": "#fff", "label": "data(label)",
        "font-size": "9px", "text-valign": "bottom", "text-margin-y": 8,
        "text-wrap": "wrap", "text-max-width": "80px", "text-halign": "center",
        "text-outline-width": 2, "text-outline-color": "#000", "text-outline-opacity": 0.85,
        "width": 20, "height": 20, "border-width": 2, "border-color": "rgba(255,255,255,0.35)",
      } },
      { selector: ".person, .person-other", style: { "background-color": "#f3e5c0", "shape": "ellipse" } },
      { selector: ".party, .entity", style: { "background-color": "#93c5fd", "shape": "round-rectangle" } },
      { selector: ".role", style: { "background-color": "#d8b4fe", "shape": "diamond" } },
      { selector: ".case", style: { "background-color": "#facc15", "shape": "round-rectangle" } },
      { selector: "edge", style: { "width": 1.5, "curve-style": "bezier", "target-arrow-shape": "triangle", "arrow-scale": 0.7 } },
      { selector: "edge.fact", style: { "line-color": COLOR.fact, "target-arrow-color": COLOR.fact } },
      { selector: "edge.disputed", style: { "line-color": COLOR.disputed, "target-arrow-color": COLOR.disputed } },
      { selector: "edge.quote", style: { "line-color": COLOR.quote, "target-arrow-color": COLOR.quote } },
      { selector: "edge:active, edge.hovered, edge.selected", style: { "width": 3, "opacity": 1 } },
      { selector: "node.hovered-node, node.selected", style: { "border-color": "#f3e5c0", "border-width": 3 } },
      { selector: "node.search-match", style: { "border-color": "#4ade80", "border-width": 3 } },
      { selector: ".faded", style: { "opacity": 0.15 } },
    ],
    layout: LAYOUT,
    minZoom: 0.3,
    maxZoom: 3,
  });

  resizeHandlers["cy-box"] = function () {
    cy.resize();
    cy.layout(LAYOUT).run();
    cy.fit(undefined, 30);
  };

  // --- robust resize: container size can change from causes other than
  //     the fullscreen toggle (viewport resize, sidebar collapse, drawer
  //     open) — a ResizeObserver on the box catches all of them.
  var box = document.getElementById("cy-box");
  if (box && window.ResizeObserver) {
    var resizeTimer = null;
    new ResizeObserver(function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        cy.resize();
      }, 120);
    }).observe(box);
  }

  // --- detail panel: click-accessible (works via touch too), not
  //     hover-only. Hover tooltip below is a bonus for mouse users, not
  //     the only way to reach this information (see also the always-
  //     present text-list fallback in the template).
  var detail = document.getElementById("cy-detail");
  function showNodeDetail(node) {
    if (!detail) return;
    var connected = node.connectedEdges().map(function (e) {
      var dir = e.source().id() === node.id() ? "→" : "←";
      var other = e.source().id() === node.id() ? e.target() : e.source();
      return "<li>" + dir + " <strong>" + other.data("label") + "</strong> — " + e.data("label") + " (" + e.data("status") + ")</li>";
    });
    detail.innerHTML =
      "<p class=\"font-semibold text-white\">" + node.data("label") + "</p>" +
      "<ul class=\"mt-2 space-y-1 text-white/70\">" + connected.join("") + "</ul>";
    detail.classList.remove("hidden");
  }
  function showEdgeDetail(edge) {
    if (!detail) return;
    detail.innerHTML =
      "<p class=\"text-white/70\"><strong class=\"text-white\">" + edge.source().data("label") + "</strong> → " +
      edge.data("label") + " → <strong class=\"text-white\">" + edge.target().data("label") + "</strong></p>" +
      "<p class=\"mt-1 text-xs text-white/40\">Stav: " + edge.data("status") + "</p>";
    detail.classList.remove("hidden");
  }
  function clearDetail() {
    if (detail) detail.classList.add("hidden");
  }

  cy.on("tap", "node", function (evt) {
    var node = evt.target;
    cy.elements().removeClass("selected hovered-node faded");
    node.addClass("selected");
    node.connectedEdges().addClass("selected");
    cy.elements().not(node).not(node.connectedEdges()).not(node.connectedEdges().connectedNodes()).addClass("faded");
    showNodeDetail(node);
  });
  cy.on("tap", "edge", function (evt) {
    var edge = evt.target;
    cy.elements().removeClass("selected hovered-node faded");
    edge.addClass("selected");
    edge.connectedNodes().addClass("selected");
    cy.elements().not(edge).not(edge.connectedNodes()).addClass("faded");
    showEdgeDetail(edge);
  });
  cy.on("tap", function (evt) {
    if (evt.target === cy) {
      cy.elements().removeClass("selected hovered-node faded");
      clearDetail();
    }
  });

  // --- hover tooltip (desktop mouse convenience, not the only path) ---
  var tooltip = document.getElementById("cy-tooltip");
  if (tooltip) {
    cy.on("mouseover", "edge", function (evt) {
      var edge = evt.target;
      edge.addClass("hovered");
      tooltip.textContent = edge.source().data("label") + " → " + edge.data("label") + " → " + edge.target().data("label");
      tooltip.hidden = false;
      var box2 = container.getBoundingClientRect();
      var p = edge.renderedMidpoint();
      tooltip.style.left = Math.min(Math.max(p.x, 60), box2.width - 60) + "px";
      tooltip.style.top = Math.max(p.y - 28, 4) + "px";
    });
    cy.on("mouseout", "edge", function (evt) {
      evt.target.removeClass("hovered");
      tooltip.hidden = true;
    });
  }

  // --- zoom / fit / relayout controls (unchanged behavior) ---
  document.querySelectorAll("#cy-box .cy-controls [data-cy-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-cy-action");
      var center = { x: cy.width() / 2, y: cy.height() / 2 };
      if (action === "zoom-in") cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: center });
      if (action === "zoom-out") cy.zoom({ level: cy.zoom() * 0.75, renderedPosition: center });
      if (action === "fit") cy.fit(undefined, 30);
      if (action === "relayout") { cy.layout(LAYOUT).run(); cy.fit(undefined, 30); }
    });
  });

  // --- kind / status filter chips + search — real filtering (cy hide/show),
  //     not just visual fading, so "shown" counts are meaningful. ---
  var kindFilterHost = document.getElementById("cy-kind-filters");
  var statusFilterHost = document.getElementById("cy-status-filters");
  var search = document.getElementById("cy-search");
  var reset = document.getElementById("cy-filter-reset");
  var visibleCountEl = document.getElementById("cy-visible-count");
  var totalCountEl = document.getElementById("cy-total-count");

  var activeKinds = {};
  var activeStatuses = {};
  KIND_GROUPS.forEach(function (g) { activeKinds[g.key] = true; });
  STATUS_GROUPS.forEach(function (g) { activeStatuses[g.key] = true; });

  function kindGroupOf(kind) {
    var g = KIND_GROUPS.find(function (g) { return g.kinds.indexOf(kind) !== -1; });
    return g ? g.key : kind;
  }

  function applyFilters() {
    var q = search && search.value.trim().toLowerCase();
    cy.nodes().forEach(function (node) {
      var kindOk = activeKinds[kindGroupOf(node.data("kind"))];
      node.scratch("_hiddenByFilter", !kindOk);
    });
    cy.edges().forEach(function (edge) {
      var statusOk = activeStatuses[edge.data("status")];
      var endsHidden = edge.source().scratch("_hiddenByFilter") || edge.target().scratch("_hiddenByFilter");
      edge.scratch("_hiddenByFilter", !statusOk || endsHidden);
    });
    cy.elements().forEach(function (el) {
      if (el.scratch("_hiddenByFilter")) el.hide();
      else el.show();
    });

    if (q) {
      cy.nodes().forEach(function (node) {
        var match = !node.hidden() && node.data("label").toLowerCase().indexOf(q) !== -1;
        node.toggleClass("search-match", match);
        node.toggleClass("faded", !node.hidden() && !match);
      });
    } else {
      cy.nodes().removeClass("search-match faded");
    }

    var visible = cy.nodes().filter(function (n) { return !n.hidden(); }).length;
    if (visibleCountEl) visibleCountEl.textContent = String(visible);
  }

  KIND_GROUPS.forEach(function (g) {
    var btn = chipButton(g.label, true);
    btn.addEventListener("click", function () {
      activeKinds[g.key] = !activeKinds[g.key];
      btn.setAttribute("aria-pressed", activeKinds[g.key] ? "true" : "false");
      applyFilters();
    });
    if (kindFilterHost) kindFilterHost.appendChild(btn);
  });
  STATUS_GROUPS.forEach(function (g) {
    var btn = chipButton(g.label, true);
    btn.addEventListener("click", function () {
      activeStatuses[g.key] = !activeStatuses[g.key];
      btn.setAttribute("aria-pressed", activeStatuses[g.key] ? "true" : "false");
      applyFilters();
    });
    if (statusFilterHost) statusFilterHost.appendChild(btn);
  });
  if (search) search.addEventListener("input", applyFilters);
  if (reset) {
    reset.addEventListener("click", function () {
      KIND_GROUPS.forEach(function (g) { activeKinds[g.key] = true; });
      STATUS_GROUPS.forEach(function (g) { activeStatuses[g.key] = true; });
      if (kindFilterHost) kindFilterHost.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "true"); });
      if (statusFilterHost) statusFilterHost.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "true"); });
      if (search) search.value = "";
      applyFilters();
    });
  }

  if (totalCountEl) totalCountEl.textContent = String(nodes.length);
  applyFilters();
}
