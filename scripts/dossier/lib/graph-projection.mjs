// Pure data-assembly library for the graph workbench transport contract
// (docs/missions/2026-08-01-graph-workbench-master-prompt.md § 3). Builds
// normalized node/edge objects — matching schemas/graph-payload.schema.json
// — from the SAME canonical sources every other generator already reads:
// data/dossiers/<slug>/graph.toml (curated entity graph) and the flat
// registry exports under static/data/*.json (built by
// build-data-exports.mjs from the same front matter the pages render
// from). Nothing here invents a relationship: every edge is a reference a
// record already declares.
//
// This module does NOT compute layout (x/y/component_id) — that's
// lib/graph-layout.mjs, run by the orchestrator (build-graph-projections.mjs)
// after assembly, because coordinates need the fully merged graph to be
// deterministic and because keeping "what data exists" separate from
// "where it's drawn" is what makes each half independently testable.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { readGraphTomlBlocks } from "./jsonld-shared.mjs";
import { loadDossierRegistry } from "./dossier-registry.mjs";

const EDGE_CLASS_BY_KIND = {
  cites: "claim_cites_source",
  asks: "gap_questions_claim",
  mentions: "entity_mentions_claim",
  backs: "relation_backed_by_claim",
};

function readJson(root, relPath) {
  return JSON.parse(readFileSync(join(root, relPath), "utf8"));
}

export function loadRouteMap(root) {
  const file = join(root, "data/generated/routes.json");
  if (!existsSync(file)) {
    throw new Error(`graph-projection: ${file} missing — run \`npm run build:routes\` first (it must precede build:graph-projections).`);
  }
  return readJson(root, "data/generated/routes.json");
}

export function listDossierSlugs(root) {
  const dir = join(root, "content/dossiers");
  return readdirSync(dir)
    .filter((f) => statSync(join(dir, f)).isDirectory())
    .sort();
}

// Every dossier gets a catalog entry (title/type from data/dossiers.toml,
// the actual source of truth for that metadata — see lib/dossier-registry.mjs).
// node_count/edge_count are filled in by the caller once the curated
// payloads are built, since a generated view (no own graph.toml) has 0 by
// definition and a self-canonical dossier's counts come from its own file.
export function buildDossierCatalog(root, dossierSlugs) {
  const registry = loadDossierRegistry();
  return dossierSlugs.map((slug) => {
    const rec = registry.find((r) => r.slug === slug);
    return {
      slug,
      title: rec?.title ?? slug,
      dossier_type: rec?.dossierType ?? "unknown",
    };
  });
}

// Popisek uzlu má nést VÝZNAM, ne kód.
//
// Uzly záznamů se dosud popisovaly identifikátorem (CLM-01, SRC-14).
// V grafu o 1631 uzlech je to k ničemu: čtenář vidí mřížku kódů, které
// nic neříkají, a musí kliknout na každý, aby zjistil, o co jde. Kód
// zůstává v inspektoru a v adrese, kde slouží k dohledání; na plátně
// patří text, který dává smysl na první pohled.
//
// Zkracuje se na hranici slova, aby popisek nekončil uprostřed výrazu.
function graphLabel(text, fallback, max = 48) {
  const s = (text || "").trim();
  if (!s) return fallback;
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + "…";
}

function resolveRoute(routeMap, key, errors, label) {
  const entry = routeMap[key];
  if (!entry) {
    errors.push(`missing route for ${label} (routes.json key "${key}")`);
    return null;
  }
  return entry.route;
}

