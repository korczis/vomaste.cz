#!/usr/bin/env node
/*
 * Referential-integrity check for data/relationship-graph.toml.
 * Not a general TOML parser — tailored to this file's flat [[nodes]] /
 * [[edges]] shape (id/source/target are the only fields validation needs),
 * matching the same approach as validate-dossier.mjs. No network access;
 * deterministic; exits non-zero on any error.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GRAPH_TOML = join(ROOT, "data/relationship-graph.toml");

const text = readFileSync(GRAPH_TOML, "utf8");
const errors = [];
const err = (msg) => errors.push(msg);

// Split into [[nodes]] / [[edges]] blocks in file order.
const blocks = text.split(/^\[\[(nodes|edges)\]\]\s*$/m).slice(1);
const nodeIds = new Set();
const edges = [];
let nodeCount = 0;

for (let i = 0; i < blocks.length; i += 2) {
  const kind = blocks[i];
  const body = blocks[i + 1];
  if (kind === "nodes") {
    const m = body.match(/^id\s*=\s*"([^"]+)"/m);
    if (!m) { err("A [[nodes]] block is missing an id field."); continue; }
    nodeCount++;
    if (nodeIds.has(m[1])) err(`Duplicate node id: "${m[1]}"`);
    nodeIds.add(m[1]);
  } else if (kind === "edges") {
    const src = body.match(/^source\s*=\s*"([^"]+)"/m);
    const tgt = body.match(/^target\s*=\s*"([^"]+)"/m);
    if (!src || !tgt) { err("An [[edges]] block is missing source or target."); continue; }
    edges.push({ source: src[1], target: tgt[1] });
  }
}

if (nodeCount === 0) err("No [[nodes]] blocks found — file format may have changed.");
if (edges.length === 0) err("No [[edges]] blocks found — file format may have changed.");

for (const e of edges) {
  if (!nodeIds.has(e.source)) err(`Edge references unknown source node: "${e.source}"`);
  if (!nodeIds.has(e.target)) err(`Edge references unknown target node: "${e.target}"`);
}

console.log(`Checked ${nodeCount} nodes and ${edges.length} edges in ${GRAPH_TOML}.`);
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log("OK — every edge resolves to a real node, no duplicate node ids.");
