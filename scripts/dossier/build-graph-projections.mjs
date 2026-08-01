#!/usr/bin/env node
/*
 * Graph workbench data contract (mission § 3, coop task T-027). Replaces
 * the monolithic data/generated/global-graph.json (whole global map
 * inlined into /map/'s HTML) with a manifest + separately fetchable
 * layer/per-dossier payloads:
 *
 *   static/data/graph/manifest.json           — layer/dossier index, counts, hashes
 *   static/data/graph/global-curated.json     — curated entity graph (small)
 *   static/data/graph/global-registry.json    — full registry layer (large, lazy-loaded)
 *   static/data/graph/dossier/<slug>.json     — one canonical dossier's own curated graph
 *
 * Everything here is a PROJECTION, not a new source of truth: node/edge
 * assembly reads the canonical dossier.json `graph` layer and the flat registry
 * exports (lib/graph-projection.mjs); coordinates are computed once at
 * build time (lib/graph-layout.mjs) so the browser never runs a
 * synchronous layout on load. Validated by validate-graph-projections.mjs.
 *
 * Run order: after build:routes (route resolution) and build:data-exports
 * (registry JSON this reads) — see npm run build / package.json.
 */
import { writeFileSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRouteMap,
  listDossierSlugs,
  dossierOwnsGraph,
  buildDossierCatalog,
  buildGlobalCuratedPayload,
  buildRegistryPayload,
} from "./lib/graph-projection.mjs";
import { computeLayout, applyLayout, LAYOUT_ALGORITHM, LAYOUT_VERSION } from "./lib/graph-layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = join(ROOT, "static/data/graph");
const OUT_DOSSIER_DIR = join(OUT_DIR, "dossier");

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function writeJson(path, value) {
  const buf = JSON.stringify(value);
  writeFileSync(path, buf, "utf8");
  return { byte_size: Buffer.byteLength(buf, "utf8"), sha256: sha256(buf) };
}

// Content hash over every canonical input this pipeline reads — the
// manifest's cache-busting/audit key, not a timestamp (mission § 3.1:
// "Nepoužívej timestamp jako jediný cache invalidátor").
// T-028 fáze H: kurátorovaná vrstva žije v dossier.json (`graph`) —
// hashují se kanonické dossier.json souborů místo dřívějších graph.toml.
function computeSourceHash(root, dossierSlugs) {
  const hash = createHash("sha256");
  const inputs = [];
  for (const slug of dossierSlugs) {
    const file = join(root, "data/dossiers", slug, "dossier.json");
    try {
      inputs.push([`data/dossiers/${slug}/dossier.json`, readFileSync(file)]);
    } catch {
      /* bez kanonického záznamu — není vstup */
    }
  }
  for (const name of ["claims", "sources", "cases", "gaps", "relations", "entities"]) {
    inputs.push([`static/data/${name}.json`, readFileSync(join(root, "static/data", `${name}.json`))]);
  }
  inputs.push(["data/generated/routes.json", readFileSync(join(root, "data/generated/routes.json"))]);
  inputs.sort(([a], [b]) => a.localeCompare(b));
  for (const [name, buf] of inputs) {
    hash.update(name).update("\n").update(buf).update("\n");
  }
  return hash.digest("hex");
}

const errors = [];
const routeMap = loadRouteMap(ROOT);
const dossierSlugs = listDossierSlugs(ROOT);
const canonicalSlugs = dossierSlugs.filter((slug) => dossierOwnsGraph(ROOT, slug));

const curated = buildGlobalCuratedPayload(ROOT, dossierSlugs, routeMap, errors);
const registry = buildRegistryPayload(ROOT, curated.nodes, routeMap, errors);

if (errors.length) {
  console.log(`build-graph-projections: ${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  process.exit(1);
}

const curatedLayout = computeLayout(curated.nodes, curated.edges, { barnesHut: false });
const curatedNodes = applyLayout(curated.nodes, curatedLayout);

const registryLayout = computeLayout(registry.nodes, registry.edges, { barnesHut: true });
const registryNodes = applyLayout(registry.nodes, registryLayout);

mkdirSync(OUT_DOSSIER_DIR, { recursive: true });

const globalCuratedInfo = writeJson(join(OUT_DIR, "global-curated.json"), {
  schema_version: 1,
  nodes: curatedNodes,
  edges: curated.edges,
  clusters: curated.clusters,
  source_families: curated.source_families,
});
const globalRegistryInfo = writeJson(join(OUT_DIR, "global-registry.json"), {
  schema_version: 1,
  nodes: registryNodes,
  edges: registry.edges,
});

const dossierCatalog = buildDossierCatalog(ROOT, dossierSlugs).map((entry) => {
  const own = curated.perDossier[entry.slug];
  if (!own) return { ...entry, url: null, node_count: 0, edge_count: 0, byte_size: 0, sha256: null };

  const layout = computeLayout(own.nodes, own.edges, { barnesHut: false });
  const nodes = applyLayout(own.nodes, layout);
  const info = writeJson(join(OUT_DOSSIER_DIR, `${entry.slug}.json`), {
    schema_version: 1,
    nodes,
    edges: own.edges,
    clusters: own.clusters,
    source_families: own.source_families,
  });
  return {
    ...entry,
    url: `/data/graph/dossier/${entry.slug}.json`,
    node_count: own.nodes.length,
    edge_count: own.edges.length,
    byte_size: info.byte_size,
    sha256: info.sha256,
  };
});

const manifest = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  generator_version: "1",
  source_hash: computeSourceHash(ROOT, dossierSlugs),
  layout: {
    algorithm: LAYOUT_ALGORITHM,
    version: LAYOUT_VERSION,
    parameters: registryLayout.parameters,
    input_hash: sha256(JSON.stringify(registry.nodes.map((n) => n.id)) + JSON.stringify(registry.edges.map((e) => [e.id, e.source, e.target]))),
  },
  layers: {
    curated: { url: "/data/graph/global-curated.json", node_count: curatedNodes.length, edge_count: curated.edges.length, ...globalCuratedInfo },
    registry: { url: "/data/graph/global-registry.json", node_count: registryNodes.length, edge_count: registry.edges.length, ...globalRegistryInfo },
  },
  facets: {
    record_type: [...new Set(registryNodes.map((n) => n.record_type))].sort(),
    entity_type: [...new Set(curatedNodes.map((n) => n.entity_type).filter(Boolean))].sort(),
    dossier: dossierSlugs.slice().sort(),
  },
  dossiers: dossierCatalog,
};
writeJson(join(OUT_DIR, "manifest.json"), manifest);

console.log(
  `Wrote ${OUT_DIR}: manifest + curated (${curatedNodes.length}n/${curated.edges.length}e) + ` +
    `registry (${registryNodes.length}n/${registry.edges.length}e) + ${canonicalSlugs.length} dossier payload(s).`,
);
