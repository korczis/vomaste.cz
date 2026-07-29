// Relationship graph (Cytoscape.js) as an Alpine component. Alpine owns
// the UI-facing reactive state (filter chips, search, detail panel); the
// Cytoscape instance itself is kept as a plain closure variable, NOT on
// `this` — wrapping it in Alpine's reactive Proxy breaks its internal
// bookkeeping (the same reason a sibling project keeps its Cytoscape
// instance outside Alpine's reactive data on purpose).
import { resizeHandlers } from "./fullscreen.js";

var COLOR = { fact: "#4ade80", disputed: "#facc15", quote: "#93c5fd" };
var STATUS_LABEL_CS = { fact: "fakt", disputed: "sporné", quote: "citace" };
var KIND_GROUPS = {
  person: ["person", "person-other"],
  entity: ["party", "entity"],
  role: ["role"],
  case: ["case"],
};

function readGraphData() {
  var el = document.getElementById("dossier-graph-data");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    return null;
  }
}

export function registerRelationshipGraph() {
  window.Alpine.data("relationshipGraph", function () {
    var cy = null;
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

    return {
      activeKinds: { person: true, entity: true, role: true, case: true },
      activeStatuses: { fact: true, disputed: true, quote: true },
      search: "",
      visibleNodeCount: 0,
      totalNodeCount: 0,
      detailVisible: false,
      detailHtml: "",

      init() {
        var container = document.getElementById("cy");
        if (!container || !window.cytoscape) return;
        var data = readGraphData();
        if (!data || !data.nodes || !data.edges) return;

        var nodes = data.nodes.map(function (n) {
          return { data: { id: n.id, label: n.label, kind: n.kind }, classes: n.kind };
        });
        var edges = data.edges.map(function (e, i) {
          return { data: { id: "e" + i, source: e.source, target: e.target, label: e.label, status: e.status }, classes: e.status };
        });
        this.totalNodeCount = nodes.length;

        cy = window.cytoscape({
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
            { selector: "edge.fact", style: { "line-color": COLOR.fact, "target-arrow-color": COLOR.fact, "line-style": "solid" } },
            { selector: "edge.disputed", style: { "line-color": COLOR.disputed, "target-arrow-color": COLOR.disputed, "line-style": "dashed" } },
            { selector: "edge.quote", style: { "line-color": COLOR.quote, "target-arrow-color": COLOR.quote, "line-style": "dotted" } },
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

        var box = document.getElementById("cy-box");
        if (box && window.ResizeObserver) {
          var resizeTimer = null;
          new ResizeObserver(function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function () { cy.resize(); }, 120);
          }).observe(box);
        }

        var self = this;

        cy.on("tap", "node", function (evt) {
          var node = evt.target;
          cy.elements().removeClass("selected hovered-node faded");
          node.addClass("selected");
          node.connectedEdges().addClass("selected");
          cy.elements().not(node).not(node.connectedEdges()).not(node.connectedEdges().connectedNodes()).addClass("faded");
          self.showNodeDetail(node);
        });
        cy.on("tap", "edge", function (evt) {
          var edge = evt.target;
          cy.elements().removeClass("selected hovered-node faded");
          edge.addClass("selected");
          edge.connectedNodes().addClass("selected");
          cy.elements().not(edge).not(edge.connectedNodes()).addClass("faded");
          self.showEdgeDetail(edge);
        });
        cy.on("tap", function (evt) {
          if (evt.target === cy) {
            cy.elements().removeClass("selected hovered-node faded");
            self.detailVisible = false;
          }
        });

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

        this.applyFilters();
      },

      showNodeDetail(node) {
        var connected = node.connectedEdges().map(function (e) {
          var dir = e.source().id() === node.id() ? "→" : "←";
          var other = e.source().id() === node.id() ? e.target() : e.source();
          var statusLabel = STATUS_LABEL_CS[e.data("status")] || e.data("status");
          return "<li>" + dir + " <strong>" + other.data("label") + "</strong> — " + e.data("label") + " (" + statusLabel + ")</li>";
        });
        this.detailHtml =
          "<p class=\"font-semibold text-white\">" + node.data("label") + "</p>" +
          "<ul class=\"mt-2 space-y-1 text-white/70\">" + connected.join("") + "</ul>";
        this.detailVisible = true;
      },

      showEdgeDetail(edge) {
        var statusLabel = STATUS_LABEL_CS[edge.data("status")] || edge.data("status");
        this.detailHtml =
          "<p class=\"text-white/70\"><strong class=\"text-white\">" + edge.source().data("label") + "</strong> → " +
          edge.data("label") + " → <strong class=\"text-white\">" + edge.target().data("label") + "</strong></p>" +
          "<p class=\"mt-1 text-xs text-white/40\">Stav: " + statusLabel + "</p>";
        this.detailVisible = true;
      },

      zoom(action) {
        if (!cy) return;
        var center = { x: cy.width() / 2, y: cy.height() / 2 };
        if (action === "in") cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: center });
        if (action === "out") cy.zoom({ level: cy.zoom() * 0.75, renderedPosition: center });
        if (action === "fit") cy.fit(undefined, 30);
        if (action === "relayout") { cy.layout(LAYOUT).run(); cy.fit(undefined, 30); }
      },

      toggleKind(k) {
        this.activeKinds[k] = !this.activeKinds[k];
        this.applyFilters();
      },
      toggleStatus(s) {
        this.activeStatuses[s] = !this.activeStatuses[s];
        this.applyFilters();
      },

      applyFilters() {
        if (!cy) return;
        var activeKinds = this.activeKinds;
        var activeStatuses = this.activeStatuses;

        function kindGroupOf(kind) {
          var found = Object.keys(KIND_GROUPS).find(function (key) {
            return KIND_GROUPS[key].indexOf(kind) !== -1;
          });
          return found || kind;
        }

        cy.nodes().forEach(function (node) {
          node.scratch("_hiddenByFilter", !activeKinds[kindGroupOf(node.data("kind"))]);
        });
        cy.edges().forEach(function (edge) {
          var endsHidden = edge.source().scratch("_hiddenByFilter") || edge.target().scratch("_hiddenByFilter");
          edge.scratch("_hiddenByFilter", !activeStatuses[edge.data("status")] || endsHidden);
        });
        cy.elements().forEach(function (el) {
          if (el.scratch("_hiddenByFilter")) el.hide();
          else el.show();
        });

        var q = this.search.trim().toLowerCase();
        if (q) {
          cy.nodes().forEach(function (node) {
            var match = !node.hidden() && node.data("label").toLowerCase().indexOf(q) !== -1;
            node.toggleClass("search-match", match);
            node.toggleClass("faded", !node.hidden() && !match);
          });
        } else {
          cy.nodes().removeClass("search-match faded");
        }

        this.visibleNodeCount = cy.nodes().filter(function (n) { return !n.hidden(); }).length;
      },

      resetFilters() {
        this.activeKinds = { person: true, entity: true, role: true, case: true };
        this.activeStatuses = { fact: true, disputed: true, quote: true };
        this.search = "";
        this.applyFilters();
      },
    };
  });
}
