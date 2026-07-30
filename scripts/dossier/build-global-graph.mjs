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
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync, existsSync } from "node:fs";
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

  // A dossier without its OWN data/dossiers/<slug>/graph.toml is a
  // generated view — its nodes/edges are the canonical dossier's,
  // already merged via that dossier's own pass. It still gets a
  // `dossiers[]` catalog entry (for the map's dossier-tree), with
  // node/edge counts of 0 here — the map reads per-view counts from
  // stats.toml instead. Decided by PHYSICAL file existence, not by
  // dossier_type: self-canonical entity dossiers (oto-klempir,
  // alena-schillerova, …) own a graph.toml and MUST be merged — the
  // old dossier_type=="entity" skip silently dropped them from the
  // global map (baseline audit § 5, fixed in T-017).
  if (!existsSync(join(DATA_ROOT, slug, "graph.toml"))) {
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
  // Identifikátor hrany je jedinečný jen uvnitř dossieru — `edge-babis-vlada`
  // existuje v macinka-turek i v andrej-babis. V globální mapě se tím dvě
  // různé hrany snažily zabrat jeden klíč a Sigma celou mapu shodila
  // (`addEdgeWithKey: the "edge-babis-vlada" edge already exists`). Klíč se
  // proto jmenuje "<dossier>::<id>", stejně jako u clusterů a rodin zdrojů
  // o dva řádky níž; původní id zůstává v `rel_id`, protože podle něj se
  // dohledává stránka vztahu, a `route` je rovnou hotová cesta, aby se
  // nemusela hádat z indexu, kde je taky nejednoznačná.
  for (const e of dossierEdges) {
    edges.push({
      ...e,
      id: `${slug}::${e.id}`,
      rel_id: e.id,
      dossier: slug,
      route: `/dossiers/${slug}/relations/${e.id}/`,
    });
  }
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
  // Tvrdý fail místo prázdné vrstvy: chybějící export znamená špatné pořadí
  // kroků v buildu (build:data-exports musí předcházet), a tiché []
  // vyrobí prázdnou "mapu celého registru", které si nikdo nevšimne —
  // přesně to prošlo lokálně a spadlo až v CI.
  const read = (name) => {
    const file = join(ROOT, "static/data", `${name}.json`);
    if (!existsSync(file)) {
      console.log(
        `ERROR build-global-graph: chybí ${file} — spusť nejdřív \`npm run build:data-exports\` ` +
          "(v npm run build i v CI musí být před tímto krokem).",
      );
      process.exit(1);
    }
    return JSON.parse(readFileSync(file, "utf8"));
  };
  const claims = read("claims");
  const sources = read("sources");
  const cases = read("cases");
  const gaps = read("gaps");
  const relations = read("relations");

  const fnodes = [];
  const fedges = [];
  // Identifikátory záznamů jsou jedinečné jen V RÁMCI dossieru: CLM-01
  // existuje v každém z nich. Uzly proto nesou klíč "<dossier>::<id>",
  // popisek zůstává holé ID. Bez toho graf spadl na
  // `Graph.addNode: the "CLM-01" node already exist` v okamžiku, kdy
  // přibyl třetí dossier.
  const key = (dossier, id) => `${dossier}::${id}`;
  const push = (id, type, label, url, extra = {}) => fnodes.push({ id, type, label, url, ...extra });

  for (const n of nodesById.values()) {
    push(n.id, "entity", n.label, null, { entity_type: n.type, subject: !!n.subject, dossiers: n.dossiers });
  }
  for (const c of claims) push(key(c.dossier, c.clm_id), "claim", c.clm_id, c.url, { status: c.status, summary: c.summary, dossier: c.dossier });
  for (const s of sources) push(key(s.dossier, s.src_id), "source", s.src_id, s.url, { outlet: s.outlet, src_type: s.src_type, dossier: s.dossier });
  for (const c of cases) push(key(c.dossier, c.case_id), "case", c.case_id, c.url, { title: c.title, status: c.status, dossier: c.dossier });
  for (const g of gaps) push(key(g.dossier, g.gap_id), "gap", g.gap_id, g.url, { priority: g.priority, dossier: g.dossier });

  const dupes = fnodes.map((n) => n.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) {
    console.log(`ERROR build-global-graph: duplicitní id uzlů v plné vrstvě: ${[...new Set(dupes)].slice(0, 5).join(", ")}`);
    process.exit(1);
  }

  const known = new Set(fnodes.map((n) => n.id));
  const seenEdges = new Set();
  const link = (id, source, target, label, kind) => {
    if (!known.has(source) || !known.has(target)) return;
    // Táž vazba může vzniknout víc cestami — entita patřící do dvou dossierů
    // vypisuje týž CLM v obou. Hrana je ale jedna; bez téhle deduplikace
    // Sigma spadne na `addEdgeWithKey: the "..." edge already exists`.
    if (seenEdges.has(id)) return;
    seenEdges.add(id);
    fedges.push({ id, source, target, label, kind });
  };

  // Všechny vazby níž jsou uvnitř jednoho dossieru (tvrzení cituje zdroj
  // téhož registru), takže se klíčují stejným dossierem. Entita je globální,
  // proto se napojuje na každý dossier, ve kterém se vyskytuje.
  for (const c of claims) for (const s of c.sources || []) link(`${key(c.dossier, c.clm_id)}->${s}`, key(c.dossier, c.clm_id), key(c.dossier, s), "cituje", "cites");
  for (const g of gaps) for (const c of g.claims || []) link(`${key(g.dossier, g.gap_id)}->${c}`, key(g.dossier, g.gap_id), key(g.dossier, c), "otázka k", "asks");
  for (const n of nodesById.values())
    for (const d of n.dossiers || []) for (const c of n.claims || []) link(`${n.id}->${key(d, c)}`, n.id, key(d, c), "figuruje v", "mentions");
  for (const r of relations) for (const c of r.claims || []) link(`${r.source}->${key(r.dossier, c)}`, r.source, key(r.dossier, c), "doloženo", "backs");

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
