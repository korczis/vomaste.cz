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

mkdirSync(dirname(OUT_FILE), { recursive: true });
const globalGraph = {
  dossiers,
  nodes: [...nodesById.values()],
  edges,
  clusters,
  source_families: sourceFamilies,
};
writeFileSync(OUT_FILE, JSON.stringify(globalGraph), "utf8");
console.log(`Wrote ${OUT_FILE}: ${dossiers.length} dossier(s), ${globalGraph.nodes.length} node(s), ${edges.length} edge(s).`);
