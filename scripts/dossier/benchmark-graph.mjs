#!/usr/bin/env node
/*
 * Technical benchmark for the build-time graph layout pipeline (mission
 * § 17.4, coop T-027). Runs scripts/dossier/lib/graph-layout.mjs — the
 * SAME code build-graph-projections.mjs uses for the real registry
 * layer — against a synthetic 10k-node/30k-edge graph. Not part of
 * `npm run build`: this is a perf report, not a pass/fail content gate,
 * and its output (static/data/graph/benchmark.json if --write is
 * passed) is gitignored and never linked from any page.
 *
 * Usage: node scripts/dossier/benchmark-graph.mjs [--nodes N] [--edges N] [--write]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateSyntheticGraph } from "./lib/synthetic-benchmark-graph.mjs";
import { computeLayout, applyLayout } from "./lib/graph-layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(args[i + 1]);
};
const nodeCount = flag("nodes", 10_000);
const edgeCount = flag("edges", 30_000);
const shouldWrite = args.includes("--write");

console.log(`benchmark-graph: generating ${nodeCount} synthetic node(s) / ${edgeCount} synthetic edge(s)…`);
const genStart = performance.now();
const graph = generateSyntheticGraph({ nodeCount, edgeCount });
const genMs = performance.now() - genStart;

const layoutStart = performance.now();
const layout = computeLayout(graph.nodes, graph.edges, { barnesHut: true });
const layoutMs = performance.now() - layoutStart;

const applyStart = performance.now();
const laidOutNodes = applyLayout(graph.nodes, layout);
const applyMs = performance.now() - applyStart;

const nonFinite = laidOutNodes.filter((n) => !Number.isFinite(n.x) || !Number.isFinite(n.y));
const componentCount = new Set(laidOutNodes.map((n) => n.component_id)).size;
const mem = process.memoryUsage();

console.log(`  generation:        ${genMs.toFixed(1)} ms`);
console.log(`  ForceAtlas2 layout: ${layoutMs.toFixed(1)} ms (${layout.parameters.iterations} iterations, barnesHutOptimize=${layout.parameters.barnesHutOptimize})`);
console.log(`  apply/merge:        ${applyMs.toFixed(1)} ms`);
console.log(`  components found:   ${componentCount}`);
console.log(`  non-finite coords:  ${nonFinite.length} (must be 0)`);
console.log(`  heap used:          ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`);

if (nonFinite.length > 0) {
  console.log("FAILED — non-finite coordinates in a synthetic run of this size; investigate before trusting the real registry-layer layout at this scale.");
  process.exit(1);
}

if (shouldWrite) {
  const outDir = join(ROOT, "static/data/graph");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "benchmark.json");
  writeFileSync(outFile, JSON.stringify({ schema_version: 1, nodes: laidOutNodes, edges: graph.edges }), "utf8");
  console.log(`  wrote ${outFile} (gitignored, unlinked — for tests/e2e/graph-benchmark.spec.mjs only)`);
}

console.log("OK — synthetic benchmark completed without error.");
