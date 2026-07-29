// Relationship graph (Cytoscape.js) as an Alpine component. Data comes
// from data/dossier/graph.toml via a JSON island (see templates/dossier.html)
// — every node/edge here is a projection of the claims/sources registry,
// not a parallel source of truth (see that file's header comment).
//
// Alpine owns UI-facing reactive state (filters, depth, selection, detail
// panel); the Cytoscape instance is kept as a plain closure variable, NOT
// on `this` — wrapping it in Alpine's reactive Proxy breaks its internal
// bookkeeping (the same reason a sibling project keeps its Cytoscape
// instance outside Alpine's reactive data on purpose).
import { resizeHandlers } from "./fullscreen.js";
import { copyToClipboard } from "./copy-link.js";

var COLOR = { corroborated: "#4ade80", disputed: "#facc15", quote: "#93c5fd", contextual: "rgba(255,255,255,0.35)" };
var STATUS_LABEL_CS = { corroborated: "fakt", disputed: "sporné", quote: "citace", contextual: "kontextové" };
var KIND_GROUPS = {
  person: ["person"],
  entity: ["political_party", "public_institution", "company", "organization"],
  role: ["role"],
  case: ["controversy", "event", "legal_or_administrative_process"],
};
function kindGroupOf(type) {
  var found = Object.keys(KIND_GROUPS).find(function (key) { return KIND_GROUPS[key].indexOf(type) !== -1; });
  return found || type;
}

