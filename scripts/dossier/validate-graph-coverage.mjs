#!/usr/bin/env node
/*
 * Coverage gate for the relationship map.
 *
 * The curated entity graph (data/dossiers/<slug>/graph.toml) is hand-authored
 * and deliberately partial. That is fine — but until now it was *silently*
 * partial: a claim attached to no node and no edge simply did not appear in
 * the map, and every build stayed green. This script makes that visible, and
 * fails only on the cases that are genuinely broken:
 *
 *   ERROR  a record exists but is missing from the FULL registry layer
 *          (data/generated/global-graph.json -> full), which is generated
 *          mechanically — a gap there means the generator dropped something;
 *   ERROR  the full layer references a record id that does not exist;
 *   report curated-graph coverage as explicit numbers, so "62 % of claims are
 *          not in the entity map" is a stated fact rather than a discovery.
 *
 * Run after build:data-exports and build:global-graph.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const errors = [];
const err = (m) => errors.push(m);

const graph = read("data/generated/global-graph.json");
const claims = read("static/data/claims.json");
const sources = read("static/data/sources.json");
const cases = read("static/data/cases.json");
const gaps = read("static/data/gaps.json");
const entities = read("static/data/entities.json");

const full = graph.full ?? { nodes: [], edges: [] };
if (full.nodes.length === 0) err("data/generated/global-graph.json has no `full` layer — build:global-graph did not run, or it regressed.");

// Uzly plné vrstvy jsou klíčované "<dossier>::<id>", protože identifikátory
// jsou jedinečné jen uvnitř dossieru (CLM-01 existuje v každém).
const fullIds = new Set(full.nodes.map((n) => n.id));
const expect = [
  ["claim", claims.map((c) => `${c.dossier}::${c.clm_id}`)],
  ["source", sources.map((s) => `${s.dossier}::${s.src_id}`)],
  ["case", cases.map((c) => `${c.dossier}::${c.case_id}`)],
  ["gap", gaps.map((g) => `${g.dossier}::${g.gap_id}`)],
];
for (const [kind, ids] of expect) {
  const missing = ids.filter((id) => !fullIds.has(id));
  if (missing.length) err(`Full map is missing ${missing.length} ${kind} record(s): ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ", …" : ""}`);
}
for (const e of full.edges) {
  if (!fullIds.has(e.source)) err(`Full-map edge "${e.id}" points at unknown source "${e.source}".`);
  if (!fullIds.has(e.target)) err(`Full-map edge "${e.id}" points at unknown target "${e.target}".`);
}

// Klíče hran kurátorské vrstvy musí být jedinečné napříč dossiery. Sigma
// staví graf přes addEdgeWithKey a na duplicitě spadne celá mapa — což se
// stalo, jakmile druhý dossier deklaroval hranu se stejným id
// (`edge-babis-vlada` v macinka-turek i andrej-babis). Build to nechytil,
// protože každý dossier je sám o sobě konzistentní; chyba vzniká až ve
// sloučení. Kontroluje se tedy tady, kde ke sloučení dochází.
const edgeKeys = new Map();
for (const e of graph.edges) {
  if (edgeKeys.has(e.id)) {
    err(
      `Curated edge key "${e.id}" is used twice (${edgeKeys.get(e.id)} and ${e.dossier}) — the global map cannot add two edges under one key and would fail to render.`,
    );
  } else {
    edgeKeys.set(e.id, e.dossier);
  }
}
const nodeIds = new Set(graph.nodes.map((n) => n.id));
for (const e of graph.edges) {
  if (!nodeIds.has(e.source)) err(`Curated edge "${e.id}" points at unknown source node "${e.source}".`);
  if (!nodeIds.has(e.target)) err(`Curated edge "${e.id}" points at unknown target node "${e.target}".`);
}

// Curated entity graph: report coverage, never fail on it — a claim with no
// entity edge is an editorial choice, not a defect.
const attached = { claims: new Set(), sources: new Set() };
for (const n of graph.nodes) {
  (n.claims ?? []).forEach((c) => attached.claims.add(c));
  (n.sources ?? []).forEach((s) => attached.sources.add(s));
}
for (const e of graph.edges) {
  (e.claims ?? []).forEach((c) => attached.claims.add(c));
  (e.sources ?? []).forEach((s) => attached.sources.add(s));
}
const pct = (a, b) => (b === 0 ? 100 : Math.round((100 * a) / b));

if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  process.exit(1);
}

console.log(
  `OK — full map covers every record: ${full.nodes.length} node(s) ` +
    `(${entities.length} entit, ${claims.length} tvrzení, ${sources.length} zdrojů, ${cases.length} kauz, ${gaps.length} mezer), ` +
    `${full.edges.length} edge(s).`,
);
console.log(
  `     curated entity graph: ${graph.nodes.length} node(s), ${graph.edges.length} edge(s); ` +
    `attaches ${attached.claims.size}/${claims.length} claims (${pct(attached.claims.size, claims.length)} %) ` +
    `and ${attached.sources.size}/${sources.length} sources (${pct(attached.sources.size, sources.length)} %).`,
);