// One dossier's OWN graph.toml, normalized with bare (non-namespaced) ids
// — the shape written to static/data/graph/dossier/<slug>.json, and the
// raw material buildGlobalCuratedPayload namespaces and merges below.
export function buildDossierCuratedPayload(root, slug, routeMap, errors) {
  const blocks = readGraphTomlBlocks(root, slug);
  const nodes = blocks.nodes.map((n) => ({
    id: n.id,
    canonical_id: n.id,
    record_type: "entity",
    entity_type: n.type,
    label: n.label,
    route: resolveRoute(routeMap, n.id, errors, `entity "${n.id}" (dossier ${slug})`),
    dossiers: [slug],
    subject: !!n.subject,
    size_class: n.subject ? "subject" : "entity",
    claim_count: (n.claims || []).length,
    source_count: (n.sources || []).length,
    ...(n.claims ? { claims: n.claims } : {}),
    ...(n.sources ? { sources: n.sources } : {}),
  }));
  const edges = blocks.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    edge_class: "curated_relation",
    label: e.label,
    status: e.status,
    relation: e.relation,
    dossier: slug,
    rel_id: e.id,
    route: resolveRoute(routeMap, `${slug}:${e.id}`, errors, `relation "${e.id}" (dossier ${slug})`),
    ...(e.claims ? { claims: e.claims } : {}),
    ...(e.sources ? { sources: e.sources } : {}),
  }));
  return { nodes, edges, clusters: blocks.clusters, source_families: blocks.source_families };
}

// Merges every dossier's own curated payload into one global layer:
// entity nodes dedup by bare id (a node can legitimately appear in more
// than one dossier's graph.toml — e.g. a government-roster entity), edges/
// clusters/source_families are namespaced "<slug>::<id>" because their ids
// are only unique within one dossier (see build-global-graph.mjs history —
// this collision is what broke the map the first time a second dossier
// reused an id).
export function buildGlobalCuratedPayload(root, dossierSlugs, routeMap, errors) {
  const nodesById = new Map();
  const edges = [];
  const clusters = [];
  const sourceFamilies = [];
  const perDossier = {};

  for (const slug of dossierSlugs) {
    if (!existsSync(join(root, "data/dossiers", slug, "graph.toml"))) continue;
    const payload = buildDossierCuratedPayload(root, slug, routeMap, errors);
    perDossier[slug] = payload;

    for (const n of payload.nodes) {
      const existing = nodesById.get(n.id);
      if (existing) {
        existing.dossiers = [...new Set([...existing.dossiers, ...n.dossiers])];
        existing.claims = [...new Set([...(existing.claims || []), ...(n.claims || [])])];
        existing.sources = [...new Set([...(existing.sources || []), ...(n.sources || [])])];
        existing.claim_count = existing.claims.length;
        existing.source_count = existing.sources.length;
      } else {
        nodesById.set(n.id, { ...n });
      }
    }
    for (const e of payload.edges) edges.push({ ...e, id: `${slug}::${e.id}` });
    for (const c of payload.clusters) clusters.push({ ...c, id: `${slug}::${c.id}`, dossier: slug });
    for (const f of payload.source_families) sourceFamilies.push({ ...f, id: `${slug}::${f.id}`, dossier: slug });
  }

  return { nodes: [...nodesById.values()], edges, clusters, source_families: sourceFamilies, perDossier };
}