function readGraphData() {
  var el = document.getElementById("dossier-graph-data");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    return null;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

export function registerRelationshipGraph() {
  window.Alpine.data("relationshipGraph", function () {
    var cy = null;
    var data = null; // raw {nodes, edges, clusters, source_families} from the JSON island
    var nodeById = {};
    var adjacency = {}; // id -> Set of neighbor ids (undirected), for path/expand logic
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
      activeStatuses: { corroborated: true, disputed: true, quote: true, contextual: true },
      maxDepth: 1,
      cluster: "",
      search: "",
      visibleNodeCount: 0,
      totalNodeCount: 0,
      hiddenNeighborCount: 0,
      detailVisible: false,
      detailHtml: "",
      clusters: [],
      forceVisible: {},

      init() {
        var container = document.getElementById("cy");
        if (!container || !window.cytoscape) return;
        data = readGraphData();
        if (!data || !data.nodes || !data.edges) return;
        this.clusters = data.clusters || [];

        data.nodes.forEach(function (n) { nodeById[n.id] = n; adjacency[n.id] = {}; });
        data.edges.forEach(function (e) {
          if (adjacency[e.source] && adjacency[e.target]) {
            adjacency[e.source][e.target] = true;
            adjacency[e.target][e.source] = true;
          }
        });

        var nodes = data.nodes.map(function (n) {
          return { data: { id: n.id, label: n.label, type: n.type, depth: n.depth, cluster: n.cluster || "" }, classes: kindGroupOf(n.type) };
        });
        var edges = data.edges.map(function (e) {
          return { data: { id: e.id, source: e.source, target: e.target, label: e.label, status: e.status, relation: e.relation }, classes: e.status };
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
            { selector: ".person", style: { "background-color": "#f3e5c0", "shape": "ellipse" } },
            { selector: ".entity", style: { "background-color": "#93c5fd", "shape": "round-rectangle" } },
            { selector: ".role", style: { "background-color": "#d8b4fe", "shape": "diamond" } },
            { selector: ".case", style: { "background-color": "#facc15", "shape": "round-rectangle" } },
            { selector: "edge", style: { "width": 1.5, "curve-style": "bezier", "target-arrow-shape": "triangle", "arrow-scale": 0.7 } },
            { selector: "edge.corroborated", style: { "line-color": COLOR.corroborated, "target-arrow-color": COLOR.corroborated, "line-style": "solid" } },
            { selector: "edge.disputed", style: { "line-color": COLOR.disputed, "target-arrow-color": COLOR.disputed, "line-style": "dashed" } },
            { selector: "edge.quote", style: { "line-color": COLOR.quote, "target-arrow-color": COLOR.quote, "line-style": "dotted" } },
            { selector: "edge.contextual", style: { "line-color": COLOR.contextual, "target-arrow-color": COLOR.contextual, "line-style": "dotted", "width": 1 } },
            { selector: "edge:active, edge.hovered, edge.selected", style: { "width": 3, "opacity": 1 } },
            { selector: "node.hovered-node, node.selected, node.path-highlight", style: { "border-color": "#f3e5c0", "border-width": 3 } },
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

        cy.on("tap", "node", function (evt) { self.selectNode(evt.target.id()); });
        cy.on("tap", "edge", function (evt) { self.selectEdge(evt.target.id()); });
        cy.on("tap", function (evt) {
          if (evt.target === cy) {
            cy.elements().removeClass("selected hovered-node faded path-highlight");
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

        // Deep-linking: ?node=<id> selects and centers a node on load.
        // Uses a query param, never the URL hash, so it can never collide
        // with the site's existing #clm-##/#gap-## anchors.
        var params = new URLSearchParams(window.location.search);
        var initialNode = params.get("node");
        if (initialNode && nodeById[initialNode]) {
          this.forceVisible[initialNode] = true;
          Object.keys(adjacency[initialNode] || {}).forEach(function (nb) { self.forceVisible[nb] = true; });
        }

        this.applyFilters();
        if (initialNode && nodeById[initialNode]) {
          window.setTimeout(function () { self.selectNode(initialNode); cy.center(cy.getElementById(initialNode)); }, 50);
        }
      },

      // --- detail panel -----------------------------------------------
      nodeDetailData(id) {
        var n = nodeById[id];
        if (!n) return null;
        var cluster = this.clusters.find(function (c) { return c.id === n.cluster; });
        var claims = n.claims || [];
        var sources = n.sources || [];
        var gaps = cluster ? cluster.gaps || [] : [];
        return { n: n, cluster: cluster, claims: claims, sources: sources, gaps: gaps };
      },

      selectNode(id) {
        var node = cy.getElementById(id);
        if (!node || node.empty()) return;
        cy.elements().removeClass("selected hovered-node faded path-highlight");
        node.addClass("selected");
        node.connectedEdges().addClass("selected");
        cy.elements().not(node).not(node.connectedEdges()).not(node.connectedEdges().connectedNodes()).addClass("faded");

        var d = this.nodeDetailData(id);
        if (!d) return;
        var n = d.n;
        var connected = Object.keys(adjacency[id] || {}).map(function (nb) {
          return "<li>" + escapeHtml(nodeById[nb] ? nodeById[nb].label : nb) + "</li>";
        });
        var html = "<p class=\"font-semibold text-white\">" + escapeHtml(n.label) + "</p>";
        html += "<p class=\"mt-1 text-xs text-white/40\">Typ: " + escapeHtml(n.type) + " · Hloubka: " + n.depth + (d.cluster ? " · Okruh: " + escapeHtml(d.cluster.label) : "") + "</p>";
        if (n.summary) html += "<p class=\"mt-2 text-white/70\">" + escapeHtml(n.summary) + "</p>";
        if (connected.length) html += "<p class=\"mt-2 text-xs text-white/40\">Přímé vazby:</p><ul class=\"list-disc pl-4 text-white/70\">" + connected.join("") + "</ul>";
        if (d.claims.length) html += "<p class=\"mt-2 text-xs text-white/40\">Tvrzení: " + d.claims.map(function (c) { return "<a class=\"text-[#f3e5c0]\" href=\"#" + c.toLowerCase() + "\">" + c + "</a>"; }).join(", ") + "</p>";
        if (d.gaps.length) html += "<p class=\"mt-1 text-xs text-white/40\">Otevřené mezery: " + d.gaps.join(", ") + "</p>";
        html += "<div class=\"mt-3 flex flex-wrap gap-2\">";
        html += "<button type=\"button\" class=\"src-filter-reset\" data-graph-action=\"expand\" data-graph-node=\"" + id + "\">Rozvinout o jednu úroveň</button>";
        html += "<button type=\"button\" class=\"src-filter-reset\" data-graph-action=\"path\" data-graph-node=\"" + id + "\">Cesta k hlavnímu subjektu</button>";
        html += "<button type=\"button\" class=\"src-filter-reset\" data-graph-action=\"link\" data-graph-node=\"" + id + "\">Kopírovat odkaz</button>";
        html += "</div>";

        this.detailHtml = html;
        this.detailVisible = true;
        this.wireDetailActions();
      },

      selectEdge(id) {
        var edge = cy.getElementById(id);
        if (!edge || edge.empty()) return;
        cy.elements().removeClass("selected hovered-node faded path-highlight");
        edge.addClass("selected");
        edge.connectedNodes().addClass("selected");
        cy.elements().not(edge).not(edge.connectedNodes()).addClass("faded");

        var rawEdge = (data.edges || []).find(function (e) { return e.id === id; });
        var statusLabel = STATUS_LABEL_CS[edge.data("status")] || edge.data("status");
        var html = "<p class=\"text-white/70\"><strong class=\"text-white\">" + escapeHtml(edge.source().data("label")) + "</strong> → " +
          escapeHtml(edge.data("label")) + " → <strong class=\"text-white\">" + escapeHtml(edge.target().data("label")) + "</strong></p>";
        html += "<p class=\"mt-1 text-xs text-white/40\">Vztah: " + escapeHtml(edge.data("relation") || "") + " · Stav: " + statusLabel + "</p>";
        if (edge.data("status") === "disputed") html += "<p class=\"mt-1 text-xs text-yellow-300\">Sporná, neuzavřená vazba — ne potvrzený fakt.</p>";
        if (edge.data("status") === "quote") html += "<p class=\"mt-1 text-xs text-blue-300\">Citace — výrok osoby, ne hodnocení tohoto webu.</p>";
        if (edge.data("status") === "contextual") html += "<p class=\"mt-1 text-xs text-white/40\">Kontextová vazba — nesporné pozadí, ne samostatně dokládané tvrzení tohoto dossieru.</p>";
        if (rawEdge && rawEdge.claims && rawEdge.claims.length) {
          html += "<p class=\"mt-2 text-xs text-white/40\">Tvrzení: " + rawEdge.claims.map(function (c) { return "<a class=\"text-[#f3e5c0]\" href=\"#" + c.toLowerCase() + "\">" + c + "</a>"; }).join(", ") + "</p>";
        }
        if (rawEdge && rawEdge.sources && rawEdge.sources.length) {
          html += "<p class=\"mt-1 text-xs text-white/40\">Zdroje: " + rawEdge.sources.join(", ") + "</p>";
        }
        this.detailHtml = html;
        this.detailVisible = true;
      },

      wireDetailActions() {
        var self = this;
        window.setTimeout(function () {
          document.querySelectorAll("[data-graph-action]").forEach(function (btn) {
            if (btn.dataset.wired) return;
            btn.dataset.wired = "true";
            btn.addEventListener("click", function () {
              var action = btn.getAttribute("data-graph-action");
              var nodeId = btn.getAttribute("data-graph-node");
              if (action === "expand") self.expandNode(nodeId);
              if (action === "path") self.showPathToSubject(nodeId);
              if (action === "link") {
                var url = new URL(window.location.href);
                url.search = "?node=" + encodeURIComponent(nodeId);
                copyToClipboard(url.toString(), btn);
              }
            });
          });
        }, 0);
      },

      // --- expand / path-to-subject ------------------------------------
      expandNode(id) {
        this.forceVisible[id] = true;
        Object.keys(adjacency[id] || {}).forEach((nb) => { this.forceVisible[nb] = true; });
        this.applyFilters();
      },

      showPathToSubject(id) {
        var subjectIds = Object.keys(nodeById).filter(function (nid) { return nodeById[nid].subject; });
        if (!subjectIds.length) return;
        // BFS from id to the nearest subject over the undirected adjacency.
        var visited = { [id]: null };
        var queue = [id];
        var targetFound = null;
        while (queue.length && !targetFound) {
          var cur = queue.shift();
          if (subjectIds.indexOf(cur) !== -1 && cur !== id) { targetFound = cur; break; }
          Object.keys(adjacency[cur] || {}).forEach(function (nb) {
            if (!(nb in visited)) { visited[nb] = cur; queue.push(nb); }
          });
        }
        if (!targetFound) return;
        var path = [];
        var walk = targetFound;
        while (walk !== null && walk !== undefined) { path.push(walk); walk = visited[walk]; }
        var self = this;
        path.forEach(function (nid) { self.forceVisible[nid] = true; });
        this.applyFilters();
        cy.elements().removeClass("path-highlight");
        path.forEach(function (nid) { cy.getElementById(nid).addClass("path-highlight"); });
      },

      // --- filters -------------------------------------------------------
      setMaxDepth(d) {
        this.maxDepth = d;
        this.applyFilters();
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
        var maxDepth = this.maxDepth;
        var clusterFilter = this.cluster;
        var forceVisible = this.forceVisible;
        var hiddenNeighbors = 0;

        cy.nodes().forEach(function (node) {
          var n = nodeById[node.id()];
          if (forceVisible[node.id()]) { node.scratch("_hiddenByFilter", false); return; }
          var kindOk = activeKinds[kindGroupOf(n.type)];
          var depthOk = n.depth <= maxDepth;
          var clusterOk = !clusterFilter || n.cluster === clusterFilter;
          var hide = !kindOk || !depthOk || !clusterOk;
          node.scratch("_hiddenByFilter", hide);
          if (hide && !depthOk) hiddenNeighbors++;
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
        this.hiddenNeighborCount = hiddenNeighbors;
      },

      resetFilters() {
        this.activeKinds = { person: true, entity: true, role: true, case: true };
        this.activeStatuses = { corroborated: true, disputed: true, quote: true, contextual: true };
        this.maxDepth = 2;
        this.cluster = "";
        this.search = "";
        this.forceVisible = {};
        cy.elements().removeClass("path-highlight selected hovered-node faded search-match");
        this.detailVisible = false;
        this.applyFilters();
      },

      zoom(action) {
        if (!cy) return;
        var center = { x: cy.width() / 2, y: cy.height() / 2 };
        if (action === "in") cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: center });
        if (action === "out") cy.zoom({ level: cy.zoom() * 0.75, renderedPosition: center });
        if (action === "fit") cy.fit(undefined, 30);
        if (action === "relayout") { cy.layout(LAYOUT).run(); cy.fit(undefined, 30); }
      },
    };
  });
}
