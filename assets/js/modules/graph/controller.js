// Owns the ONE Sigma instance for a graph container (mission § 6.1/6.2):
// layer switches call renderer.setGraph() instead of killing and
// recreating the renderer, and each layer's camera position is
// remembered and restored on return — Sigma 3's setGraph()/getCamera()/
// Camera#getState()/setState() are exactly the stable API this is built
// on (see docs/adr/graph-workbench-and-data-projection.md).
import Sigma from "sigma";
import { buildGraph } from "./graph-factory.js";
import { attachResizeLifecycle } from "./lifecycle.js";

const SIGMA_SETTINGS = {
  renderEdgeLabels: false,
  labelColor: { color: "#ffffff" },
  labelSize: 11,
  labelWeight: "500",
  labelDensity: 0.7,
  labelGridCellSize: 70,
  edgeLabelColor: { color: "rgba(255,255,255,0.7)" },
  defaultEdgeType: "arrow",
  minCameraRatio: 0.3,
  maxCameraRatio: 4,
};

const DEFAULT_CAMERA_STATE = { x: 0.5, y: 0.5, ratio: 1, angle: 0 };

// Sigma's WebGL failure does NOT surface as a constructor throw — the
// context is requested successfully as `null` and the actual failure
// (`gl.blendFunc` on a null context) happens later, inside a deferred
// render call a try/catch around `new Sigma(...)` can't reach. Feature-
// detect on a throwaway canvas BEFORE ever constructing Sigma instead
// (mission § 13).
function isWebglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (e) {
    return false;
  }
}

export class GraphController {
  // options.onSelect(kind, id | null) — called on node/edge click AND on
  // programmatic select()/clearSelection(), so a single callback drives
  // both the URL/inspector wiring (Phase F) regardless of trigger.
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.renderer = null;
    this.graph = null;
    this.activeLayerKey = null;
    this.cameraStateByLayer = new Map();
    this.selectedId = null;
    this._resizeLifecycle = attachResizeLifecycle(container, () => this._handleResize());
  }

  // `payload` — a normalized {nodes, edges, ...} graph-payload object
  // (already fetched/decoded by the caller — this module never fetches).
  // Returns false (and calls options.onRendererError) if Sigma could not
  // create a renderer at all — WebGL unavailable/blocked is the real
  // case (mission § 13: never leave a blank canvas, show a fallback).
  setLayer(key, payload) {
    const nextGraph = buildGraph(payload);

    if (!this.renderer) {
      if (!isWebglAvailable()) {
        if (typeof this.options.onRendererError === "function") this.options.onRendererError(new Error("WebGL unavailable"));
        return false;
      }
      try {
        this.renderer = new Sigma(nextGraph, this.container, SIGMA_SETTINGS);
      } catch (err) {
        if (typeof this.options.onRendererError === "function") this.options.onRendererError(err);
        return false;
      }
      this._wireEvents();
    } else {
      if (this.activeLayerKey) {
        this.cameraStateByLayer.set(this.activeLayerKey, this.renderer.getCamera().getState());
      }
      this.renderer.setGraph(nextGraph);
    }

    this.graph = nextGraph;
    this.activeLayerKey = key;
    this.renderer.getCamera().setState(this.cameraStateByLayer.get(key) || DEFAULT_CAMERA_STATE);

    // A node selected on the previous layer may not exist on this one
    // (mission § 6.2 step 4/5) — restore it if present, else clear
    // cleanly rather than leave a stale highlight/inspector open.
    if (this.selectedId && !nextGraph.hasNode(this.selectedId)) {
      this.clearSelection();
    } else if (this.selectedId) {
      this._notifySelect("node", this.selectedId);
    }
    return true;
  }

  select(nodeId) {
    if (!this.graph || !this.graph.hasNode(nodeId)) return;
    this.selectedId = nodeId;
    this._notifySelect("node", nodeId);
    if (this.renderer) this.renderer.refresh();
  }

  clearSelection() {
    this.selectedId = null;
    this._notifySelect(null, null);
    if (this.renderer) this.renderer.refresh();
  }

  setReducers(nodeReducer, edgeReducer) {
    if (!this.renderer) return;
    this.renderer.setSettings({ nodeReducer, edgeReducer });
    this.renderer.refresh();
  }

  resetCamera() {
    if (!this.renderer) return;
    this.renderer.getCamera().setState(DEFAULT_CAMERA_STATE);
    if (this.activeLayerKey) this.cameraStateByLayer.delete(this.activeLayerKey);
  }

  destroy() {
    this._resizeLifecycle.destroy();
    if (this.renderer) {
      this.renderer.kill();
      this.renderer = null;
    }
    this.graph = null;
    this.cameraStateByLayer.clear();
  }

  _routeOf(kind, id) {
    if (!this.graph) return null;
    return kind === "node" ? this.graph.getNodeAttribute(id, "route") : this.graph.getEdgeAttribute(id, "route");
  }

  _notifySelect(kind, id) {
    if (typeof this.options.onSelect === "function") this.options.onSelect(kind, id);
  }

  _wireEvents() {
    const r = this.renderer;
    r.on("clickNode", ({ node }) => {
      this.select(node);
    });
    r.on("clickEdge", ({ edge }) => {
      const route = this._routeOf("edge", edge);
      if (route) window.location.href = route;
    });
    r.on("enterNode", ({ node }) => {
      this.container.style.cursor = this._routeOf("node", node) ? "pointer" : "";
    });
    r.on("enterEdge", ({ edge }) => {
      this.container.style.cursor = this._routeOf("edge", edge) ? "pointer" : "";
    });
    r.on("leaveNode", () => {
      this.container.style.cursor = "";
    });
    r.on("leaveEdge", () => {
      this.container.style.cursor = "";
    });
  }

  _handleResize() {
    if (!this.renderer) return;
    this.renderer.resize();
    this.renderer.refresh();
  }
}
