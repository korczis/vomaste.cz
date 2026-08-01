#!/usr/bin/env node
/*
 * Build gate for the graph workbench data contract (mission § 16,
 * coop task T-027). Extends the schema-only division of labor in
 * schemas/README.md: shape is schemas/graph-manifest.schema.json /
 * graph-payload.schema.json (AJV); this script owns the cross-file
 * SEMANTICS that only make sense once every payload is on disk —
 * referential integrity, manifest/file parity, hash integrity, and
 * registry coverage (folds in the checks the old
 * validate-graph-coverage.mjs made against data/generated/global-graph.json,
 * now retired in favor of static/data/graph/*).
 *
 * Run after build:graph-projections, before zola build.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GRAPH_DIR = join(ROOT, "static/data/graph");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const errors = [];
const err = (m) => errors.push(m);

if (!existsSync(join(GRAPH_DIR, "manifest.json"))) {
  console.log("ERROR validate-graph-projections: static/data/graph/manifest.json missing — run `npm run build:graph-projections` first.");
  process.exit(1);
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
const manifestSchema = JSON.parse(readFileSync(join(ROOT, "schemas/graph-manifest.schema.json"), "utf8"));
const payloadSchema = JSON.parse(readFileSync(join(ROOT, "schemas/graph-payload.schema.json"), "utf8"));
const validateManifest = ajv.compile(manifestSchema);
const validatePayload = ajv.compile(payloadSchema);

function checkSchema(validate, value, label) {
  if (!validate(value)) {
    for (const e of validate.errors) err(`${label}: ${e.instancePath || "(root)"} ${e.message}`);
  }
}

const manifest = read("static/data/graph/manifest.json");
checkSchema(validateManifest, manifest, "manifest.json");

function checkPayloadFile(relPath, label, expectedCount) {
  const absPath = join(ROOT, relPath);
  const buf = readFileSync(absPath);
  const payload = JSON.parse(buf.toString("utf8"));
  checkSchema(validatePayload, payload, label);

  const seenNodeIds = new Set();
  for (const n of payload.nodes) {
    if (seenNodeIds.has(n.id)) err(`${label}: duplicate node id "${n.id}"`);
    seenNodeIds.add(n.id);
    if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) err(`${label}: node "${n.id}" has non-finite coordinates (x=${n.x}, y=${n.y})`);
  }
  const seenEdgeIds = new Set();
  for (const e of payload.edges) {
    if (seenEdgeIds.has(e.id)) err(`${label}: duplicate edge id "${e.id}"`);
    seenEdgeIds.add(e.id);
    if (!seenNodeIds.has(e.source)) err(`${label}: edge "${e.id}" points at unknown source node "${e.source}"`);
    if (!seenNodeIds.has(e.target)) err(`${label}: edge "${e.id}" points at unknown target node "${e.target}"`);
  }
  if (expectedCount) {
    if (payload.nodes.length !== expectedCount.node_count) err(`${label}: manifest says ${expectedCount.node_count} node(s), file has ${payload.nodes.length}`);
    if (payload.edges.length !== expectedCount.edge_count) err(`${label}: manifest says ${expectedCount.edge_count} edge(s), file has ${payload.edges.length}`);
    const hash = sha256(buf);
    if (hash !== expectedCount.sha256) err(`${label}: manifest sha256 does not match the file on disk`);
    if (Buffer.byteLength(buf) !== expectedCount.byte_size) err(`${label}: manifest byte_size does not match the file on disk`);
  }
  return payload;
}

const curated = checkPayloadFile("static/data/graph/global-curated.json", "global-curated.json", manifest.layers?.curated);
const registry = checkPayloadFile("static/data/graph/global-registry.json", "global-registry.json", manifest.layers?.registry);

for (const d of manifest.dossiers ?? []) {
  if (!d.url) continue;
  const relPath = `static/data/graph/dossier/${d.slug}.json`;
  if (!existsSync(join(ROOT, relPath))) {
    err(`manifest lists dossier "${d.slug}" with url ${d.url}, but ${relPath} does not exist`);
    continue;
  }
  checkPayloadFile(relPath, `dossier/${d.slug}.json`, d);
}

// Route parity: every node's resolved route must match what
// data/generated/routes.json (the single route source, built earlier in
// the pipeline) says for that record — catches a future refactor that
// hardcodes or miscomputes a URL instead of reading the manifest.
const routes = existsSync(join(ROOT, "data/generated/routes.json")) ? read("data/generated/routes.json") : null;
if (routes) {
  for (const n of curated.nodes) {
    if (n.record_type !== "entity" || n.route == null) continue;
    const expected = routes[n.canonical_id]?.route;
    if (expected && n.route !== expected) err(`global-curated.json: node "${n.id}" route "${n.route}" does not match routes.json ("${expected}")`);
  }
  for (const n of registry.nodes) {
    if (n.record_type === "entity" || n.route == null) continue;
    const expected = routes[`${n.dossier}:${n.canonical_id}`]?.route;
    if (expected && n.route !== expected) err(`global-registry.json: node "${n.id}" route "${n.route}" does not match routes.json ("${expected}")`);
  }
}

// Registry coverage: every claim/source/case/gap the flat exports know
// about must appear as a node in the full-registry layer — a generator
// regression here means records silently vanish from the map, which
// stayed invisible for a long time before this check existed (see
// docs/audits/graph-workbench-baseline.md).
const registryIds = new Set(registry.nodes.map((n) => n.id));
const claims = read("static/data/claims.json");
const sources = read("static/data/sources.json");
const cases = read("static/data/cases.json");
const gaps = read("static/data/gaps.json");
const coverage = [
  ["claim", claims.map((c) => `${c.dossier}::${c.clm_id}`)],
  ["source", sources.map((s) => `${s.dossier}::${s.src_id}`)],
  ["case", cases.map((c) => `${c.dossier}::${c.case_id}`)],
  ["gap", gaps.map((g) => `${g.dossier}::${g.gap_id}`)],
];
for (const [kind, ids] of coverage) {
  const missing = ids.filter((id) => !registryIds.has(id));
  if (missing.length) err(`global-registry.json is missing ${missing.length} ${kind} record(s): ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ", …" : ""}`);
}

if (errors.length) {
  console.log(`validate-graph-projections: ${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  process.exit(1);
}

const attachedClaims = new Set();
const attachedSources = new Set();
for (const n of curated.nodes) {
  (n.claims ?? []).forEach((c) => attachedClaims.add(c));
  (n.sources ?? []).forEach((s) => attachedSources.add(s));
}
for (const e of curated.edges) {
  (e.claims ?? []).forEach((c) => attachedClaims.add(c));
  (e.sources ?? []).forEach((s) => attachedSources.add(s));
}
const pct = (a, b) => (b === 0 ? 100 : Math.round((100 * a) / b));
console.log(
  `OK — manifest + ${manifest.dossiers.filter((d) => d.url).length} dossier payload(s) valid; ` +
    `registry layer covers every record (${registry.nodes.length} node(s), ${registry.edges.length} edge(s)); ` +
    `curated layer: ${curated.nodes.length} node(s)/${curated.edges.length} edge(s), attaches ` +
    `${attachedClaims.size}/${claims.length} claims (${pct(attachedClaims.size, claims.length)} %) and ` +
    `${attachedSources.size}/${sources.length} sources (${pct(attachedSources.size, sources.length)} %).`,
);