// The full-registry layer: every claim/source/case/gap becomes a node
// (namespaced "<slug>::<ID>" — ids restart at 01 in every dossier), every
// entity from the curated merge stays as-is (entities are global), and
// every edge is a reference a record already declares in the flat exports
// (build-data-exports.mjs) — nothing curated, nothing inferred.
export function buildRegistryPayload(root, curatedEntityNodes, routeMap, errors) {
  const claims = readJson(root, "static/data/claims.json");
  const sources = readJson(root, "static/data/sources.json");
  const cases = readJson(root, "static/data/cases.json");
  const gaps = readJson(root, "static/data/gaps.json");
  const relations = readJson(root, "static/data/relations.json");

  const key = (dossier, id) => `${dossier}::${id}`;
  const nodes = [];
  const nodeById = new Map();
  const addNode = (node) => {
    if (nodeById.has(node.id)) {
      errors.push(`registry layer: duplicate node id "${node.id}"`);
      return;
    }
    nodeById.set(node.id, node);
    nodes.push(node);
  };

  for (const n of curatedEntityNodes) {
    addNode({
      id: n.id,
      canonical_id: n.canonical_id,
      record_type: "entity",
      entity_type: n.entity_type,
      label: n.label,
      route: n.route,
      dossiers: n.dossiers,
      subject: n.subject,
      size_class: n.size_class,
      claim_count: n.claim_count,
      source_count: n.source_count,
    });
  }
  for (const c of claims) {
    addNode({
      id: key(c.dossier, c.clm_id),
      canonical_id: c.clm_id,
      record_type: "claim",
      label: graphLabel(c.summary, c.clm_id),
      route: resolveRoute(routeMap, `${c.dossier}:${c.clm_id}`, errors, `claim ${c.dossier}/${c.clm_id}`),
      dossier: c.dossier,
      status: c.status,
      summary: c.summary,
      size_class: "claim",
      source_count: (c.sources || []).length,
    });
  }
  for (const s of sources) {
    addNode({
      id: key(s.dossier, s.src_id),
      canonical_id: s.src_id,
      record_type: "source",
      label: graphLabel(s.outlet, s.src_id, 32),
      route: resolveRoute(routeMap, `${s.dossier}:${s.src_id}`, errors, `source ${s.dossier}/${s.src_id}`),
      dossier: s.dossier,
      outlet: s.outlet,
      size_class: "source",
    });
  }
  for (const c of cases) {
    addNode({
      id: key(c.dossier, c.case_id),
      canonical_id: c.case_id,
      record_type: "case",
      label: graphLabel(c.title, c.case_id),
      route: resolveRoute(routeMap, `${c.dossier}:${c.case_id}`, errors, `case ${c.dossier}/${c.case_id}`),
      dossier: c.dossier,
      title: c.title,
      status: c.status,
      size_class: "case",
    });
  }
  for (const g of gaps) {
    addNode({
      id: key(g.dossier, g.gap_id),
      canonical_id: g.gap_id,
      record_type: "gap",
      // Titulek mezery už kód obsahuje ("GAP-01 — …"), takže by se v popisku
      // objevil dvakrát; odřízne se prefix a zůstane jen text otázky.
      label: graphLabel((g.title || g.summary || "").replace(/^GAP-\d+\s*[—-]\s*/, ""), g.gap_id),
      route: resolveRoute(routeMap, `${g.dossier}:${g.gap_id}`, errors, `gap ${g.dossier}/${g.gap_id}`),
      dossier: g.dossier,
      priority: g.priority,
      size_class: "gap",
    });
  }

  const known = new Set(nodes.map((n) => n.id));
  const seenEdges = new Set();
  const edges = [];
  const link = (id, source, target, label, kind) => {
    if (!known.has(source) || !known.has(target)) return;
    // The same reference can be reached more than one way (an entity in
    // two dossiers cites the same claim in both) — the edge itself is
    // one edge; without this the second attempt collides on id.
    if (seenEdges.has(id)) return;
    seenEdges.add(id);
    edges.push({ id, source, target, label, edge_class: EDGE_CLASS_BY_KIND[kind], dossier: source.includes("::") ? source.split("::")[0] : target.includes("::") ? target.split("::")[0] : null });
  };

  for (const c of claims) for (const s of c.sources || []) link(`${key(c.dossier, c.clm_id)}->${s}`, key(c.dossier, c.clm_id), key(c.dossier, s), "cituje", "cites");
  for (const g of gaps) for (const c of g.claims || []) link(`${key(g.dossier, g.gap_id)}->${c}`, key(g.dossier, g.gap_id), key(g.dossier, c), "otázka k", "asks");
  for (const n of curatedEntityNodes)
    for (const d of n.dossiers || []) for (const c of n.claims || []) link(`${n.id}->${key(d, c)}`, n.id, key(d, c), "figuruje v", "mentions");
  for (const r of relations) for (const c of r.claims || []) link(`${r.source}->${key(r.dossier, c)}`, r.source, key(r.dossier, c), "doloženo", "backs");

  return { nodes, edges };
}
