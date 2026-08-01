#!/usr/bin/env node
// Regression tests for lib/graph-layout.mjs (coop task T-027, mission
// § 4.2): the build-time layout must be DETERMINISTIC — same node/edge
// input, same coordinates, every run. This is what makes it safe to ship
// pre-computed x/y instead of running ForceAtlas2 on the browser's main
// thread (mission § 4.1) — a non-deterministic layout would make every
// rebuild a visually-unstable diff for no content reason.
//
// Usage: node --test scripts/dossier/graph-layout.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeLayout, applyLayout } from "./lib/graph-layout.mjs";

function sampleGraph(n = 40, e = 70) {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: `node-${i}` }));
  const edges = [];
  for (let i = 0; i < e; i++) {
    const source = `node-${i % n}`;
    const target = `node-${(i * 7 + 3) % n}`;
    if (source === target) continue;
    edges.push({ id: `edge-${i}`, source, target });
  }
  return { nodes, edges };
}

test("computeLayout produces identical coordinates across two runs on the same input", () => {
  const { nodes, edges } = sampleGraph();
  const first = computeLayout(nodes, edges, { barnesHut: false });
  const second = computeLayout(nodes, edges, { barnesHut: false });
  for (const node of nodes) {
    const a = first.positions.get(node.id);
    const b = second.positions.get(node.id);
    assert.ok(a && b, `both runs must place ${node.id}`);
    assert.strictEqual(a.x, b.x, `x drifted for ${node.id}`);
    assert.strictEqual(a.y, b.y, `y drifted for ${node.id}`);
    assert.strictEqual(a.component_id, b.component_id);
    assert.strictEqual(a.neighbor_count, b.neighbor_count);
  }
});

test("computeLayout is deterministic with barnesHutOptimize on (the full-registry-layer setting)", () => {
  const { nodes, edges } = sampleGraph(120, 300);
  const first = computeLayout(nodes, edges, { barnesHut: true });
  const second = computeLayout(nodes, edges, { barnesHut: true });
  for (const node of nodes) {
    const a = first.positions.get(node.id);
    const b = second.positions.get(node.id);
    assert.strictEqual(a.x, b.x, `x drifted for ${node.id} with barnesHutOptimize`);
    assert.strictEqual(a.y, b.y, `y drifted for ${node.id} with barnesHutOptimize`);
  }
});

test("every computed coordinate is finite, even for a disconnected/degenerate graph", () => {
  const nodes = [{ id: "solo-1" }, { id: "solo-2" }, { id: "a" }, { id: "b" }];
  const edges = [{ id: "e1", source: "a", target: "b" }];
  const { positions } = computeLayout(nodes, edges, { barnesHut: false });
  for (const node of nodes) {
    const p = positions.get(node.id);
    assert.ok(Number.isFinite(p.x), `${node.id}.x must be finite`);
    assert.ok(Number.isFinite(p.y), `${node.id}.y must be finite`);
  }
});

test("weakly-connected components: disconnected nodes get distinct component ids, connected ones share one", () => {
  const nodes = [{ id: "solo-1" }, { id: "solo-2" }, { id: "a" }, { id: "b" }, { id: "c" }];
  const edges = [
    { id: "e1", source: "a", target: "b" },
    { id: "e2", source: "b", target: "c" },
  ];
  const layout = computeLayout(nodes, edges, { barnesHut: false });
  const cid = (id) => layout.positions.get(id).component_id;
  assert.strictEqual(cid("a"), cid("b"));
  assert.strictEqual(cid("b"), cid("c"));
  assert.notStrictEqual(cid("solo-1"), cid("solo-2"));
  assert.notStrictEqual(cid("a"), cid("solo-1"));
});

test("neighbor_count is undirected degree (counts an edge from either endpoint once)", () => {
  const nodes = [{ id: "hub" }, { id: "a" }, { id: "b" }, { id: "c" }];
  const edges = [
    { id: "e1", source: "hub", target: "a" },
    { id: "e2", source: "b", target: "hub" },
    { id: "e3", source: "hub", target: "c" },
  ];
  const layout = computeLayout(nodes, edges, { barnesHut: false });
  assert.strictEqual(layout.positions.get("hub").neighbor_count, 3);
  assert.strictEqual(layout.positions.get("a").neighbor_count, 1);
});

test("applyLayout merges x/y/component_id/neighbor_count onto a copy, without mutating the input node", () => {
  const nodes = [{ id: "a" }, { id: "b" }];
  const edges = [{ id: "e1", source: "a", target: "b" }];
  const layout = computeLayout(nodes, edges, { barnesHut: false });
  const applied = applyLayout(nodes, layout);
  assert.strictEqual(nodes[0].x, undefined, "input node must not be mutated");
  assert.ok(Number.isFinite(applied[0].x));
  assert.ok(Number.isFinite(applied[0].y));
  assert.strictEqual(applied[0].layout_partition, applied[0].component_id);
});

test("applyLayout throws on a node with no computed position (a real generator bug, not a silent fallback)", () => {
  const nodes = [{ id: "a" }, { id: "b" }];
  const edges = [];
  const layout = computeLayout(nodes, edges, { barnesHut: false });
  assert.throws(() => applyLayout([{ id: "unknown-node" }], layout));
});
