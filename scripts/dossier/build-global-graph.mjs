#!/usr/bin/env node
/*
 * Aggregates every dossier's data/dossiers/<slug>/graph.toml into one
 * global content graph, in the SAME {nodes, edges, clusters,
 * source_families} shape relationship-graph.js already knows how to
 * render — so the global map (templates/map.html) reuses that exact
 * component instead of a second hand-written graph renderer. Also adds a
 * top-level `dossiers` array (dossier catalog metadata) for the map's
 * dossier-tree/catalog view and its no-JS text alternative.
 *
 * This is a projection, not a new source of truth: every node/edge is
 * still owned by its dossier's own graph.toml; this script only merges
 * (deduping shared entity nodes by id, unioning their claims/sources)
 * and namespaces cluster/source_family ids by dossier to avoid collision
 * if a future second dossier happens to reuse a cluster name.
 *
 * Output: data/generated/global-graph.json
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const DATA_ROOT = join(ROOT, "data/dossiers");
const OUT_FILE = join(ROOT, "data/generated/global-graph.json");

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return [];
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
}

function parseBlocks(text) {
  const blocks = { nodes: [], edges: [], clusters: [], source_families: [] };
  const re = /^\[\[(nodes|edges|clusters|source_families|updates)\]\]\s*$/gm;
  const matches = [...text.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const kind = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(start, end);
    const obj = {};
    for (const m of body.matchAll(/^(\w+)\s*=\s*(.+)$/gm)) {
      const key = m[1];
      const raw = m[2].trim();
      if (raw.startsWith("[")) {
        obj[key] = [...raw.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
      } else if (raw.startsWith('"')) {
        obj[key] = raw.slice(1, -1).replace(/\\"/g, '"');
      } else if (raw === "true" || raw === "false") {
        obj[key] = raw === "true";
      } else if (/^-?\d+$/.test(raw)) {
        obj[key] = parseInt(raw, 10);
      } else {
        obj[key] = raw;
      }
    }
    if (blocks[kind]) blocks[kind].push(obj);
  }
  return blocks;
}

const dossierSlugs = readdirSync(DOSSIERS_ROOT)
  .filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory())
  .sort();

const nodesById = new Map();
const edges = [];
const clusters = [];
const sourceFamilies = [];
const dossiers = [];

for (const slug of dossierSlugs) {
  const dossierMd = readFileSync(join(DOSSIERS_ROOT, slug, "_index.md"), "utf8");
  const fmEnd = dossierMd.indexOf("\n+++", 4);
  const fm = dossierMd.slice(0, fmEnd);
  const titleMatch = dossierMd.match(/^title = "(.*)"$/m);
  const dossierType = extractField(fm, "dossier_type") ?? "unknown";

  // Entity dossiers (dossier_type = "entity") own no graph.toml of their
  // own — their nodes/edges are the canonical (aggregate) dossier's,
  // already merged into this graph via that dossier's own pass below.
  // They still get a `dossiers[]` catalog entry (for the map's
  // dossier-tree), just with node/edge counts of 0 here — the map reads
  // real per-entity-dossier counts from data/dossiers/<slug>/stats.toml
  // instead, same as templates/entity-dossier.html does.
  if (dossierType === "entity") {
    dossiers.push({
      slug,
      title: titleMatch ? titleMatch[1] : slug,
      dossier_type: dossierType,
      subject_entities: extractArrayField(fm, "subject_entities"),
      node_count: 0,
      edge_count: 0,
    });
    continue;
  }

  const graphToml = readFileSync(join(DATA_ROOT, slug, "graph.toml"), "utf8");
  const { nodes, edges: dossierEdges, clusters: dossierClusters, source_families: dossierFamilies } = parseBlocks(graphToml);

  for (const n of nodes) {
    if (nodesById.has(n.id)) {
      const existing = nodesById.get(n.id);
      existing.dossiers = [...new Set([...(existing.dossiers || []), slug])];
      existing.claims = [...new Set([...(existing.claims || []), ...(n.claims || [])])];
      existing.sources = [...new Set([...(existing.sources || []), ...(n.sources || [])])];
    } else {
      nodesById.set(n.id, { ...n, dossiers: [slug] });
    }
  }
  for (const e of dossierEdges) edges.push({ ...e, dossier: slug });
  for (const c of dossierClusters) clusters.push({ ...c, id: `${slug}::${c.id}`, dossier: slug });
  for (const f of dossierFamilies) sourceFamilies.push({ ...f, id: `${slug}::${f.id}`, dossier: slug });

  dossiers.push({
    slug,
    title: titleMatch ? titleMatch[1] : slug,
    dossier_type: extractField(fm, "dossier_type") ?? "unknown",
    subject_entities: extractArrayField(fm, "subject_entities"),
    node_count: nodes.length,
    edge_count: dossierEdges.length,
  });
}

// --- full-registry layer -----------------------------------------------------
// The curated graph above is an ENTITY graph: hand-authored nodes and edges in
// graph.toml. It deliberately does not contain every record — measured, only
// ~62% of claims and ~69% of sources are attached to any node or edge, and
// gaps appear nowhere. That is a legitimate editorial view, but it is not a
// map of the dataset, so this second layer derives one mechanically from the
// registries themselves (static/data/*.json, written by build-data-exports.mjs
// from the same front matter the pages render from).
//
// Nothing here is curated: every node is a record that exists, every edge is a
// reference that record already declares. No new relationship is invented.
function buildFullLayer() {
  const read = (name) => {
    try {
      return JSON.parse(readFileSync(join(ROOT, "static/data", `${name}.json`), "utf8"));
    } catch {
      return [];
    }
  };
  const claims = read("claims");
  const sources = read("sources");
  const cases = read("cases");
  const gaps = read("gaps");
  const relations = read("relations");

  const fnodes = [];
  const fedges = [];
  const push = (id, type, label, url, extra = {}) => fnodes.push({ id, type, label, url, ...extra });

  for (const n of nodesById.values()) {
    push(n.id, "entity", n.label, null, { entity_type: n.type, subject: !!n.subject, dossiers: n.dossiers });
  }
  for (const c of claims) push(c.clm_id, "claim", c.clm_id, c.url, { status: c.status, summary: c.summary });
  for (const s of sources) push(s.src_id, "source", s.src_id, s.url, { outlet: s.outlet, src_type: s.src_type });
  for (const c of cases) push(c.case_id, "case", c.case_id, c.url, { title: c.title, status: c.status });
  for (const g of gaps) push(g.gap_id, "gap", g.gap_id, g.url, { priority: g.priority });

  const known = new Set(fnodes.map((n) => n.id));
  const link = (id, source, target, label, kind) => {
    if (!known.has(source) || !known.has(target)) return;
    fedges.push({ id, source, target, label, kind });
  };

  // claim -> source ("cituje"): the backbone of the evidence layer.
  for (const c of claims) for (const s of c.sources || []) link(`${c.clm_id}->${s}`, c.clm_id, s, "cituje", "cites");
  // gap -> claim ("otevřená otázka k"): what is not settled about what.
  for (const g of gaps) for (const c of g.claims || []) link(`${g.gap_id}->${c}`, g.gap_id, c, "otázka k", "asks");
  // entity -> claim ("figuruje v"): from the curated graph's own claim refs.
  for (const n of nodesById.values()) for (const c of n.claims || []) link(`${n.id}->${c}`, n.id, c, "figuruje v", "mentions");
  // relation edge -> claim ("doloženo"): what backs each curated edge.
  for (const r of relations) for (const c of r.claims || []) link(`${r.relation_id}->${c}`, r.source, c, "doloženo", "backs");

  return { nodes: fnodes, edges: fedges };
}

const full = buildFullLayer();

mkdirSync(dirname(OUT_FILE), { recursive: true });
const globalGraph = {
  dossiers,
  nodes: [...nodesById.values()],
  edges,
  clusters,
  source_families: sourceFamilies,
  full,
};
writeFileSync(OUT_FILE, JSON.stringify(globalGraph), "utf8");
console.log(
  `Wrote ${OUT_FILE}: ${dossiers.length} dossier(s), ${globalGraph.nodes.length} curated node(s), ${edges.length} curated edge(s); ` +
    `full registry layer: ${full.nodes.length} node(s), ${full.edges.length} edge(s).`,
);
